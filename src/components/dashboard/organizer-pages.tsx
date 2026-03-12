import type { Route } from "next";
import {
  CalendarClock,
  ClipboardCheck,
  CopyPlus,
  LayoutGrid,
  MapPinned,
  ScanQrCode,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import {
  ActivityFeed,
  DashboardTable,
  DecisionStrip,
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
  getOrganizerPortalData,
} from "@/lib/dashboard-fetchers";
import {
  OrganizerAttendeeControlCenter,
  OrganizerVenueRequestStudio,
} from "@/components/dashboard/operations-panels";
import { QrCheckin } from "@/components/dashboard/qr-checkin";
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

export async function OrganizerMessagesScreen() {
  const organizerPortalData = await getOrganizerPortalData();
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
                    <span className="text-brand-text">{message.counterpart}</span>
                    <span className="mx-2 text-brand-border">·</span>
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

export async function OrganizerNotificationsScreen() {
  const organizerPortalData = await getOrganizerPortalData();
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

export async function OrganizerOverviewScreen() {
  const organizerPortalData = await getOrganizerPortalData();
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
                className="rounded-lg border border-brand-border-light bg-white p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-brand-text">
                      {event.title}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-brand-text-muted">
                      {event.groupName} · {event.venueName} · {event.dateLabel}
                    </p>
                  </div>
                  <ToneBadge tone={statusTone(event.status)}>{event.status}</ToneBadge>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-4">
                  <div className="rounded-md bg-brand-sand-light px-3 py-2 text-sm">
                    <div className="text-[11px] font-medium uppercase tracking-wider text-brand-text-light">
                      RSVP
                    </div>
                    <div className="mt-1 font-semibold text-brand-text">
                      {event.rsvps} / {event.capacity}
                    </div>
                  </div>
                  <div className="rounded-md bg-brand-sand-light px-3 py-2 text-sm">
                    <div className="text-[11px] font-medium uppercase tracking-wider text-brand-text-light">
                      Waitlist
                    </div>
                    <div className="mt-1 font-semibold text-brand-text">
                      {event.waitlist}
                    </div>
                  </div>
                  <div className="rounded-md bg-brand-sand-light px-3 py-2 text-sm">
                    <div className="text-[11px] font-medium uppercase tracking-wider text-brand-text-light">
                      Tickets
                    </div>
                    <div className="mt-1 font-semibold text-brand-text">
                      {event.ticketsSold}
                    </div>
                  </div>
                  <div className="rounded-md bg-brand-sand-light px-3 py-2 text-sm">
                    <div className="text-[11px] font-medium uppercase tracking-wider text-brand-text-light">
                      Revenue
                    </div>
                    <div className="mt-1 font-semibold text-brand-text">
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

export async function OrganizerGroupsScreen() {
  const organizerPortalData = await getOrganizerPortalData();
  const approvalGroups = organizerPortalData.groups.filter((group) =>
    group.joinMode.toLowerCase().includes("approval"),
  ).length;
  const cadenceRiskGroups = organizerPortalData.groups.filter((group) =>
    group.status.toLowerCase().includes("review"),
  ).length;
  const pendingRequests = organizerPortalData.groups.reduce(
    (sum, group) => sum + group.pendingMembers,
    0,
  );
  const totalCoHosts = organizerPortalData.groups.reduce((sum, group) => sum + group.coHosts, 0);

  return (
    <OrganizerShell
      eyebrow="Organizer groups"
      title="Group management"
      description="All groups, members, and co-host context."
      links={organizerLinks("/organizer/groups")}
    >
      <DecisionStrip
        eyebrow="Group read"
        title="What your communities need from you"
        description="Scan membership pressure, cadence risk, and host coverage before opening the full group directory."
        items={[
          {
            key: "membership",
            label: "Membership",
            summary: `${pendingRequests} member requests are sitting across ${approvalGroups} approval-based groups.`,
            meta: "If join requests stall, the best potential newcomers never reach the event layer.",
            tone: "coral",
          },
          {
            key: "cadence",
            label: "Cadence",
            summary: `${cadenceRiskGroups} group lanes are showing signs of weak recurring rhythm or low event cadence.`,
            meta: "Protect repeatable groups first. A strong recurring calendar does more work than one-off event spikes.",
            tone: "indigo",
          },
          {
            key: "host-coverage",
            label: "Host coverage",
            summary: `${totalCoHosts} co-hosts are spread across your current groups.`,
            meta: "Use co-host depth to decide which communities can safely scale into more frequent or bigger formats.",
            tone: "sage",
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <Surface
          eyebrow="Groups"
          title="Live group directory"
          description="Keep group join rules, review status, and host coverage aligned before the event layer starts slipping."
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
              caption="Organizer group directory with join mode, review state, pending members, host coverage, next event, and health."
              columns={[
                "Group",
                "Join mode",
                "Status",
                "Requests",
                "Co-hosts",
                "Next event",
                "Health",
              ]}
              rows={organizerPortalData.groups.map((item) => ({
                key: item.group.slug,
                cells: [
                  <div key="group">
                    <div className="font-semibold text-brand-text">{item.group.name}</div>
                    <div className="text-xs text-brand-text-muted">
                      {item.group.members} members
                    </div>
                  </div>,
                  <ToneBadge key="join" tone={item.joinMode === "Approval" ? "coral" : "indigo"}>
                    {item.joinMode}
                  </ToneBadge>,
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

        <div className="space-y-6">
          <Surface
            eyebrow="Cadence watch"
            title="Where group quality needs help"
          >
            <div className="space-y-4">
              {organizerPortalData.groups.map((item) => (
                <StreamCard
                  key={item.group.slug}
                  eyebrow={
                    <>
                      <span className="text-brand-text">{item.group.name}</span>
                      <span className="mx-2 text-brand-border">·</span>
                      {item.group.members} members
                    </>
                  }
                  title={item.nextEvent}
                  description={item.health}
                  meta={`${item.coHosts} co-hosts · ${item.pendingMembers} pending`}
                  badge={<ToneBadge tone={statusTone(item.status)}>{item.status}</ToneBadge>}
                />
              ))}
            </div>
          </Surface>

          <Surface
            eyebrow="Host coverage"
            title="Join flow and host support"
          >
            <KeyValueList
              items={[
                {
                  key: "approval-groups",
                  label: "Approval-based groups",
                  value: String(approvalGroups),
                },
                {
                  key: "open-groups",
                  label: "Open groups",
                  value: String(organizerPortalData.groups.length - approvalGroups),
                },
                {
                  key: "total-hosts",
                  label: "Co-host coverage",
                  value: String(totalCoHosts),
                },
                {
                  key: "pending-requests",
                  label: "Pending requests",
                  value: String(pendingRequests),
                },
              ]}
            />
          </Surface>
        </div>
      </div>
    </OrganizerShell>
  );
}

export async function OrganizerEventsScreen() {
  const organizerPortalData = await getOrganizerPortalData();
  const totalWaitlist = organizerPortalData.events.reduce((sum, event) => sum + event.waitlist, 0);
  const manualApprovalEvents = organizerPortalData.events.filter((event) =>
    event.approvalMode.toLowerCase().includes("manual"),
  ).length;
  const totalRevenue = organizerPortalData.events.reduce((sum, event) => {
    const amount = Number.parseInt(event.revenue.replace(/[^0-9]/g, ""), 10) || 0;
    return sum + amount;
  }, 0);

  return (
    <OrganizerShell
      eyebrow="Organizer events"
      title="Event list and calendar"
      description="Published, draft, and recurring events."
      links={organizerLinks("/organizer/events")}
    >
      <DecisionStrip
        eyebrow="Weekly focus"
        title="Where event operations need attention"
        description="Read the pressure points before dropping into the event table."
        items={[
          {
            key: "approval",
            label: "Approvals",
            summary: `${manualApprovalEvents} manual-approval formats are live this week.`,
            meta: `${totalWaitlist} people are currently sitting on waitlists or approval-sensitive formats.`,
            tone: "coral",
          },
          {
            key: "revenue",
            label: "Revenue",
            summary: `${totalRevenue.toLocaleString()} ISK is booked across the current event stack.`,
            meta: "Ticketed workshops and hosted socials are carrying the strongest commercial signal.",
            tone: "sage",
          },
          {
            key: "cadence",
            label: "Cadence",
            summary: `${organizerPortalData.templates.length} proven templates are ready to clone into the next cycle.`,
            meta: "The faster path is repeatable formats, not rebuilding each event from scratch.",
            tone: "indigo",
          },
        ]}
      />

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
                    <div className="font-semibold text-brand-text">{event.title}</div>
                    <div className="text-xs text-brand-text-muted">{event.dateLabel}</div>
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
            title="Calendar load"
          >
            <div className="space-y-3">
              {organizerPortalData.events.map((event) => (
                <div
                  key={event.slug}
                  className="flex items-center justify-between gap-4 rounded-md border border-brand-border-light bg-white px-4 py-3"
                >
                  <div>
                    <div className="font-semibold text-brand-text">{event.dateLabel}</div>
                    <div className="text-sm text-brand-text-muted">{event.title}</div>
                  </div>
                  <ToneBadge tone={statusTone(event.status)}>{event.status}</ToneBadge>
                </div>
              ))}
            </div>
          </Surface>

          <Surface
            eyebrow="Templates"
            title="Saved formats"
          >
            <div className="grid gap-3">
              {organizerPortalData.templates.map((template) => (
                <div
                  key={template}
                  className="rounded-md border border-brand-border-light bg-brand-sand-light px-4 py-3 text-sm font-semibold text-brand-text"
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

export async function OrganizerEventDetailScreen({ slug }: { slug: string }) {
  const organizerPortalData = await getOrganizerPortalData();
  const event = getManagedOrganizerEvent(slug);

  if (!event) {
    return null;
  }

  const approvalSensitiveCount = event.attendees.filter((attendee) =>
    attendee.status.toLowerCase().includes("pending") ||
    attendee.status.toLowerCase().includes("waitlist"),
  ).length;
  const approvedCount = event.attendees.filter((attendee) =>
    attendee.status.toLowerCase().includes("approved"),
  ).length;
  const ticketRevenue = Number.parseInt(event.revenue.replace(/[^0-9]/g, ""), 10) || 0;
  const revenuePerSeat = event.capacity ? Math.round(ticketRevenue / event.capacity) : 0;

  return (
    <OrganizerShell
      eyebrow="Organizer event"
      title={event.title}
      description="Event details and attendee management."
      links={organizerLinks("/organizer/events")}
    >
      <DecisionStrip
        eyebrow="Event read"
        title="What this event needs from you"
        description="Read approval pressure, seat confidence, and commercial signal before working attendees or venue logistics."
        items={[
          {
            key: "approval",
            label: "Approval pressure",
            summary: `${approvalSensitiveCount} attendees are still pending or sitting on the waitlist.`,
            meta: "Approval lag is usually the fastest way to flatten momentum on a paid or trust-sensitive format.",
            tone: "coral",
          },
          {
            key: "attendance",
            label: "Attendance confidence",
            summary: `${approvedCount} attendees are already approved inside a ${event.capacity}-seat room.`,
            meta: "Your room plan should follow approved and likely-attending people, not raw sign-up vanity.",
            tone: "indigo",
          },
          {
            key: "commercial",
            label: "Commercial signal",
            summary: `${event.revenue} is booked so far, about ${revenuePerSeat.toLocaleString()} ISK per seat at current capacity.`,
            meta: "Per-seat signal is the cleanest read on whether the event economics match the room and format.",
            tone: "sage",
          },
        ]}
      />

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
                className="flex items-center justify-between gap-4 rounded-md border border-brand-border-light bg-white px-4 py-3"
              >
                <div className="font-semibold text-brand-text">{step.label}</div>
                <ToneBadge tone="sand">{step.time}</ToneBadge>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-brand-border-light bg-brand-sand-light p-4">
              <div className="text-xs font-medium uppercase tracking-wider text-brand-text-light">
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
            <div className="rounded-md border border-brand-border-light bg-brand-sand-light p-4">
              <div className="text-xs font-medium uppercase tracking-wider text-brand-text-light">
                Discussion
              </div>
              <p className="mt-3 text-sm leading-relaxed text-brand-text-muted">
                {event.commentsSummary}
              </p>
            </div>
          </div>
          <div className="mt-5">
            <KeyValueList
              items={[
                {
                  key: "venue",
                  label: "Venue",
                  value: event.venueName,
                },
                {
                  key: "approval-mode",
                  label: "Approval mode",
                  value: event.approvalMode,
                },
                {
                  key: "date",
                  label: "Event date",
                  value: event.dateLabel,
                },
              ]}
            />
          </div>
        </Surface>

        <Surface
          eyebrow="Attendees"
          title="Approve, reject, and check in"
          description="This is the live attendance lane for approval, ticket state, and check-in context."
        >
          <DashboardTable
            caption="Event attendee table with status, ticket state, check-in state, and organizer context."
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

      <div className="grid gap-6 xl:grid-cols-2">
        <Surface
          eyebrow="Action desk"
          title="Attendee operations"
        >
          <OrganizerAttendeeControlCenter attendees={event.attendees} />
        </Surface>

        <Surface
          eyebrow="Door check"
          title="QR check-in"
          description="Scan attendee QR codes or search by name to check in at the door."
        >
          <QrCheckin eventSlug={event.slug} attendees={event.attendees} />
        </Surface>
      </div>

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
                className="rounded-lg border border-brand-border-light bg-white p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-brand-text">{signal.label}</div>
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
                <p className="mt-3 text-sm leading-relaxed text-brand-text-muted">
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
                className="rounded-md border border-brand-border-light bg-brand-sand-light px-4 py-3 text-sm leading-relaxed text-brand-text-muted"
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

export async function OrganizerVenuesScreen() {
  const organizerPortalData = await getOrganizerPortalData();
  const acceptedVenueThreads = organizerPortalData.bookingPipeline.filter((item) =>
    item.status.toLowerCase().includes("accepted"),
  ).length;
  const pendingVenueThreads = organizerPortalData.bookingPipeline.filter((item) =>
    item.status.toLowerCase().includes("pending") ||
    item.status.toLowerCase().includes("counter"),
  ).length;
  const topMatch = organizerPortalData.venueMatches[0];

  return (
    <OrganizerShell
      eyebrow="Organizer venues"
      title="Venue browser"
      description="Find and book partner venues."
      links={organizerLinks("/organizer/venues")}
    >
      <DecisionStrip
        eyebrow="Venue read"
        title="What the venue lane needs from you"
        description="See fit quality, booking momentum, and reply pressure before sending more venue requests."
        items={[
          {
            key: "fit",
            label: "Best match",
            summary: topMatch
              ? `${topMatch.venue.name} is still the strongest room match at ${topMatch.score}.`
              : "No lead venue match available.",
            meta: "Start from proven room-fit instead of broad outreach. Better matching usually fixes more than more messaging.",
            tone: "sage",
          },
          {
            key: "pipeline",
            label: "Pipeline",
            summary: `${acceptedVenueThreads} venue threads are already accepted across the current booking pipeline.`,
            meta: "Accepted rooms are operational leverage. Use them before adding more speculative requests.",
            tone: "indigo",
          },
          {
            key: "reply-pressure",
            label: "Needs reply",
            summary: `${pendingVenueThreads} venue conversations still need answers, counters, or final headcount follow-up.`,
            meta: "Reply speed matters most when the room is already a strong fit and timing is the only blocker.",
            tone: "coral",
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Surface
          eyebrow="Venue browser"
          title="Matched partner venues"
          description="These rooms are already scored for fit, slot quality, and operational ease for your current event stack."
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
                className="rounded-lg border border-brand-border-light bg-white p-4"
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
                <div className="mt-2 text-base font-semibold text-brand-text">
                  {venue.name}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-brand-text-muted">{fit}</p>
                <div className="mt-3 text-sm font-semibold text-brand-text">
                  Next slot: {nextSlot}
                </div>
              </article>
            ))}
          </div>
        </Surface>

        <Surface
          eyebrow="Pipeline"
          title="Booking requests"
          description="This is the live state of your venue outreach, not just a history list."
        >
          <DashboardTable
            caption="Organizer venue booking pipeline with room, status, date, and operational note."
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
          <div className="mt-5">
            <KeyValueList
              items={[
                {
                  key: "accepted",
                  label: "Accepted threads",
                  value: String(acceptedVenueThreads),
                },
                {
                  key: "pending",
                  label: "Pending or countered",
                  value: String(pendingVenueThreads),
                },
                {
                  key: "best-match",
                  label: "Strongest current fit",
                  value: topMatch ? topMatch.venue.name : "N/A",
                },
              ]}
            />
          </div>
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
