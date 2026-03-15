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
import { AdminVenueApprovalConsole, AdminVenueOperationsDesk } from "./panels";

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
      {/* ── Pending applications (interactive) ────────────── */}
      <Surface
        eyebrow="Applications"
        title="Pending venue applications"
        description={`${venues.applications.length} application${venues.applications.length === 1 ? "" : "s"} awaiting review. Approve or reject applications.`}
      >
        <AdminVenueApprovalConsole applications={venues.applications} />
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

      {/* ── Active venues table (interactive) ────────────── */}
      <Surface
        eyebrow="Partner network"
        title="Active venues"
        description={`${venues.active.length} verified venues currently in the partner network.`}
      >
        <AdminVenueOperationsDesk venues={venues.active} />
      </Surface>
    </PortalShell>
  );
}
