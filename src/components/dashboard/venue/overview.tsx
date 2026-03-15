import Link from "next/link";
import type { Route } from "next";
import {
  CalendarDays,
  Users,
  Star,
  Clock,
  Inbox,
  CalendarRange,
  BarChart3,
  Tag,
} from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import {
  Surface,
  StatCard,
  QuickActionCard,
  DashboardTable,
  ActivityFeed,
  ToneBadge,
  TrendChart,
  AvatarStamp,
} from "@/components/dashboard/primitives";
import type { DashboardTone } from "@/components/dashboard/primitives";
import { getVenuePortalData } from "@/lib/dashboard-fetchers";
import { resolveVenueTier, venueHasFeature } from "@/lib/entitlements";
import { MessageActions, MessageStatusBadge, ComposeMessageButton } from "../member/message-actions";
import { MarkAllReadButton } from "../notification-actions";
import { getUserConversations } from "@/lib/db/messages";
import { getUser } from "@/lib/auth/guards";

/* ── Shared helpers ──────────────────────────────────────────── */

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
  if (/pending|draft|waitlisted|counter/i.test(s)) return "sand";
  if (/cancelled|rejected|suspended|declined|urgent/i.test(s)) return "coral";
  return "neutral";
}

/* ── Overview Screen ─────────────────────────────────────────── */

