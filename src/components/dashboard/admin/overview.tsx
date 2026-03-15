import type { Route } from "next";
import Link from "next/link";
import {
  Users,
  CalendarDays,
  TrendingUp,
  DollarSign,
  Building2,
  AlertTriangle,
  Activity,
  ShieldCheck,
  Settings,
  FileText,
  ClipboardList,
} from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import {
  Surface,
  StatCard,
  StreamCard,
  ToneBadge,
  TrendChart,
  ActivityFeed,
  QuickActionCard,
  SignalRail,
  DecisionStrip,
} from "@/components/dashboard/primitives";
import type { DashboardTone } from "@/components/dashboard/primitives";
import { getAdminPortalData } from "@/lib/dashboard-fetchers";

/* ── Shared helpers ──────────────────────────────────────────── */

function adminLinks(activeKey: string) {
  return [
    { key: "overview", label: "Overview", href: "/admin" as Route },
    { key: "users", label: "Users", href: "/admin/users" as Route },
    { key: "events", label: "Events", href: "/admin/events" as Route },
    { key: "venues", label: "Venues", href: "/admin/venues" as Route },
    { key: "groups", label: "Groups", href: "/admin/groups" as Route },
    { key: "bookings", label: "Bookings", href: "/admin/bookings" as Route },
    { key: "revenue", label: "Revenue", href: "/admin/revenue" as Route },
    { key: "payouts", label: "Payouts", href: "/admin/payouts" as Route },
    { key: "messages", label: "Messages", href: "/admin/messages" as Route },
    { key: "settings", label: "Settings", href: "/admin/settings" as Route },
    { key: "audit", label: "Audit Log", href: "/admin/audit" as Route },
    { key: "analytics", label: "Analytics", href: "/admin/analytics" as Route },
    { key: "content", label: "Content", href: "/admin/content" as Route },
    { key: "comms", label: "Comms", href: "/admin/comms" as Route },
    { key: "moderation", label: "Moderation", href: "/admin/moderation" as Route },
  ].map((l) => ({ href: l.href, label: l.label, active: l.key === activeKey }));
}

function statusTone(s: string): DashboardTone {
  if (/active|published|approved|going|accepted|completed/i.test(s)) return "sage";
  if (/pending|draft|waitlisted|counter/i.test(s)) return "sand";
  if (/cancelled|rejected|suspended|declined|critical/i.test(s)) return "coral";
  return "neutral";
}

/* ── Screen ──────────────────────────────────────────────────── */

