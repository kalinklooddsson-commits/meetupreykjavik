import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { hasTrustedOrigin } from "@/lib/security/request";
import { forbiddenResponse } from "@/lib/security/response";
import { sendEmail, hasResendEnv } from "@/lib/email/resend";
import {
  checkRateLimit,
  rateLimitKeyFromRequest,
  CONTACT_RATE_LIMIT,
} from "@/lib/security/rate-limit";

const contactSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(200),
  topic: z.string().min(1).max(100),
  message: z.string().min(10).max(5000),
});

export async function POST(request: NextRequest) {
  if (!hasTrustedOrigin(request)) {
    return forbiddenResponse("Cross-site contact submissions are not allowed.");
  }

  const rlKey = rateLimitKeyFromRequest(request, "contact");
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
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { name, email, topic, message } = parsed.data;

    // Send via Resend if configured, otherwise acknowledge in mock mode
    if (hasResendEnv()) {
      const contactEmail = process.env.CONTACT_EMAIL ?? "hello@meetupreykjavik.com";
      await sendEmail({
        to: contactEmail,
        subject: `[Contact] ${topic} — from ${name}`,
        html: `<p><strong>From:</strong> ${name} (${email})</p><p><strong>Topic:</strong> ${topic}</p><hr/><p>${message.replace(/\n/g, "<br/>")}</p>`,
      });
    } else {
      // Mock mode: log and acknowledge
      console.log(`[Contact form] From: ${name} <${email}> | Topic: ${topic} | Message: ${message.slice(0, 100)}...`);
    }

    return NextResponse.json({
      ok: true,
      message: "Thank you! We'll get back to you within 48 hours.",
    });
  } catch {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 },
    );
  }
}
