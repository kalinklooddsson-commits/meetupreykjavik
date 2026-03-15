import type { Route } from "next";
import { PortalShell } from "@/components/layout/portal-shell";
import {
  Surface,
  ToneBadge,
  KeyValueList,
  ActivityFeed,
} from "@/components/dashboard/primitives";
import type { DashboardTone } from "@/components/dashboard/primitives";
import { getAdminPortalData } from "@/lib/dashboard-fetchers";
import { AdminUserCommandCenter } from "./panels";

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

/* ── Screen ──────────────────────────────────────────────────── */

export async function AdminUsersScreen() {
  const data = await getAdminPortalData();
  const { users, clientDossier } = data;

  return (
    <PortalShell
      eyebrow="Admin portal"
      title="Users"
      description="Search, review, and manage all platform accounts including members, organizers, and venue partners."
      links={adminLinks("users")}
      variant="admin"
      roleMode="admin"
    >
      {/* ── Users table (interactive) ────────────────────── */}
      <Surface
        eyebrow="All accounts"
        title="Platform users"
        description="Search, filter by role, and take admin actions."
      >
        <AdminUserCommandCenter users={users} />
      </Surface>

      {/* ── Client dossier ─────────────────────────────────── */}
      <Surface
        eyebrow="Client intelligence"
        title={`Dossier: ${clientDossier.name}`}
        description={clientDossier.summary}
      >
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="space-y-4">
            <KeyValueList
              items={clientDossier.items.map((item) => ({
                key: item.key,
                label: item.label,
                value: item.value,
              }))}
            />
            <div>
              <div className="mb-2 text-xs font-medium uppercase tracking-wider text-brand-text-light">
                Interests
              </div>
              <div className="flex flex-wrap gap-1.5">
                {clientDossier.interests.map((interest) => (
                  <ToneBadge key={interest} tone="neutral">{interest}</ToneBadge>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 text-xs font-medium uppercase tracking-wider text-brand-text-light">
                Badges
              </div>
              <div className="flex flex-wrap gap-1.5">
                {clientDossier.badges.map((badge) => (
                  <ToneBadge key={badge} tone="indigo">{badge}</ToneBadge>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="mb-2 text-xs font-medium uppercase tracking-wider text-brand-text-light">
                Access rules
              </div>
              <KeyValueList
                items={clientDossier.accessRules.map((rule, i) => ({
                  key: `ar-${i}`,
                  label: rule.label,
                  value: rule.value,
                }))}
              />
            </div>

            <div>
              <div className="mb-2 text-xs font-medium uppercase tracking-wider text-brand-text-light">
                Admin playbook
              </div>
              <ul className="space-y-1.5">
                {clientDossier.playbook.map((note, i) => (
                  <li key={i} className="flex gap-2 text-sm leading-relaxed text-brand-text-muted">
                    <span className="mt-1 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-brand-indigo" />
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Curation timeline */}
        <div className="mt-5">
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-brand-text-light">
            Curation timeline
          </div>
          <ActivityFeed
            items={clientDossier.curationTimeline.map((entry) => ({
              key: entry.key,
              title: entry.title,
              detail: entry.detail,
              meta: entry.meta,
              tone: "indigo" as DashboardTone,
            }))}
          />
        </div>

        {/* Admin notes */}
        <div className="mt-5">
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-brand-text-light">
            Admin notes
          </div>
          <ul className="space-y-1.5">
            {clientDossier.adminNotes.map((note, i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed text-brand-text-muted">
                <span className="mt-1 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-brand-sage" />
                {note}
              </li>
            ))}
          </ul>
        </div>
      </Surface>
    </PortalShell>
  );
}
