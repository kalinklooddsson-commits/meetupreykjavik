import type { Route } from "next";
import {
  CalendarClock,
  BellRing,
  ClipboardCheck,
  CopyPlus,
  LayoutGrid,
  Mail,
  MapPinned,
  MessageSquareMore,
  ScanQrCode,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import {
  ActivityFeed,
  CommandCenterDeck,
  DecisionStrip,
  DashboardTable,
  FilterChips,
  KeyValueList,
  QuickActionCard,
  SignalRail,
  StatCard,
  StreamCard,
  Surface,
  ToneBadge,
  TrendChart,
} from "@/components/dashboard/primitives";
import {
  getDashboardAvatar,
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
      title="Venue negotiations, attendee asks, and host threads"
      description="Organizers need a serious communication workspace because deals, approvals, and venue coordination all depend on message flow."
      links={organizerLinks("/organizer/messages")}
    >
      <CommandCenterDeck
        eyebrow="Comms command"
        title="Work the threads that affect capacity, room shape, and revenue"
        description="This page keeps the operational conversation layer visible so organizers can answer venues, attendees, and co-hosts without losing the event timeline."
        prompt="Scan what needs a reply, which thread changes event economics, and which conversation should become a task before reminders go out."
        action={{ href: "/organizer/events", label: "Open event operations" }}
        secondaryAction={{ href: "/organizer/notifications", label: "Open notifications" }}
        suggestions={["needs reply", "venue counter", "attendee ask", "co-host note", "urgent today", "ticket impact"]}
        stats={[
          {
            icon: MessageSquareMore,
            label: "Open threads",
            value: String(organizerPortalData.messages.length),
            detail: "Organizer communications are operational work and should sit beside the rest of the command system.",
            tone: "indigo",
          },
          {
            icon: BellRing,
            label: "Needs reply",
            value: String(organizerPortalData.messages.filter((item) => item.status !== "Open").length),
            detail: "Unread and response-needed conversations are the real queue, not raw thread count alone.",
            tone: "coral",
          },
          {
            icon: Mail,
            label: "Comms lanes",
            value: "3",
            detail: "Venue negotiation, attendee resolution, and internal host ops each need a distinct tone and speed.",
            tone: "sage",
          },
          {
            icon: ClipboardCheck,
            label: "Event-linked",
            value: "3",
            detail: "All current organizer threads connect directly to live events or templates in motion.",
            tone: "indigo",
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <Surface
          eyebrow="Message queue"
          title="Current conversations"
          description="The organizer inbox needs to expose counterpart, urgency, and channel immediately so the next action is obvious."
        >
          <div className="space-y-4">
            {organizerPortalData.messages.map((message) => (
              <StreamCard
                key={message.key}
                avatarName={message.counterpart}
                avatarSrc={getDashboardAvatar(message.counterpart)}
                avatarTone={
                  message.role.includes("Venue")
                    ? "coral"
                    : message.role.includes("host")
                      ? "sage"
                      : "indigo"
                }
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
            title="Organizer message filters"
            description="Operators need to isolate venue, attendee, and co-host threads quickly."
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
            title="Notification pressure"
            description="The message desk stays connected to approval and revenue alerts so the organizer can respond with full context."
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
      title="Approvals, template signals, and revenue alerts"
      description="Notification control for organizers needs to distinguish urgent operational issues from useful business updates."
      links={organizerLinks("/organizer/notifications")}
    >
      <CommandCenterDeck
        eyebrow="Alert command"
        title="Sort urgent ops from healthy momentum"
        description="This view is built to keep organizers focused on the signals that move attendance, venue fit, and earnings."
        prompt="Separate urgent approvals, healthy revenue milestones, and template housekeeping before the day fragments."
        action={{ href: "/organizer/messages", label: "Open messages" }}
        secondaryAction={{ href: "/organizer/events", label: "Open events" }}
        suggestions={["urgent approvals", "revenue", "templates", "reminder timing", "today", "host workflow"]}
        stats={[
          {
            icon: BellRing,
            label: "Alert stream",
            value: String(organizerPortalData.notifications.length),
            detail: "A real organizer product needs an operational alert layer, not just passive dashboard cards.",
            tone: "coral",
          },
          {
            icon: ClipboardCheck,
            label: "Urgent issues",
            value: String(organizerPortalData.notifications.filter((item) => item.status === "Urgent").length),
            detail: "Urgent count tells the host how much immediate attention is required before posting anything new.",
            tone: "coral",
          },
          {
            icon: Sparkles,
            label: "Positive signals",
            value: String(organizerPortalData.notifications.filter((item) => item.status === "Good").length),
            detail: "Good signals matter too because organizers need to see what formats are working commercially.",
            tone: "sage",
          },
          {
            icon: CopyPlus,
            label: "System notes",
            value: "1",
            detail: "Template and automation updates belong here so operators do not lose institutional knowledge.",
            tone: "indigo",
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <Surface
          eyebrow="Alert stream"
          title="Recent organizer notifications"
          description="Expose status, channel, and timing clearly so the team can decide what to do first."
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
          description="Organizers should be able to separate operational risk from business momentum."
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
      description="Stats cards, RSVP trend, upcoming events, activity feed, and quick actions are all present here so organizers can run formats without waiting for backend wiring."
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

      <CommandCenterDeck
        eyebrow="Operator command"
        title="Run the next 72 hours without losing the room shape"
        description="The organizer overview should read like an operating console: approvals, event momentum, venue-fit pressure, and revenue all aligned in one place."
        prompt="Scan the approval queue, tonight's event pressure, venue counters, and the next actions that keep a recurring format healthy."
        action={{ href: "/organizer/events", label: "Open event operations" }}
        secondaryAction={{ href: "/events/new", label: "Create a new event" }}
        suggestions={[
          "approval queue",
          "waitlist moves",
          "venue counters",
          "reminder cadence",
          "ticket revenue",
          "series health",
        ]}
        stats={[
          {
            icon: CalendarClock,
            label: "Next events",
            value: String(organizerPortalData.nextEvents.length),
            detail:
              "The next few events should stay close enough that an organizer can spot risk and momentum without opening each detail page.",
            tone: "indigo",
          },
          {
            icon: ClipboardCheck,
            label: "Action queue",
            value: String(organizerPortalData.activityFeed.length),
            detail:
              "Approvals, edits, and host-side nudges are what keep the event layer from slipping into passive posting.",
            tone: "coral",
          },
          {
            icon: LayoutGrid,
            label: "Fast actions",
            value: String(organizerPortalData.quickActions.length),
            detail:
              "Quick-access routes reduce friction between planning, live ops, venue requests, and follow-up work.",
            tone: "sage",
          },
          {
            icon: CopyPlus,
            label: "Revenue pulse",
            value: organizerPortalData.metrics[2]?.value ?? "0 ISK",
            detail:
              "Paid formats and recurring groups need a visible commercial readout, not just attendance numbers.",
            tone: "coral",
          },
        ]}
      />

      <SignalRail
        eyebrow="Operating lanes"
        title="Keep attendance, revenue, and room fit in one scan"
        description="The organizer workspace should make it obvious whether the next problem is people, money, or venue fit before the host disappears into separate pages."
        items={[
          {
            key: "attendance",
            label: "Attendance lane",
            value: organizerPortalData.metrics[0]?.value ?? "0",
            detail: "Attendance pressure tells the host whether discovery, approvals, or reminders need intervention first.",
            tone: "indigo",
          },
          {
            key: "commercial",
            label: "Commercial lane",
            value: organizerPortalData.metrics[2]?.value ?? "0 ISK",
            detail: "Paid formats need a visible money signal so the host can manage the product like a business, not a hobby.",
            tone: "coral",
          },
          {
            key: "supply",
            label: "Venue-fit lane",
            value: String(organizerPortalData.nextEvents.length),
            detail: "The next events are the supply pressure zone where room shape, venue counters, and staffing start to matter.",
            tone: "sage",
          },
        ]}
      />

      <DecisionStrip
        eyebrow="Host read"
        title="What the organizer should decide before opening every subpage"
        description="The top scan should force three calls: protect attendance quality, tighten venue fit, and focus the formats that can sustain repeat paid demand."
        items={[
          {
            key: "attendance",
            label: "Attendance call",
            summary: "Protect room quality before chasing raw RSVP count.",
            meta: "Approvals, waitlists, and arrival design usually matter more than a bigger but less coherent room.",
            tone: "coral",
          },
          {
            key: "venue",
            label: "Venue call",
            summary: "Use stronger rooms to raise conversion and repeat behavior.",
            meta: "Venue fit changes how comfortable people feel buying, arriving, and recommending the format afterward.",
            tone: "sage",
          },
          {
            key: "revenue",
            label: "Revenue call",
            summary: "Invest in formats that justify both a ticket and an organizer plan.",
            meta: "The host dashboard should keep attention on repeatable commercial formats, not activity that looks busy but never compounds.",
            tone: "indigo",
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <Surface
          eyebrow="Trend"
          title="RSVP flow this week"
          description="A simple trend view for attendance momentum before reminder and approval workflows are fully live."
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
          description="The action queue stays close to the chart so organizers can react quickly."
        >
          <ActivityFeed items={organizerPortalData.activityFeed} />
        </Surface>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Surface
          eyebrow="Next 5"
          title="Upcoming events"
          description="This list is the working organizer queue: capacity, approval mode, waitlist, and venue all stay visible."
        >
          <div className="space-y-4">
            {organizerPortalData.nextEvents.map((event) => (
              <div
                key={event.slug}
                className="rounded-[1.35rem] border border-[rgba(153,148,168,0.12)] bg-white/80 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="font-editorial text-2xl tracking-[-0.04em] text-[var(--brand-text)]">
                      {event.title}
                    </div>
                    <p className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">
                      {event.groupName} · {event.venueName} · {event.dateLabel}
                    </p>
                  </div>
                  <ToneBadge tone={statusTone(event.status)}>{event.status}</ToneBadge>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-4">
                  <div className="rounded-[1rem] bg-[rgba(245,240,232,0.82)] px-3 py-2 text-sm">
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--brand-text-light)]">
                      RSVP
                    </div>
                    <div className="mt-1 font-semibold text-[var(--brand-text)]">
                      {event.rsvps} / {event.capacity}
                    </div>
                  </div>
                  <div className="rounded-[1rem] bg-[rgba(245,240,232,0.82)] px-3 py-2 text-sm">
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--brand-text-light)]">
                      Waitlist
                    </div>
                    <div className="mt-1 font-semibold text-[var(--brand-text)]">
                      {event.waitlist}
                    </div>
                  </div>
                  <div className="rounded-[1rem] bg-[rgba(245,240,232,0.82)] px-3 py-2 text-sm">
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--brand-text-light)]">
                      Tickets
                    </div>
                    <div className="mt-1 font-semibold text-[var(--brand-text)]">
                      {event.ticketsSold}
                    </div>
                  </div>
                  <div className="rounded-[1rem] bg-[rgba(245,240,232,0.82)] px-3 py-2 text-sm">
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--brand-text-light)]">
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
          description="The organizer workflow needs fast access to event creation, approvals, venue booking, and group controls."
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
      description="All groups, moderation state, member management, and co-host context now render as a proper working surface."
      links={organizerLinks("/organizer/groups")}
    >
      <CommandCenterDeck
        eyebrow="Groups command"
        title="Protect cadence, approvals, and co-host load from one surface"
        description="Group management should read like a live operator board: where the join pressure is, which groups deserve featuring, and where recurring energy is starting to slip."
        prompt="Scan pending joins, cadence risk, co-host coverage, and featured-group upside before you start tuning individual settings."
        action={{ href: "/groups/new", label: "Create a new group" }}
        secondaryAction={{ href: "/organizer/events", label: "Open event operations" }}
        suggestions={[
          "pending joins",
          "co-host load",
          "cadence risk",
          "featured groups",
          "approval mode",
          "member health",
        ]}
        stats={[
          {
            icon: LayoutGrid,
            label: "Managed groups",
            value: String(organizerPortalData.groups.length),
            detail:
              "This view should tell the organizer how broad their active group surface is before they start reading individual rows.",
            tone: "indigo",
          },
          {
            icon: ClipboardCheck,
            label: "Pending members",
            value: String(
              organizerPortalData.groups.reduce(
                (total, item) => total + item.pendingMembers,
                0,
              ),
            ),
            detail:
              "Join approvals are one of the fastest ways for a healthy community to quietly fall behind if they are not surfaced first.",
            tone: "coral",
          },
          {
            icon: UsersRound,
            label: "Co-host coverage",
            value: String(
              organizerPortalData.groups.reduce((total, item) => total + item.coHosts, 0),
            ),
            detail:
              "Co-host depth matters because recurring formats break down when only one person can carry the room or the arrivals.",
            tone: "sage",
          },
          {
            icon: Sparkles,
            label: "Cadence risks",
            value: String(
              organizerPortalData.groups.filter((item) =>
                item.health.toLowerCase().includes("needs"),
              ).length,
            ),
            detail:
              "Groups that are losing rhythm need intervention early, before they start looking inactive to members and venues.",
            tone: "coral",
          },
        ]}
      />

      <DecisionStrip
        eyebrow="Group operating read"
        title="What the organizer should resolve before touching each community manually"
        description="The group workspace should force three calls: protect cadence, clear join pressure, and keep co-host support strong enough that recurring formats do not depend on one person alone."
        items={[
          {
            key: "cadence",
            label: "Cadence call",
            summary: "Rescue groups that are starting to lose visible rhythm before members feel drift.",
            meta: "If recurring momentum slips, the group becomes harder to trust and the next event becomes harder to sell.",
            tone: "coral",
          },
          {
            key: "joins",
            label: "Join call",
            summary: "Clear pending members where fast approval will improve the room rather than dilute it.",
            meta: "Join approvals are part of quality control, not just an inbox chore, especially for hosted communities.",
            tone: "sage",
          },
          {
            key: "support",
            label: "Co-host call",
            summary: "Strengthen co-host coverage where the format would suffer if one person missed a night.",
            meta: "A serious recurring group should have enough host structure to survive schedule pressure and still feel well held.",
            tone: "indigo",
          },
        ]}
      />

      <Surface
        eyebrow="Filters"
        title="Your groups"
        description="A dense table for group health, join mode, pending members, and next event rhythm."
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

      <Surface
        eyebrow="Organizer standard"
        title="What strong recurring groups should keep true"
        description="This is the organizer-side quality bar: groups that feel intentional, easy to join correctly, and resilient enough to keep going."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Visible host structure",
              text: "Members should understand who is holding the room, what the join rules are, and how the group behaves before arriving.",
            },
            {
              title: "Reliable next edition",
              text: "The next event should always feel legible enough that members can picture returning, not wonder if the group is fading out.",
            },
            {
              title: "Shared workload",
              text: "Recurring communities get stronger when approvals, arrivals, and follow-up are not all trapped with one organizer.",
            },
          ].map((item) => (
            <article
              key={item.title}
              className="rounded-[1.3rem] border border-[rgba(153,148,168,0.12)] bg-white/82 p-4"
            >
              <div className="font-semibold text-[var(--brand-text)]">{item.title}</div>
              <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">
                {item.text}
              </p>
            </article>
          ))}
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
      description="The event area now carries a table, calendar context, template access, and a clear path back into the seven-step event wizard."
      links={organizerLinks("/organizer/events")}
    >
      <CommandCenterDeck
        eyebrow="Events command"
        title="Run approvals, templates, and revenue without losing the event stack"
        description="This screen should feel like an event operating surface: publishing state, workload, template reuse, and paid-format signals all visible before the organizer starts editing rows."
        prompt="Scan the live event table, spot stacked dates, reuse proven templates, and move quickly into creation or deeper event control."
        action={{ href: "/events/new", label: "Create a new event" }}
        secondaryAction={{ href: "/organizer" as Route, label: "Back to organizer overview" }}
        suggestions={[
          "approval mode",
          "paid formats",
          "stacked dates",
          "waitlists",
          "repeat templates",
          "venue placement",
        ]}
        stats={[
          {
            icon: CalendarClock,
            label: "Managed events",
            value: String(organizerPortalData.events.length),
            detail:
              "The main event table should feel like a real command grid, not a static listing of titles and dates.",
            tone: "indigo",
          },
          {
            icon: ClipboardCheck,
            label: "Approval pressure",
            value: String(
              organizerPortalData.events.filter((event) => event.waitlist > 0).length,
            ),
            detail:
              "Waitlist-bearing events are the clearest signal that the organizer needs to make curation decisions soon.",
            tone: "coral",
          },
          {
            icon: LayoutGrid,
            label: "Reusable templates",
            value: String(organizerPortalData.templates.length),
            detail:
              "Templates are a real operator feature and should stay close to the event table, not hidden deeper in the product.",
            tone: "sage",
          },
          {
            icon: CopyPlus,
            label: "Revenue tracked",
            value: organizerPortalData.metrics[2]?.value ?? "0 ISK",
            detail:
              "Paid events need a visible commercial readout or the product starts feeling like a free posting tool again.",
            tone: "coral",
          },
        ]}
      />

      <DecisionStrip
        eyebrow="Event operating read"
        title="What the organizer should resolve before editing the whole stack"
        description="A stronger event workspace turns the first scan into three calls: curate the formats with pressure, watch the calendar where dates are stacking, and push the formats that already prove they can earn."
        items={[
          {
            key: "curation",
            label: "Curation call",
            summary: "Handle waitlists and approvals before publishing more supply.",
            meta: "The events carrying review pressure are where room quality can improve fast or drift if the organizer hesitates.",
            tone: "coral",
          },
          {
            key: "calendar",
            label: "Calendar call",
            summary: "Protect the dates where your own events can cannibalize each other.",
            meta: "A better calendar read keeps the host from creating schedule friction that weakens attendance, venue fit, and staff focus.",
            tone: "sage",
          },
          {
            key: "commercial",
            label: "Commercial call",
            summary: "Repeat the templates and formats that already justify paid seats.",
            meta: "The organizer product should keep attention on what compounds, not make every event feel like an equal fresh start.",
            tone: "indigo",
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Surface
          eyebrow="Event table"
          title="Published, draft, and recurring events"
          description="Filters, approval context, and venue placement are visible in one management table."
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
            description="A lightweight schedule rail for spotting stacked event nights."
          >
            <div className="space-y-3">
              {organizerPortalData.events.map((event) => (
                <div
                  key={event.slug}
                  className="flex items-center justify-between gap-4 rounded-[1.2rem] border border-[rgba(153,148,168,0.12)] bg-white/80 px-4 py-3"
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
            description="Templates are called out separately because the spec treats them as a real organizer power feature."
          >
            <div className="grid gap-3">
              {organizerPortalData.templates.map((template) => (
                <div
                  key={template}
                  className="rounded-[1.15rem] border border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.82)] px-4 py-3 text-sm font-semibold text-[var(--brand-text)]"
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
      description="This screen now covers the critical spec requirement: full attendee control, check-in visibility, event timing, co-organizer context, and the live management notes around a single event."
      links={organizerLinks("/organizer/events")}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Capacity" value={`${event.rsvps}/${event.capacity}`} delta={event.status} detail="Live seats against configured event cap." icon={UsersRound} tone="indigo" />
        <StatCard label="Waitlist" value={String(event.waitlist)} delta={event.approvalMode} detail="Manual approval and auto-promotion context." icon={ClipboardCheck} tone="coral" />
        <StatCard label="Ticket sales" value={String(event.ticketsSold)} delta={event.revenue} detail="Paid inventory and revenue context." icon={Sparkles} tone="sage" />
        <StatCard label="Check-in" value={event.checkIns} delta="QR workflow" detail="Ready for QR and manual door check." icon={ScanQrCode} tone="indigo" />
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
                className="flex items-center justify-between gap-4 rounded-[1.15rem] border border-[rgba(153,148,168,0.12)] bg-white/80 px-4 py-3"
              >
                <div className="font-semibold text-[var(--brand-text)]">{step.label}</div>
                <ToneBadge tone="sand">{step.time}</ToneBadge>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.2rem] border border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.82)] p-4">
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-text-light)]">
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
            <div className="rounded-[1.2rem] border border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.82)] p-4">
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-text-light)]">
                Discussion
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">
                {event.commentsSummary}
              </p>
            </div>
          </div>
        </Surface>

        <Surface
          eyebrow="Attendees"
          title="Approve, reject, and check in"
          description="This table is the organizer control center for manual approvals and live event doors."
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
        description="Search the attendee list, make approval decisions, and mark door check-ins from one local control center."
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
                className="rounded-[1.25rem] border border-[rgba(153,148,168,0.12)] bg-white/82 p-4"
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
                <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">
                  {signal.note}
                </p>
              </article>
            ))}
          </div>
        </Surface>

        <Surface
          eyebrow="Host guidance"
          title="Arrival, seating, and pacing notes"
          description="This gives organizers a profile-aware lens on how to welcome people into the room instead of treating every attendee the same."
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
                className="rounded-[1.15rem] border border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.82)] px-4 py-3 text-sm leading-7 text-[var(--brand-text-muted)]"
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
      title="Find a venue match"
      description="This venue browser now exposes fit score, next available slot, and booking pipeline context so organizers can choose rooms intentionally rather than by guesswork."
      links={organizerLinks("/organizer/venues")}
    >
      <CommandCenterDeck
        eyebrow="Venue command"
        title="Match room fit, booking pressure, and paid-format upside in one scan"
        description="The venue browser should act like a commercial matching surface: where the best rooms are, which requests are stuck, and which partnerships support stronger paid-event economics."
        prompt="Compare fit scores, watch the booking pipeline, and move toward venues that can support both room shape and reliable revenue."
        action={{ href: "/events/new", label: "Create a venue-ready event" }}
        secondaryAction={{ href: "/organizer/events", label: "Review event operations" }}
        suggestions={[
          "premium fit",
          "evening slots",
          "countered bookings",
          "repeat partners",
          "capacity 40+",
          "host desk flow",
        ]}
        stats={[
          {
            icon: MapPinned,
            label: "Matched venues",
            value: String(organizerPortalData.venueMatches.length),
            detail:
              "The organizer should see how much viable supply exists before opening venue cards or drafting a booking note.",
            tone: "indigo",
          },
          {
            icon: ClipboardCheck,
            label: "Open pipeline work",
            value: String(
              organizerPortalData.bookingPipeline.filter(
                (item) => item.status.toLowerCase() !== "accepted",
              ).length,
            ),
            detail:
              "Countered and pending venue requests are the real friction layer, so they need to sit above the table and not disappear into row scanning.",
            tone: "coral",
          },
          {
            icon: Sparkles,
            label: "Premium-fit rooms",
            value: String(
              organizerPortalData.venueMatches.filter((item) =>
                item.fit.toLowerCase().includes("premium"),
              ).length,
            ),
            detail:
              "Premium-capable rooms matter because the paid-event business model only works when venue fit and per-seat value stay visible.",
            tone: "sage",
          },
          {
            icon: CopyPlus,
            label: "Live booking lanes",
            value: String(organizerPortalData.bookingPipeline.length),
            detail:
              "Booking work should read like an active queue, not a side note next to discovery cards and venue art.",
            tone: "indigo",
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Surface
          eyebrow="Venue browser"
          title="Matched partner venues"
          description="Capacity, area, amenities, and fit notes all stay visible before a booking request is sent."
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
                className="rounded-[1.35rem] border border-[rgba(153,148,168,0.12)] bg-white/80 p-4"
              >
                <div
                  className="h-28 rounded-[1.2rem]"
                  style={{ background: venue.art }}
                  aria-hidden="true"
                />
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <ToneBadge tone="sage">{score} fit</ToneBadge>
                  <ToneBadge tone="sand">{venue.area}</ToneBadge>
                </div>
                <div className="font-editorial mt-4 text-2xl tracking-[-0.04em] text-[var(--brand-text)]">
                  {venue.name}
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">{fit}</p>
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
          description="Requests, counters, and accepted partner bookings stay visible alongside the venue match view."
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
        description="Select the best-fit venue, tune the request note, and push a booking request into the working pipeline locally."
      >
        <OrganizerVenueRequestStudio
          matches={organizerPortalData.venueMatches}
          pipeline={organizerPortalData.bookingPipeline}
        />
      </Surface>
    </OrganizerShell>
  );
}
