import Link from "next/link";
import type { Route } from "next";
import { PortalShell } from "@/components/layout/portal-shell";
import {
  Surface,
  CalendarMatrix,
  DashboardTable,
  ToneBadge,
} from "@/components/dashboard/primitives";
import type { DashboardTone } from "@/components/dashboard/primitives";
import { getMemberPortalData } from "@/lib/dashboard-fetchers";
import { EventsFilterBar } from "./events-filter-bar";
import { RsvpButton } from "@/components/public/rsvp-button";

/* Re-export the statusTone for recommendations table below */

/* ── Shared helpers ──────────────────────────────────────────── */

function memberLinks(activeKey: string) {
  return [
    { key: "overview", label: "Overview", href: "/dashboard" as Route },
    { key: "events", label: "My Events", href: "/dashboard/calendar" as Route },
    { key: "groups", label: "Groups", href: "/dashboard/groups" as Route },
    { key: "messages", label: "Messages", href: "/dashboard/messages" as Route },
    { key: "transactions", label: "Payments", href: "/dashboard/transactions" as Route },
    { key: "notifications", label: "Notifications", href: "/dashboard/notifications" as Route },
    { key: "profile", label: "Profile", href: "/settings" as Route },
  ].map((l) => ({ href: l.href, label: l.label, active: l.key === activeKey }));
}

function statusTone(s: string): DashboardTone {
  if (/active|published|approved|going|accepted|completed|confirmed/i.test(s)) return "sage";
  if (/pending|draft|waitlisted|waitlist/i.test(s)) return "sand";
  if (/cancelled|rejected|suspended|declined/i.test(s)) return "coral";
  return "neutral";
}

/* ── Screen ──────────────────────────────────────────────────── */

export async function MemberCalendarScreen() {
  const data = await getMemberPortalData();

  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <PortalShell
      eyebrow="Member portal"
      title="My Events"
      description="Your calendar, RSVPs, and event history."
      links={memberLinks("events")}
      roleMode="member"
    >
      {/* ── Filter bar + filterable table (client component) ── */}
      <EventsFilterBar events={data.upcomingEvents.map((e) => ({
        event: { slug: e.event.slug, title: e.event.title, venueName: e.event.venueName },
        status: e.status,
        seat: e.seat,
      }))} />

      {/* ── Calendar view ───────────────────────────────────── */}
      <Surface
        eyebrow="Calendar"
        title="March 2026"
        description="Days with your RSVPs are highlighted. Tap a day to see event details."
      >
        <CalendarMatrix
          monthLabel="March 2026"
          weekdays={weekdays}
          days={data.calendarDays}
        />
      </Surface>

      {/* ── Recommendations ─────────────────────────────────── */}
      <Surface
        eyebrow="For you"
        title="Recommended events"
        description="Events matched to your interests, attendance history, and group activity."
      >
        <DashboardTable
          columns={["Event", "Venue", "Match", "Why", "Action"]}
          rows={data.recommendations.map((r) => ({
            key: r.event.slug,
            cells: [
              <Link
                key="title"
                href={`/events/${r.event.slug}` as Route}
                className="font-medium text-brand-indigo hover:underline"
              >
                {r.event.title}
              </Link>,
              r.event.venueName,
              <ToneBadge key="score" tone="indigo">{r.score}</ToneBadge>,
              <span key="reason" className="text-brand-text-muted">{r.reason}</span>,
              <RsvpButton key="rsvp" eventSlug={r.event.slug} className="!min-h-0 !px-3 !py-1.5 !text-xs" />,
            ],
          }))}
          caption="Recommended events"
        />
      </Surface>
    </PortalShell>
  );
}
