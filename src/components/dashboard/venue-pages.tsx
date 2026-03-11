import type { Route } from "next";
import {
  BadgeEuro,
  BellRing,
  CalendarCheck2,
  CalendarRange,
  Gift,
  MessageSquareMore,
  ShieldCheck,
  Users,
} from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import {
  ActivityFeed,
  DashboardTable,
  FilterChips,
  KeyValueList,
  ProgressSteps,
  StatCard,
  StreamCard,
  Surface,
  ToneBadge,
  TrendChart,
} from "@/components/dashboard/primitives";
import { venuePortalData } from "@/lib/dashboard-data";
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

export function VenueNotificationsScreen() {
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

export function VenueOnboardingScreen() {
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
      description="Hosted events, bookings, and calendar context."
      links={venueLinks("/venue/events")}
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Surface
          eyebrow="Events"
          title="Event pipeline"
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
          title="Recent performance"
        >
          <TrendChart
            data={venuePortalData.analytics.eventTypes}
            tone="coral"
            formatValue={(value) => `${value}`}
          />
        </Surface>
      </div>
    </VenueShell>
  );
}

export function VenueBookingsScreen() {
  return (
    <VenueShell
      eyebrow="Venue bookings"
      title="Booking queue"
      description="Requests, counters, and approvals."
      links={venueLinks("/venue/bookings")}
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Surface
          eyebrow="Incoming"
          title="Booking requests"
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
        title="Respond to requests"
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
      title="Hours and open slots"
      description="Recurring availability, exceptions, and day-by-day blocks."
      links={venueLinks("/venue/availability")}
    >
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Surface
          eyebrow="Recurring"
          title="Availability rules"
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
      title="Deals and perks"
      description="Member offers and partnership perks."
      links={venueLinks("/venue/deals")}
    >
      <Surface
        eyebrow="Offers"
        title="Active and draft deals"
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
        title="Status and redemption controls"
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
      description="Profile views, events hosted, and booking conversion."
      links={venueLinks("/venue/analytics")}
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Surface
          eyebrow="Funnel"
          title="Booking conversion"
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
      title="Public profile"
      description="Photos, description, amenities, and hours."
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
        >
          <VenueProfileSectionEditor sections={venuePortalData.profileSections} />
        </Surface>
      </div>
    </VenueShell>
  );
}
