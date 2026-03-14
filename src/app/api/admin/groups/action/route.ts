import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getUser } from "@/lib/auth/guards";

/**
 * POST /api/admin/groups/action
 *
 * Admin-only endpoint for group management:
 * - approve / suspend / feature / archive
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
      approve: "active",
      approved: "active",
      suspend: "archived",
      suspended: "archived",
      archive: "archived",
      archived: "archived",
    };

    const isFeatureAction = action.toLowerCase() === "feature" || action.toLowerCase() === "featured";
    const newStatus = statusMap[action.toLowerCase()];

    if (!newStatus && !isFeatureAction) {
      return NextResponse.json({ error: `Invalid action: ${action}` }, { status: 400 });
    }

    // Look up group by id first, then by slug (avoid raw .or() filter injection)
    let groupId: string | null = null;
    const { data: byId } = await db
      .from("groups")
      .select("id")
      .eq("id", key)
      .maybeSingle();

    if (byId) {
      groupId = byId.id;
    } else {
      const { data: bySlug } = await db
        .from("groups")
        .select("id")
        .eq("slug", key)
        .maybeSingle();
      groupId = bySlug?.id ?? null;
    }

    if (!groupId) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const update: Record<string, unknown> = {};
    if (isFeatureAction) {
      update.is_featured = true;
      update.status = "active"; // featured groups should be active
    } else {
      update.status = newStatus;
      // Unfeaturing when archiving/suspending
      if (newStatus === "archived") {
        update.is_featured = false;
      }
    }

    const { error } = await db
      .from("groups")
      .update(update)
      .eq("id", groupId);

    if (error) {
      console.error("Admin group action failed:", error);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    // Audit log
    try {
      await db.from("admin_audit_log").insert({
        admin_id: session.id,
        action: `group_${action}`,
        target_type: "group",
        target_id: key,
        details: { action, key },
      });
    } catch { /* non-critical */ }

    return NextResponse.json({ ok: true, action, key });
  } catch (error) {
    console.error("Admin group action error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
