import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getUser } from "@/lib/auth/guards";

/**
 * POST /api/admin/users/action
 *
 * Admin-only endpoint for user management actions:
 * - suspend / unsuspend
 * - grant_premium / remove_premium
 * - verify / unverify
 * - change_role
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getUser();
    if (!session || session.accountType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { userKey, action } = body as { userKey: string; action: string };

    if (!userKey || !action) {
      return NextResponse.json({ error: "Missing userKey or action" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    // Find user by slug or id — use type assertion due to stale generated types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    const { data: profile } = await db
      .from("profiles")
      .select("id")
      .or(`slug.eq.${userKey},id.eq.${userKey}`)
      .maybeSingle();

    const userId = profile?.id ?? userKey;

    let update: Record<string, unknown> = {};

    switch (action) {
      case "suspend":
        update = { is_verified: false };
        break;
      case "unsuspend":
        update = { is_verified: true };
        break;
      case "grant_premium":
        update = { is_premium: true, premium_tier: "plus" };
        break;
      case "remove_premium":
        update = { is_premium: false, premium_tier: null };
        break;
      case "verify":
        update = { is_verified: true };
        break;
      case "unverify":
        update = { is_verified: false };
        break;
      case "change_role": {
        const newRole = body.value;
        if (!["user", "organizer", "venue", "admin"].includes(newRole)) {
          return NextResponse.json({ error: "Invalid role" }, { status: 400 });
        }
        update = { account_type: newRole };
        break;
      }
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    const { error } = await db
      .from("profiles")
      .update(update)
      .eq("id", userId);

    if (error) {
      console.error("Admin user action failed:", error);
      return NextResponse.json(
        { error: typeof error === "object" && error !== null && "message" in error ? (error as { message: string }).message : "Update failed" },
        { status: 500 },
      );
    }

    // Log to audit trail
    try {
      await db.from("admin_audit_log").insert({
        admin_id: session.id,
        action: `user_${action}`,
        target_type: "user",
        target_id: userId,
        details: { action, userKey },
      });
    } catch {
      // Non-critical — don't fail the request if audit logging fails
    }

    return NextResponse.json({ success: true, action, userKey: userId });
  } catch (error) {
    console.error("Admin user action error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
