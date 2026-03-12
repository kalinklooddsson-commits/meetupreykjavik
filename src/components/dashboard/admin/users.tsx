import type { Route } from "next";
import {
  Users,
  UserCheck,
  Shield,
  Star,
  Award,
  Briefcase,
} from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import {
  Surface,
  DashboardTable,
  ToneBadge,
  AvatarStamp,
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
  if (/active|published|approved|going|accepted|completed|verified/i.test(s)) return "sage";
  if (/pending|draft|waitlisted|counter/i.test(s)) return "sand";
  if (/cancelled|rejected|suspended|declined|critical|flagged/i.test(s)) return "coral";
  return "neutral";
}

function typeTone(t: string): DashboardTone {
  if (/organizer/i.test(t)) return "indigo";
  if (/venue/i.test(t)) return "coral";
  return "neutral";
}

/* ── Screen ──────────────────────────────────────────────────── */

export async function AdminUsersScreen() {
  const data = await getAdminPortalData();
  const { users, selectedUser, clientDossier } = data;

  return (
    <PortalShell
      eyebrow="Admin portal"
      title="Users"
      description="Search, review, and manage all platform accounts including members, organizers, and venue partners."
      links={adminLinks("users")}
      variant="admin"
      roleMode="admin"
    >
      {/* ── Users table ────────────────────────────────────── */}
      <Surface
        eyebrow="All accounts"
        title="Platform users"
        description={`${users.length} accounts shown. Filter by type, status, or activity to find specific users.`}
      >
        <DashboardTable
          columns={["User", "Email", "Type", "Status", "Joined", "Last active", "Groups", "Events", "Tier"]}
          rows={users.map((u) => ({
            key: u.key,
            cells: [
              <div key="name" className="flex items-center gap-2">
                <AvatarStamp name={u.name} size="sm" />
                <span className="font-medium">{u.name}</span>
              </div>,
              <span key="email" className="text-brand-text-muted">{u.email}</span>,
              <ToneBadge key="type" tone={typeTone(u.type)}>{u.type}</ToneBadge>,
              <ToneBadge key="status" tone={statusTone(u.status)}>{u.status}</ToneBadge>,
              u.joined,
              u.lastActive,
              u.groups,
              u.events,
              <ToneBadge key="rev" tone={u.revenue === "Free" ? "neutral" : "indigo"}>{u.revenue}</ToneBadge>,
            ],
          }))}
          caption="Platform user accounts"
        />
      </Surface>

      {/* ── Selected user profile ──────────────────────────── */}
      <Surface
        eyebrow="User spotlight"
        title={selectedUser.name}
        description={selectedUser.notes}
      >
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <AvatarStamp name={selectedUser.name} size="lg" />
              <div>
                <div className="text-base font-semibold text-brand-text">{selectedUser.name}</div>
                <ToneBadge tone="indigo">{selectedUser.role}</ToneBadge>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-brand-text-muted">{selectedUser.bio}</p>
            <KeyValueList
              items={selectedUser.items.map((item) => ({
                key: item.key,
                label: item.label,
                value: item.value,
              }))}
            />
          </div>
          <div className="space-y-4">
            <div>
              <div className="mb-2 text-xs font-medium uppercase tracking-wider text-brand-text-light">
                Trust signals
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedUser.trustSignals.map((signal) => (
                  <ToneBadge key={signal} tone="sage">{signal}</ToneBadge>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 text-xs font-medium uppercase tracking-wider text-brand-text-light">
                Interests
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedUser.interests.map((interest) => (
                  <ToneBadge key={interest} tone="neutral">{interest}</ToneBadge>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 text-xs font-medium uppercase tracking-wider text-brand-text-light">
                Badges
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedUser.badges.map((badge) => (
                  <ToneBadge key={badge} tone="indigo">{badge}</ToneBadge>
                ))}
              </div>
            </div>
          </div>
        </div>
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
