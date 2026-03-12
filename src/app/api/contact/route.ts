import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { hasTrustedOrigin } from "@/lib/security/request";
import { forbiddenResponse } from "@/lib/security/response";
import { sendEmail, hasResendEnv } from "@/lib/email/resend";

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

  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { name, email, topic, message } = parsed.data;

    // Send via Resend if configured, otherwise log
    if (hasResendEnv()) {
      await sendEmail({
        to: "hello@meetupreykjavik.com",
        subject: `[Contact] ${topic} — from ${name}`,
        html: `<p><strong>From:</strong> ${name} (${email})</p><p><strong>Topic:</strong> ${topic}</p><hr/><p>${message.replace(/\n/g, "<br/>")}</p>`,
      });
    } else {
      console.log("[Contact Form]", { name, email, topic, messageLength: message.length });
    }

    return NextResponse.json({
      ok: true,
      message: "Thank you! We'll get back to you within 48 hours.",
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 },
    );
  }
}
