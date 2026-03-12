import type { Route } from "next";
import {
  Building2,
  MapPin,
  Star,
} from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import {
  Surface,
  DashboardTable,
  StreamCard,
  ToneBadge,
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
  if (/active|published|approved|going|accepted|completed/i.test(s)) return "sage";
  if (/pending|draft|waitlisted|waitlist|counter|request/i.test(s)) return "sand";
  if (/cancelled|rejected|suspended|declined|critical/i.test(s)) return "coral";
  return "neutral";
}

/* ── Screen ──────────────────────────────────────────────────── */

export async function AdminVenuesScreen() {
  const data = await getAdminPortalData();
  const { venues } = data;

  return (
    <PortalShell
      eyebrow="Admin portal"
      title="Venues"
      description="Review applications, manage the active partner network, and oversee venue matching."
      links={adminLinks("venues")}
      variant="admin"
      roleMode="admin"
    >
      {/* ── Pending applications ───────────────────────────── */}
      <Surface
        eyebrow="Applications"
        title="Pending venue applications"
        description={`${venues.applications.length} application${venues.applications.length === 1 ? "" : "s"} awaiting review. Approve or request additional information.`}
      >
        <div className="grid gap-3 lg:grid-cols-3">
          {venues.applications.map((app) => (
            <StreamCard
              key={app.key}
              eyebrow={app.type}
              title={app.name}
              description={app.note}
              badge={<ToneBadge tone={statusTone(app.status)}>{app.status}</ToneBadge>}
            />
          ))}
        </div>
      </Surface>

      {/* ── Venue matching notes ───────────────────────────── */}
      <Surface
        eyebrow="Matching"
        title="Venue matching guidance"
        description="Operational rules for pairing organizers with the right spaces."
      >
        <ul className="space-y-1.5">
          {venues.matching.map((rule, i) => (
            <li key={i} className="flex gap-2 text-sm leading-relaxed text-brand-text-muted">
              <span className="mt-1 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-brand-indigo" />
              {rule}
            </li>
          ))}
        </ul>
      </Surface>

      {/* ── Active venues table ────────────────────────────── */}
      <Surface
        eyebrow="Partner network"
        title="Active venues"
        description={`${venues.active.length} verified venues currently in the partner network.`}
      >
        <DashboardTable
          columns={["Venue", "Area", "Type", "Rating", "Deal / Note"]}
          rows={venues.active.map((v) => ({
            key: v.key,
            cells: [
              <span key="name" className="font-medium">{v.name}</span>,
              <span key="area" className="flex items-center gap-1 text-brand-text-muted">
                <MapPin className="h-3 w-3" />
                {v.area}
              </span>,
              <ToneBadge key="type" tone="neutral">{v.type}</ToneBadge>,
              <span key="rating" className="flex items-center gap-1 font-medium">
                <Star className="h-3 w-3 text-amber-500" />
                {v.rating}
              </span>,
              <span key="note" className="text-xs text-brand-text-muted">{v.note || "—"}</span>,
            ],
          }))}
          caption="Active venue partners"
        />
      </Surface>
    </PortalShell>
  );
}
