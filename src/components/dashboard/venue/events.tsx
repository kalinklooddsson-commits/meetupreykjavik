import Link from "next/link";
import type { Route } from "next";
import { CalendarDays } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import {
  Surface,
  DashboardTable,
  ToneBadge,
  AvatarStamp,
} from "@/components/dashboard/primitives";
import type { DashboardTone } from "@/components/dashboard/primitives";
import { getVenuePortalData } from "@/lib/dashboard-fetchers";

/* ── Helpers ─────────────────────────────────────────────────── */

function venueLinks(activeKey: string) {
  return [
    { key: "overview", label: "Overview", href: "/venue/dashboard" as Route },
    { key: "bookings", label: "Bookings", href: "/venue/bookings" as Route },
    { key: "availability", label: "Availability", href: "/venue/availability" as Route },
    { key: "deals", label: "Deals", href: "/venue/deals" as Route },
    { key: "events", label: "Events", href: "/venue/events" as Route },
    { key: "reviews", label: "Reviews", href: "/venue/reviews" as Route },
    { key: "analytics", label: "Analytics", href: "/venue/analytics" as Route },
    { key: "profile", label: "Profile", href: "/venue/profile" as Route },
  ].map((l) => ({ href: l.href, label: l.label, active: l.key === activeKey }));
}

function statusTone(s: string): DashboardTone {
  if (/active|published|approved|going|accepted|completed|confirmed/i.test(s)) return "sage";
  if (/pending|draft|waitlisted|counter|transferred/i.test(s)) return "sand";
  if (/cancelled|rejected|suspended|declined/i.test(s)) return "coral";
  return "neutral";
}

/* ── Screen ──────────────────────────────────────────────────── */

export async function VenueEventsScreen() {
  const data = await getVenuePortalData();

  return (
    <PortalShell
      eyebrow="Venue portal"
      title="Events"
      description="All events scheduled at your venue."
      links={venueLinks("events")}
      roleMode="venue"
    >
      <Surface
        eyebrow="Schedule"
        title="Upcoming events"
        description="Events confirmed or pending at your venue, sorted by date."
      >
        <DashboardTable
          columns={["Event", "Organizer", "Status", "Note"]}
          rows={data.upcomingEvents.map((e) => ({
            key: e.event.slug,
            cells: [
              <Link
                key="title"
                href={`/events/${e.event.slug}` as Route}
                className="font-medium text-brand-indigo hover:underline"
              >
                {e.event.title}
              </Link>,
              <div key="org" className="flex items-center gap-2">
                <AvatarStamp name={e.organizer} size="sm" />
                <span>{e.organizer}</span>
              </div>,
              <ToneBadge key="status" tone={statusTone(e.status)}>
                {e.status}
              </ToneBadge>,
              <span key="note" className="text-brand-text-muted">{e.note}</span>,
            ],
          }))}
          caption="Upcoming venue events"
        />
      </Surface>

      {data.upcomingEvents.length === 0 && (
        <Surface
          eyebrow="No events"
          title="No upcoming events"
          description="There are no events currently scheduled at your venue."
        >
          <div className="flex items-center gap-4 rounded-lg border border-brand-border-light bg-brand-sand-light p-4">
            <CalendarDays className="h-8 w-8 text-brand-text-muted" />
            <div>
              <p className="text-sm font-medium text-brand-text">
                Events will appear here once organizers book your venue.
              </p>
              <p className="mt-1 text-sm text-brand-text-muted">
                Make sure your availability is up to date and your profile is complete to attract bookings.
              </p>
            </div>
          </div>
        </Surface>
      )}
    </PortalShell>
  );
}