export async function VenueDashboardScreen() {
  const data = await getVenuePortalData();
  const tier = resolveVenueTier(data.partnershipTier);

  const metricIcons = [CalendarDays, Users, Star, Clock, Inbox, Tag] as const;
  const metricTones: DashboardTone[] = ["indigo", "sage", "coral", "sand", "indigo", "sage"];

  return (
    <PortalShell
      eyebrow="Venue portal"
      title={data.venue.name}
      description="Manage your venue, bookings, and organizer relationships."
      links={venueLinks("overview")}
      roleMode="venue"
      signalCards={data.metrics.map((m) => ({
        label: m.label,
        value: m.value,
        detail: m.detail,
      }))}
      primaryAction={{ href: "/venue/bookings" as Route, label: "Review bookings" }}
    >
      {/* ── Stat cards ──────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {data.metrics.map((m, i) => (
          <StatCard
            key={m.label}
            label={m.label}
            value={m.value}
            delta={m.delta}
            detail={m.detail}
            icon={metricIcons[i % metricIcons.length]}
            tone={metricTones[i % metricTones.length]}
          />
        ))}
      </div>

      {/* ── Incoming bookings ─────────────────────────────── */}
      <Surface
        eyebrow="Bookings"
        title="Pending booking requests"
        description="Respond to incoming booking requests from organizers."
        actionLabel="All bookings"
        actionHref={"/venue/bookings" as Route}
      >
        {data.bookings.incoming.filter((b) => !/accepted/i.test(b.status)).length > 0 ? (
          <DashboardTable
            columns={["Organizer", "Event", "Date", "Attendance", "Status"]}
            rows={data.bookings.incoming
              .filter((b) => !/accepted/i.test(b.status))
              .map((b) => ({
                key: b.key,
                cells: [
                  <div key="org" className="flex items-center gap-2">
                    <AvatarStamp name={b.organizer} size="sm" />
                    <span className="font-medium">{b.organizer}</span>
                  </div>,
                  b.event,
                  b.date,
                  b.attendance,
                  <ToneBadge key="status" tone={statusTone(b.status)}>
                    {b.status}
                  </ToneBadge>,
                ],
              }))}
            caption="Pending booking requests"
          />
        ) : (
          <p className="py-8 text-center text-sm text-gray-500">
            No pending booking requests at this time.
          </p>
        )}
      </Surface>

      {/* ── Upcoming events ───────────────────────────────── */}
      <Surface
        eyebrow="Calendar"
        title="Upcoming events at your venue"
        description="Confirmed and pending events scheduled at your space."
        actionLabel="All events"
        actionHref={"/venue/events" as Route}
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
                e.organizer,
                <ToneBadge key="status" tone={statusTone(e.status)}>
                  {e.status}
                </ToneBadge>,
                <span key="note" className="text-brand-text-muted">{e.note}</span>,
              ],
            }))}
            caption="Upcoming events"
          />
        ) : (
          <p className="py-8 text-center text-sm text-gray-500">
            No upcoming events scheduled yet.
          </p>
        )}
      </Surface>

      {/* ── Analytics preview ─────────────────────────────── */}
      {venueHasFeature(data.partnershipTier, "premium_analytics") && (
        <Surface
          eyebrow="Analytics"
          title="Booking funnel"
          description="How organizers discover and book your venue."
          actionLabel="Full analytics"
          actionHref={"/venue/analytics" as Route}
        >
          <TrendChart
            data={data.analytics.funnel}
            tone="indigo"
          />
        </Surface>
      )}

      {/* ── Recent messages ───────────────────────────────── */}
      <Surface
        eyebrow="Messages"
        title="Recent messages"
        description="Conversations with organizers and platform support."
        actionLabel="All messages"
        actionHref={"/venue/messages" as Route}
      >
        {data.messages.length > 0 ? (
          <DashboardTable
            columns={["From", "Subject", "Channel", "Status", "When"]}
            rows={data.messages.map((m) => ({
              key: m.key,
              cells: [
                <div key="from" className="flex items-center gap-2">
                  <AvatarStamp name={m.counterpart} size="sm" />
                  <div>
                    <div className="font-medium">{m.counterpart}</div>
                    <div className="text-xs text-brand-text-muted">{m.role}</div>
                  </div>
                </div>,
                <div key="subject">
                  <div className="font-medium">{m.subject}</div>
                  <div className="mt-0.5 text-xs text-brand-text-muted line-clamp-1">{m.preview}</div>
                </div>,
                m.channel,
                <ToneBadge key="status" tone={statusTone(m.status)}>
                  {m.status}
                </ToneBadge>,
                m.meta,
              ],
            }))}
            caption="Recent venue messages"
            dense
          />
        ) : (
          <p className="py-8 text-center text-sm text-gray-500">
            No messages yet. Conversations with organizers will appear here.
          </p>
        )}
      </Surface>

      {/* ── Notifications ─────────────────────────────────── */}
      <Surface
        eyebrow="Alerts"
        title="Notifications"
        description="Action items and venue updates."
        actionLabel="All notifications"
        actionHref={"/venue/notifications" as Route}
      >
        <ActivityFeed
          items={data.notifications.map((n) => ({
            key: n.key,
            title: n.title,
            detail: n.detail,
            meta: n.meta,
            tone: n.tone,
          }))}
        />
      </Surface>

      {/* ── Quick actions ─────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <QuickActionCard
          href={"/venue/bookings" as Route}
          title="Review bookings"
          description="Accept, decline, or counter incoming booking requests."
          icon={Inbox}
        />
        <QuickActionCard
          href={"/venue/availability" as Route}
          title="Set availability"
          description="Update your weekly schedule and block out dates."
          icon={CalendarRange}
        />
        <QuickActionCard
          href={"/venue/deals" as Route}
          title="Manage deals"
          description="Create and track member and organizer deals."
          icon={Tag}
        />
        <QuickActionCard
          href={"/venue/analytics" as Route}
          title="View analytics"
          description="Booking funnel, event types, and referral insights."
          icon={BarChart3}
        />
      </div>
    </PortalShell>
  );
}

/* ── Messages Screen ─────────────────────────────────────────── */

export async function VenueMessagesScreen() {
  const session = await getUser().catch(() => null);

  // Fetch real messages from the database
  let messages: Array<{
    key: string;
    counterpart: string;
    role: string;
    subject: string;
    preview: string;
    channel: string;
    status: string;
  }> = [];

  if (session?.id) {
    try {
      const dbMessages = await getUserConversations(session.id);
      messages = dbMessages.map((m: Record<string, unknown>) => ({
        key: (m.id as string) ?? "",
        counterpart: (m.other_display_name as string) ?? "Unknown",
        role: "Organizer",
        subject: (m.subject as string) ?? "No subject",
        preview: ((m.body as string) ?? "").slice(0, 100),
        channel: "Direct",
        status: m.is_read ? "Read" : "Unread",
      }));
    } catch {
      // Fall back to mock data
    }
  }

  // If no real messages, use mock data
  if (messages.length === 0) {
    const data = await getVenuePortalData();
    messages = data.messages;
  }

  return (
    <PortalShell
      eyebrow="Venue portal"
      title="Messages"
      description="All conversations with organizers and platform support."
      links={venueLinks("messages")}
      roleMode="venue"
    >
      {/* ── Compose button ──────────────────────────────────── */}
      <ComposeMessageButton />

      <Surface
        eyebrow="Inbox"
        title="All messages"
        description="Booking threads, compliance notices, and organizer conversations."
      >
        {messages.length > 0 ? (
          <DashboardTable
            columns={["From", "Subject", "Channel", "Status", "Action"]}
            rows={messages.map((m) => ({
              key: m.key,
              cells: [
                <div key="from" className="flex items-center gap-2">
                  <AvatarStamp name={m.counterpart} size="sm" />
                  <div>
                    <span className="font-medium text-brand-text">{m.counterpart}</span>
                    <div className="text-xs text-brand-text-muted">{m.role}</div>
                  </div>
                </div>,
                <div key="subject">
                  <div className="font-medium">{m.subject}</div>
                  <div className="mt-0.5 text-xs text-brand-text-muted line-clamp-1">{m.preview}</div>
                </div>,
                <ToneBadge key="channel" tone="neutral">{m.channel}</ToneBadge>,
                <MessageStatusBadge key="status" messageKey={m.key} serverStatus={m.status} />,
                <MessageActions key="action" messageKey={m.key} subject={m.subject} />,
              ],
            }))}
            caption="All venue messages"
          />
        ) : (
          <p className="py-8 text-center text-sm text-gray-500">
            No messages yet. Conversations with organizers and support will appear here.
          </p>
        )}
      </Surface>
    </PortalShell>
  );
}

/* ── Notifications Screen ────────────────────────────────────── */

export async function VenueNotificationsScreen() {
  const data = await getVenuePortalData();

  const unreadIds = data.notifications
    .filter((n) => n.status === "Unread" || n.status === "New")
    .map((n) => n.key);

  return (
    <PortalShell
      eyebrow="Venue portal"
      title="Notifications"
      description="Action items, alerts, and venue updates."
      links={venueLinks("notifications")}
      roleMode="venue"
    >
      <Surface
        eyebrow="Alerts"
        title="All notifications"
        description="Booking deadlines, revenue updates, and platform notices."
      >
        {unreadIds.length > 0 && (
          <div className="mb-4 flex justify-end">
            <MarkAllReadButton ids={unreadIds} />
          </div>
        )}
        <ActivityFeed
          items={data.notifications.map((n) => ({
            key: n.key,
            title: n.title,
            detail: n.detail,
            meta: `${n.channel} · ${n.meta}`,
            tone: n.tone,
          }))}
        />
      </Surface>
    </PortalShell>
  );
}

/* ── Analytics Screen ────────────────────────────────────────── */

export async function VenueAnalyticsScreen() {
  const data = await getVenuePortalData();
  const hasPremiumAnalytics = venueHasFeature(data.partnershipTier, "premium_analytics");

  if (!hasPremiumAnalytics) {
    return (
      <PortalShell
        eyebrow="Venue portal"
        title="Analytics"
        description="Detailed insights into your venue performance."
        links={venueLinks("analytics")}
        roleMode="venue"
      >
        <Surface
          eyebrow="Upgrade required"
          title="Premium Analytics"
          description="Upgrade to the Premium tier to unlock detailed booking funnels, event type breakdowns, and referral source analytics."
        >
          <div className="flex items-center gap-4 rounded-lg border border-brand-border-light bg-brand-sand-light p-4">
            <BarChart3 className="h-8 w-8 text-brand-text-muted" />
            <div>
              <p className="text-sm font-medium text-brand-text">
                Analytics are available on the Premium venue plan.
              </p>
              <p className="mt-1 text-sm text-brand-text-muted">
                Get insights into how organizers discover and book your venue, which event types perform best, and where your traffic comes from.
              </p>
            </div>
          </div>
        </Surface>
      </PortalShell>
    );
  }

  return (
    <PortalShell
      eyebrow="Venue portal"
      title="Analytics"
      description="Detailed insights into your venue performance."
      links={venueLinks("analytics")}
      roleMode="venue"
    >
      {/* ── Booking funnel ───────────────────────────────── */}
      <Surface
        eyebrow="Conversion"
        title="Booking funnel"
        description="How organizers move from viewing your profile to confirmed bookings."
      >
        <TrendChart
          data={data.analytics.funnel}
          tone="indigo"
        />
      </Surface>

      {/* ── Event type mix ───────────────────────────────── */}
      <Surface
        eyebrow="Event types"
        title="Events by category"
        description="Which types of events are booked at your venue most often."
      >
        <TrendChart
          data={data.analytics.eventTypes}
          tone="sage"
        />
      </Surface>

      {/* ── Top referrers ────────────────────────────────── */}
      <Surface
        eyebrow="Traffic sources"
        title="Top referrers"
        description="Where your booking inquiries are coming from."
      >
        <div className="space-y-2">
          {data.analytics.topReferrers.length > 0 ? (
            data.analytics.topReferrers.map((ref, i) => (
              <div
                key={typeof ref === "string" ? ref : ref.label}
                className="flex items-center gap-3 rounded-lg border border-brand-border-light bg-white p-3"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[rgba(55,48,163,0.08)] text-xs font-semibold text-brand-indigo">
                  {i + 1}
                </span>
                <span className="flex-1 text-sm font-medium text-brand-text">
                  {typeof ref === "string" ? ref : ref.label}
                </span>
                {typeof ref !== "string" && ref.value > 0 && (
                  <span className="text-xs tabular-nums text-brand-text-muted">
                    {ref.value} inquiries
                  </span>
                )}
              </div>
            ))
          ) : (
            <p className="py-6 text-center text-sm text-brand-text-muted">
              Referrer data will appear here once your venue receives booking inquiries.
            </p>
          )}
        </div>
      </Surface>
    </PortalShell>
  );
}
