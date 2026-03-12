import { NextResponse } from "next/server";

import { sendEmail } from "@/lib/email/resend";
import {
  eventReminder24hEmail,
  eventReminder2hEmail,
} from "@/lib/email/templates";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Vercel Cron: runs every hour.
 * Sends 24-hour and 2-hour event reminders to confirmed RSVPs.
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

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Database unavailable" },
      { status: 503 },
    );
  }

  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000);
  const in2h = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const in3h = new Date(now.getTime() + 3 * 60 * 60 * 1000);

  let sent24h = 0;
  let sent2h = 0;

  // 24-hour reminders
  try {
    const { data: events24h } = await supabase
      .from("events")
      .select("*, venues(*)")
      .eq("status", "published")
      .gte("starts_at", in24h.toISOString())
      .lt("starts_at", in25h.toISOString());

    for (const event of events24h ?? []) {
      const { data: rsvps } = await supabase
        .from("rsvps")
        .select("*, profiles(*)")
        .eq("event_id", event.id)
        .eq("status", "confirmed");

      for (const rsvp of rsvps ?? []) {
        const profile = rsvp.profiles;
        if (!profile?.email) continue;

        const locale = (profile.locale as "en" | "is") ?? "en";
        const { subject, html } = eventReminder24hEmail(
          profile.display_name ?? profile.email,
          event.title,
          new Date(event.starts_at).toLocaleDateString(locale === "is" ? "is-IS" : "en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          }),
          event.venues?.name ?? "",
          event.slug,
          locale,
        );

        await sendEmail({ to: profile.email, subject, html });
        sent24h++;
      }
    }
  } catch (error) {
    console.error("[cron/event-reminders] 24h error:", error);
  }

  // 2-hour reminders
  try {
    const { data: events2h } = await supabase
      .from("events")
      .select("*, venues(*)")
      .eq("status", "published")
      .gte("starts_at", in2h.toISOString())
      .lt("starts_at", in3h.toISOString());

    for (const event of events2h ?? []) {
      const { data: rsvps } = await supabase
        .from("rsvps")
        .select("*, profiles(*)")
        .eq("event_id", event.id)
        .eq("status", "confirmed");

      for (const rsvp of rsvps ?? []) {
        const profile = rsvp.profiles;
        if (!profile?.email) continue;

        const locale = (profile.locale as "en" | "is") ?? "en";
        const eventTime = new Date(event.starts_at).toLocaleTimeString(
          locale === "is" ? "is-IS" : "en-US",
          { hour: "numeric", minute: "2-digit" },
        );

        const { subject, html } = eventReminder2hEmail(
          profile.display_name ?? profile.email,
          event.title,
          eventTime,
          event.venues?.name ?? "",
          event.slug,
          locale,
        );

        await sendEmail({ to: profile.email, subject, html });
        sent2h++;
      }
    }
  } catch (error) {
    console.error("[cron/event-reminders] 2h error:", error);
  }

  return NextResponse.json({
    ok: true,
    sent24h,
    sent2h,
    timestamp: now.toISOString(),
  });
}