export async function AdminOverviewScreen() {
  const data = await getAdminPortalData();

  const pendingCount = data.urgentQueues.length;
  const metricIcons = [Users, Activity, CalendarDays, TrendingUp, DollarSign, Building2, AlertTriangle, ShieldCheck] as const;

  return (
    <PortalShell
      eyebrow="Admin portal"
      title="Platform Overview"
      description="Real-time health, pending decisions, and operational signals across the entire platform."
      links={adminLinks("overview")}
      variant="admin"
      roleMode="admin"
    >
      {/* ── Decision strip ─────────────────────────────────── */}
      <DecisionStrip
        eyebrow="Attention required"
        title="Platform pulse"
        description={`${pendingCount} urgent queue${pendingCount === 1 ? "" : "s"} need your attention today. Review and triage before the next digest cycle.`}
        items={data.urgentQueues.map((q) => ({
          key: q.key,
          label: q.meta,
          summary: q.title,
          meta: q.detail,
          tone: q.tone,
        }))}
      />

      {/* ── Key metrics ────────────────────────────────────── */}
      <Surface
        eyebrow="Platform metrics"
        title="Key performance indicators"
        description="High-level numbers across users, events, revenue, and system health."
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {data.metrics.map((m, i) => (
            <StatCard
              key={m.label}
              label={m.label}
              value={m.value}
              delta={m.delta}
              detail={m.detail}
              icon={metricIcons[i % metricIcons.length]}
              tone={i < 2 ? "indigo" : i < 4 ? "sage" : i < 6 ? "coral" : "basalt"}
            />
          ))}
        </div>
      </Surface>

      {/* ── Urgent queues ──────────────────────────────────── */}
      <Surface
        eyebrow="Urgent"
        title="Pending queues"
        description="Items that need a decision or action before they block downstream workflows."
      >
        <div className="grid gap-3 lg:grid-cols-3">
          {data.urgentQueues.map((q) => {
            // Route urgent queue items to the appropriate admin lane
            const laneRoutes: Record<string, string> = {
              events: "/admin/events",
              venues: "/admin/venues",
              users: "/admin/users",
              groups: "/admin/groups",
              bookings: "/admin/bookings",
              moderation: "/admin/moderation",
              audit: "/admin/audit",
            };
            const lane = q.key.split("-")[0] || "events";
            const href = laneRoutes[lane] || "/admin/events";
            return (
            <Link key={q.key} href={href as Route} className="block transition hover:opacity-80">
              <StreamCard
                eyebrow={q.meta}
                title={q.title}
                description={q.detail}
                badge={<ToneBadge tone={q.tone}>{q.tone === "coral" ? "Urgent" : "Review"}</ToneBadge>}
              />
            </Link>
            );
          })}
        </div>
      </Surface>

      {/* ── Growth + category charts ───────────────────────── */}
      <div className="grid gap-4 xl:grid-cols-2">
        <Surface
          eyebrow="Growth"
          title="User growth trend"
          description="New verified signups over the past six months."
        >
          <TrendChart data={data.growthChart} tone="indigo" />
        </Surface>

        <Surface
          eyebrow="Categories"
          title="Event category mix"
          description="Distribution of events across top categories."
        >
          <TrendChart data={data.categoryMix} tone="sage" />
        </Surface>
      </div>

      {/* ── Handoff log ────────────────────────────────────── */}
      <Surface
        eyebrow="Activity"
        title="Recent handoff log"
        description="Cross-team handoffs and escalation notes from the last 24 hours."
      >
        <ActivityFeed
          items={data.handoffLog.map((h) => ({
            key: h.key,
            title: `${h.actor} — ${h.lane}`,
            detail: h.summary,
            meta: h.when,
            tone: h.lane === "Moderation" ? "coral" as DashboardTone : h.lane === "Revenue" ? "indigo" as DashboardTone : "sage" as DashboardTone,
          }))}
        />
      </Surface>

      {/* ── Quick actions ──────────────────────────────────── */}
      <Surface
        eyebrow="Quick actions"
        title="Jump to key areas"
        description="Shortcuts to the most common admin workflows."
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <QuickActionCard
            href={"/admin/venues" as Route}
            title="Approve venues"
            description="Review pending venue applications and manage the partner network."
            icon={Building2}
          />
          <QuickActionCard
            href={"/admin/users" as Route}
            title="Manage users"
            description="Search users, review flagged accounts, and manage roles."
            icon={Users}
          />
          <QuickActionCard
            href={"/admin/revenue" as Route}
            title="Revenue dashboard"
            description="Track platform revenue, transactions, and payout status."
            icon={DollarSign}
          />
          <QuickActionCard
            href={"/admin/settings" as Route}
            title="Platform settings"
            description="Configure registration, events, payments, and feature flags."
            icon={Settings}
          />
          <QuickActionCard
            href={"/admin/audit" as Route}
            title="Audit log"
            description="Review all admin actions and system changes."
            icon={ClipboardList}
          />
          <QuickActionCard
            href={"/admin/events" as Route}
            title="Event operations"
            description="Manage events, audience curation, and calendar scheduling."
            icon={CalendarDays}
          />
        </div>
      </Surface>

      {/* ── Ops inbox signal rail ──────────────────────────── */}
      <SignalRail
        eyebrow="Operations"
        title="Ops inbox"
        description="Current workstream items assigned across the operations team."
        items={data.opsInbox.map((item) => {
          const laneRoutes: Record<string, string> = {
            Moderation: "/admin/moderation",
            Revenue: "/admin/revenue",
            Events: "/admin/events",
            Users: "/admin/users",
            Venues: "/admin/venues",
            Bookings: "/admin/bookings",
            Groups: "/admin/groups",
            Payouts: "/admin/payouts",
          };
          return {
            key: item.key,
            label: item.lane,
            value: item.status,
            detail: item.title,
            tone: statusTone(item.status),
            href: laneRoutes[item.lane] ?? "/admin",
          };
        })}
      />
    </PortalShell>
  );
}
