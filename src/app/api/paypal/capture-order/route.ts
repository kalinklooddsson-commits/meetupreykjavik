import { NextRequest, NextResponse } from "next/server";

import { getCurrentAppSession } from "@/lib/auth/session";
import { hasPayPalEnv, captureOrder } from "@/lib/payments/paypal";
import { createTransaction } from "@/lib/db/transactions";
import { createRsvp } from "@/lib/db/rsvps";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/resend";
import { rsvpConfirmationEmail } from "@/lib/email/templates";

export async function POST(request: NextRequest) {
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
      status: captureData.status,
    });

    // Create RSVP for the purchased ticket
    if (customData.eventSlug) {
      try {
        const supabase = await createSupabaseServerClient();
        if (supabase) {
          const { data: event } = await supabase
            .from("events")
            .select("id")
            .eq("slug", customData.eventSlug)
            .single();
          if (event) {
            // Find the ticket tier if specified
            let ticketTierId: string | undefined;
            if (customData.tierName) {
              const { data: tier } = await supabase
                .from("ticket_tiers")
                .select("id")
                .eq("event_id", event.id)
                .eq("name", customData.tierName)
                .single();
              ticketTierId = tier?.id;
            }
            await createRsvp(event.id, session.id, ticketTierId);
          }
        }
      } catch (rsvpErr) {
        // Log but don't fail the capture — payment was already taken
        console.error("[PayPal] RSVP creation after capture failed:", rsvpErr);
      }
    }

    // Send ticket confirmation email (best-effort)
    try {
      const sessionEmail = (session as unknown as { email?: string }).email;
      if (sessionEmail) {
        const { subject, html } = rsvpConfirmationEmail(
          (session as unknown as { displayName?: string }).displayName ?? sessionEmail,
          customData.tierName ?? "Event ticket",
          new Date().toLocaleDateString("en-US"),
          "",
          customData.eventSlug ?? "event",
        );
        await sendEmail({ to: sessionEmail, subject, html });
      }
    } catch {
      // Email is best-effort — don't fail the capture response
    }

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
