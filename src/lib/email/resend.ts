import { env } from "@/lib/env";

const FROM_ADDRESS = "MeetupReykjavik <noreply@meetupreykjavik.com>";
const RESEND_API_URL = "https://api.resend.com/emails";

export function hasResendEnv(): boolean {
  return Boolean(env.RESEND_API_KEY);
}

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
}

interface SendEmailResult {
  id: string;
}

export async function sendEmail(
  options: SendEmailOptions,
): Promise<SendEmailResult> {
  const { to, subject, html } = options;

  if (!hasResendEnv()) {
    // In development without Resend, return a mock ID silently
    return { id: `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}` };
  }

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Resend API error (${response.status}): ${errorBody}`,
    );
  }

  const data = (await response.json()) as { id: string };
  return { id: data.id };
}
