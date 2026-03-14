import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/guards";

/**
 * POST /api/admin/content/action
 *
 * Admin-only: content management actions (publish, unpublish, feature).
 * Currently UI-state only.
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

    return NextResponse.json({ ok: true, action, key });
  } catch (error) {
    console.error("Content action error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
