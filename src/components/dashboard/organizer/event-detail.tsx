import type { Route } from "next";
import Link from "next/link";
import { PortalShell } from "@/components/layout/portal-shell";
import {
  Surface,
  StatCard,
  DashboardTable,
  ActivityFeed,
  ToneBadge,
  KeyValueList,
  AvatarStamp,
} from "@/components/dashboard/primitives";
import type { DashboardTone } from "@/components/dashboard/primitives";
import { getManagedOrganizerEvent } from "@/lib/dashboard-fetchers";
import {
  Users,
  Clock,
  Ticket,
  DollarSign,
  ScanQrCode,
  ArrowRight,
} from "lucide-react";

function organizerLinks(activeKey: string) {
  return [
    { key: "overview", label: "Overview", href: "/organizer" as Route },
    { key: "events", label: "Events", href: "/organizer/events" as Route },
    { key: "groups", label: "Groups", href: "/organizer/groups" as Route },
    { key: "bookings", label: "Bookings", href: "/organizer/bookings" as Route },
    { key: "venues", label: "Venues", href: "/organizer/venues" as Route },
    { key: "messages", label: "Messages", href: "/organizer/messages" as Route },
  ].map((l) => ({ href: l.href, label: l.label, active: l.key === activeKey }));
}

function statusTone(s: string): DashboardTone {
  if (/active|published|approved|going|accepted|completed|paid/i.test(s)) return "sage";
  if (/pending|draft|waitlisted|waitlist|countered|hold|invoice/i.test(s)) return "sand";
  if (/cancelled|rejected|suspended|declined|refunded/i.test(s)) return "coral";
  return "neutral";
}

