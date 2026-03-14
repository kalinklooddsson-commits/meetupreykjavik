import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getUser } from "@/lib/auth/guards";

/**
 * POST /api/admin/venues/action
 *
 * Admin-only endpoint for venue management:
 * - verify / suspend / approve / reject (single or batch)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getUser();
    if (!session || session.accountType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { key, keys, action } = body as { key?: string; keys?: string[]; action: string };
    const targetKeys = keys ?? (key ? [key] : []);

    if (targetKeys.length === 0 || !action) {
      return NextResponse.json({ error: "Missing key(s) or action" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    // Venues CHECK: ('pending', 'active', 'waitlisted', 'suspended', 'rejected')
    const statusMap: Record<string, string> = {
      verify: "active",
      approve: "active",
      approved: "active",
      suspend: "suspended",
      suspended: "suspended",
      reject: "rejected",
      rejected: "rejected",
      waitlist: "waitlisted",
      waitlisted: "waitlisted",
    };

    const newStatus = statusMap[action.toLowerCase()];
    if (!newStatus) {
      return NextResponse.json({ error: `Invalid action: ${action}` }, { status: 400 });
    }

    const update = { status: newStatus };

    for (const k of targetKeys) {
      // Look up venue by id first, then by slug (avoid raw .or() filter injection)
      let venueId: string | null = null;
      const { data: byId } = await db
        .from("venues")
        .select("id")
        .eq("id", k)
        .maybeSingle();

      if (byId) {
        venueId = byId.id;
      } else {
        const { data: bySlug } = await db
          .from("venues")
          .select("id")
          .eq("slug", k)
          .maybeSingle();
        venueId = bySlug?.id ?? null;
      }

      if (venueId) {
        await db.from("venues").update(update).eq("id", venueId);
      }
    }

    // Audit log
    try {
      await db.from("admin_audit_log").insert({
        admin_id: session.id,
        action: `venue_${action}`,
        target_type: "venue",
        target_id: targetKeys.join(","),
        details: { action, keys: targetKeys },
      });
    } catch { /* non-critical */ }

    return NextResponse.json({ ok: true, action, count: targetKeys.length });
  } catch (error) {
    console.error("Admin venue action error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
