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

    let update: Record<string, unknown> = {};
    switch (action.toLowerCase()) {
      case "verify":
      case "approve":
      case "approved":
        update = { status: "active" };
        break;
      case "suspend":
      case "suspended":
        update = { status: "suspended" };
        break;
      case "reject":
      case "rejected":
        update = { status: "rejected" };
        break;
      default:
        update = { status: action.toLowerCase() };
    }

    for (const k of targetKeys) {
      await db
        .from("venues")
        .update(update)
        .or(`slug.eq.${k},id.eq.${k}`);
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
