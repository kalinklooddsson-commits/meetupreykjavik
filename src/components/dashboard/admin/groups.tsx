import type { Route } from "next";
import { Users } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import {
  Surface,
  DashboardTable,
  StreamCard,
  ToneBadge,
} from "@/components/dashboard/primitives";
import type { DashboardTone } from "@/components/dashboard/primitives";
import { getAdminPortalData } from "@/lib/dashboard-fetchers";
import { AdminActionButton } from "./panels";

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
    { key: "settings", label: "Settings", href: "/admin/settings" as Route },
    { key: "audit", label: "Audit Log", href: "/admin/audit" as Route },
  ].map((l) => ({ href: l.href, label: l.label, active: l.key === activeKey }));
}

function statusTone(s: string): DashboardTone {
  if (/active|published|approved|going|accepted|completed|featured|excellent|healthy/i.test(s)) return "sage";
  if (/pending|draft|waitlisted|counter|feature|needs/i.test(s)) return "sand";
  if (/cancelled|rejected|suspended|declined|critical|flag|health/i.test(s)) return "coral";
  return "neutral";
}

function healthTone(h: string): DashboardTone {
  if (/excellent|healthy/i.test(h)) return "sage";
  if (/needs/i.test(h)) return "sand";
  return "neutral";
}

/* ── Screen ──────────────────────────────────────────────────── */

export async function AdminGroupsScreen() {
  const data = await getAdminPortalData();
  const { groups } = data;

  return (
    <PortalShell
      eyebrow="Admin portal"
      title="Groups"
      description="Review pending group proposals, monitor health, and manage the community directory."
      links={adminLinks("groups")}
      variant="admin"
      roleMode="admin"
    >
      {/* ── Pending queue ──────────────────────────────────── */}
      <Surface
        eyebrow="Queue"
        title="Pending group queue"
        description={`${groups.queue.length} group${groups.queue.length === 1 ? "" : "s"} need attention. Approve, feature, or follow up with organizers.`}
      >
        <div className="grid gap-3 lg:grid-cols-3">
          {groups.queue.map((g) => (
            <StreamCard
              key={g.key}
              eyebrow={g.organizer}
              title={g.name}
              description={g.note}
              badge={<ToneBadge tone={statusTone(g.status)}>{g.status}</ToneBadge>}
            />
          ))}
        </div>
      </Surface>

      {/* ── Groups table ───────────────────────────────────── */}
      <Surface
        eyebrow="Directory"
        title="All groups"
        description={`${groups.table.length} groups in the platform directory. Monitor engagement health and take action as needed.`}
      >
        <DashboardTable
          columns={["Group", "Members", "Status", "Health", "Action"]}
          rows={groups.table.map((g) => ({
            key: g.key,
            cells: [
              <span key="name" className="font-medium">{g.name}</span>,
              <span key="members" className="flex items-center gap-1 tabular-nums">
                <Users className="h-3 w-3 text-brand-text-light" />
                {g.members}
              </span>,
              <ToneBadge key="status" tone={statusTone(g.status)}>{g.status}</ToneBadge>,
              <ToneBadge key="health" tone={healthTone(g.health)}>{g.health}</ToneBadge>,
              <AdminActionButton key="action" actionKey={g.key} actionLabel={g.action} endpoint="/api/admin/groups/action" />,
            ],
          }))}
          caption="Platform groups"
        />
      </Surface>
    </PortalShell>
  );
}
