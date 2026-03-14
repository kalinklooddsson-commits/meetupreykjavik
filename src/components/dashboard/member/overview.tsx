import Link from "next/link";
import type { Route } from "next";
import {
  CalendarDays,
  Users,
  Sparkles,
  UserCircle,
  Search,
  CalendarRange,
  MessageSquare,
  Settings,
} from "lucide-react";
import { RsvpButton } from "@/components/public/rsvp-button";
import { PortalShell } from "@/components/layout/portal-shell";
import {
  Surface,
  StatCard,
  QuickActionCard,
  DashboardTable,
  ActivityFeed,
  ToneBadge,
  AvatarStamp,
} from "@/components/dashboard/primitives";
import type { DashboardTone } from "@/components/dashboard/primitives";
import { getMemberPortalData, getMemberProfile } from "@/lib/dashboard-fetchers";
import { resolveMemberTier } from "@/lib/entitlements";
import { shouldShowPremiumBadge } from "@/lib/features/member-features";

/* ── Shared helpers ──────────────────────────────────────────── */

function memberLinks(activeKey: string) {
  return [
    { key: "overview", label: "Overview", href: "/dashboard" as Route },
    { key: "events", label: "My Events", href: "/dashboard/calendar" as Route },
    { key: "groups", label: "Groups", href: "/dashboard/groups" as Route },
    { key: "messages", label: "Messages", href: "/dashboard/messages" as Route },
    { key: "transactions", label: "Payments", href: "/dashboard/transactions" as Route },
    { key: "profile", label: "Profile", href: "/settings" as Route },
  ].map((l) => ({ href: l.href, label: l.label, active: l.key === activeKey }));
}

function statusTone(s: string): DashboardTone {
  if (/active|published|approved|going|accepted|completed/i.test(s)) return "sage";
  if (/pending|draft|waitlisted|waitlist/i.test(s)) return "sand";
  if (/cancelled|rejected|suspended|declined/i.test(s)) return "coral";
  return "neutral";
}

/* ── Screen ──────────────────────────────────────────────────── */

export async function MemberOverviewScreen() {
  const [data, profile] = await Promise.all([
    getMemberPortalData(),
    getMemberProfile(),
  ]);

  const tier = resolveMemberTier(profile.tier);
  const showBadge = shouldShowPremiumBadge(profile.tier);
  const completionPct = parseInt(profile.completion, 10) || 0;

  const metricIcons = [CalendarDays, Users, Sparkles, UserCircle] as const;

  return (
    <PortalShell
      eyebrow="Member portal"
      title={`Welcome back, ${profile.name.split(" ")[0]}`}
      description="Your events, groups, and community at a glance."
      links={memberLinks("overview")}
      roleMode="member"
      signalCards={data.metrics.map((m) => ({
        label: m.label,
        value: m.value,
        detail: m.detail,
      }))}
    >
      {/* ── Profile welcome bar ─────────────────────────────── */}
      <Surface
        eyebrow="Your profile"
        title={profile.name}
        description={profile.bio || "Complete your bio to help organizers understand your interests."}
        actionLabel="Edit profile"
        actionHref={"/settings" as Route}
      >
        <div className="flex flex-wrap items-center gap-4">
          <AvatarStamp name={profile.name} size="lg" />
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-brand-text">
                {profile.city} &middot; Member since {profile.memberSince}
              </span>
              {showBadge ? (
                <ToneBadge tone="indigo">{profile.tier}</ToneBadge>
              ) : (
                <ToneBadge tone="neutral">{profile.tier}</ToneBadge>
              )}
            </div>
            {/* completion bar */}
            <div className="flex items-center gap-3">
              <div className="h-2 w-40 overflow-hidden rounded-full bg-brand-sand">
                <div
                  className="h-full rounded-full bg-brand-indigo transition-all"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
              <span className="text-xs font-medium text-brand-text-muted">
                {profile.completion} complete
              </span>
            </div>
          </div>
        </div>
      </Surface>

      {/* ── Stat cards ──────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.metrics.map((m, i) => (
          <StatCard
            key={m.label}
            label={m.label}
            value={m.value}
            delta={m.delta}
            detail={m.detail}
            icon={metricIcons[i]}
            tone={i === 0 ? "indigo" : i === 1 ? "sage" : i === 2 ? "coral" : "sand"}
          />
        ))}
      </div>

      {/* ── Upcoming events ─────────────────────────────────── */}
      <Surface
        eyebrow="Calendar"
        title="Upcoming events"
        description="Your confirmed RSVPs and waitlist positions."
        actionLabel="View calendar"
        actionHref={"/dashboard/calendar" as Route}
      >
        {data.upcomingEvents.length > 0 ? (
          <DashboardTable
            columns={["Event", "Venue", "Status", "Seat / Position", "Action"]}
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
                e.event.venueName,
                <ToneBadge key="status" tone={statusTone(e.status)}>
                  {e.status}
                </ToneBadge>,
                e.seat,
                <RsvpButton key="rsvp" eventSlug={e.event.slug} className="!min-h-0 !px-3 !py-1.5 !text-xs" />,
              ],
            }))}
            caption="Your upcoming events"
          />
        ) : (
          <p className="py-8 text-center text-sm text-gray-500">
            No upcoming events yet. <Link href={"/events" as Route} className="text-brand-indigo hover:underline">Browse events</Link> to find something you&apos;ll love.
          </p>
        )}
      </Surface>

      {/* ── Activity feed ───────────────────────────────────── */}
      <Surface
        eyebrow="Inbox"
        title="Recent activity"
        description="Latest updates from your events, groups, and venues."
        actionLabel="All notifications"
        actionHref={"/dashboard/notifications" as Route}
      >
        <ActivityFeed items={data.inbox} />
      </Surface>

      {/* ── Quick actions ───────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <QuickActionCard
          href={"/events" as Route}
          title="Browse events"
          description="Discover upcoming events in Reykjavik matched to your interests."
          icon={Search}
        />
        <QuickActionCard
          href={"/dashboard/calendar" as Route}
          title="Calendar"
          description="See your RSVPs, waitlists, and recommended events on the calendar."
          icon={CalendarRange}
        />
        <QuickActionCard
          href={"/dashboard/messages" as Route}
          title="Messages"
          description="Direct messages from organizers and group threads."
          icon={MessageSquare}
        />
        <QuickActionCard
          href={"/settings" as Route}
          title="Settings"
          description="Profile, notifications, privacy, and billing preferences."
          icon={Settings}
        />
      </div>

      {/* ── Notifications ───────────────────────────────────── */}
      <Surface
        eyebrow="Alerts"
        title="Recent notifications"
        description="Action items and system updates."
      >
        {data.notifications.length > 0 ? (
          <DashboardTable
            columns={["Notification", "Channel", "Status", "When"]}
            rows={data.notifications.map((n) => ({
              key: n.key,
              cells: [
                <div key="body">
                  <div className="font-medium">{n.title}</div>
                  <div className="mt-0.5 text-xs text-brand-text-muted">{n.detail}</div>
                </div>,
                n.channel,
                <ToneBadge key="status" tone={statusTone(n.status)}>
                  {n.status}
                </ToneBadge>,
                n.meta,
              ],
            }))}
            caption="Recent notifications"
          />
        ) : (
          <p className="py-8 text-center text-sm text-gray-500">
            No notifications right now. You&apos;ll see updates about your events and groups here.
          </p>
        )}
      </Surface>
    </PortalShell>
  );
}
