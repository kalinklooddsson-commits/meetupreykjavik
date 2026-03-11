import type { Route } from "next";
import {
  CalendarClock,
  BellRing,
  ClipboardCheck,
  CopyPlus,
  LayoutGrid,
  MapPinned,
  MessageSquareMore,
  ScanQrCode,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import {
  ActivityFeed,
  DashboardTable,
  FilterChips,
  KeyValueList,
  QuickActionCard,
  StatCard,
  StreamCard,
  Surface,
  ToneBadge,
  TrendChart,
} from "@/components/dashboard/primitives";
import {
  getManagedOrganizerEvent,
  organizerPortalData,
} from "@/lib/dashboard-data";
import {
  OrganizerAttendeeControlCenter,
  OrganizerVenueRequestStudio,
} from "@/components/dashboard/operations-panels";
import type { ComponentProps } from "react";

function organizerLinks(activeHref: Route) {
  return [
    { href: "/organizer" as Route, label: "Overview", active: activeHref === "/organizer" },
    {
      href: "/organizer/groups" as Route,
      label: "Groups",
      active: activeHref === "/organizer/groups",
    },
    {
      href: "/organizer/events" as Route,
      label: "Events",
      active: activeHref === "/organizer/events",
    },
    {
      href: "/organizer/venues" as Route,
      label: "Venue browser",
      active: activeHref === "/organizer/venues",
    },
    {
      href: "/organizer/messages" as Route,
      label: "Messages",
      active: activeHref === "/organizer/messages",
    },
    {
      href: "/organizer/notifications" as Route,
      label: "Notifications",
      active: activeHref === "/organizer/notifications",
    },
  ];
}

function statusTone(status: string) {
  const normalized = status.toLowerCase();

  if (
    normalized.includes("draft") ||
    normalized.includes("pending") ||
    normalized.includes("counter")
  ) {
    return "coral" as const;
  }

  if (
    normalized.includes("feature") ||
    normalized.includes("accepted") ||
    normalized.includes("published")
  ) {
    return "sage" as const;
  }

  return "indigo" as const;
}

function OrganizerShell(props: ComponentProps<typeof PortalShell>) {
  return <PortalShell roleMode="organizer" {...props} />;
}

export function OrganizerMessagesScreen() {
  return (
    <OrganizerShell
      eyebrow="Organizer messages"
      title="Messages"
      description="Venue negotiations, attendee asks, and host threads."
      links={organizerLinks("/organizer/messages")}
    >
      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <Surface
          eyebrow="Message queue"
          title="Current conversations"
        >
          <div className="space-y-4">
            {organizerPortalData.messages.map((message) => (
              <StreamCard
                key={message.key}
                eyebrow={
                  <>
                    <span className="text-[var(--brand-text)]">{message.counterpart}</span>
                    <span className="mx-2 text-[var(--brand-border)]">·</span>
                    {message.role} · {message.channel}
                  </>
                }
                badge={
                  <ToneBadge tone={message.status.includes("reply") || message.status.includes("Unread") ? "coral" : "indigo"}>
                    {message.status}
                  </ToneBadge>
                }
                title={message.subject}
                description={message.preview}
                meta={message.meta}
              />
            ))}
          </div>
        </Surface>

        <div className="space-y-6">
          <Surface
            eyebrow="Lanes"
            title="Message filters"
          >
            <FilterChips
              items={[
                { key: "all", label: "All threads", active: true, tone: "indigo" },
                { key: "venue", label: "Venue negotiation", tone: "coral" },
                { key: "attendees", label: "Attendees" },
                { key: "hosts", label: "Host ops", tone: "sage" },
              ]}
            />
          </Surface>

          <Surface
            eyebrow="Linked alerts"
            title="Related notifications"
          >
            <ActivityFeed items={organizerPortalData.notifications} />
          </Surface>
        </div>
      </div>
    </OrganizerShell>
  );
}

export function OrganizerNotificationsScreen() {
  return (
    <OrganizerShell
      eyebrow="Organizer notifications"
      title="Notifications"
      description="Approvals, template signals, and revenue alerts."
      links={organizerLinks("/organizer/notifications")}
    >
      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <Surface
          eyebrow="Alert stream"
          title="Recent notifications"
        >
          <div className="space-y-4">
            {organizerPortalData.notifications.map((item) => (
              <StreamCard
                key={item.key}
                eyebrow={item.channel}
                badge={<ToneBadge tone={item.tone}>{item.status}</ToneBadge>}
                title={item.title}
                description={item.detail}
                meta={item.meta}
              />
            ))}
          </div>
        </Surface>

        <Surface
          eyebrow="Filters"
          title="Notification lanes"
        >
          <FilterChips
            items={[
              { key: "all", label: "All", active: true, tone: "indigo" },
              { key: "approvals", label: "Approvals", tone: "coral" },
              { key: "revenue", label: "Revenue", tone: "sage" },
              { key: "templates", label: "Templates" },
            ]}
          />
        </Surface>
      </div>
    </OrganizerShell>
  );
}

export function OrganizerOverviewScreen() {
  return (
    <OrganizerShell
      eyebrow="Organizer dashboard"
      title="Host tools and attendee flow"
      description="Your organizer overview."
      links={organizerLinks("/organizer")}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {organizerPortalData.metrics.map((metric, index) => (
          <StatCard
            key={metric.label}
            {...metric}
            icon={[UsersRound, ClipboardCheck, CopyPlus, MapPinned][index]}
            tone={index === 1 ? "coral" : index === 3 ? "sage" : "indigo"}
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <Surface
          eyebrow="Trend"
          title="RSVP flow this week"
        >
          <TrendChart
            data={organizerPortalData.rsvpTrend}
            tone="indigo"
            formatValue={(value) => `${value}`}
          />
        </Surface>

        <Surface
          eyebrow="Activity"
          title="What needs attention"
        >
          <ActivityFeed items={organizerPortalData.activityFeed} />
        </Surface>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Surface
          eyebrow="Next 5"
          title="Upcoming events"
          actionLabel="Create new event"
          actionHref="/events/new"
        >
          <div className="space-y-4">
            {organizerPortalData.nextEvents.map((event) => (
              <div
                key={event.slug}
                className="rounded-lg border border-[var(--brand-border-light)] bg-white p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-[var(--brand-text)]">
                      {event.title}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--brand-text-muted)]">
                      {event.groupName} · {event.venueName} · {event.dateLabel}
                    </p>
                  </div>
                  <ToneBadge tone={statusTone(event.status)}>{event.status}</ToneBadge>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-4">
                  <div className="rounded-md bg-[var(--brand-sand-light)] px-3 py-2 text-sm">
                    <div className="text-[11px] font-medium uppercase tracking-wider text-[var(--brand-text-light)]">
                      RSVP
                    </div>
                    <div className="mt-1 font-semibold text-[var(--brand-text)]">
                      {event.rsvps} / {event.capacity}
                    </div>
                  </div>
                  <div className="rounded-md bg-[var(--brand-sand-light)] px-3 py-2 text-sm">
                    <div className="text-[11px] font-medium uppercase tracking-wider text-[var(--brand-text-light)]">
                      Waitlist
                    </div>
                    <div className="mt-1 font-semibold text-[var(--brand-text)]">
                      {event.waitlist}
                    </div>
                  </div>
                  <div className="rounded-md bg-[var(--brand-sand-light)] px-3 py-2 text-sm">
                    <div className="text-[11px] font-medium uppercase tracking-wider text-[var(--brand-text-light)]">
                      Tickets
                    </div>
                    <div className="mt-1 font-semibold text-[var(--brand-text)]">
                      {event.ticketsSold}
                    </div>
                  </div>
                  <div className="rounded-md bg-[var(--brand-sand-light)] px-3 py-2 text-sm">
                    <div className="text-[11px] font-medium uppercase tracking-wider text-[var(--brand-text-light)]">
                      Revenue
                    </div>
                    <div className="mt-1 font-semibold text-[var(--brand-text)]">
                      {event.revenue}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Surface>

        <Surface
          eyebrow="Actions"
          title="Quick actions"
        >
          <div className="grid gap-4">
            {organizerPortalData.quickActions.map((action, index) => (
              <QuickActionCard
                key={action.href}
                href={action.href as Route}
                title={action.title}
                description={action.description}
                icon={[CalendarClock, ScanQrCode, MapPinned, LayoutGrid][index]}
              />
            ))}
          </div>
        </Surface>
      </div>
    </OrganizerShell>
  );
}

export function OrganizerGroupsScreen() {
  return (
    <OrganizerShell
      eyebrow="Organizer groups"
      title="Group management"
      description="All groups, members, and co-host context."
      links={organizerLinks("/organizer/groups")}
    >
      <Surface
        eyebrow="Filters"
        title="Your groups"
        actionLabel="Create new group"
        actionHref="/groups/new"
      >
        <FilterChips
          items={[
            { key: "all", label: "All groups", active: true, tone: "indigo" },
            { key: "active", label: "Active", tone: "sage" },
            { key: "featured", label: "Featured", tone: "coral" },
            { key: "needs-love", label: "Needs cadence", tone: "coral" },
          ]}
        />
        <div className="mt-6">
          <DashboardTable
            columns={[
              "Group",
              "Join mode",
              "Status",
              "Pending",
              "Co-hosts",
              "Next event",
              "Health",
            ]}
            rows={organizerPortalData.groups.map((item) => ({
              key: item.group.slug,
              cells: [
                <div key="group">
                  <div className="font-semibold text-[var(--brand-text)]">{item.group.name}</div>
                  <div className="text-xs text-[var(--brand-text-muted)]">
                    {item.group.members} members
                  </div>
                </div>,
                item.joinMode,
                <ToneBadge key="status" tone={statusTone(item.status)}>
                  {item.status}
                </ToneBadge>,
                String(item.pendingMembers),
                String(item.coHosts),
                item.nextEvent,
                item.health,
              ],
            }))}
          />
        </div>
      </Surface>
    </OrganizerShell>
  );
}

export function OrganizerEventsScreen() {
  return (
    <OrganizerShell
      eyebrow="Organizer events"
      title="Event list and calendar"
      description="Published, draft, and recurring events."
      links={organizerLinks("/organizer/events")}
    >
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Surface
          eyebrow="Event table"
          title="All events"
          actionLabel="Create new event"
          actionHref="/events/new"
        >
          <FilterChips
            items={[
              { key: "table", label: "Table view", active: true, tone: "indigo" },
              { key: "calendar", label: "Calendar view", tone: "sage" },
              { key: "approval", label: "Approval mode", tone: "coral" },
              { key: "paid", label: "Paid events", tone: "sand" },
            ]}
          />
          <div className="mt-6">
            <DashboardTable
              columns={[
                "Event",
                "Group",
                "Status",
                "RSVPs",
                "Waitlist",
                "Tickets",
                "Revenue",
              ]}
              rows={organizerPortalData.events.map((event) => ({
                key: event.slug,
                cells: [
                  <div key="event">
                    <div className="font-semibold text-[var(--brand-text)]">{event.title}</div>
                    <div className="text-xs text-[var(--brand-text-muted)]">{event.dateLabel}</div>
                  </div>,
                  event.groupName,
                  <ToneBadge key="status" tone={statusTone(event.status)}>
                    {event.status}
                  </ToneBadge>,
                  `${event.rsvps}/${event.capacity}`,
                  String(event.waitlist),
                  String(event.ticketsSold),
                  event.revenue,
                ],
              }))}
            />
          </div>
        </Surface>

        <div className="space-y-6">
          <Surface
            eyebrow="Calendar"
            title="March workload"
          >
            <div className="space-y-3">
              {organizerPortalData.events.map((event) => (
                <div
                  key={event.slug}
                  className="flex items-center justify-between gap-4 rounded-md border border-[var(--brand-border-light)] bg-white px-4 py-3"
                >
                  <div>
                    <div className="font-semibold text-[var(--brand-text)]">{event.dateLabel}</div>
                    <div className="text-sm text-[var(--brand-text-muted)]">{event.title}</div>
                  </div>
                  <ToneBadge tone={statusTone(event.status)}>{event.status}</ToneBadge>
                </div>
              ))}
            </div>
          </Surface>

          <Surface
            eyebrow="Templates"
            title="Repeatable event formats"
          >
            <div className="grid gap-3">
              {organizerPortalData.templates.map((template) => (
                <div
                  key={template}
                  className="rounded-md border border-[var(--brand-border-light)] bg-[var(--brand-sand-light)] px-4 py-3 text-sm font-semibold text-[var(--brand-text)]"
                >
                  {template}
                </div>
              ))}
            </div>
          </Surface>
        </div>
      </div>
    </OrganizerShell>
  );
}

export function OrganizerEventDetailScreen({ slug }: { slug: string }) {
  const event = getManagedOrganizerEvent(slug);

  if (!event) {
    return null;
  }

  return (
    <OrganizerShell
      eyebrow="Organizer event"
      title={event.title}
      description="Event details and attendee management."
      links={organizerLinks("/organizer/events")}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Capacity" value={`${event.rsvps}/${event.capacity}`} delta={event.status} detail="Live seats" icon={UsersRound} tone="indigo" />
        <StatCard label="Waitlist" value={String(event.waitlist)} delta={event.approvalMode} detail="Approval mode" icon={ClipboardCheck} tone="coral" />
        <StatCard label="Ticket sales" value={String(event.ticketsSold)} delta={event.revenue} detail="Revenue" icon={Sparkles} tone="sage" />
        <StatCard label="Check-in" value={event.checkIns} delta="QR workflow" detail="Door check" icon={ScanQrCode} tone="indigo" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Surface
          eyebrow="Timeline"
          title="Run of show"
          description={event.notes}
        >
          <div className="space-y-3">
            {event.timeline.map((step) => (
              <div
                key={step.time}
                className="flex items-center justify-between gap-4 rounded-md border border-[var(--brand-border-light)] bg-white px-4 py-3"
              >
                <div className="font-semibold text-[var(--brand-text)]">{step.label}</div>
                <ToneBadge tone="sand">{step.time}</ToneBadge>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-[var(--brand-border-light)] bg-[var(--brand-sand-light)] p-4">
              <div className="text-xs font-medium uppercase tracking-wider text-[var(--brand-text-light)]">
                Co-organizers
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {event.coOrganizers.map((person) => (
                  <ToneBadge key={person} tone="sage">
                    {person}
                  </ToneBadge>
                ))}
              </div>
            </div>
            <div className="rounded-md border border-[var(--brand-border-light)] bg-[var(--brand-sand-light)] p-4">
              <div className="text-xs font-medium uppercase tracking-wider text-[var(--brand-text-light)]">
                Discussion
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[var(--brand-text-muted)]">
                {event.commentsSummary}
              </p>
            </div>
          </div>
        </Surface>

        <Surface
          eyebrow="Attendees"
          title="Approve, reject, and check in"
        >
          <DashboardTable
            columns={["Attendee", "Status", "Ticket", "Check-in", "Context"]}
            rows={event.attendees.map((attendee) => ({
              key: attendee.name,
              cells: [
                attendee.name,
                <ToneBadge key="status" tone={statusTone(attendee.status)}>
                  {attendee.status}
                </ToneBadge>,
                attendee.ticket,
                attendee.checkedIn,
                attendee.note,
              ],
            }))}
          />
        </Surface>
      </div>

      <Surface
        eyebrow="Action desk"
        title="Attendee operations"
      >
        <OrganizerAttendeeControlCenter attendees={event.attendees} />
      </Surface>

      <div className="grid gap-6 xl:grid-cols-[0.96fr_1.04fr]">
        <Surface
          eyebrow="Guest intelligence"
          title={organizerPortalData.attendeeIntelligence.featuredProfile}
          description={organizerPortalData.attendeeIntelligence.summary}
        >
          <div className="space-y-4">
            {organizerPortalData.attendeeIntelligence.fitSignals.map((signal) => (
              <article
                key={signal.key}
                className="rounded-lg border border-[var(--brand-border-light)] bg-white p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-[var(--brand-text)]">{signal.label}</div>
                  <ToneBadge
                    tone={
                      signal.score >= 85
                        ? "sage"
                        : signal.score >= 65
                          ? "coral"
                          : "basalt"
                    }
                  >
                    {signal.score}%
                  </ToneBadge>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[var(--brand-text-muted)]">
                  {signal.note}
                </p>
              </article>
            ))}
          </div>
        </Surface>

        <Surface
          eyebrow="Host guidance"
          title="Arrival, seating, and pacing notes"
        >
          <KeyValueList
            items={organizerPortalData.attendeeIntelligence.arrivalProfile.map((item) => ({
              key: item.label,
              label: item.label,
              value: item.value,
            }))}
          />
          <div className="mt-5 space-y-3">
            {organizerPortalData.attendeeIntelligence.hostingNotes.map((note) => (
              <div
                key={note}
                className="rounded-md border border-[var(--brand-border-light)] bg-[var(--brand-sand-light)] px-4 py-3 text-sm leading-relaxed text-[var(--brand-text-muted)]"
              >
                {note}
              </div>
            ))}
          </div>
        </Surface>
      </div>
    </OrganizerShell>
  );
}

export function OrganizerVenuesScreen() {
  return (
    <OrganizerShell
      eyebrow="Organizer venues"
      title="Venue browser"
      description="Find and book partner venues."
      links={organizerLinks("/organizer/venues")}
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Surface
          eyebrow="Venue browser"
          title="Matched partner venues"
        >
          <FilterChips
            items={[
              { key: "capacity", label: "Capacity 40+", active: true, tone: "indigo" },
              { key: "evening", label: "Evening slots", tone: "sage" },
              { key: "101", label: "101 Reykjavik", tone: "sand" },
              { key: "hosted", label: "Hosted format fit", tone: "coral" },
            ]}
          />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {organizerPortalData.venueMatches.map(({ venue, score, nextSlot, fit }) => (
              <article
                key={venue.slug}
                className="rounded-lg border border-[var(--brand-border-light)] bg-white p-4"
              >
                <div
                  className="h-28 rounded-md"
                  style={{ background: venue.art }}
                  aria-hidden="true"
                />
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <ToneBadge tone="sage">{score} fit</ToneBadge>
                  <ToneBadge tone="sand">{venue.area}</ToneBadge>
                </div>
                <div className="mt-2 text-base font-semibold text-[var(--brand-text)]">
                  {venue.name}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[var(--brand-text-muted)]">{fit}</p>
                <div className="mt-3 text-sm font-semibold text-[var(--brand-text)]">
                  Next slot: {nextSlot}
                </div>
              </article>
            ))}
          </div>
        </Surface>

        <Surface
          eyebrow="Pipeline"
          title="Booking requests"
        >
          <DashboardTable
            columns={["Organizer", "Venue", "Status", "Date", "Note"]}
            rows={organizerPortalData.bookingPipeline.map((item) => ({
              key: item.key,
              cells: [
                item.organizer,
                item.venue,
                <ToneBadge key="status" tone={statusTone(item.status)}>
                  {item.status}
                </ToneBadge>,
                item.date,
                item.note,
              ],
            }))}
          />
        </Surface>
      </div>

      <Surface
        eyebrow="Request desk"
        title="Compose venue requests"
      >
        <OrganizerVenueRequestStudio
          matches={organizerPortalData.venueMatches}
          pipeline={organizerPortalData.bookingPipeline}
        />
      </Surface>
    </OrganizerShell>
  );
}
