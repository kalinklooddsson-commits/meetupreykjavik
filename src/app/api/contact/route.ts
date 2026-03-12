import { NextResponse } from "next/server";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(200),
  topic: z.string().min(1).max(100),
  message: z.string().min(10).max(5000),
});

export async function POST(request: Request) {
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

    // Log for now — in production, send via Resend or store in Supabase
    console.log("[Contact Form]", { name, email, topic, messageLength: message.length });

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
