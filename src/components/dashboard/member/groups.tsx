import Link from "next/link";
import type { Route } from "next";
import { Users, MessageCircle, CalendarDays } from "lucide-react";
import { LeaveGroupButton } from "./groups-actions";
import { PortalShell } from "@/components/layout/portal-shell";
import {
  Surface,
  DashboardTable,
  ToneBadge,
  StatCard,
  AvatarStamp,
} from "@/components/dashboard/primitives";
import type { DashboardTone } from "@/components/dashboard/primitives";
import { getMemberPortalData } from "@/lib/dashboard-fetchers";

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

export async function MemberGroupsScreen() {
  const data = await getMemberPortalData();

  return (
    <PortalShell
      eyebrow="Member portal"
      title="Groups"
      description="Communities you belong to and their upcoming activity."
      links={memberLinks("groups")}
      roleMode="member"
    >
      {/* ── Stats overview ──────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Groups joined"
          value={String(data.groups.length)}
          detail="Active communities you participate in."
          icon={Users}
          tone="indigo"
        />
        <StatCard
          label="Unread threads"
          value={String(
            data.groups.reduce((sum, g) => {
              const num = parseInt(g.unread, 10);
              return sum + (isNaN(num) ? 1 : num);
            }, 0),
          )}
          detail="New posts and intros across your groups."
          icon={MessageCircle}
          tone="coral"
        />
        <StatCard
          label="Next group event"
          value={data.groups[0]?.nextEvent?.split(" ").slice(0, 3).join(" ") ?? "None"}
          detail="The soonest event from any of your groups."
          icon={CalendarDays}
          tone="sage"
        />
      </div>

      {/* ── Groups table ────────────────────────────────────── */}
      <Surface
        eyebrow="Your communities"
        title="Groups"
        description="Your role, next event, and unread activity for each group."
        actionLabel="Discover groups"
        actionHref={"/groups" as Route}
      >
        <DashboardTable
          columns={["Group", "Your Role", "Next Event", "Unread", "Action"]}
          rows={data.groups.map((g) => ({
            key: g.group.slug,
            cells: [
              <div key="group" className="flex items-center gap-2.5">
                <AvatarStamp name={g.group.name} size="sm" />
                <Link
                  href={`/groups/${g.group.slug}` as Route}
                  className="font-medium text-brand-indigo hover:underline"
                >
                  {g.group.name}
                </Link>
              </div>,
              <ToneBadge key="role" tone="neutral">{g.role}</ToneBadge>,
              g.nextEvent ? (
                <span key="event" className="text-sm">{g.nextEvent}</span>
              ) : (
                <span key="event" className="text-sm text-brand-text-muted">No upcoming event</span>
              ),
              <ToneBadge key="unread" tone={g.unread.includes("0") ? "neutral" : "coral"}>
                {g.unread}
              </ToneBadge>,
              <LeaveGroupButton key="leave" groupSlug={g.group.slug} groupName={g.group.name} />,
            ],
          }))}
          caption="Your groups"
        />
      </Surface>

      {/* ── Group details cards ─────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {data.groups.map((g) => (
          <Surface key={g.group.slug} title={g.group.name}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-brand-text-light">
                  Role
                </span>
                <ToneBadge tone="indigo">{g.role}</ToneBadge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-brand-text-light">
                  Next event
                </span>
                <span className="text-sm font-medium text-brand-text">
                  {g.nextEvent || "None scheduled"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-brand-text-light">
                  Activity
                </span>
                <ToneBadge tone="coral">{g.unread}</ToneBadge>
              </div>
              <Link
                href={`/groups/${g.group.slug}` as Route}
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand-indigo hover:underline"
              >
                Open group
              </Link>
            </div>
          </Surface>
        ))}
      </div>
    </PortalShell>
  );
}
