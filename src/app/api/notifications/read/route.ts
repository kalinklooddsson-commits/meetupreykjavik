import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getUser } from "@/lib/auth/guards";

/**
 * PATCH /api/notifications/read
 *
 * Mark notifications as read for the current user.
 * Accepts { ids: string[] } to mark specific notifications.
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ids } = body as { ids: string[] };

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Missing notification ids" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    const { error } = await db
      .from("notifications")
      .update({ is_read: true })
      .in("id", ids)
      .eq("user_id", session.id);

    if (error) {
      console.error("Notification read update failed:", error);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, count: ids.length });
  } catch (error) {
    console.error("Notification read error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
