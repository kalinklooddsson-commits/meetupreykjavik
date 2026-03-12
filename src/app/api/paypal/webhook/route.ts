import { NextRequest, NextResponse } from "next/server";

import { hasPayPalEnv, verifyWebhookSignature } from "@/lib/payments/paypal";

export async function POST(request: NextRequest) {
  if (!hasPayPalEnv()) {
    return NextResponse.json(
      { error: "Payment processing is not available yet." },
      { status: 503 },
    );
  }

  const body = await request.text();

  const headers: Record<string, string> = {};
  for (const key of [
    "paypal-auth-algo",
    "paypal-cert-url",
    "paypal-transmission-id",
    "paypal-transmission-sig",
    "paypal-transmission-time",
  ]) {
    headers[key] = request.headers.get(key) ?? "";
  }

  let verified: boolean;
  try {
    verified = await verifyWebhookSignature(headers, body);
  } catch (error) {
    console.error("PayPal webhook verification error:", error);
    return NextResponse.json(
      { error: "Webhook verification failed." },
      { status: 400 },
    );
  }

  if (!verified) {
    return NextResponse.json(
      { error: "Invalid webhook signature." },
      { status: 401 },
    );
  }

  let event: { event_type?: string; resource?: Record<string, unknown> };
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const eventType = event.event_type;

  switch (eventType) {
    case "PAYMENT.CAPTURE.COMPLETED": {
      const captureId = event.resource?.id as string | undefined;
      const amount = event.resource?.amount as
        | { value?: string; currency_code?: string }
        | undefined;
      console.log(
        `[PayPal Webhook] Payment captured: ${captureId}, amount: ${amount?.value} ${amount?.currency_code}`,
      );
      // TODO: Update transaction status in database, fulfill ticket
      break;
    }

    case "BILLING.SUBSCRIPTION.ACTIVATED": {
      const subscriptionId = event.resource?.id as string | undefined;
      const planId = event.resource?.plan_id as string | undefined;
      console.log(
        `[PayPal Webhook] Subscription activated: ${subscriptionId}, plan: ${planId}`,
      );
      // TODO: Activate user subscription in database
      break;
    }

    case "BILLING.SUBSCRIPTION.CANCELLED": {
      const subscriptionId = event.resource?.id as string | undefined;
      console.log(
        `[PayPal Webhook] Subscription cancelled: ${subscriptionId}`,
      );
      // TODO: Deactivate user subscription in database
      break;
    }

    default:
      console.log(`[PayPal Webhook] Unhandled event type: ${eventType}`);
      break;
  }

  return NextResponse.json({ received: true });
}
