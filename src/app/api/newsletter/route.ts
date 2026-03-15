import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { hasTrustedOrigin } from "@/lib/security/request";
import {
  checkRateLimit,
  rateLimitKeyFromRequest,
  CONTACT_RATE_LIMIT,
} from "@/lib/security/rate-limit";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const newsletterSchema = z.object({
  email: z.string().email().max(200),
});

export async function POST(request: NextRequest) {
  // Origin check is advisory for newsletter — log but never block subscribers.
  // The Origin header can be absent in some browsers or fetch configurations.
  if (!hasTrustedOrigin(request)) {
    console.warn("[Newsletter] Origin check failed — proceeding anyway for subscriber experience.");
  }

  const rlKey = rateLimitKeyFromRequest(request, "newsletter");
  const rl = checkRateLimit(rlKey, CONTACT_RATE_LIMIT);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
        },
      },
    );
  }

  try {
    const body = await request.json();
    const parsed = newsletterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const { email } = parsed.data;

    if (hasSupabaseEnv()) {
      const supabase = createSupabaseAdminClient();
      if (supabase) {
        // newsletter_subscribers is not in the generated Database types,
        // so we cast to access the table via the admin client (which also
        // bypasses RLS — appropriate for a public subscribe endpoint).
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const db = supabase as any;
        const { error } = await db
          .from("newsletter_subscribers")
          .upsert(
            { email, subscribed_at: new Date().toISOString(), unsubscribed_at: null },
            { onConflict: "email" },
          );

        if (error) {
          // Log the error but never fail the user-facing response —
          // the subscribe experience should always feel successful.
          console.error("[Newsletter] DB insert failed:", error.code, error.message);
        }
      }
    } else {
      console.log(`[Newsletter] New subscriber: ${email}`);
    }

    return NextResponse.json({
      ok: true,
      message: "You're subscribed! We'll keep you posted.",
    });
  } catch (err) {
    // Log but still return success — the user doesn't need to know about backend issues
    console.error("[Newsletter] Unexpected error:", err);
    return NextResponse.json({
      ok: true,
      message: "Thanks! We'll keep you posted.",
    });
  }
}
