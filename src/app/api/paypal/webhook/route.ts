import { NextRequest, NextResponse } from "next/server";

import { hasPayPalEnv, verifyWebhookSignature } from "@/lib/payments/paypal";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Database-backed dedup for webhook retries.
 * Uses Supabase `webhook_dedup` table with upsert + conflict detection.
 * Falls back to in-memory map if DB is unavailable.
 */
const memoryFallback = new Map<string, number>();

async function isDuplicate(transmissionId: string): Promise<boolean> {
  if (!transmissionId) return false;

  // Try database-backed dedup first (works across serverless instances)
  try {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { error } = await supabase
        .from("webhook_dedup")
        .insert({ transmission_id: transmissionId });

      // If unique constraint violation → duplicate
      if (error?.code === "23505") return true;
      if (!error) return false;
    }
  } catch {
    // Fall through to in-memory fallback
  }

  // In-memory fallback (best-effort, single instance only)
  if (memoryFallback.has(transmissionId)) return true;
  memoryFallback.set(transmissionId, Date.now());
  // Prune old entries
  if (memoryFallback.size > 500) {
    const cutoff = Date.now() - 10 * 60 * 1000;
    for (const [id, ts] of memoryFallback) {
      if (ts < cutoff) memoryFallback.delete(id);
    }
  }
  return false;
}

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

  // Idempotency: skip if we already processed this transmission
  const transmissionId = headers["paypal-transmission-id"];
  if (await isDuplicate(transmissionId)) {
    return NextResponse.json({ received: true, deduplicated: true });
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

  try {
    switch (eventType) {
      case "PAYMENT.CAPTURE.COMPLETED": {
        const captureId = event.resource?.id as string | undefined;
        if (captureId) {
          const supabase = await createSupabaseServerClient();
          if (supabase) {
            await supabase
              .from("transactions")
              .update({ status: "completed" })
              .eq("payment_id", captureId)
              .eq("payment_provider", "paypal");
          }
        }
        break;
      }

      case "PAYMENT.CAPTURE.DENIED":
      case "PAYMENT.CAPTURE.REFUNDED": {
        const captureId = event.resource?.id as string | undefined;
        const newStatus = eventType === "PAYMENT.CAPTURE.DENIED" ? "failed" : "refunded";
        if (captureId) {
          const supabase = await createSupabaseServerClient();
          if (supabase) {
            await supabase
              .from("transactions")
              .update({ status: newStatus })
              .eq("payment_id", captureId)
              .eq("payment_provider", "paypal");
          }
        }
        break;
      }

      case "BILLING.SUBSCRIPTION.ACTIVATED": {
        const subscriptionId = event.resource?.id as string | undefined;
        const subscriberEmail = (event.resource?.subscriber as Record<string, unknown>)?.email_address as string | undefined;
        if (subscriptionId && subscriberEmail) {
          const supabase = await createSupabaseServerClient();
          if (supabase) {
            const customId = event.resource?.custom_id as string | undefined;
            const tier = customId ?? "plus";
            await supabase
              .from("profiles")
              .update({ is_premium: true, premium_tier: tier })
              .eq("email", subscriberEmail);
          }
        }
        break;
      }

      case "BILLING.SUBSCRIPTION.CANCELLED":
      case "BILLING.SUBSCRIPTION.EXPIRED":
      case "BILLING.SUBSCRIPTION.SUSPENDED": {
        const subscriberEmail = (event.resource?.subscriber as Record<string, unknown>)?.email_address as string | undefined;
        if (subscriberEmail) {
          const supabase = await createSupabaseServerClient();
          if (supabase) {
            await supabase
              .from("profiles")
              .update({ is_premium: false, premium_tier: null })
              .eq("email", subscriberEmail);
          }
        }
        break;
      }

      default:
        // Unhandled event types are silently acknowledged
        break;
    }
  } catch (error) {
    // Log but don't fail — PayPal expects a 200 response
    console.error(`PayPal webhook handler error for ${eventType}:`, error);
  }

  return NextResponse.json({ received: true });
}
