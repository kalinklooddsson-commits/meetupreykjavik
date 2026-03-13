import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { hasTrustedOrigin } from "@/lib/security/request";
import { forbiddenResponse } from "@/lib/security/response";
import {
  checkRateLimit,
  rateLimitKeyFromRequest,
  CONTACT_RATE_LIMIT,
} from "@/lib/security/rate-limit";

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

    // In production this would add to a mailing list (e.g. Resend audience).
    // For now, acknowledge the subscription.
    console.log(`[Newsletter] New subscriber: ${parsed.data.email}`);

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
