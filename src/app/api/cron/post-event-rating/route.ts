import { NextResponse } from "next/server";

import { sendEmail } from "@/lib/email/resend";
import { postEventRatingEmail } from "@/lib/email/templates";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Vercel Cron: runs daily at 10am UTC.
 * Sends rating requests to attendees of events that ended ~24 hours ago.
 */
export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 503 });
  }
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Database unavailable" },
      { status: 503 },
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const now = new Date();
  const ago23h = new Date(now.getTime() - 23 * 60 * 60 * 1000);
  const ago25h = new Date(now.getTime() - 25 * 60 * 60 * 1000);

  // Find events that ended approximately 24 hours ago
  const { data: events } = await db
    .from("events")
    .select("id, title, slug, ends_at")
    .eq("status", "published")
    .gte("ends_at", ago25h.toISOString())
    .lt("ends_at", ago23h.toISOString());

  let sent = 0;

  for (const event of events ?? []) {
    // Get confirmed attendees
    const { data: rsvps } = await db
      .from("rsvps")
      .select("*, profiles(*)")
      .eq("event_id", event.id)
      .eq("status", "going");

    for (const rsvp of rsvps ?? []) {
      const profile = rsvp.profiles;
      if (!profile?.email) continue;

      const locale = (profile.locale as "en" | "is") ?? "en";

      const { subject, html } = postEventRatingEmail(
        profile.display_name ?? profile.email,
        event.title,
        event.slug,
        locale,
      );

      try {
        await sendEmail({ to: profile.email, subject, html });
        sent++;
      } catch (error) {
        console.error(
          `[cron/post-event-rating] Failed for ${profile.id}:`,
          error,
        );
      }
    }
  }

  return NextResponse.json({
    ok: true,
    sent,
    eventsProcessed: events?.length ?? 0,
    timestamp: now.toISOString(),
  });
}
