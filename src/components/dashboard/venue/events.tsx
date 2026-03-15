import Link from "next/link";
import type { Route } from "next";
import { CalendarDays, Plus } from "lucide-react";
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
    { key: "messages", label: "Messages", href: "/venue/messages" as Route },
    { key: "notifications", label: "Notifications", href: "/venue/notifications" as Route },
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
      {/* Create event action */}
      <div className="mb-6 flex justify-end">
        <Link
          href={"/venue/events/new" as Route}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-indigo px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-indigo-light"
        >
          <Plus className="h-4 w-4" />
          Create event
        </Link>
      </div>

      <Surface
        eyebrow="Schedule"
        title="Upcoming events"
        description="Events confirmed or pending at your venue, sorted by date."
      >
        {data.upcomingEvents.length > 0 ? (
          <DashboardTable
            columns={["Event", "Date", "Organizer", "Status", "Note"]}
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
                <span key="date" className="tabular-nums text-brand-text-muted">{e.date ?? ""}</span>,
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
        ) : (
          <p className="py-8 text-center text-sm text-gray-500">
            No upcoming events at your venue yet.
          </p>
        )}
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
                Create your own event or wait for organizers to book your venue.
              </p>
              <p className="mt-1 text-sm text-brand-text-muted">
                Use the &ldquo;Create event&rdquo; button above to host an event at your venue.
              </p>
            </div>
          </div>
        </Surface>
      )}
    </PortalShell>
  );
}
