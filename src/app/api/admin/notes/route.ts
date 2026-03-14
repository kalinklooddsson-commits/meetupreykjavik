import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/guards";

/**
 * POST /api/admin/notes — Create an admin note
 * DELETE /api/admin/notes — Delete an admin note
 *
 * Admin-only: client curation notes (UI-only state for now).
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getUser();
    if (!session || session.accountType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const body = await request.json();
    return NextResponse.json({ ok: true, ...body });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getUser();
    if (!session || session.accountType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const body = await request.json();
    return NextResponse.json({ ok: true, ...body });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
