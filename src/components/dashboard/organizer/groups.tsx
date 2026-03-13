import type { Route } from "next";
import { PortalShell } from "@/components/layout/portal-shell";
import {
  Surface,
  DashboardTable,
  ToneBadge,
} from "@/components/dashboard/primitives";
import type { DashboardTone } from "@/components/dashboard/primitives";
import { getOrganizerPortalData } from "@/lib/dashboard-fetchers";

function organizerLinks(activeKey: string) {
  return [
    { key: "overview", label: "Overview", href: "/organizer" as Route },
    { key: "events", label: "Events", href: "/organizer/events" as Route },
    { key: "groups", label: "Groups", href: "/organizer/groups" as Route },
    { key: "bookings", label: "Bookings", href: "/organizer/bookings" as Route },
    { key: "venues", label: "Venues", href: "/organizer/venues" as Route },
    { key: "analytics", label: "Analytics", href: "/organizer/analytics" as Route },
    { key: "messages", label: "Messages", href: "/organizer/messages" as Route },
  ].map((l) => ({ href: l.href, label: l.label, active: l.key === activeKey }));
}

function statusTone(s: string): DashboardTone {
  if (/active|published|approved|going|accepted|completed|featured|excellent|strong/i.test(s))
    return "sage";
  if (/pending|draft|waitlisted|countered|reviewing|needs/i.test(s)) return "sand";
  if (/cancelled|rejected|suspended|declined/i.test(s)) return "coral";
  return "neutral";
}

export async function OrganizerGroupsScreen() {
  const data = await getOrganizerPortalData();

  return (
    <PortalShell
      eyebrow="Organizer portal"
      title="Groups"
      description="Manage your community groups, membership settings, and co-hosts."
      links={organizerLinks("groups")}
      roleMode="organizer"
      primaryAction={{
        href: "/groups" as Route,
        label: "Browse groups",
      }}
    >
      <div className="space-y-6">
        <Surface
          eyebrow="Your groups"
          title="Managed groups"
          description="Groups you organize or co-host. Each group can have its own join mode, event cadence, and moderation rules."
        >
          <DashboardTable
            columns={[
              "Group",
              "Join mode",
              "Status",
              "Pending members",
              "Health",
              "Next event",
            ]}
            rows={data.groups.map((g) => ({
              key: g.group.slug,
              cells: [
                <div key="name">
                  <div className="font-medium text-brand-text">
                    {g.group.name}
                  </div>
                  <div className="mt-0.5 text-xs text-brand-text-muted">
                    {g.coHosts} co-host{g.coHosts !== 1 ? "s" : ""}
                  </div>
                </div>,
                <ToneBadge
                  key="join"
                  tone={g.joinMode === "Approval" ? "sand" : "sage"}
                >
                  {g.joinMode}
                </ToneBadge>,
                <ToneBadge key="status" tone={statusTone(g.status)}>
                  {g.status}
                </ToneBadge>,
                <span key="pending" className="tabular-nums">
                  {g.pendingMembers > 0 ? (
                    <span className="font-medium text-brand-coral">
                      {g.pendingMembers} pending
                    </span>
                  ) : (
                    <span className="text-brand-text-muted">None</span>
                  )}
                </span>,
                <ToneBadge key="health" tone={statusTone(g.health)}>
                  {g.health}
                </ToneBadge>,
                <span key="next" className="text-sm text-brand-text-muted">
                  {g.nextEvent}
                </span>,
              ],
            }))}
            caption="Groups you manage"
          />
        </Surface>

        {/* Group management tips */}
        <div className="rounded-xl border border-brand-border-light bg-brand-sand-light p-5">
          <div className="text-xs font-medium uppercase tracking-wider text-brand-text-light">
            Tips
          </div>
          <p className="mt-1 text-sm leading-relaxed text-brand-text">
            Groups with a regular event cadence and at least two co-hosts tend
            to retain members better. Consider adding a recurring event template
            to groups marked as needing more rhythm.
          </p>
        </div>
      </div>
    </PortalShell>
  );
}
