import type { Route } from "next";
import { PortalShell } from "@/components/layout/portal-shell";
import {
  Surface,
  StatCard,
  DashboardTable,
  TrendChart,
  ActivityFeed,
  QuickActionCard,
  DecisionStrip,
  ToneBadge,
  KeyValueList,
} from "@/components/dashboard/primitives";
import type { DashboardTone } from "@/components/dashboard/primitives";
import { getOrganizerPortalData } from "@/lib/dashboard-fetchers";
import { resolveOrganizerTier, getMaxActiveEvents } from "@/lib/entitlements";
import {
  CalendarPlus,
  Users,
  LayoutTemplate,
  Building2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

function organizerLinks(activeKey: string) {
  return [
    { key: "overview", label: "Overview", href: "/organizer" as Route },
    { key: "events", label: "Events", href: "/organizer/events" as Route },
    { key: "groups", label: "Groups", href: "/organizer/groups" as Route },
    { key: "bookings", label: "Bookings", href: "/organizer/bookings" as Route },
    { key: "venues", label: "Venues", href: "/organizer/venues" as Route },
    { key: "analytics", label: "Analytics", href: "/organizer/analytics" as Route },
    { key: "messages", label: "Messages", href: "/organizer/messages" as Route },
    { key: "notifications", label: "Notifications", href: "/organizer/notifications" as Route },
  ].map((l) => ({ href: l.href, label: l.label, active: l.key === activeKey }));
}

function statusTone(s: string): DashboardTone {
  if (/active|published|approved|going|accepted|completed/i.test(s)) return "sage";
  if (/pending|draft|waitlisted|countered/i.test(s)) return "sand";
  if (/cancelled|rejected|suspended|declined/i.test(s)) return "coral";
  return "neutral";
}

export async function OrganizerOverviewScreen() {
  const data = await getOrganizerPortalData();
  const tier = resolveOrganizerTier(null);
  const maxEvents = getMaxActiveEvents(null);

  const pendingApprovals = data.metrics.find(
    (m) => m.label === "Pending approvals",
  );
  const pendingCount = pendingApprovals?.value ?? "0";

  const decisionItems = [
    ...(Number(pendingCount) > 0
      ? [
          {
            key: "approvals",
            label: "Approvals",
            summary: `${pendingCount} attendee approvals waiting`,
            meta: "Review before reminder emails go out.",
            tone: "coral" as DashboardTone,
          },
        ]
      : []),
    {
      key: "venue-replies",
      label: "Venue replies",
      summary: "Check venue booking responses",
      meta: "Counter-offers and confirmations need attention.",
      tone: "indigo" as DashboardTone,
    },
    {
      key: "upcoming",
      label: "Next event",
      summary: data.nextEvents[0]?.title ?? "No upcoming events",
      meta: data.nextEvents[0]
        ? `${data.nextEvents[0].dateLabel} at ${data.nextEvents[0].venueName}`
        : "Create your first event to get started.",
      tone: "sage" as DashboardTone,
    },
  ];

  const iconMap: Record<string, typeof CalendarPlus> = {
    "Create new event": CalendarPlus,
    "Review approvals": Users,
    "Send venue request": Building2,
    "Tune group settings": LayoutTemplate,
  };

  return (
    <PortalShell
      eyebrow="Organizer portal"
      title="Dashboard"
      description="Manage your events, groups, venues, and attendees from one place."
      links={organizerLinks("overview")}
      roleMode="organizer"
      primaryAction={{ href: "/events/new" as Route, label: "Create event" }}
      signalCards={data.metrics.map((m) => ({
        label: m.label,
        value: m.value,
        detail: m.detail,
      }))}
    >
      <div className="space-y-6">
        {/* Decision strip */}
        <DecisionStrip
          eyebrow="Needs attention"
          title="What matters now"
          description="Items that need your input before reminders or deadlines trigger."
          items={decisionItems}
        />

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {data.metrics.map((m) => (
            <StatCard
              key={m.label}
              label={m.label}
              value={m.value}
              detail={m.detail}
              delta={m.delta}
              tone={
                m.label.includes("Pending")
                  ? "coral"
                  : m.label.includes("Venue")
                    ? "indigo"
                    : "sage"
              }
            />
          ))}
        </div>

        {/* Active events table */}
        <Surface
          eyebrow="Your events"
          title="Active events"
          description="Events you are currently managing. Click any event for full details."
          actionLabel="View all events"
          actionHref={"/organizer/events" as Route}
        >
          <DashboardTable
            columns={["Event", "Date", "Venue", "RSVPs", "Status"]}
            rows={data.nextEvents.map((e) => ({
              key: e.slug,
              cells: [
                <Link
                  key="title"
                  href={`/organizer/events/${e.slug}` as Route}
                  className="font-medium text-brand-indigo hover:underline"
                >
                  {e.title}
                </Link>,
                e.dateLabel,
                e.venueName,
                <span key="rsvps" className="tabular-nums">
                  {e.rsvps} / {e.capacity}
                  {e.waitlist > 0 && (
                    <span className="ml-1 text-brand-text-muted">
                      (+{e.waitlist} waitlist)
                    </span>
                  )}
                </span>,
                <ToneBadge key="status" tone={statusTone(e.status)}>
                  {e.status}
                </ToneBadge>,
              ],
            }))}
            caption="Active events managed by you"
          />
        </Surface>

        {/* RSVP trend + Activity feed side by side */}
        <div className="grid gap-6 xl:grid-cols-2">
          <Surface
            eyebrow="Trends"
            title="RSVP trend"
            description="RSVPs received across all your events over the past week."
          >
            <TrendChart data={data.rsvpTrend} tone="indigo" />
          </Surface>

          <Surface
            eyebrow="Recent activity"
            title="Activity feed"
            description="Latest updates across your events and venue partnerships."
          >
            <ActivityFeed items={data.activityFeed} />
          </Surface>
        </div>

        {/* Quick actions */}
        <Surface
          eyebrow="Shortcuts"
          title="Quick actions"
          description="Jump into the workflows you use most."
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {data.quickActions.map((qa) => (
              <QuickActionCard
                key={qa.title}
                href={qa.href as Route}
                title={qa.title}
                description={qa.description}
                icon={iconMap[qa.title]}
              />
            ))}
          </div>
        </Surface>

        {/* Tier info */}
        <Surface
          eyebrow="Your plan"
          title={`${tier.charAt(0).toUpperCase() + tier.slice(1)} tier`}
          description={
            tier === "starter"
              ? `You can run up to ${maxEvents} active events on the Starter plan. Upgrade for unlimited events, venue workflows, and audience reporting.`
              : "You have access to all organizer features on your current plan."
          }
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <KeyValueList
              items={[
                { key: "tier", label: "Current tier", value: tier.charAt(0).toUpperCase() + tier.slice(1) },
                {
                  key: "events",
                  label: "Active event limit",
                  value: maxEvents === Infinity ? "Unlimited" : String(maxEvents),
                },
                {
                  key: "features",
                  label: "Key features",
                  value:
                    tier === "starter"
                      ? "Events, ticketing, basic analytics"
                      : tier === "pro"
                        ? "Unlimited events, approvals, venue workflows"
                        : "All features + priority support, sponsors",
                },
              ]}
            />
            {tier === "starter" && (
              <Link
                href={"/pricing" as Route}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-indigo px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-indigo/90"
              >
                <Sparkles className="h-4 w-4" />
                Upgrade plan
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </Surface>
      </div>
    </PortalShell>
  );
}
