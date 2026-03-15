import { NextResponse } from "next/server";

import { sendEmail } from "@/lib/email/resend";
import { weeklyDigestEmail } from "@/lib/email/templates";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Vercel Cron: runs Monday at 9am UTC.
 * Sends a weekly digest of upcoming events to opted-in users.
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
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Fetch upcoming events for the next week
  const { data: events } = await db
    .from("events")
    .select("id, title, slug, starts_at")
    .eq("status", "published")
    .gte("starts_at", now.toISOString())
    .lt("starts_at", nextWeek.toISOString())
    .order("starts_at", { ascending: true })
    .limit(10);

  if (!events || events.length === 0) {
    return NextResponse.json({
      ok: true,
      sent: 0,
      reason: "No upcoming events this week",
    });
  }

  // STUB: digest preferences are not wired yet.
  // The profiles table lacks a `digest_opt_in` column, so this sends to ALL
  // users with an email address. Once the column is added via migration,
  // filter with `.eq("digest_opt_in", true)` and add an unsubscribe link
  // to the email template so users can manage their preference.
  const { data: users } = await db
    .from("profiles")
    .select("id, email, display_name, locale")
    .not("email", "is", null);

  let sent = 0;

  for (const user of users ?? []) {
    if (!user.email) continue;

    const locale = (user.locale as "en" | "is") ?? "en";

    const eventList = events.map((e: Record<string, unknown>) => ({
      title: e.title as string,
      slug: e.slug as string,
      date: new Date(e.starts_at as string).toLocaleDateString(
        locale === "is" ? "is-IS" : "en-US",
        { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" },
      ),
    }));

    const { subject, html } = weeklyDigestEmail(
      user.display_name ?? user.email,
      eventList,
      locale,
    );

    try {
      await sendEmail({ to: user.email, subject, html });
      sent++;
    } catch (error) {
      console.error(`[cron/weekly-digest] Failed for ${user.id}:`, error);
    }
  }

  return NextResponse.json({
    ok: true,
    sent,
    eventsIncluded: events.length,
    timestamp: now.toISOString(),
  });
}
