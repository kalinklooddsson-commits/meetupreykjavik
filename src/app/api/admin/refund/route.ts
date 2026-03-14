import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getUser } from "@/lib/auth/guards";

/**
 * POST /api/admin/refund
 *
 * Admin-only: process a refund for a transaction.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getUser();
    if (!session || session.accountType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { transactionId, reason } = body as { transactionId: string; reason?: string };

    if (!transactionId) {
      return NextResponse.json({ error: "Missing transactionId" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({ ok: true, offline: true });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    const { error } = await db
      .from("transactions")
      .update({ status: "refunded", refund_reason: reason ?? null })
      .eq("id", transactionId);

    if (error) {
      console.error("Refund failed:", error);
      return NextResponse.json({ error: "Refund failed" }, { status: 500 });
    }

    // Audit
    try {
      await db.from("admin_audit_log").insert({
        admin_id: session.id,
        action: "refund_processed",
        target_type: "transaction",
        target_id: transactionId,
        details: { reason },
      });
    } catch { /* non-critical */ }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Refund error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
