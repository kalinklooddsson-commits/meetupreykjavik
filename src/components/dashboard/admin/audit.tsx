import type { Route } from "next";
import {
  ClipboardList,
  Clock,
  Shield,
} from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import {
  Surface,
  DashboardTable,
  ToneBadge,
  StatCard,
} from "@/components/dashboard/primitives";
import type { DashboardTone } from "@/components/dashboard/primitives";
import { adminAuditLog as mockAuditLog } from "@/lib/dashboard-data";
import { getAdminAuditLog } from "@/lib/dashboard-fetchers";

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
  ].map((l) => ({ href: l.href, label: l.label, active: l.key === activeKey }));
}

function targetTypeTone(t: string): DashboardTone {
  if (/venue/i.test(t)) return "coral";
  if (/event/i.test(t)) return "indigo";
  if (/user/i.test(t)) return "sage";
  if (/group/i.test(t)) return "sand";
  if (/transaction/i.test(t)) return "basalt";
  return "neutral";
}

function actionLabel(action: string): string {
  return action
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ── Screen ──────────────────────────────────────────────────── */

export async function AdminAuditScreen() {
  const dbEntries = await getAdminAuditLog();
  const entries = dbEntries.length > 0 ? dbEntries : mockAuditLog;

  const uniqueAdmins = new Set(entries.map((e) => e.admin)).size;
  const targetTypes = new Set(entries.map((e) => e.targetType)).size;

  return (
    <PortalShell
      eyebrow="Admin portal"
      title="Audit Log"
      description="Complete record of all administrative actions. Every change is logged with the responsible admin, target, and timestamp."
      links={adminLinks("audit")}
      variant="admin"
      roleMode="admin"
    >
      {/* ── Summary stats ──────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Total entries"
          value={String(entries.length)}
          detail="Administrative actions recorded"
          icon={ClipboardList}
          tone="indigo"
        />
        <StatCard
          label="Active admins"
          value={String(uniqueAdmins)}
          detail="Unique admin accounts with actions"
          icon={Shield}
          tone="sage"
        />
        <StatCard
          label="Target types"
          value={String(targetTypes)}
          detail="Different resource types affected"
          icon={Clock}
          tone="neutral"
        />
      </div>

      {/* ── Audit log table ────────────────────────────────── */}
      <Surface
        eyebrow="Complete log"
        title="Administrative actions"
        description="Every admin action is recorded here for transparency and accountability."
      >
        <DashboardTable
          columns={["Admin", "Action", "Target type", "Target ID", "Details", "Timestamp"]}
          rows={entries.map((e) => ({
            key: e.key,
            cells: [
              <span key="admin" className="font-medium">{e.admin}</span>,
              <span key="action" className="font-medium">{actionLabel(e.action)}</span>,
              <ToneBadge key="type" tone={targetTypeTone(e.targetType)}>{e.targetType}</ToneBadge>,
              <span key="target" className="font-mono text-xs text-brand-text-muted">{e.targetId}</span>,
              <span key="details" className="text-xs text-brand-text-muted">{e.details}</span>,
              <span key="time" className="whitespace-nowrap text-xs text-brand-text-muted">
                {formatTimestamp(e.timestamp)}
              </span>,
            ],
          }))}
          caption="Admin audit log"
        />
      </Surface>
    </PortalShell>
  );
}