export async function OrganizerEventDetailScreen({ slug }: { slug: string }) {
  const event = await getManagedOrganizerEvent(slug);

  if (!event) {
    return (
      <PortalShell
        eyebrow="Organizer portal"
        title="Event not found"
        description="The event you are looking for does not exist or you do not have access to it."
        links={organizerLinks("events")}
        roleMode="organizer"
      >
        <div className="rounded-xl border border-brand-border-light bg-white p-8 text-center">
          <p className="text-sm text-brand-text-muted">
            No event matches the slug &ldquo;{slug}&rdquo;.
          </p>
          <Link
            href={"/organizer/events" as Route}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-indigo hover:underline"
          >
            Back to events
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </PortalShell>
    );
  }

  const hasPaidTickets = event.ticketsSold > 0;
  const fillRate =
    event.capacity > 0
      ? Math.round((event.rsvps / event.capacity) * 100)
      : 0;

  // Build timeline for activity feed
  const timelineFeed = event.timeline.map((t, i) => ({
    key: `tl-${i}`,
    title: t.label,
    detail: `Scheduled for ${t.time}`,
    meta: t.time,
    tone: (i === 0 ? "indigo" : "neutral") as DashboardTone,
  }));

  return (
    <PortalShell
      eyebrow="Organizer portal"
      title={event.title}
      description={`${event.groupName} — ${event.dateLabel} at ${event.venueName}`}
      links={organizerLinks("events")}
      roleMode="organizer"
      breadcrumbs={["Events", event.title]}
      primaryAction={{
        href: `/organizer/events/${slug}/checkin` as Route,
        label: "QR Check-in",
      }}
    >
      <div className="space-y-6">
        {/* Event header with status */}
        <div className="flex flex-wrap items-center gap-3">
          <ToneBadge tone={statusTone(event.status)}>{event.status}</ToneBadge>
          <span className="text-sm text-brand-text-muted">
            {event.approvalMode}
          </span>
          {event.commentsSummary && (
            <span className="text-sm text-brand-text-muted">
              {event.commentsSummary}
            </span>
          )}
        </div>

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="RSVPs"
            value={`${event.rsvps} / ${event.capacity}`}
            detail={`${fillRate}% fill rate across all ticket types.`}
            delta={event.waitlist > 0 ? `${event.waitlist} on waitlist` : "No waitlist"}
            tone="indigo"
            icon={Users}
          />
          <StatCard
            label="Waitlist"
            value={String(event.waitlist)}
            detail={
              event.waitlist > 0
                ? "These attendees will auto-promote if seats open."
                : "No one is currently waiting for a spot."
            }
            tone={event.waitlist > 0 ? "sand" : "sage"}
            icon={Clock}
          />
          <StatCard
            label="Check-ins"
            value={event.checkIns}
            detail="Use QR check-in at the door or manually mark attendees."
            tone="sage"
            icon={ScanQrCode}
          />
          <StatCard
            label="Revenue"
            value={event.revenue}
            detail={`${event.ticketsSold} tickets sold so far.`}
            delta={hasPaidTickets ? "Paid event" : "Free event"}
            tone={hasPaidTickets ? "indigo" : "neutral"}
            icon={hasPaidTickets ? DollarSign : Ticket}
          />
        </div>

        {/* Event notes */}
        {event.notes && (
          <div className="rounded-xl border border-brand-border-light bg-brand-sand-light p-4">
            <div className="text-xs font-medium uppercase tracking-wider text-brand-text-light">
              Organizer notes
            </div>
            <p className="mt-1 text-sm leading-relaxed text-brand-text">
              {event.notes}
            </p>
          </div>
        )}

        {/* Attendees table */}
        <Surface
          eyebrow="Attendees"
          title="Attendee list"
          description={`${event.attendees.length} attendees registered for this event.`}
        >
          <DashboardTable
            columns={["Name", "Status", "Ticket", "Checked in", "Note"]}
            rows={event.attendees.map((a) => ({
              key: a.name,
              cells: [
                <div key="name" className="flex items-center gap-2">
                  <AvatarStamp name={a.name} size="sm" />
                  <span className="font-medium">{a.name}</span>
                </div>,
                <ToneBadge key="status" tone={statusTone(a.status)}>
                  {a.status}
                </ToneBadge>,
                <ToneBadge key="ticket" tone={statusTone(a.ticket)}>
                  {a.ticket}
                </ToneBadge>,
                <span
                  key="checkin"
                  className={
                    String(a.checkedIn) === "Yes"
                      ? "font-medium text-brand-sage"
                      : "text-brand-text-muted"
                  }
                >
                  {String(a.checkedIn) === "Yes" ? "Checked in" : "Not yet"}
                </span>,
                <span key="note" className="text-brand-text-muted">
                  {a.note}
                </span>,
              ],
            }))}
            caption="Event attendees"
          />
        </Surface>

        {/* Timeline + Co-organizers side by side */}
        <div className="grid gap-6 xl:grid-cols-2">
          <Surface
            eyebrow="Schedule"
            title="Event timeline"
            description="The run of show for this event."
          >
            <ActivityFeed items={timelineFeed} />
          </Surface>

          <div className="space-y-6">
            {/* Co-organizers */}
            <Surface
              eyebrow="Team"
              title="Co-organizers"
              description="People helping run this event."
            >
              <div className="space-y-2">
                {event.coOrganizers.map((name) => (
                  <div
                    key={name}
                    className="flex items-center gap-3 rounded-lg border border-brand-border-light bg-white p-3"
                  >
                    <AvatarStamp name={name} size="sm" />
                    <div>
                      <div className="text-sm font-medium text-brand-text">
                        {name}
                      </div>
                      <div className="text-xs text-brand-text-muted">
                        Co-organizer
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Surface>

            {/* Revenue details for paid events */}
            {hasPaidTickets && (
              <Surface
                eyebrow="Financials"
                title="Revenue breakdown"
                description="Ticket revenue for this event."
              >
                <KeyValueList
                  items={[
                    {
                      key: "sold",
                      label: "Tickets sold",
                      value: String(event.ticketsSold),
                    },
                    {
                      key: "revenue",
                      label: "Total revenue",
                      value: event.revenue,
                    },
                    {
                      key: "capacity",
                      label: "Total capacity",
                      value: String(event.capacity),
                    },
                    {
                      key: "fill",
                      label: "Fill rate",
                      value: `${fillRate}%`,
                    },
                  ]}
                />
              </Surface>
            )}
          </div>
        </div>

        {/* QR Check-in CTA */}
        <div className="rounded-xl border border-brand-border-light bg-white p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-indigo/10 text-brand-indigo">
                <ScanQrCode className="h-5 w-5" />
              </span>
              <div>
                <div className="text-sm font-semibold text-brand-text">
                  QR Check-in station
                </div>
                <p className="mt-0.5 text-sm text-brand-text-muted">
                  Open the check-in screen to scan attendee QR codes or search by name at the door.
                </p>
              </div>
            </div>
            <Link
              href={`/organizer/events/${slug}/checkin` as Route}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-indigo px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-indigo/90"
            >
              Open check-in
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
