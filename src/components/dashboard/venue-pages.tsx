import type { Route } from "next";
import {
  BadgeEuro,
  BellRing,
  CalendarCheck2,
  CalendarRange,
  Gift,
  Mail,
  MessageSquareMore,
  ShieldCheck,
  Users,
} from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import {
  ActivityFeed,
  CommandCenterDeck,
  DecisionStrip,
  DashboardTable,
  FilterChips,
  KeyValueList,
  ProgressSteps,
  SignalRail,
  StatCard,
  StreamCard,
  Surface,
  ToneBadge,
  TrendChart,
} from "@/components/dashboard/primitives";
import { getDashboardAvatar, venuePortalData } from "@/lib/dashboard-data";
import {
  VenueAvailabilityStudio,
  VenueBookingCommandCenter,
  VenueDealStudio,
  VenueProfileSectionEditor,
} from "@/components/dashboard/operations-panels";
import type { ComponentProps } from "react";

function venueLinks(activeHref: Route) {
  return [
    {
      href: "/venue/dashboard" as Route,
      label: "Dashboard",
      active: activeHref === "/venue/dashboard",
    },
    {
      href: "/venue/onboarding" as Route,
      label: "Onboarding",
      active: activeHref === "/venue/onboarding",
    },
    {
      href: "/venue/events" as Route,
      label: "Events",
      active: activeHref === "/venue/events",
    },
    {
      href: "/venue/bookings" as Route,
      label: "Bookings",
      active: activeHref === "/venue/bookings",
    },
    {
      href: "/venue/availability" as Route,
      label: "Availability",
      active: activeHref === "/venue/availability",
    },
    {
      href: "/venue/deals" as Route,
      label: "Deals",
      active: activeHref === "/venue/deals",
    },
    {
      href: "/venue/analytics" as Route,
      label: "Analytics",
      active: activeHref === "/venue/analytics",
    },
    {
      href: "/venue/profile" as Route,
      label: "Profile",
      active: activeHref === "/venue/profile",
    },
    {
      href: "/venue/messages" as Route,
      label: "Messages",
      active: activeHref === "/venue/messages",
    },
    {
      href: "/venue/notifications" as Route,
      label: "Notifications",
      active: activeHref === "/venue/notifications",
    },
  ];
}

function statusTone(status: string) {
  const normalized = status.toLowerCase();

  if (
    normalized.includes("pending") ||
    normalized.includes("counter") ||
    normalized.includes("draft")
  ) {
    return "coral" as const;
  }

  if (
    normalized.includes("accepted") ||
    normalized.includes("confirmed") ||
    normalized.includes("active") ||
    normalized.includes("verified")
  ) {
    return "sage" as const;
  }

  return "indigo" as const;
}

function VenueShell(props: ComponentProps<typeof PortalShell>) {
  return <PortalShell roleMode="venue" {...props} />;
}

