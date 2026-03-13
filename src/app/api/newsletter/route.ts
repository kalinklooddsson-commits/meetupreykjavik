import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { hasTrustedOrigin } from "@/lib/security/request";
import { forbiddenResponse } from "@/lib/security/response";
import {
  checkRateLimit,
  rateLimitKeyFromRequest,
  CONTACT_RATE_LIMIT,
} from "@/lib/security/rate-limit";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const newsletterSchema = z.object({
  email: z.string().email().max(200),
});

export async function POST(request: NextRequest) {
  if (!hasTrustedOrigin(request)) {
    return forbiddenResponse("Cross-site submissions are not allowed.");
  }

  const rlKey = rateLimitKeyFromRequest(request, "newsletter");
  const rl = checkRateLimit(rlKey, CONTACT_RATE_LIMIT);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again later." },
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
        { ok: false, error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const { email } = parsed.data;

    if (hasSupabaseEnv()) {
      const supabase = await createSupabaseServerClient();
      if (supabase) {
        const { error } = await supabase
          .from("newsletter_subscribers")
          .upsert(
            { email, subscribed_at: new Date().toISOString(), unsubscribed_at: null },
            { onConflict: "email" },
          );

        if (error) {
          console.error("[Newsletter] DB insert failed:", error.message);
          return NextResponse.json(
            { ok: false, error: "Subscription failed. Please try again." },
            { status: 500 },
          );
        }
      }
    } else {
      console.log(`[Newsletter] New subscriber: ${email}`);
    }

    return NextResponse.json({
      ok: true,
      message: "You're subscribed! We'll keep you posted.",
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 },
    );
  }
}
