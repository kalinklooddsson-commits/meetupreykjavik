import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/guards";

/**
 * POST /api/admin/comms/send
 *
 * Admin-only: send communications (emails, announcements).
 * Currently returns success for frontend state — actual email
 * sending would integrate with Resend/SendGrid.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getUser();
    if (!session || session.accountType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { template, audience, subject } = body as {
      template?: string;
      audience?: string;
      subject?: string;
    };

    // Log the intent (would integrate with email service in production)
    console.log(`Admin comms: ${session.id} sending "${subject ?? template}" to ${audience ?? "all"}`);

    return NextResponse.json({ ok: true, sent: true });
  } catch (error) {
    console.error("Admin comms error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
