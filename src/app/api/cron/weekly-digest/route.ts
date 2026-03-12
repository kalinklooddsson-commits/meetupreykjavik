import { NextResponse } from "next/server";

import { sendEmail } from "@/lib/email/resend";
import { weeklyDigestEmail } from "@/lib/email/templates";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Vercel Cron: runs Monday at 9am UTC.
 * Sends a weekly digest of upcoming events to opted-in users.
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
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
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Fetch upcoming events for the next week
  const { data: events } = await supabase
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

  // Fetch users opted-in to digest (weekly_digest preference)
  const { data: users } = await supabase
    .from("profiles")
    .select("id, email, display_name, locale")
    .eq("digest_opt_in", true);

  let sent = 0;

  for (const user of users ?? []) {
    if (!user.email) continue;

    const locale = (user.locale as "en" | "is") ?? "en";

    const eventList = events.map((e) => ({
      title: e.title,
      slug: e.slug,
      date: new Date(e.starts_at).toLocaleDateString(
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
