import { NextRequest, NextResponse } from "next/server";

import { getCurrentAppSession } from "@/lib/auth/session";
import { hasPayPalEnv, createTicketOrder } from "@/lib/payments/paypal";
import { MIN_TICKET_PRICE_ISK } from "@/lib/payments/constants";
import { hasTrustedOrigin } from "@/lib/security/request";

export async function POST(request: NextRequest) {
  if (!hasTrustedOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const session = await getCurrentAppSession();
  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  if (!hasPayPalEnv()) {
    return NextResponse.json(
      { error: "Payment processing is not available yet." },
      { status: 503 },
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

  const { eventSlug, tierName, amountIsk, quantity } = body as {
    eventSlug?: string;
    tierName?: string;
    amountIsk?: number;
    quantity?: number;
  };

  if (!eventSlug || typeof eventSlug !== "string") {
    return NextResponse.json(
      { error: "eventSlug is required." },
      { status: 400 },
    );
  }

  if (!tierName || typeof tierName !== "string") {
    return NextResponse.json(
      { error: "tierName is required." },
      { status: 400 },
    );
  }

  if (typeof amountIsk !== "number" || amountIsk < MIN_TICKET_PRICE_ISK) {
    return NextResponse.json(
      { error: `amountIsk must be at least ${MIN_TICKET_PRICE_ISK} ISK.` },
      { status: 400 },
    );
  }

  if (typeof quantity !== "number" || quantity < 1 || !Number.isInteger(quantity)) {
    return NextResponse.json(
      { error: "quantity must be a positive integer." },
      { status: 400 },
    );
  }

  try {
    const order = await createTicketOrder(eventSlug, tierName, amountIsk, quantity);
    return NextResponse.json(order);
  } catch (error) {
    console.error("PayPal create order error:", error);
    return NextResponse.json(
      { error: "Failed to create payment order." },
      { status: 500 },
    );
  }
}
