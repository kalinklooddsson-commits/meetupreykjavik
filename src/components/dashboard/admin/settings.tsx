import type { Route } from "next";
import { PortalShell } from "@/components/layout/portal-shell";
import {
  Surface,
  DashboardTable,
  StreamCard,
  ToneBadge,
  KeyValueList,
  ActivityFeed,
} from "@/components/dashboard/primitives";
import type { DashboardTone } from "@/components/dashboard/primitives";
import { getAdminPortalData } from "@/lib/dashboard-fetchers";
import {
  AdminSettingsControlCenter,
  AdminContentControlCenter,
  AdminModerationOperationsDesk,
  AdminModerationConsole,
  AdminCommsStudio,
} from "./panels";

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

function statusTone(s: string): DashboardTone {
  if (/active|published|approved|going|accepted|completed|live|open|enabled|healthy|on/i.test(s)) return "sage";
  if (/pending|draft|waitlisted|counter|investigating|queued|needs|in progress/i.test(s)) return "sand";
  if (/cancelled|rejected|suspended|declined|critical|escalated|expiring|high/i.test(s)) return "coral";
  return "neutral";
}

function severityTone(s: string): DashboardTone {
  if (/high|critical/i.test(s)) return "coral";
  if (/medium/i.test(s)) return "sand";
  return "neutral";
}

/* ── Settings Screen ─────────────────────────────────────────── */

export async function AdminSettingsScreen() {
  const data = await getAdminPortalData();
  const { settings, incidentConsole, opsInbox, ownershipBoard } = data;

  return (
    <PortalShell
      eyebrow="Admin portal"
      title="Settings"
      description="Platform configuration, incident monitoring, and operational ownership across all workstreams."
      links={adminLinks("settings")}
      variant="admin"
      roleMode="admin"
    >
      {/* ── Settings sections (editable) ────────────────── */}
      <AdminSettingsControlCenter settings={settings} />

      {/* ── Incident console ───────────────────────────────── */}
      <Surface
        eyebrow="Incidents"
        title="Incident console"
        description="Active incidents and degraded services that need monitoring or resolution."
      >
        <div className="grid gap-3 lg:grid-cols-3">
          {incidentConsole.map((incident) => (
            <StreamCard
              key={incident.key}
              eyebrow={`${incident.severity} severity`}
              title={incident.title}
              description={incident.note}
              meta={`Owner: ${incident.owner}`}
              badge={<ToneBadge tone={severityTone(incident.severity)}>{incident.status}</ToneBadge>}
            />
          ))}
        </div>
      </Surface>

      {/* ── Ops inbox ──────────────────────────────────────── */}
      <Surface
        eyebrow="Operations"
        title="Ops inbox"
        description="Current workstream items assigned to operations team members."
      >
        <div className="grid gap-3 lg:grid-cols-2">
          {opsInbox.map((item) => (
            <StreamCard
              key={item.key}
              eyebrow={`${item.lane} — Due: ${item.due}`}
              title={item.title}
              description={item.note}
              meta={`Owner: ${item.owner}`}
              badge={<ToneBadge tone={statusTone(item.status)}>{item.status}</ToneBadge>}
            />
          ))}
        </div>
      </Surface>

      {/* ── Ownership board ────────────────────────────────── */}
      <Surface
        eyebrow="Team"
        title="Ownership board"
        description="Who owns what across the platform operations workstreams."
      >
        <DashboardTable
          columns={["Lane", "Lead", "Coverage", "Load"]}
          rows={ownershipBoard.map((o) => ({
            key: o.key,
            cells: [
              <span key="lane" className="font-medium">{o.lane}</span>,
              o.lead,
              <span key="cov" className="text-xs text-brand-text-muted">{o.coverage}</span>,
              <ToneBadge key="load" tone={o.load === "High" ? "coral" : "sage"}>{o.load}</ToneBadge>,
            ],
          }))}
          caption="Operations ownership"
        />
      </Surface>
    </PortalShell>
  );
}

/* ── Content Screen ──────────────────────────────────────────── */

export async function AdminContentScreen() {
  const data = await getAdminPortalData();
  const { content } = data;

  return (
    <PortalShell
      eyebrow="Admin portal"
      title="Content"
      description="Manage homepage sections, event categories, and the editorial blog queue."
      links={adminLinks("settings")}
      variant="admin"
      roleMode="admin"
    >
      <AdminContentControlCenter content={content} />
    </PortalShell>
  );
}

/* ── Moderation Screen ───────────────────────────────────────── */

export async function AdminModerationScreen() {
  const data = await getAdminPortalData();
  const { moderation } = data;

  return (
    <PortalShell
      eyebrow="Admin portal"
      title="Moderation"
      description="Review reports, manage banned accounts, and track moderation actions."
      links={adminLinks("settings")}
      variant="admin"
      roleMode="admin"
    >
      {/* ── Reports (interactive) ────────────────────────────── */}
      <AdminModerationOperationsDesk reports={moderation.reports} />

      {/* ── Banned users (interactive) ─────────────────────── */}
      <Surface
        eyebrow="Enforcement"
        title="Banned accounts"
        description="Users currently suspended or permanently banned. Unban accounts as needed."
      >
        <AdminModerationConsole items={moderation.banned} />
      </Surface>

      {/* ── Audit log preview ──────────────────────────────── */}
      <Surface
        eyebrow="Audit"
        title="Recent moderation actions"
        description="Last actions taken by the moderation team."
        actionLabel="Full audit log"
        actionHref={"/admin/audit" as Route}
      >
        <ActivityFeed
          items={moderation.auditLog.map((entry) => ({
            key: entry.key,
            title: entry.action,
            detail: `By ${entry.actor}`,
            meta: entry.when,
            tone: "indigo" as DashboardTone,
          }))}
        />
      </Surface>
    </PortalShell>
  );
}

/* ── Comms Screen ────────────────────────────────────────────── */

export async function AdminCommsScreen() {
  const data = await getAdminPortalData();
  const { comms } = data;

  return (
    <PortalShell
      eyebrow="Admin portal"
      title="Communications"
      description="Manage email campaigns, audience targeting, and communication history."
      links={adminLinks("settings")}
      variant="admin"
      roleMode="admin"
    >
      {/* ── Communications studio (interactive) ─────────── */}
      <AdminCommsStudio comms={comms} />
    </PortalShell>
  );
}
