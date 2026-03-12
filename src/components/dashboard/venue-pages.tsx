import type { Route } from "next";
import {
  BadgeEuro,
  CalendarCheck2,
  CalendarRange,
  Gift,
  ShieldCheck,
  Users,
} from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import {
  ActivityFeed,
  DashboardTable,
  DecisionStrip,
  FilterChips,
  KeyValueList,
  ProgressSteps,
  StatCard,
  StreamCard,
  Surface,
  ToneBadge,
  TrendChart,
} from "@/components/dashboard/primitives";
import { getVenuePortalData } from "@/lib/dashboard-fetchers";
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

function formatVenueEventSchedule(startsAt: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Atlantic/Reykjavik",
  }).format(new Date(startsAt));
}

function VenueShell(props: ComponentProps<typeof PortalShell>) {
  return <PortalShell roleMode="venue" {...props} />;
}

export async function VenueMessagesScreen() {
  const venuePortalData = await getVenuePortalData();
  return (
    <VenueShell
      eyebrow="Venue messages"
      title="Messages"
      description="Booking threads, compliance, and host requests."
      links={venueLinks("/venue/messages")}
    >
      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <Surface
          eyebrow="Inbox"
          title="Current message queue"
        >
          <div className="space-y-4">
            {venuePortalData.messages.map((message) => (
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
                { key: "booking", label: "Booking threads", tone: "coral" },
                { key: "platform", label: "Platform" },
                { key: "repeat", label: "Repeat hosts", tone: "sage" },
              ]}
            />
          </Surface>

          <Surface
            eyebrow="Linked alerts"
            title="Related notifications"
          >
            <ActivityFeed items={venuePortalData.notifications} />
          </Surface>
        </div>
      </div>
    </VenueShell>
  );
}

export async function VenueNotificationsScreen() {
  const venuePortalData = await getVenuePortalData();
  return (
    <VenueShell
      eyebrow="Venue notifications"
      title="Notifications"
      description="Booking urgency, revenue, and visibility signals."
      links={venueLinks("/venue/notifications")}
    >
      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <Surface
          eyebrow="Alert stream"
          title="Recent notifications"
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

export async function VenueOnboardingScreen() {
  const venuePortalData = await getVenuePortalData();
  return (
    <VenueShell
      eyebrow="Venue partner onboarding"
      title="Venue application"
      description="Progress, documents, and verification status."
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
          >
            <div className="space-y-3">
              {venuePortalData.onboarding.requiredDocs.map((doc) => (
                <div
                  key={doc}
                  className="rounded-md border border-brand-border-light bg-white px-4 py-3 text-sm font-semibold text-brand-text"
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
              className="h-48 rounded-lg"
              style={{ background: venuePortalData.venue.art }}
              aria-hidden="true"
            />
          </Surface>
        </div>
      </div>
    </VenueShell>
  );
}

export async function VenueDashboardScreen() {
  const venuePortalData = await getVenuePortalData();
  return (
    <VenueShell
      eyebrow="Venue dashboard"
      title="Availability, bookings, and deals"
      description="Your venue overview."
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

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Surface
          eyebrow="Lineup"
          title="Upcoming events"
        >
          <div className="space-y-4">
            {venuePortalData.upcomingEvents.map(({ event, organizer, status, note }) => (
              <div
                key={`${event.slug}-${organizer}`}
                className="rounded-lg border border-brand-border-light bg-white p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-brand-text">
                      {event.title}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-brand-text-muted">
                      {organizer} · {event.venueName}
                    </p>
                  </div>
                  <ToneBadge tone={statusTone(status)}>{status}</ToneBadge>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-brand-text-muted">{note}</p>
              </div>
            ))}
          </div>
        </Surface>

        <Surface
          eyebrow="Tier"
          title={venuePortalData.partnershipTier}
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

export async function VenueEventsScreen() {
  const venuePortalData = await getVenuePortalData();
  const replyNeededEvents = venuePortalData.upcomingEvents.filter((item) =>
    item.status.toLowerCase().includes("counter"),
  ).length;
  const confirmedEvents = venuePortalData.upcomingEvents.filter((item) =>
    item.status.toLowerCase().includes("confirmed") ||
    item.status.toLowerCase().includes("transferred"),
  ).length;
  const totalExpectedAttendance = venuePortalData.upcomingEvents.reduce(
    (sum, item) => sum + item.event.attendees,
    0,
  );

  return (
    <VenueShell
      eyebrow="Venue events"
      title="Events at this venue"
      description="Hosted events, bookings, and calendar context."
      links={venueLinks("/venue/events")}
    >
      <DecisionStrip
        eyebrow="Calendar read"
        title="What the live venue calendar needs"
        description="Read event load, reply pressure, and expected room traffic before you work the event pipeline."
        items={[
          {
            key: "confirmed",
            label: "Confirmed formats",
            summary: `${confirmedEvents} live events are already holding space in the room calendar.`,
            meta: "Protected room-fit is more important than saying yes to every new booking thread.",
            tone: "sage",
          },
          {
            key: "reply-needed",
            label: "Needs reply",
            summary: `${replyNeededEvents} upcoming event threads still need venue follow-up or a counter.`,
            meta: "Fast reply speed protects conversion and stops strong organizers from drifting to another room.",
            tone: "coral",
          },
          {
            key: "attendance",
            label: "Attendance load",
            summary: `${totalExpectedAttendance} expected attendees are moving through the current venue event stack.`,
            meta: "Room planning should follow actual throughput, not just raw booking count.",
            tone: "indigo",
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Surface
          eyebrow="Events"
          title="Live event pipeline"
          description="Use this list to track which event formats are confirmed, which still need a venue answer, and where room-fit needs intervention."
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
            caption="Venue event pipeline with organizer, status, format, attendance, and venue note."
            columns={["Event", "Organizer", "Status", "Format", "Attendance", "Note"]}
            rows={venuePortalData.upcomingEvents.map((item) => ({
              key: `${item.event.slug}-${item.organizer}`,
              cells: [
                <div key="event">
                  <div className="font-semibold text-brand-text">{item.event.title}</div>
                  <div className="text-xs text-brand-text-muted">
                    {formatVenueEventSchedule(item.event.startsAt)}
                  </div>
                </div>,
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
          eyebrow="Format momentum"
          title="Recent performance"
          description="This room is converting best when the format fits the energy, service, and arrival flow."
        >
          <TrendChart
            data={venuePortalData.analytics.eventTypes}
            tone="coral"
            formatValue={(value) => `${value}`}
          />
          <div className="mt-5 space-y-3">
            {venuePortalData.upcomingEvents.map((item) => (
              <div
                key={`${item.event.slug}-note`}
                className="rounded-md border border-brand-border-light bg-white px-4 py-3 text-sm leading-relaxed text-brand-text-muted"
              >
                <span className="font-semibold text-brand-text">{item.event.title}:</span>{" "}
                {item.note}
              </div>
            ))}
          </div>
        </Surface>
      </div>
    </VenueShell>
  );
}

export async function VenueBookingsScreen() {
  const venuePortalData = await getVenuePortalData();
  const urgentReplies = venuePortalData.bookings.incoming.filter((booking) =>
    booking.status.toLowerCase().includes("pending") ||
    booking.status.toLowerCase().includes("counter"),
  ).length;
  const acceptedThreads = venuePortalData.bookings.history.filter((booking) =>
    booking.result.toLowerCase().includes("accepted"),
  ).length;
  const topFitSignal = venuePortalData.bookings.guestFit.signals
    .slice()
    .sort((left, right) => right.score - left.score)[0];

  return (
    <VenueShell
      eyebrow="Venue bookings"
      title="Booking queue"
      description="Requests, counters, and approvals."
      links={venueLinks("/venue/bookings")}
    >
      <DecisionStrip
        eyebrow="Booking read"
        title="What the room needs from you today"
        description="See response pressure, conversion momentum, and room-fit context before opening request details."
        items={[
          {
            key: "reply-pressure",
            label: "Reply pressure",
            summary: `${urgentReplies} booking threads need a response or counter today.`,
            meta: "The fastest operational win here is tightening reply speed on premium and weekend slots.",
            tone: "coral",
          },
          {
            key: "conversion",
            label: "Conversion",
            summary: `${acceptedThreads} recent booking outcomes closed as accepted.`,
            meta: "Repeat organizers are converting best when room guidance is handled up front.",
            tone: "sage",
          },
          {
            key: "fit",
            label: "Room fit",
            summary: topFitSignal
              ? `${topFitSignal.label} is the strongest guest-fit signal at ${topFitSignal.score}%.`
              : "Room-fit signal unavailable.",
            meta: "Use audience behavior and arrival flow to decide whether the request really belongs in this room.",
            tone: "indigo",
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Surface
          eyebrow="Incoming"
          title="Incoming bookings"
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
          title="Recent outcomes"
        >
          <div className="space-y-4">
            {venuePortalData.bookings.history.map((item) => (
              <div
                key={item.key}
                className="rounded-lg border border-brand-border-light bg-white p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-brand-text">
                    {item.organizer}
                  </div>
                  <ToneBadge tone={statusTone(item.result)}>{item.result}</ToneBadge>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-brand-text-muted">
                  {item.note}
                </p>
              </div>
            ))}
          </div>
        </Surface>
      </div>

      <Surface
        eyebrow="Action desk"
        title="Reply and counter"
      >
        <VenueBookingCommandCenter bookings={venuePortalData.bookings.incoming} />
      </Surface>

      <div className="grid gap-6 xl:grid-cols-[0.96fr_1.04fr]">
        <Surface
          eyebrow="Guest fit"
          title="Attendee fit for this room"
          description={venuePortalData.bookings.guestFit.summary}
        >
          <div className="space-y-4">
            {venuePortalData.bookings.guestFit.signals.map((signal) => (
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
          eyebrow="Room guidance"
          title="Arrival and layout cues"
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
                className="rounded-md border border-brand-border-light bg-brand-sand-light px-4 py-3 text-sm leading-relaxed text-brand-text-muted"
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

export async function VenueAvailabilityScreen() {
  const venuePortalData = await getVenuePortalData();
  const blockedDates = venuePortalData.availability.exceptions.length;
  const openDays = venuePortalData.availability.weeklyGrid.filter((day) =>
    day.blocks.some((block) => block.toLowerCase().includes("open")),
  ).length;
  const premiumWindows = venuePortalData.availability.weeklyGrid.reduce((sum, day) => {
    return sum + day.blocks.filter((block) => block.toLowerCase().includes("premium")).length;
  }, 0);

  return (
    <VenueShell
      eyebrow="Venue availability"
      title="Hours and open slots"
      description="Recurring availability, exceptions, and day-by-day blocks."
      links={venueLinks("/venue/availability")}
    >
      <DecisionStrip
        eyebrow="Availability read"
        title="What the room schedule is signaling"
        description="See open-day coverage, blocked dates, and high-yield windows before editing the weekly calendar."
        items={[
          {
            key: "coverage",
            label: "Open coverage",
            summary: `${openDays} weekdays currently expose open event windows to organizers.`,
            meta: "Coverage matters more than volume. A few clean bookable windows outperform messy all-day availability.",
            tone: "indigo",
          },
          {
            key: "exceptions",
            label: "Exceptions",
            summary: `${blockedDates} exception blocks are already shaping how this month can be sold.`,
            meta: "If blocked dates are buried, booking reply speed suffers because operators cannot trust the calendar.",
            tone: "coral",
          },
          {
            key: "premium",
            label: "Premium windows",
            summary: `${premiumWindows} high-yield time blocks are currently marked as premium or protected inventory.`,
            meta: "Premium windows should stay obvious so high-fit paid formats are routed into the right hours.",
            tone: "sage",
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Surface
          eyebrow="Recurring"
          title="Availability rules"
          description="These are the standing rules that explain how the room should usually be sold."
        >
          <div className="space-y-3">
            {venuePortalData.availability.recurring.map((rule) => (
              <div
                key={rule}
                className="rounded-md border border-brand-border-light bg-white px-4 py-3 text-sm font-semibold text-brand-text"
              >
                {rule}
              </div>
            ))}
          </div>
        </Surface>

        <Surface
          eyebrow="Weekly editor"
          title="Open and blocked windows"
          description="Every day should make it obvious when the room is open, protected, or commercially constrained."
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1">
            {venuePortalData.availability.weeklyGrid.map((day) => (
              <div
                key={day.day}
                className="rounded-lg border border-brand-border-light bg-white p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-brand-text">{day.day}</div>
                  <ToneBadge tone="sand">{day.blocks.length} blocks</ToneBadge>
                </div>
                <div className="mt-3 space-y-2">
                  {day.blocks.map((block) => (
                    <div
                      key={block}
                      className="rounded-full bg-[rgba(79,70,229,0.08)] px-3 py-2 text-sm text-brand-text"
                    >
                      {block}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Surface>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <Surface
          eyebrow="Exceptions"
          title="Dates that override the normal calendar"
        >
          <div className="space-y-3">
            {venuePortalData.availability.exceptions.map((item, index) => (
              <div
                key={item}
                className="rounded-md border border-brand-border-light bg-white px-4 py-3 text-sm leading-relaxed text-brand-text-muted"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-brand-text">Calendar exception</span>
                  <ToneBadge tone={index === 0 ? "coral" : "sand"}>
                    {index === 0 ? "Current" : "Upcoming"}
                  </ToneBadge>
                </div>
                <div className="mt-2">{item}</div>
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

        <Surface
          eyebrow="Editor"
          title="Weekly availability studio"
        >
          <VenueAvailabilityStudio
            weeklyGrid={venuePortalData.availability.weeklyGrid}
            exceptions={venuePortalData.availability.exceptions}
          />
        </Surface>
      </div>
    </VenueShell>
  );
}

export async function VenueDealsScreen() {
  const venuePortalData = await getVenuePortalData();
  const activeDeals = venuePortalData.deals.filter((deal) =>
    deal.status.toLowerCase().includes("active"),
  ).length;
  const draftDeals = venuePortalData.deals.filter((deal) =>
    deal.status.toLowerCase().includes("draft"),
  ).length;
  const featuredDeal = venuePortalData.deals[0];

  return (
    <VenueShell
      eyebrow="Venue deals"
      title="Deals and perks"
      description="Member offers and partnership perks."
      links={venueLinks("/venue/deals")}
    >
      <DecisionStrip
        eyebrow="Offer read"
        title="What the deal stack needs from you"
        description="Read live offer count, draft pressure, and the strongest current perk before editing deals."
        items={[
          {
            key: "active",
            label: "Active offers",
            summary: `${activeDeals} venue deals are currently live for members and hosts.`,
            meta: "A smaller clean offer stack usually converts better than a cluttered menu of weak perks.",
            tone: "sage",
          },
          {
            key: "drafts",
            label: "Draft pressure",
            summary: `${draftDeals} deal concepts are still waiting on commercial or menu decisions.`,
            meta: "Drafts that sit too long usually signal weak economics or unclear audience fit.",
            tone: "coral",
          },
          {
            key: "hero-offer",
            label: "Strongest perk",
            summary: featuredDeal
              ? `${featuredDeal.title} is currently the clearest lead offer in the venue stack.`
              : "No lead deal available.",
            meta: "One clear perk should carry the commercial story before you add secondary offers.",
            tone: "indigo",
          },
        ]}
      />

      <Surface
        eyebrow="Offers"
        title="Active and draft deals"
        description="This is the live commercial layer for member value, host value, and venue conversion."
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
              className="rounded-lg border border-brand-border-light bg-white p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <ToneBadge tone={deal.tier === "Gold" ? "coral" : deal.tier === "Silver" ? "indigo" : "sage"}>
                  {deal.tier}
                </ToneBadge>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(79,70,229,0.08)] text-brand-indigo">
                  {[Gift, BadgeEuro, CalendarCheck2][index] ? (
                    (() => {
                      const Icon = [Gift, BadgeEuro, CalendarCheck2][index];
                      return <Icon className="h-5 w-5" />;
                    })()
                  ) : null}
                </span>
              </div>
              <div className="mt-2 text-base font-semibold text-brand-text">
                {deal.title}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <ToneBadge tone={statusTone(deal.status)}>{deal.status}</ToneBadge>
                <ToneBadge tone="sand">{deal.type}</ToneBadge>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-brand-text-muted">
                {deal.note}
              </p>
              <div className="mt-4 text-sm font-semibold text-brand-text">
                Redemption: {deal.redemption}
              </div>
            </article>
          ))}
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <StatCard
            label="Active deals"
            value={String(activeDeals)}
            detail="Live commercial offers"
            tone="sage"
          />
          <StatCard
            label="Draft deals"
            value={String(draftDeals)}
            detail="Need pricing or ops decision"
            tone="coral"
          />
          <StatCard
            label="Lead perk"
            value={featuredDeal?.tier ?? "N/A"}
            detail={featuredDeal?.title ?? "No featured deal"}
            tone="indigo"
          />
        </div>
      </Surface>

      <Surface
        eyebrow="Deal editor"
        title="Status and redemption controls"
      >
        <VenueDealStudio deals={venuePortalData.deals} />
      </Surface>
    </VenueShell>
  );
}

export async function VenueAnalyticsScreen() {
  const venuePortalData = await getVenuePortalData();
  const profileViews = venuePortalData.analytics.funnel.find((item) => item.label === "Profile views")?.value ?? 0;
  const bookingInquiries =
    venuePortalData.analytics.funnel.find((item) => item.label === "Booking inquiries")?.value ?? 0;
  const confirmedBookings =
    venuePortalData.analytics.funnel.find((item) => item.label === "Confirmed bookings")?.value ?? 0;
  const inquiryConversion = bookingInquiries
    ? Math.round((confirmedBookings / bookingInquiries) * 100)
    : 0;
  const topFormat = venuePortalData.analytics.eventTypes
    .slice()
    .sort((left, right) => right.value - left.value)[0];

  return (
    <VenueShell
      eyebrow="Venue analytics"
      title="Performance and conversion"
      description="Profile views, events hosted, and booking conversion."
      links={venueLinks("/venue/analytics")}
    >
      <DecisionStrip
        eyebrow="Performance read"
        title="What venue performance needs from you"
        description="Read inquiry conversion, top-performing format, and discovery pull before opening the deeper charts."
        items={[
          {
            key: "conversion",
            label: "Inquiry conversion",
            summary: `${confirmedBookings} bookings closed from ${bookingInquiries} inquiries, a ${inquiryConversion}% conversion rate.`,
            meta: "If conversion drifts, the problem is usually fit clarity or reply speed before it is pure demand.",
            tone: "coral",
          },
          {
            key: "format",
            label: "Top format",
            summary: topFormat
              ? `${topFormat.label} is currently the strongest hosted format at ${topFormat.value} live or recent events.`
              : "No top format signal available.",
            meta: "Protect the formats that already fit the room before chasing adjacent but weaker inventory.",
            tone: "sage",
          },
          {
            key: "visibility",
            label: "Visibility",
            summary: `${profileViews} profile views are currently feeding the top of the venue demand funnel.`,
            meta: "If visibility is strong but bookings lag, the room story or commercial framing is not doing enough work.",
            tone: "indigo",
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Surface
          eyebrow="Funnel"
          title="Booking conversion"
          description="This is the commercial path from visibility to repeat organizers."
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
          description="Format mix should reinforce what the room does best, not spread evenly across weak event types."
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
        title="Where bookings come from"
      >
        <div className="grid gap-6 xl:grid-cols-[0.94fr_1.06fr]">
          <div className="grid gap-4 md:grid-cols-2">
            {venuePortalData.analytics.topReferrers.map((referrer) => (
              <div
                key={referrer}
                className="rounded-lg border border-brand-border-light bg-white p-4 text-sm font-semibold text-brand-text"
              >
                {referrer}
              </div>
            ))}
          </div>

          <KeyValueList
            items={[
              {
                key: "profile-views",
                label: "Profile views",
                value: String(profileViews),
              },
              {
                key: "booking-inquiries",
                label: "Booking inquiries",
                value: String(bookingInquiries),
              },
              {
                key: "confirmed-bookings",
                label: "Confirmed bookings",
                value: String(confirmedBookings),
              },
              {
                key: "conversion-rate",
                label: "Inquiry conversion",
                value: `${inquiryConversion}%`,
              },
            ]}
          />
        </div>
      </Surface>
    </VenueShell>
  );
}

export async function VenueProfileScreen() {
  const venuePortalData = await getVenuePortalData();
  const totalProfileSections = venuePortalData.profileSections.length;
  const totalAmenities = venuePortalData.venue.amenities.length;
  const highlightedHours = venuePortalData.venue.hours.filter((hour) => hour.highlighted).length;

  return (
    <VenueShell
      eyebrow="Venue profile"
      title="Public profile"
      description="Photos, description, amenities, and hours."
      links={venueLinks("/venue/profile")}
    >
      <DecisionStrip
        eyebrow="Profile read"
        title="What the public venue profile needs"
        description="Read profile coverage, amenity depth, and highlighted service windows before editing sections."
        items={[
          {
            key: "coverage",
            label: "Coverage",
            summary: `${totalProfileSections} public profile sections are currently shaping how organizers see this room.`,
            meta: "If the public story is weak, strong operational performance will still under-convert.",
            tone: "indigo",
          },
          {
            key: "amenities",
            label: "Amenities",
            summary: `${totalAmenities} amenities are currently visible on the public venue profile.`,
            meta: "Amenities only matter if they support room-fit decisions, not if they read like filler tags.",
            tone: "sage",
          },
          {
            key: "hours",
            label: "Highlighted hours",
            summary: `${highlightedHours} weekly hours are currently marked as highlighted or strategically important.`,
            meta: "Strong highlighted hours make booking decisions easier and reduce weak-fit inquiries.",
            tone: "coral",
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Surface
          eyebrow="Preview"
          title={venuePortalData.venue.name}
          description={venuePortalData.venue.summary}
        >
          <div
            className="h-52 rounded-lg"
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
          <div className="mt-5">
            <KeyValueList
              items={[
                {
                  key: "partnership-tier",
                  label: "Partnership tier",
                  value: venuePortalData.partnershipTier,
                },
                {
                  key: "capacity",
                  label: "Capacity",
                  value: String(venuePortalData.venue.capacity),
                },
                {
                  key: "rating",
                  label: "Venue rating",
                  value: String(venuePortalData.venue.rating),
                },
              ]}
            />
          </div>
        </Surface>

        <Surface
          eyebrow="Editor"
          title="Profile sections"
          description="Keep the public venue story clear enough that the right organizers self-select into this room."
        >
          <VenueProfileSectionEditor sections={venuePortalData.profileSections} />
        </Surface>
      </div>
    </VenueShell>
  );
}
