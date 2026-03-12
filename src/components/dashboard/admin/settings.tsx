import type { Route } from "next";
import {
  Settings,
  AlertTriangle,
  Inbox,
  Users,
  FileText,
  Tag,
  PenSquare,
  Shield,
  Ban,
  ClipboardList,
  Mail,
  Send,
  Eye,
} from "lucide-react";
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
      {/* ── Settings sections ──────────────────────────────── */}
      {settings.map((section) => (
        <Surface
          key={section.key}
          eyebrow="Configuration"
          title={section.title}
          description={`Current ${section.title.toLowerCase()} configuration values.`}
        >
          <KeyValueList
            items={section.items.map((item, i) => ({
              key: `${section.key}-${i}`,
              label: item.label,
              value: item.value,
            }))}
          />
        </Surface>
      ))}

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
      {/* ── Content sections ───────────────────────────────── */}
      <Surface
        eyebrow="Homepage"
        title="Content sections"
        description="Current status of homepage content blocks. Update sections before the weekly digest cycle."
      >
        <DashboardTable
          columns={["Section", "Status", "Note"]}
          rows={content.sections.map((s) => ({
            key: s.key,
            cells: [
              <span key="title" className="font-medium">{s.title}</span>,
              <ToneBadge key="status" tone={statusTone(s.status)}>{s.status}</ToneBadge>,
              <span key="note" className="text-xs text-brand-text-muted">{s.note}</span>,
            ],
          }))}
          caption="Homepage content sections"
        />
      </Surface>

      {/* ── Categories ─────────────────────────────────────── */}
      <Surface
        eyebrow="Taxonomy"
        title="Event categories"
        description="Category directory with event counts and visual tone assignments."
      >
        <div className="flex flex-wrap gap-2">
          {content.categories.map((cat) => (
            <div
              key={cat.key}
              className="flex items-center gap-2 rounded-lg border border-brand-border-light bg-white px-3 py-2"
            >
              <ToneBadge tone={(cat.tone as DashboardTone) ?? "neutral"}>{cat.name}</ToneBadge>
              <span className="tabular-nums text-sm font-medium text-brand-text-muted">
                {cat.count} events
              </span>
            </div>
          ))}
        </div>
      </Surface>

      {/* ── Blog queue ─────────────────────────────────────── */}
      <Surface
        eyebrow="Editorial"
        title="Blog queue"
        description="Posts in the editorial pipeline awaiting review or publication."
      >
        <DashboardTable
          columns={["Title", "Category", "Status"]}
          rows={content.blogQueue.map((post) => ({
            key: post.key,
            cells: [
              <span key="title" className="font-medium">{post.title}</span>,
              <ToneBadge key="cat" tone="neutral">{post.category}</ToneBadge>,
              <ToneBadge key="status" tone={statusTone(post.status)}>{post.status}</ToneBadge>,
            ],
          }))}
          caption="Blog post queue"
        />
      </Surface>
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
      {/* ── Reports ────────────────────────────────────────── */}
      <Surface
        eyebrow="Reports"
        title="Active reports"
        description={`${moderation.reports.length} open reports requiring review. Prioritize high-severity items first.`}
      >
        <DashboardTable
          columns={["Subject", "Priority", "Status", "Note"]}
          rows={moderation.reports.map((r) => ({
            key: r.key,
            cells: [
              <span key="sub" className="font-medium">{r.subject}</span>,
              <ToneBadge key="pri" tone={severityTone(r.priority)}>{r.priority}</ToneBadge>,
              <ToneBadge key="status" tone={statusTone(r.status)}>{r.status}</ToneBadge>,
              <span key="note" className="text-xs text-brand-text-muted">{r.note}</span>,
            ],
          }))}
          caption="Moderation reports"
        />
      </Surface>

      {/* ── Banned users ───────────────────────────────────── */}
      <Surface
        eyebrow="Enforcement"
        title="Banned accounts"
        description="Users currently suspended or permanently banned from the platform."
      >
        <DashboardTable
          columns={["Name", "Reason", "Appeal status"]}
          rows={moderation.banned.map((b) => ({
            key: b.key,
            cells: [
              <span key="name" className="font-medium">{b.name}</span>,
              <ToneBadge key="reason" tone="coral">{b.reason}</ToneBadge>,
              <ToneBadge key="appeal" tone={b.appeal === "Pending" ? "sand" : "neutral"}>
                {b.appeal}
              </ToneBadge>,
            ],
          }))}
          caption="Banned accounts"
        />
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
      {/* ── Draft preview ──────────────────────────────────── */}
      <Surface
        eyebrow="Current draft"
        title={comms.draft.subject}
        description="Preview of the next scheduled email communication."
      >
        <div className="rounded-lg border border-brand-border-light bg-brand-sand-light p-4">
          <KeyValueList
            items={[
              { key: "template", label: "Template", value: comms.draft.templateKey },
              { key: "subject", label: "Subject line", value: comms.draft.subject },
              { key: "preheader", label: "Preheader", value: comms.draft.preheader },
              { key: "headline", label: "Headline", value: comms.draft.headline },
              { key: "cta", label: "CTA label", value: comms.draft.ctaLabel },
              { key: "footer", label: "Footer", value: comms.draft.footer },
            ]}
          />
          <div className="mt-3">
            <div className="text-xs font-medium uppercase tracking-wider text-brand-text-light">Preview</div>
            <p className="mt-1 text-sm leading-relaxed text-brand-text-muted">
              {comms.draft.preview}
            </p>
          </div>
        </div>
      </Surface>

      {/* ── Audiences ──────────────────────────────────────── */}
      <Surface
        eyebrow="Targeting"
        title="Audience segments"
        description="Available audience segments for campaign targeting."
      >
        <div className="flex flex-wrap gap-2">
          {comms.audiences.map((audience) => (
            <ToneBadge key={audience} tone="indigo">{audience}</ToneBadge>
          ))}
        </div>
      </Surface>

      {/* ── History ────────────────────────────────────────── */}
      <Surface
        eyebrow="History"
        title="Communication history"
        description="Recent email campaigns and their performance."
      >
        <DashboardTable
          columns={["Campaign", "Audience", "Sent", "Result"]}
          rows={comms.history.map((h) => ({
            key: h.key,
            cells: [
              <span key="title" className="font-medium">{h.title}</span>,
              <ToneBadge key="aud" tone="neutral">{h.audience}</ToneBadge>,
              <span key="sent" className="text-brand-text-muted">{h.sent}</span>,
              <ToneBadge key="result" tone="sage">{h.result}</ToneBadge>,
            ],
          }))}
          caption="Email campaign history"
        />
      </Surface>
    </PortalShell>
  );
}
