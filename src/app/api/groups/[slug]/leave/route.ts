import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getUser } from "@/lib/auth/guards";

/**
 * POST /api/groups/[slug]/leave
 *
 * Remove the current user from a group's membership.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await getUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const supabase = createSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({ ok: true, offline: true });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    // Find group by slug
    const { data: group } = await db
      .from("groups")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Remove membership
    const { error } = await db
      .from("group_members")
      .delete()
      .eq("group_id", group.id)
      .eq("user_id", session.id);

    if (error) {
      console.error("Leave group failed:", error);
      return NextResponse.json({ error: "Failed to leave group" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Leave group error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