export function VenueMessagesScreen() {
  return (
    <VenueShell
      eyebrow="Venue messages"
      title="Booking threads, compliance follow-ups, and repeat host requests"
      description="Venue teams need their own communications desk because the booking layer is half negotiation, half operations."
      links={venueLinks("/venue/messages")}
    >
      <CommandCenterDeck
        eyebrow="Message command"
        title="Handle booking conversations before they become room problems"
        description="This workspace keeps incoming organizer asks, admin follow-ups, and repeat-host context together so the room can be run commercially."
        prompt="Scan which message affects tonight's staffing, which one changes premium slot value, and what needs a fast answer."
        action={{ href: "/venue/bookings", label: "Open bookings" }}
        secondaryAction={{ href: "/venue/notifications", label: "Open notifications" }}
        suggestions={["needs reply", "premium slot", "repeat host", "compliance", "room fit", "today"]}
        stats={[
          {
            icon: MessageSquareMore,
            label: "Open threads",
            value: String(venuePortalData.messages.length),
            detail: "Venue conversation volume should be handled as operating work, not left inside booking notes alone.",
            tone: "indigo",
          },
          {
            icon: BellRing,
            label: "Needs reply",
            value: String(venuePortalData.messages.filter((item) => item.status !== "Open").length),
            detail: "The real pressure is reply-needed threads that can block bookings or verification.",
            tone: "coral",
          },
          {
            icon: Mail,
            label: "Comms lanes",
            value: "3",
            detail: "Organizer booking, platform compliance, and repeat-host requests each need different handling speed.",
            tone: "sage",
          },
          {
            icon: CalendarRange,
            label: "Booking-linked",
            value: "2",
            detail: "Most venue messages should stay directly attached to concrete room and time decisions.",
            tone: "indigo",
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <Surface
          eyebrow="Inbox"
          title="Current message queue"
          description="Surface counterpart, channel, and urgency immediately so venue operators can answer with the right commercial context."
        >
          <div className="space-y-4">
            {venuePortalData.messages.map((message) => (
              <StreamCard
                key={message.key}
                avatarName={message.counterpart}
                avatarSrc={getDashboardAvatar(message.counterpart)}
                avatarTone={
                  message.role.includes("Organizer")
                    ? "indigo"
                    : message.role.includes("repeat")
                      ? "sage"
                      : "coral"
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
            title="Venue message filters"
            description="Use clear message lanes so sales, compliance, and repeat-host work stay legible."
          >
            <FilterChips
              items={[
                { key: "all", label: "All threads", active: true, tone: "indigo" },
                { key: "booking", label: "Booking threads", tone: "coral" },
                { key: "platform", label: "Platform" },
                { key: "repeat", label: "Repeat hosts", tone: "sage" },
              ]}
            />
          </Surface>

          <Surface
            eyebrow="Linked alerts"
            title="Venue notification pressure"
            description="Booking urgency, profile visibility, and deal performance stay nearby so every reply carries context."
          >
            <ActivityFeed items={venuePortalData.notifications} />
          </Surface>
        </div>
      </div>
    </VenueShell>
  );
}

export function VenueNotificationsScreen() {
  return (
    <VenueShell
      eyebrow="Venue notifications"
      title="Booking urgency, revenue movement, and visibility signals"
      description="Venue notifications need their own operational layer because room scheduling, deal performance, and public visibility all move on different clocks."
      links={venueLinks("/venue/notifications")}
    >
      <CommandCenterDeck
        eyebrow="Alert command"
        title="Separate urgent booking pressure from growth signals"
        description="This view keeps venue operators focused on what blocks revenue now versus what improves the partner position over time."
        prompt="Scan urgent replies, commercial wins, and platform visibility changes without forcing the team to infer severity from generic dashboard cards."
        action={{ href: "/venue/messages", label: "Open messages" }}
        secondaryAction={{ href: "/venue/bookings", label: "Open booking queue" }}
        suggestions={["urgent", "booking holds", "deal uplift", "visibility", "today", "premium nights"]}
        stats={[
          {
            icon: BellRing,
            label: "Alert stream",
            value: String(venuePortalData.notifications.length),
            detail: "Venue operators need a dedicated alert layer to avoid missing time-sensitive commercial decisions.",
            tone: "coral",
          },
          {
            icon: CalendarRange,
            label: "Booking urgent",
            value: String(venuePortalData.notifications.filter((item) => item.status === "Urgent").length),
            detail: "Urgent booking pressure is the first thing a venue team should see in the morning.",
            tone: "coral",
          },
          {
            icon: Gift,
            label: "Revenue wins",
            value: String(venuePortalData.notifications.filter((item) => item.status === "Good").length),
            detail: "Deal and conversion improvements are working signals and should stay visible, not hidden in analytics.",
            tone: "sage",
          },
          {
            icon: ShieldCheck,
            label: "Platform notes",
            value: "1",
            detail: "Visibility and verification changes affect supply quality and public conversion.",
            tone: "indigo",
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <Surface
          eyebrow="Alert stream"
          title="Recent venue notifications"
          description="Show urgency, channel, and timing clearly so venue operators know what changes room economics first."
        >
          <div className="space-y-4">
            {venuePortalData.notifications.map((item) => (
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
          description="Keep booking urgency, growth, and platform signals separated so the venue team can prioritize correctly."
        >
          <FilterChips
            items={[
              { key: "all", label: "All", active: true, tone: "indigo" },
              { key: "bookings", label: "Bookings", tone: "coral" },
              { key: "revenue", label: "Revenue", tone: "sage" },
              { key: "visibility", label: "Visibility" },
            ]}
          />
        </Surface>
      </div>
    </VenueShell>
  );
}

export function VenueOnboardingScreen() {
  return (
    <VenueShell
      eyebrow="Venue partner onboarding"
      title="Ten-step venue application"
      description="This onboarding view now mirrors the spec with progress, reviewer context, outstanding documents, and the exact areas still blocking verification."
      links={venueLinks("/venue/onboarding")}
    >
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Surface
          eyebrow="Progress"
          title={venuePortalData.onboarding.completion}
          description={`Reviewer: ${venuePortalData.onboarding.reviewer}`}
        >
          <ProgressSteps steps={venuePortalData.onboarding.steps} />
        </Surface>

        <div className="space-y-6">
          <Surface
            eyebrow="Requirements"
            title="Remaining documents"
            description="The final proof points to clear before the verified badge can be issued."
          >
            <div className="space-y-3">
              {venuePortalData.onboarding.requiredDocs.map((doc) => (
                <div
                  key={doc}
                  className="rounded-[1.2rem] border border-[rgba(153,148,168,0.12)] bg-white/78 px-4 py-3 text-sm font-semibold text-[var(--brand-text)]"
                >
                  {doc}
                </div>
              ))}
            </div>
          </Surface>

          <Surface
            eyebrow="Current venue"
            title={venuePortalData.venue.name}
            description={venuePortalData.venue.summary}
          >
            <div
              className="h-48 rounded-[1.45rem]"
              style={{ background: venuePortalData.venue.art }}
              aria-hidden="true"
            />
          </Surface>
        </div>
      </div>
    </VenueShell>
  );
}

export function VenueDashboardScreen() {
  return (
    <VenueShell
      eyebrow="Venue dashboard"
      title="Availability, bookings, and deals"
      description="The venue home now exposes stats, upcoming event context, the booking queue, and partnership tier performance instead of placeholder copy."
      links={venueLinks("/venue/dashboard")}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {venuePortalData.metrics.map((metric, index) => (
          <StatCard
            key={metric.label}
            {...metric}
            icon={[CalendarCheck2, Users, ShieldCheck, CalendarRange][index]}
            tone={index === 2 ? "sage" : index === 3 ? "coral" : "indigo"}
          />
        ))}
      </div>

      <CommandCenterDeck
        eyebrow="Venue command"
        title="Protect room quality, response time, and partner revenue"
        description="The venue overview should feel like operational infrastructure: incoming requests, live room usage, deal performance, and staffing pressure all visible before the first reply."
        prompt="Scan bookings that need a reply, confirmed lineup pressure, availability constraints, and the deals that actually improve partner value."
        action={{ href: "/venue/bookings", label: "Open booking queue" }}
        secondaryAction={{ href: "/venue/availability", label: "Adjust availability" }}
        suggestions={[
          "reply today",
          "counter offers",
          "deal redemption",
          "staffing windows",
          "organizer fit",
          "featured nights",
        ]}
        stats={[
          {
            icon: CalendarCheck2,
            label: "Live lineup",
            value: String(venuePortalData.upcomingEvents.length),
            detail:
              "Confirmed and in-flight events stay visible here so room planning does not depend on opening multiple pages.",
            tone: "indigo",
          },
          {
            icon: Users,
            label: "Incoming bookings",
            value: String(venuePortalData.bookings.incoming.length),
            detail:
              "The booking queue is the most time-sensitive venue workflow, so it belongs near the top of the dashboard.",
            tone: "coral",
          },
          {
            icon: Gift,
            label: "Active deals",
            value: String(venuePortalData.deals.length),
            detail:
              "Deals are part of the partnership model and should feel like working commercial inventory, not sidebar extras.",
            tone: "sage",
          },
          {
            icon: BadgeEuro,
            label: "Partner tier",
            value: venuePortalData.partnershipTier,
            detail:
              "Tier context keeps availability, visibility, and response expectations grounded in the actual commercial relationship.",
            tone: "coral",
          },
        ]}
      />

      <SignalRail
        eyebrow="Commercial lanes"
        title="Keep booking pressure, partner quality, and yield visible"
        description="The venue overview should surface the three things that matter commercially: how fast the room must respond, how strong the partner mix is, and whether the venue is monetizing well."
        items={[
          {
            key: "booking",
            label: "Booking lane",
            value: String(venuePortalData.bookings.incoming.length),
            detail: "Incoming requests are the live commercial queue and should stay above the fold.",
            tone: "coral",
          },
          {
            key: "quality",
            label: "Partner quality",
            value: venuePortalData.metrics[2]?.value ?? "4.8",
            detail: "Venue reputation and repeat-host quality shape pricing power more than raw volume alone.",
            tone: "sage",
          },
          {
            key: "yield",
            label: "Yield lane",
            value: venuePortalData.partnershipTier,
            detail: "Tier, deals, and featured nights are the commercial context that determines how the room should be sold.",
            tone: "indigo",
          },
        ]}
      />

      <DecisionStrip
        eyebrow="Operator read"
        title="What the venue team should decide before touching the booking tools"
        description="The top scan should force three commercial calls: reply fast where premium slots matter, protect partner quality, and keep the room yield disciplined."
        items={[
          {
            key: "booking",
            label: "Booking call",
            summary: "Prioritize reply speed on the requests that affect premium inventory.",
            meta: "If the best room slots sit too long, the venue loses both money and organizer trust at the same time.",
            tone: "coral",
          },
          {
            key: "yield",
            label: "Yield call",
            summary: "Use deals and placement to support repeatable, higher-quality business.",
            meta: "The venue layer should not reward random traffic. It should help the best recurring formats come back and spend again.",
            tone: "sage",
          },
          {
            key: "quality",
            label: "Partner call",
            summary: "Keep organizer-fit visible before accepting room pressure blindly.",
            meta: "Better host quality leads to smoother nights, fewer support problems, and a stronger public-facing venue reputation.",
            tone: "indigo",
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Surface
          eyebrow="Lineup"
          title="Upcoming confirmed and in-flight events"
          description="Venue teams need to see both confirmed bookings and active counters to manage operations cleanly."
        >
          <div className="space-y-4">
            {venuePortalData.upcomingEvents.map(({ event, organizer, status, note }) => (
              <div
                key={`${event.slug}-${organizer}`}
                className="rounded-[1.35rem] border border-[rgba(153,148,168,0.12)] bg-white/80 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="font-editorial text-2xl tracking-[-0.04em] text-[var(--brand-text)]">
                      {event.title}
                    </div>
                    <p className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">
                      {organizer} · {event.venueName}
                    </p>
                  </div>
                  <ToneBadge tone={statusTone(status)}>{status}</ToneBadge>
                </div>
                <p className="mt-4 text-sm leading-7 text-[var(--brand-text-muted)]">{note}</p>
              </div>
            ))}
          </div>
        </Surface>

        <Surface
          eyebrow="Tier"
          title={venuePortalData.partnershipTier}
          description="Partnership positioning, current deal usage, and next operational asks stay visible on the front page."
        >
          <KeyValueList
            items={[
              { key: "deal", label: "Lead deal", value: venuePortalData.deals[0]?.title ?? "None" },
              { key: "redemption", label: "Best redemption", value: venuePortalData.deals[0]?.redemption ?? "0%" },
              { key: "rating", label: "Live rating", value: venuePortalData.metrics[2]?.value ?? "4.8" },
              { key: "pending", label: "Urgent bookings", value: "2 need reply today" },
            ]}
          />
        </Surface>
      </div>
    </VenueShell>
  );
}

export function VenueEventsScreen() {
  return (
    <VenueShell
      eyebrow="Venue events"
      title="Events at this venue"
      description="This view combines hosted events, requested bookings, and quick calendar context so venue partners can plan staffing and room layout."
      links={venueLinks("/venue/events")}
    >
      <CommandCenterDeck
        eyebrow="Events command"
        title="See what is confirmed, premium, and operationally risky before service starts"
        description="Venue event management should open with room pressure, event status, and commercial quality so operators do not need to inspect every booking one row at a time."
        prompt="Scan the hosted-event lineup, find counters or transfers, and compare what is confirmed against what deserves staffing or pricing attention."
        action={{ href: "/venue/bookings", label: "Open booking queue" }}
        secondaryAction={{ href: "/venue/analytics", label: "Review venue analytics" }}
        suggestions={[
          "confirmed tonight",
          "countered events",
          "premium formats",
          "staffing pressure",
          "layout risk",
          "repeat winners",
        ]}
        stats={[
          {
            icon: CalendarRange,
            label: "Hosted events",
            value: String(venuePortalData.upcomingEvents.length),
            detail:
              "The venue team should be able to scan how many live events are on the board before reading the detail column.",
            tone: "indigo",
          },
          {
            icon: CalendarCheck2,
            label: "Confirmed status",
            value: String(
              venuePortalData.upcomingEvents.filter((item) =>
                item.status.toLowerCase().includes("confirm"),
              ).length,
            ),
            detail:
              "Confirmed events are the clearest staffing and room-read signal, so they should stand out from counters and pending changes.",
            tone: "sage",
          },
          {
            icon: BadgeEuro,
            label: "Premium-led nights",
            value: String(
              venuePortalData.upcomingEvents.filter(
                (item) =>
                  item.status.toLowerCase().includes("premium") ||
                  item.note.toLowerCase().includes("premium"),
              ).length,
            ),
            detail:
              "Premium and higher-margin formats need explicit visibility or the venue loses the commercial signal inside generic scheduling data.",
            tone: "coral",
          },
          {
            icon: Gift,
            label: "Repeat-fit signals",
            value: String(venuePortalData.analytics.topReferrers.length),
            detail:
              "The repeat-booking story matters because venue operators care about which formats reliably turn into future revenue, not only tonight's occupancy.",
            tone: "indigo",
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Surface
          eyebrow="Events"
          title="Event pipeline"
          description="Confirmed, countered, and draft venue-created events all sit in one table."
        >
          <FilterChips
            items={[
              { key: "all", label: "All events", active: true, tone: "indigo" },
              { key: "confirmed", label: "Confirmed", tone: "sage" },
              { key: "countered", label: "Needs reply", tone: "coral" },
              { key: "premium", label: "Premium formats", tone: "sand" },
            ]}
          />
          <DashboardTable
            columns={["Event", "Organizer", "Status", "Format", "Attendance", "Note"]}
            rows={venuePortalData.upcomingEvents.map((item) => ({
              key: `${item.event.slug}-${item.organizer}`,
              cells: [
                item.event.title,
                item.organizer,
                <ToneBadge key="status" tone={statusTone(item.status)}>
                  {item.status}
                </ToneBadge>,
                item.event.category,
                `${item.event.attendees}/${item.event.capacity}`,
                item.note,
              ],
            }))}
          />
        </Surface>

        <Surface
          eyebrow="Past stats"
          title="What performed recently"
          description="Past event context stays visible beside the active lineup so venues can compare which formats are worth repeating."
        >
          <TrendChart
            data={venuePortalData.analytics.eventTypes}
            tone="coral"
            formatValue={(value) => `${value}`}
          />
          <div className="mt-5 text-sm leading-7 text-[var(--brand-text-muted)]">
            Social and expat-led events are still the strongest repeat-booking drivers, while smaller premium formats create the best per-seat revenue.
          </div>
        </Surface>
      </div>
    </VenueShell>
  );
}

export function VenueBookingsScreen() {
  return (
    <VenueShell
      eyebrow="Venue bookings"
      title="Requests, counters, and approvals"
      description="The booking workflow now has an explicit incoming queue, status actions, and history context for venue operators."
      links={venueLinks("/venue/bookings")}
    >
      <CommandCenterDeck
        eyebrow="Bookings command"
        title="Reply quickly without sacrificing room fit"
        description="Venue bookings should feel like operations software: incoming requests, response urgency, guest-fit guidance, and room constraints all visible before a venue says yes."
        prompt="Scan incoming requests, compare them to room guidance, and respond with the right accept, counter, hold, or decline stance."
        action={{ href: "/venue/availability", label: "Check availability" }}
        secondaryAction={{ href: "/venue/events", label: "Review venue events" }}
        suggestions={[
          "reply today",
          "counter offer",
          "guest fit",
          "layout guidance",
          "room constraints",
          "deal alignment",
        ]}
        stats={[
          {
            icon: CalendarRange,
            label: "Incoming requests",
            value: String(venuePortalData.bookings.incoming.length),
            detail:
              "The queue should tell the venue team how much active decision work is in front of them before they start opening rows.",
            tone: "coral",
          },
          {
            icon: CalendarCheck2,
            label: "Recent outcomes",
            value: String(venuePortalData.bookings.history.length),
            detail:
              "History matters because venue operators need to compare new requests against what has worked or failed recently.",
            tone: "indigo",
          },
          {
            icon: Users,
            label: "Guest-fit signals",
            value: String(venuePortalData.bookings.guestFit.signals.length),
            detail:
              "The best booking products give venues a clear read on whether the room and audience actually fit each other.",
            tone: "sage",
          },
          {
            icon: ShieldCheck,
            label: "Arrival guidance",
            value: String(venuePortalData.bookings.guestFit.arrivalNotes.length),
            detail:
              "Arrival and layout cues help venues avoid weak accepts and make stronger counter-offers.",
            tone: "indigo",
          },
        ]}
      />

      <DecisionStrip
        eyebrow="Booking operating read"
        title="What the venue should decide before replying line by line"
        description="A better booking surface turns the opening scan into three decisions: which requests need speed, which need a fit counter, and which are worth protecting because they build better repeat business."
        items={[
          {
            key: "speed",
            label: "Reply call",
            summary: "Move fastest where timing affects premium inventory or same-week revenue.",
            meta: "The best booking desks do not answer everything equally. They protect the requests that matter most to yield and trust.",
            tone: "coral",
          },
          {
            key: "fit",
            label: "Fit call",
            summary: "Counter or redirect bookings that are technically possible but wrong for the room.",
            meta: "Availability alone is not enough. The right room shape, arrival flow, and guest profile matter more than an easy accept.",
            tone: "sage",
          },
          {
            key: "repeat",
            label: "Repeat call",
            summary: "Favor organizers and formats that are likely to come back stronger.",
            meta: "The venue product should help operators build a better recurring book of business, not just a fuller one-off calendar.",
            tone: "indigo",
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Surface
          eyebrow="Incoming"
          title="Booking request queue"
          description="Organizer, event, date, attendance, and message all stay in one operational table."
        >
          <DashboardTable
            columns={["Organizer", "Event", "Date", "Attendance", "Status", "Message"]}
            rows={venuePortalData.bookings.incoming.map((booking) => ({
              key: booking.key,
              cells: [
                booking.organizer,
                booking.event,
                booking.date,
                booking.attendance,
                <ToneBadge key="status" tone={statusTone(booking.status)}>
                  {booking.status}
                </ToneBadge>,
                booking.message,
              ],
            }))}
          />
        </Surface>

        <Surface
          eyebrow="History"
          title="Recent booking outcomes"
          description="Past accepts, declines, and counters remain visible for operator context."
        >
          <div className="space-y-4">
            {venuePortalData.bookings.history.map((item) => (
              <div
                key={item.key}
                className="rounded-[1.25rem] border border-[rgba(153,148,168,0.12)] bg-white/80 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-[var(--brand-text)]">
                    {item.organizer}
                  </div>
                  <ToneBadge tone={statusTone(item.result)}>{item.result}</ToneBadge>
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">
                  {item.note}
                </p>
              </div>
            ))}
          </div>
        </Surface>
      </div>

      <Surface
        eyebrow="Action desk"
        title="Respond to incoming requests"
        description="This local control center lets venue operators accept, counter, hold, or decline bookings with explicit reply copy."
      >
        <VenueBookingCommandCenter bookings={venuePortalData.bookings.incoming} />
      </Surface>

      <div className="grid gap-6 xl:grid-cols-[0.96fr_1.04fr]">
        <Surface
          eyebrow="Guest fit"
          title="What kind of attendee this room serves best"
          description={venuePortalData.bookings.guestFit.summary}
        >
          <div className="space-y-4">
            {venuePortalData.bookings.guestFit.signals.map((signal) => (
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
          eyebrow="Room guidance"
          title="Arrival and layout cues"
          description="Operators can use this to decide whether to accept a booking, counter it, or move it into a better room or time block."
        >
          <KeyValueList
            items={venuePortalData.bookings.guestFit.arrivalNotes.map((item) => ({
              key: item.label,
              label: item.label,
              value: item.value,
            }))}
          />
          <div className="mt-5 space-y-3">
            {venuePortalData.bookings.guestFit.roomGuidance.map((item) => (
              <div
                key={item}
                className="rounded-[1.15rem] border border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.82)] px-4 py-3 text-sm leading-7 text-[var(--brand-text-muted)]"
              >
                {item}
              </div>
            ))}
          </div>
        </Surface>
      </div>
    </VenueShell>
  );
}

export function VenueAvailabilityScreen() {
  return (
    <VenueShell
      eyebrow="Venue availability"
      title="Set hours and open slots"
      description="Recurring availability, exceptions, and day-by-day blocks are all present here as a practical calendar editor shell."
      links={venueLinks("/venue/availability")}
    >
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Surface
          eyebrow="Recurring"
          title="Availability rules"
          description="Recurring patterns are the backbone of faster organizer booking."
        >
          <div className="space-y-3">
            {venuePortalData.availability.recurring.map((rule) => (
              <div
                key={rule}
                className="rounded-[1.2rem] border border-[rgba(153,148,168,0.12)] bg-white/80 px-4 py-3 text-sm font-semibold text-[var(--brand-text)]"
              >
                {rule}
              </div>
            ))}
          </div>
        </Surface>

        <Surface
          eyebrow="Weekly editor"
          title="Open and blocked windows"
          description="The weekly view is enough to make the availability workflow concrete before full calendar state is wired."
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1">
            {venuePortalData.availability.weeklyGrid.map((day) => (
              <div
                key={day.day}
                className="rounded-[1.25rem] border border-[rgba(153,148,168,0.12)] bg-white/80 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-[var(--brand-text)]">{day.day}</div>
                  <ToneBadge tone="sand">{day.blocks.length} blocks</ToneBadge>
                </div>
                <div className="mt-3 space-y-2">
                  {day.blocks.map((block) => (
                    <div
                      key={block}
                      className="rounded-full bg-[rgba(79,70,229,0.08)] px-3 py-2 text-sm text-[var(--brand-text)]"
                    >
                      {block}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5">
            <FilterChips
              items={venuePortalData.availability.exceptions.map((item, index) => ({
                key: item,
                label: item,
                active: index === 0,
                tone: "coral",
              }))}
            />
          </div>
        </Surface>
      </div>

      <Surface
        eyebrow="Editor"
        title="Weekly availability studio"
        description="Adjust day blocks and add one-off exceptions without leaving the availability page."
      >
        <VenueAvailabilityStudio
          weeklyGrid={venuePortalData.availability.weeklyGrid}
          exceptions={venuePortalData.availability.exceptions}
        />
      </Surface>
    </VenueShell>
  );
}

export function VenueDealsScreen() {
  return (
    <VenueShell
      eyebrow="Venue deals"
      title="Member offers and partnership perks"
      description="Deals are now represented as a proper management surface with type, tier, status, and redemption context."
      links={venueLinks("/venue/deals")}
    >
      <CommandCenterDeck
        eyebrow="Deals command"
        title="Treat offers like revenue tools, not decorative perks"
        description="Venue deals should open as a commercial control surface: active ladder, redemption quality, draft offers, and partnership tier all visible before anyone edits copy."
        prompt="Review which offers are live, which tiers are missing, and whether the deal stack is actually helping bookings and repeat organizer behavior."
        action={{ href: "/venue/analytics", label: "Review venue analytics" }}
        secondaryAction={{ href: "/venue/profile", label: "Tune public profile" }}
        suggestions={[
          "active offers",
          "gold tier",
          "draft deals",
          "redemption rate",
          "repeat hosts",
          "arrival perks",
        ]}
        stats={[
          {
            icon: Gift,
            label: "Deal inventory",
            value: String(venuePortalData.deals.length),
            detail:
              "The venue team should immediately see how many offers are on the board before they start editing individual cards.",
            tone: "indigo",
          },
          {
            icon: CalendarCheck2,
            label: "Live offers",
            value: String(
              venuePortalData.deals.filter((deal) => deal.status.toLowerCase() === "active")
                .length,
            ),
            detail:
              "Only live offers can influence bookings and member behavior, so they need to stand apart from drafts.",
            tone: "sage",
          },
          {
            icon: BadgeEuro,
            label: "Premium tiers",
            value: String(
              venuePortalData.deals.filter((deal) => deal.tier !== "Bronze").length,
            ),
            detail:
              "Silver and Gold offers carry more commercial weight and should be visible as part of the venue's monetization posture.",
            tone: "coral",
          },
          {
            icon: Users,
            label: "Draft backlog",
            value: String(
              venuePortalData.deals.filter((deal) => deal.status.toLowerCase() === "draft")
                .length,
            ),
            detail:
              "Draft count matters because unused offer ideas are often where a venue can unlock the next revenue step without changing the whole profile.",
            tone: "indigo",
          },
        ]}
      />

      <Surface
        eyebrow="Offers"
        title="Active and draft deals"
        description="Bronze, silver, and gold offers are visible together with clear operational notes."
      >
        <FilterChips
          items={[
            { key: "all", label: "All deals", active: true, tone: "indigo" },
            { key: "active", label: "Active", tone: "sage" },
            { key: "gold", label: "Gold / Silver", tone: "coral" },
            { key: "draft", label: "Draft", tone: "sand" },
          ]}
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {venuePortalData.deals.map((deal, index) => (
            <article
              key={deal.key}
              className="rounded-[1.4rem] border border-[rgba(153,148,168,0.12)] bg-white/82 p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <ToneBadge tone={deal.tier === "Gold" ? "coral" : deal.tier === "Silver" ? "indigo" : "sage"}>
                  {deal.tier}
                </ToneBadge>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(79,70,229,0.08)] text-[var(--brand-indigo)]">
                  {[Gift, BadgeEuro, CalendarCheck2][index] ? (
                    (() => {
                      const Icon = [Gift, BadgeEuro, CalendarCheck2][index];
                      return <Icon className="h-5 w-5" />;
                    })()
                  ) : null}
                </span>
              </div>
              <div className="font-editorial mt-4 text-2xl tracking-[-0.04em] text-[var(--brand-text)]">
                {deal.title}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <ToneBadge tone={statusTone(deal.status)}>{deal.status}</ToneBadge>
                <ToneBadge tone="sand">{deal.type}</ToneBadge>
              </div>
              <p className="mt-4 text-sm leading-7 text-[var(--brand-text-muted)]">
                {deal.note}
              </p>
              <div className="mt-4 text-sm font-semibold text-[var(--brand-text)]">
                Redemption: {deal.redemption}
              </div>
            </article>
          ))}
        </div>
      </Surface>

      <Surface
        eyebrow="Deal editor"
        title="Status, copy, and redemption controls"
        description="The venue team can tune each offer locally instead of only reading the current state."
      >
        <VenueDealStudio deals={venuePortalData.deals} />
      </Surface>
    </VenueShell>
  );
}

export function VenueAnalyticsScreen() {
  return (
    <VenueShell
      eyebrow="Venue analytics"
      title="Performance and conversion"
      description="Profile views, events hosted, attendees, rating trend, top event types, and booking conversion are all surfaced here."
      links={venueLinks("/venue/analytics")}
    >
      <CommandCenterDeck
        eyebrow="Analytics command"
        title="Watch conversion, format strength, and partner demand from one place"
        description="Venue analytics should feel operational and commercial: funnel health, top-performing formats, and demand sources all visible before the venue starts reacting to bookings."
        prompt="Read the booking funnel, compare event-type strength, and decide which offers or room formats deserve more attention next."
        action={{ href: "/venue/deals", label: "Open deal controls" }}
        secondaryAction={{ href: "/venue/bookings", label: "Review booking queue" }}
        suggestions={[
          "booking funnel",
          "repeat hosts",
          "top formats",
          "referrer mix",
          "conversion drop",
          "demand signals",
        ]}
        stats={[
          {
            icon: CalendarRange,
            label: "Funnel stages",
            value: String(venuePortalData.analytics.funnel.length),
            detail:
              "The funnel should read as a practical business instrument, not only a decorative chart block.",
            tone: "indigo",
          },
          {
            icon: BadgeEuro,
            label: "Best format volume",
            value: String(
              Math.max(...venuePortalData.analytics.eventTypes.map((item) => item.value)),
            ),
            detail:
              "The strongest event type should be explicit because it points directly at what the venue should keep supplying and pricing well.",
            tone: "coral",
          },
          {
            icon: Users,
            label: "Referral lanes",
            value: String(venuePortalData.analytics.topReferrers.length),
            detail:
              "Demand sources matter because the venue needs to know whether traffic is coming from discovery, partners, or outbound communications.",
            tone: "sage",
          },
          {
            icon: ShieldCheck,
            label: "Confirmed bookings",
            value: String(
              venuePortalData.analytics.funnel.find((item) => item.label === "Confirmed bookings")
                ?.value ?? 0,
            ),
            detail:
              "Confirmed-booking volume is the clearest bottom-funnel signal and should stay visible above the chart grid.",
            tone: "indigo",
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Surface
          eyebrow="Funnel"
          title="Booking conversion"
          description="The funnel view explains how venue profile attention translates into real bookings."
        >
          <FilterChips
            items={[
              { key: "funnel", label: "Booking funnel", active: true, tone: "indigo" },
              { key: "formats", label: "Top formats", tone: "coral" },
              { key: "referrers", label: "Referrers", tone: "sage" },
              { key: "repeat", label: "Repeat hosts", tone: "sand" },
            ]}
          />
          <TrendChart
            data={venuePortalData.analytics.funnel}
            tone="indigo"
            formatValue={(value) => `${value}`}
          />
        </Surface>

        <Surface
          eyebrow="Event types"
          title="Top formats hosted"
          description="The venue can quickly see which categories deserve more supply and which ones are underperforming."
        >
          <TrendChart
            data={venuePortalData.analytics.eventTypes}
            tone="coral"
            formatValue={(value) => `${value}`}
          />
        </Surface>
      </div>

      <Surface
        eyebrow="Referrers"
        title="Where bookings are coming from"
        description="A compact referrer list gives venue partners a practical explanation for demand, even before live analytics queries are connected."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {venuePortalData.analytics.topReferrers.map((referrer) => (
            <div
              key={referrer}
              className="rounded-[1.25rem] border border-[rgba(153,148,168,0.12)] bg-white/80 p-4 text-sm font-semibold text-[var(--brand-text)]"
            >
              {referrer}
            </div>
          ))}
        </div>
      </Surface>
    </VenueShell>
  );
}

export function VenueProfileScreen() {
  return (
    <VenueShell
      eyebrow="Venue profile"
      title="Public-facing partner profile"
      description="Photos, description, amenities, hours, social links, and preview context all live here now as a real editing surface."
      links={venueLinks("/venue/profile")}
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Surface
          eyebrow="Preview"
          title={venuePortalData.venue.name}
          description={venuePortalData.venue.summary}
        >
          <div
            className="h-52 rounded-[1.45rem]"
            style={{ background: venuePortalData.venue.art }}
            aria-hidden="true"
          />
          <div className="mt-5 flex flex-wrap gap-2">
            {venuePortalData.venue.amenities.map((amenity) => (
              <ToneBadge key={amenity} tone="sage">
                {amenity}
              </ToneBadge>
            ))}
          </div>
        </Surface>

        <Surface
          eyebrow="Editor"
          title="Profile sections"
          description="Each block maps directly to the editable public venue fields from the spec."
        >
          <VenueProfileSectionEditor sections={venuePortalData.profileSections} />
        </Surface>
      </div>
    </VenueShell>
  );
}
