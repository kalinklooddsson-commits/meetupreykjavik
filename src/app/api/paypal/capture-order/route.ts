import { NextRequest, NextResponse } from "next/server";

import { getCurrentAppSession } from "@/lib/auth/session";
import { hasPayPalEnv, captureOrder } from "@/lib/payments/paypal";
import { createTransaction } from "@/lib/db/transactions";
import { hasTrustedOrigin } from "@/lib/security/request";

export async function POST(request: NextRequest) {
  if (!hasTrustedOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!hasPayPalEnv()) {
    return NextResponse.json(
      { error: "Payment processing is not available yet." },
      { status: 503 },
    );
  }

  const session = await getCurrentAppSession();

  if (!session) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const { orderId } = body as { orderId?: string };

  if (!orderId || typeof orderId !== "string") {
    return NextResponse.json(
      { error: "orderId is required." },
      { status: 400 },
    );
  }

  try {
    const captureData = await captureOrder(orderId);

    const purchaseUnit = captureData.purchase_units?.[0];
    const capture = purchaseUnit?.payments?.captures?.[0];
    let customData: { eventSlug?: string; tierName?: string; quantity?: number; commission?: number } = {};

    try {
      customData = JSON.parse(purchaseUnit?.custom_id ?? "{}");
    } catch {
      // custom_id parsing is best-effort
    }

    await createTransaction({
      user_id: session.id,
      type: "ticket",
      description: `${customData.tierName ?? "Ticket"} for ${customData.eventSlug ?? "event"} (x${customData.quantity ?? 1})`,
      amount_isk: Number(capture?.amount?.value ?? 0),
      commission_amount: customData.commission ?? 0,
      payment_provider: "paypal",
      payment_id: capture?.id ?? orderId,
      status: (captureData.status ?? "pending").toLowerCase(),
    });

    return NextResponse.json({
      status: captureData.status,
      orderId: captureData.id,
      captureId: capture?.id ?? null,
    });
  } catch (error) {
    console.error("PayPal capture order error:", error);
    return NextResponse.json(
      { error: "Failed to capture payment." },
      { status: 500 },
    );
  }
}
