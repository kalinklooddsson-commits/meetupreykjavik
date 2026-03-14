import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/guards";

/**
 * POST /api/admin/incidents/action
 *
 * Admin-only endpoint for incident status updates.
 * These are UI-only state transitions (no dedicated DB table yet).
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
    console.error("Admin incidents action error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
