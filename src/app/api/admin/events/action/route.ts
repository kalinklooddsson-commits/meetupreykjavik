import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getUser } from "@/lib/auth/guards";

/**
 * POST /api/admin/events/action
 *
 * Admin-only endpoint for event management actions:
 * - approve / reject / unpublish / archive
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getUser();
    if (!session || session.accountType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { key, action } = body as { key: string; action: string };

    if (!key || !action) {
      return NextResponse.json({ error: "Missing key or action" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    const statusMap: Record<string, string> = {
      approve: "published",
      approved: "published",
      reject: "cancelled",
      rejected: "cancelled",
      unpublish: "draft",
      archive: "completed",
      "pending review": "draft",
    };

    const newStatus = statusMap[action.toLowerCase()] ?? action.toLowerCase();

    const { error } = await db
      .from("events")
      .update({ status: newStatus })
      .or(`slug.eq.${key},id.eq.${key}`);

    if (error) {
      console.error("Admin event action failed:", error);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    // Audit log
    try {
      await db.from("admin_audit_log").insert({
        admin_id: session.id,
        action: `event_${action}`,
        target_type: "event",
        target_id: key,
        details: { action, key },
      });
    } catch { /* non-critical */ }

    return NextResponse.json({ ok: true, action, key });
  } catch (error) {
    console.error("Admin event action error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
