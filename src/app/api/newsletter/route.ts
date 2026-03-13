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
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

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

    // Persist to database when available
    if (hasSupabaseEnv()) {
      const admin = createSupabaseAdminClient();
      if (admin) {
        // Read current subscribers list from platform_settings
        // Use type assertion to bypass generated types for JSONB column
        const { data: existing } = await (admin as unknown as { from: (t: string) => { select: (c: string) => { eq: (k: string, v: string) => { single: () => Promise<{ data: { value: Record<string, unknown> } | null }> } } } })
          .from("platform_settings")
          .select("value")
          .eq("key", "newsletter_subscribers")
          .single();

        const existingValue = existing?.value ?? {};
        const subscribers: string[] = Array.isArray(existingValue.emails)
          ? (existingValue.emails as string[])
          : [];

        if (!subscribers.includes(email)) {
          subscribers.push(email);
          await (admin as unknown as { from: (t: string) => { upsert: (d: unknown, o: unknown) => Promise<unknown> } })
            .from("platform_settings")
            .upsert(
              {
                key: "newsletter_subscribers",
                value: { emails: subscribers, count: subscribers.length },
                updated_at: new Date().toISOString(),
              },
              { onConflict: "key" },
            );
        }
      }
    }

    console.log(`[Newsletter] New subscriber: ${email}`);

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
