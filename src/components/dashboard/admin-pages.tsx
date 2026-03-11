import type { Route } from "next";
import {
  BellElectric,
  CreditCard,
  Flag,
  LayoutTemplate,
  ShieldAlert,
  Store,
  Users,
} from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import {
  ActivityFeed,
  DashboardTable,
  FilterChips,
  HeatGrid,
  KeyValueList,
  StatCard,
  Surface,
  ToneBadge,
  TrendChart,
} from "@/components/dashboard/primitives";
import {
  AdminEventOperationsDesk,
  AdminClientCurationWorkbench,
  AdminEventAudiencePicker,
  AdminGroupOperationsDesk,
  AdminModerationOperationsDesk,
  AdminModerationConsole,
  AdminIncidentCommandDesk,
  AdminOpsInboxDesk,
  AdminRevenueControlDesk,
  AdminRevenueOperationsDesk,
  AdminSettingsControlCenter,
  AdminUserCommandCenter,
  AdminAnalyticsOperationsDesk,
  AdminVenueApprovalConsole,
  AdminVenueOperationsDesk,
} from "@/components/dashboard/admin-control-panels";
import {
  AdminCommsStudio,
  AdminContentControlCenter,
} from "@/components/dashboard/operations-panels";
import { adminPortalData } from "@/lib/dashboard-data";
import type { ComponentProps } from "react";

function adminLinks(activeHref: Route) {
  return [
    { href: "/admin" as Route, label: "Overview", active: activeHref === "/admin" },
    { href: "/admin/users" as Route, label: "Users", active: activeHref === "/admin/users" },
    { href: "/admin/groups" as Route, label: "Groups", active: activeHref === "/admin/groups" },
    { href: "/admin/events" as Route, label: "Events", active: activeHref === "/admin/events" },
    { href: "/admin/venues" as Route, label: "Venues", active: activeHref === "/admin/venues" },
    {
      href: "/admin/revenue" as Route,
      label: "Revenue",
      active: activeHref === "/admin/revenue",
    },
    {
      href: "/admin/analytics" as Route,
      label: "Analytics",
      active: activeHref === "/admin/analytics",
    },
    {
      href: "/admin/content" as Route,
      label: "Content",
      active: activeHref === "/admin/content",
    },
    {
      href: "/admin/moderation" as Route,
      label: "Moderation",
      active: activeHref === "/admin/moderation",
    },
    {
      href: "/admin/comms" as Route,
      label: "Comms",
      active: activeHref === "/admin/comms",
    },
    {
      href: "/admin/settings" as Route,
      label: "Settings",
      active: activeHref === "/admin/settings",
    },
  ];
}

function adminShellFrame(
  section: string,
  primaryAction: { href: Route; label: string },
  signalCards: Array<{ label: string; value: string; detail: string }>,
) {
  return {
    variant: "admin" as const,
    roleMode: "admin" as const,
    breadcrumbs: ["Super admin", "Control room", section],
    primaryAction,
    signalCards,
  };
}

function AdminShell(props: ComponentProps<typeof PortalShell>) {
  return <PortalShell roleMode="admin" {...props} />;
}

function statusTone(status: string) {
  const normalized = status.toLowerCase();

  if (
    normalized.includes("pending") ||
    normalized.includes("flag") ||
    normalized.includes("wait") ||
    normalized.includes("open")
  ) {
    return "coral" as const;
  }

  if (
    normalized.includes("active") ||
    normalized.includes("verified") ||
    normalized.includes("approved") ||
    normalized.includes("captured") ||
    normalized.includes("published")
  ) {
    return "sage" as const;
  }

  return "indigo" as const;
}

export function AdminOverviewScreen() {
  return (
    <AdminShell
      eyebrow="Super admin"
      title="Platform control room"
      description="Platform overview."
      links={adminLinks("/admin")}
      {...adminShellFrame(
        "Overview",
        { href: "/admin/events", label: "Triage live event supply" },
        [
          {
            label: "Urgent queues",
            value: String(adminPortalData.urgentQueues.length),
            detail: "Active attention needed today.",
          },
          {
            label: "Revenue pulse",
            value: adminPortalData.metrics[4]?.value ?? "0 ISK",
            detail: "Current revenue state.",
          },
          {
            label: "Pending actions",
            value: adminPortalData.metrics[6]?.value ?? "0",
            detail: "Working backlog.",
          },
          {
            label: "System posture",
            value: adminPortalData.metrics[7]?.value ?? "Healthy",
            detail: "Platform health.",
          },
        ],
      )}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {adminPortalData.metrics.map((metric, index) => (
          <StatCard
            key={metric.label}
            {...metric}
            icon={[Users, Users, LayoutTemplate, BellElectric, CreditCard, Store, Flag, ShieldAlert][index]}
            tone={
              index === 4
                ? "coral"
                : index === 5 || index === 7
                  ? "sage"
                  : "indigo"
            }
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Surface
          eyebrow="Growth"
          title="Platform growth"
        >
          <TrendChart
            data={adminPortalData.growthChart}
            tone="indigo"
            formatValue={(value) => `${value}`}
          />
        </Surface>

        <Surface
          eyebrow="Categories"
          title="Activity concentration"
        >
          <TrendChart
            data={adminPortalData.categoryMix}
            tone="coral"
            formatValue={(value) => `${value}`}
          />
        </Surface>
      </div>

      <Surface
        eyebrow="Queues"
        title="Urgent admin attention"
      >
        <ActivityFeed items={adminPortalData.urgentQueues} />
      </Surface>

      <Surface
        eyebrow="Power"
        title="Super-admin powers"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "User command center",
              note: "Promote, suspend, restore, and impersonate any account.",
            },
            {
              title: "Curated event audiences",
              note: "Pick specific clients for events, promote waitlists, and send targeted invites.",
            },
            {
              title: "Venue approvals",
              note: "Approve, reject, waitlist, or request information from any venue applicant.",
            },
            {
              title: "Platform toggles",
              note: "Flip registration, payments, maintenance, privacy, and feature flags.",
            },
          ].map((item) => (
            <article
              key={item.title}
              className="rounded-[1.3rem] border border-[rgba(153,148,168,0.12)] bg-white/80 p-4"
            >
              <div className="font-semibold text-[var(--brand-text)]">{item.title}</div>
              <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">
                {item.note}
              </p>
            </article>
          ))}
        </div>
      </Surface>

      <Surface
        eyebrow="Ops backbone"
        title="Daily admin queue"
      >
        <AdminOpsInboxDesk
          items={adminPortalData.opsInbox}
          handoffs={adminPortalData.handoffLog}
        />
      </Surface>

      <Surface
        eyebrow="Incident command"
        title="Ownership and reliability"
      >
        <AdminIncidentCommandDesk
          incidents={adminPortalData.incidentConsole}
          ownership={adminPortalData.ownershipBoard}
        />
      </Surface>
    </AdminShell>
  );
}

export function AdminUsersScreen() {
  return (
    <AdminShell
      eyebrow="Admin users"
      title="User management"
      description="Users, roles, status, and activity."
      links={adminLinks("/admin/users")}
      {...adminShellFrame(
        "Users",
        { href: "/admin/events", label: "Open curated audience control" },
        [
          {
            label: "Users in view",
            value: String(adminPortalData.users.length),
            detail: "Total user count.",
          },
          {
            label: "Flagged accounts",
            value: String(
              adminPortalData.users.filter((user) =>
                user.status.toLowerCase().includes("flag"),
              ).length,
            ),
            detail: "Accounts needing review.",
          },
          {
            label: "Trusted signals",
            value: String(adminPortalData.selectedUser.trustSignals.length),
            detail: "Trust markers.",
          },
          {
            label: "Dossier notes",
            value: String(adminPortalData.clientDossier.adminNotes.length),
            detail: "Admin notes on file.",
          },
        ],
      )}
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Surface
          eyebrow="Directory"
          title="Users table"
        >
          <FilterChips
            items={[
              { key: "all", label: "All", active: true, tone: "indigo" },
              { key: "users", label: "Users", tone: "sage" },
              { key: "organizers", label: "Organizers", tone: "coral" },
              { key: "venues", label: "Venues", tone: "sand" },
            ]}
          />
          <div className="mt-6">
            <DashboardTable
              columns={[
                "Name",
                "Email",
                "Type",
                "Status",
                "Joined",
                "Last active",
                "Groups",
                "Events",
                "Revenue",
              ]}
              rows={adminPortalData.users.map((user) => ({
                key: user.key,
                cells: [
                  user.name,
                  user.email,
                  user.type,
                  <ToneBadge key="status" tone={statusTone(user.status)}>
                    {user.status}
                  </ToneBadge>,
                  user.joined,
                  user.lastActive,
                  user.groups,
                  user.events,
                  user.revenue,
                ],
              }))}
            />
          </div>
        </Surface>

        <Surface
          eyebrow="Profile oversight"
          title={adminPortalData.selectedUser.name}
          description={adminPortalData.selectedUser.bio}
        >
          <div className="flex flex-wrap gap-2">
            <ToneBadge tone="indigo">{adminPortalData.selectedUser.role}</ToneBadge>
            <ToneBadge tone="sage">Impersonate ready</ToneBadge>
            <ToneBadge tone="sand">{adminPortalData.selectedUser.locale}</ToneBadge>
          </div>
          <div className="mt-5">
            <KeyValueList items={adminPortalData.selectedUser.items} />
          </div>
          <div className="mt-5 space-y-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-text-light)]">
                Trust signals
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {adminPortalData.selectedUser.trustSignals.map((item) => (
                  <ToneBadge key={item} tone="sage">
                    {item}
                  </ToneBadge>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-text-light)]">
                Interests and badges
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {adminPortalData.selectedUser.interests.map((item) => (
                  <ToneBadge key={item} tone="indigo">
                    {item}
                  </ToneBadge>
                ))}
                {adminPortalData.selectedUser.badges.map((item) => (
                  <ToneBadge key={item} tone="coral">
                    {item}
                  </ToneBadge>
                ))}
              </div>
            </div>
          </div>
        </Surface>
      </div>

      <Surface
        eyebrow="Command center"
        title="Account actions"
      >
        <AdminUserCommandCenter users={adminPortalData.users} />
      </Surface>

      <div className="grid gap-6 xl:grid-cols-[0.96fr_1.04fr]">
        <Surface
          eyebrow="Client dossier"
          title={adminPortalData.clientDossier.name}
          description={adminPortalData.clientDossier.summary}
        >
          <div className="flex flex-wrap gap-2">
            <ToneBadge tone="indigo">{adminPortalData.clientDossier.tier}</ToneBadge>
            <ToneBadge tone="sage">Low no-show risk</ToneBadge>
            <ToneBadge tone="coral">Curated invite candidate</ToneBadge>
          </div>
          <div className="mt-5">
            <KeyValueList items={adminPortalData.clientDossier.items} />
          </div>
          <div className="mt-5">
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-text-light)]">
              Interests and trust
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {adminPortalData.clientDossier.interests.map((item) => (
                <ToneBadge key={item} tone="indigo">
                  {item}
                </ToneBadge>
              ))}
              {adminPortalData.clientDossier.badges.map((item) => (
                <ToneBadge key={item} tone="sage">
                  {item}
                </ToneBadge>
              ))}
            </div>
          </div>
        </Surface>

        <Surface
          eyebrow="Admin event-fit view"
          title="Attendance, venue fit, and privacy"
        >
          <div className="grid gap-5 xl:grid-cols-2">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-text-light)]">
                Recent attendance
              </div>
              <div className="mt-3 space-y-3">
                {adminPortalData.clientDossier.recentAttendance.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[1.15rem] border border-[rgba(153,148,168,0.12)] bg-white/78 p-4"
                  >
                    <div className="font-semibold text-[var(--brand-text)]">{item.title}</div>
                    <div className="mt-1 text-sm text-[var(--brand-text-muted)]">
                      {item.venue}
                    </div>
                    <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">
                      {item.note}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-text-light)]">
                  Venue preferences
                </div>
                <div className="mt-3 space-y-3">
                  {adminPortalData.clientDossier.venuePreferences.map((item) => (
                    <div
                      key={item.venue}
                      className="rounded-[1.15rem] border border-[rgba(153,148,168,0.12)] bg-white/78 p-4"
                    >
                      <div className="font-semibold text-[var(--brand-text)]">{item.venue}</div>
                      <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">
                        {item.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-text-light)]">
                  Privacy and admin notes
                </div>
                <div className="mt-3 space-y-3">
                  {adminPortalData.clientDossier.privacySnapshot.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-start justify-between gap-4 rounded-[1rem] border border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.84)] px-4 py-3"
                    >
                      <div className="text-sm text-[var(--brand-text-muted)]">{item.label}</div>
                      <div className="text-right text-sm font-semibold text-[var(--brand-text)]">
                        {item.value}
                      </div>
                    </div>
                  ))}
                  {adminPortalData.clientDossier.adminNotes.map((item) => (
                    <div
                      key={item}
                      className="rounded-[1rem] border border-[rgba(153,148,168,0.12)] bg-white/78 px-4 py-3 text-sm leading-7 text-[var(--brand-text-muted)]"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Surface>
      </div>

      <Surface
        eyebrow="Curation workbench"
        title="Invite strategy and access controls"
      >
        <AdminClientCurationWorkbench dossier={adminPortalData.clientDossier} />
      </Surface>
    </AdminShell>
  );
}

export function AdminGroupsScreen() {
  return (
    <AdminShell
      eyebrow="Admin groups"
      title="Group approvals and health"
      description="Approval queue, active groups, and health flags."
      links={adminLinks("/admin/groups")}
      {...adminShellFrame(
        "Groups",
        { href: "/admin/content", label: "Review featuring decisions" },
        [
          {
            label: "Approval queue",
            value: String(adminPortalData.groups.queue.length),
            detail: "Pending review.",
          },
          {
            label: "Live groups",
            value: String(adminPortalData.groups.table.length),
            detail: "Active communities.",
          },
          {
            label: "Feature pressure",
            value: String(
              adminPortalData.groups.queue.filter((group) =>
                group.status.toLowerCase().includes("feature"),
              ).length,
            ),
            detail: "Feature candidates.",
          },
          {
            label: "Cadence risks",
            value: String(
              adminPortalData.groups.table.filter((group) =>
                group.health.toLowerCase().includes("needs"),
              ).length,
            ),
            detail: "Losing rhythm.",
          },
        ],
      )}
    >
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Surface
          eyebrow="Approval queue"
          title="Needs admin review"
        >
          <div className="space-y-4">
            {adminPortalData.groups.queue.map((group) => (
              <div
                key={group.key}
                className="rounded-[1.3rem] border border-[rgba(153,148,168,0.12)] bg-white/80 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-[var(--brand-text)]">{group.name}</div>
                  <ToneBadge tone={statusTone(group.status)}>{group.status}</ToneBadge>
                </div>
                <p className="mt-2 text-sm text-[var(--brand-text-muted)]">
                  Organizer: {group.organizer}
                </p>
                <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">
                  {group.note}
                </p>
              </div>
            ))}
          </div>
        </Surface>

        <Surface
          eyebrow="All groups"
          title="Active group table"
        >
          <FilterChips
            items={[
              { key: "all", label: "All groups", active: true, tone: "indigo" },
              { key: "featured", label: "Featured", tone: "sage" },
              { key: "needs-cadence", label: "Needs cadence", tone: "coral" },
              { key: "queue", label: "Approval queue", tone: "sand" },
            ]}
          />
          <DashboardTable
            columns={["Group", "Members", "Status", "Health", "Action"]}
            rows={adminPortalData.groups.table.map((group) => ({
              key: group.key,
              cells: [
                group.name,
                String(group.members),
                <ToneBadge key="status" tone={statusTone(group.status)}>
                  {group.status}
                </ToneBadge>,
                group.health,
                group.action,
              ],
            }))}
          />
        </Surface>
      </div>

      <Surface
        eyebrow="Batch group control"
        title="Feature, rescue, archive, and approve"
      >
        <AdminGroupOperationsDesk
          queue={adminPortalData.groups.queue}
          groups={adminPortalData.groups.table}
        />
      </Surface>
    </AdminShell>
  );
}

export function AdminEventsScreen() {
  return (
    <AdminShell
      eyebrow="Admin events"
      title="Event moderation and featuring"
      description="Event status, category, venue, and actions."
      links={adminLinks("/admin/events")}
      {...adminShellFrame(
        "Events",
        { href: "/admin/users", label: "Open user curation lane" },
        [
          {
            label: "Managed events",
            value: String(adminPortalData.events.table.length),
            detail: "Live event stack.",
          },
          {
            label: "Curated seats",
            value: String(adminPortalData.events.audiencePicker.selectedIds.length),
            detail: "Audience shaping.",
          },
          {
            label: "Paid watch",
            value: String(
              adminPortalData.events.table.filter(
                (event) =>
                  event.status.toLowerCase().includes("paid") ||
                  event.action.toLowerCase().includes("payout"),
              ).length,
            ),
            detail: "Paid events.",
          },
          {
            label: "Calendar stack",
            value: String(adminPortalData.events.calendar.length),
            detail: "Scheduled dates.",
          },
        ],
      )}
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Surface
          eyebrow="Events"
          title="Moderation and feature controls"
        >
          <FilterChips
            items={[
              { key: "all", label: "All events", active: true, tone: "indigo" },
              { key: "approved", label: "Approved", tone: "sage" },
              { key: "paid", label: "Paid", tone: "coral" },
              { key: "curated", label: "Curated audience", tone: "sand" },
            ]}
          />
          <DashboardTable
            columns={["Event", "Status", "Category", "Venue", "Date", "Action"]}
            rows={adminPortalData.events.table.map((event) => ({
              key: event.key,
              cells: [
                event.title,
                <ToneBadge key="status" tone={statusTone(event.status)}>
                  {event.status}
                </ToneBadge>,
                event.category,
                event.venue,
                event.date,
                event.action,
              ],
            }))}
          />
        </Surface>

        <Surface
          eyebrow="Audience control"
          title="Client selection for this event"
        >
          <AdminEventAudiencePicker audience={adminPortalData.events.audiencePicker} />
        </Surface>
      </div>

      <Surface
        eyebrow="Calendar"
        title="March event stack"
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {adminPortalData.events.calendar.map((item, index) => (
            <div
              key={`${item.day}-${index}`}
              className="flex items-center justify-between gap-3 rounded-[1.2rem] border border-[rgba(153,148,168,0.12)] bg-white/80 px-4 py-3"
            >
              <div className="font-semibold text-[var(--brand-text)]">{item.label}</div>
              <ToneBadge tone="sand">{item.day} Mar</ToneBadge>
            </div>
          ))}
        </div>
      </Surface>

      <div className="grid gap-6 xl:grid-cols-[0.96fr_1.04fr]">
        <Surface
          eyebrow="Seat strategy"
          title="Room shape and curation rules"
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <KeyValueList items={adminPortalData.events.audienceStrategy.brief} />
            <div className="space-y-3">
              {adminPortalData.events.audienceStrategy.rules.map((rule) => (
                <div
                  key={rule}
                  className="rounded-[1.2rem] border border-[rgba(153,148,168,0.12)] bg-white/80 px-4 py-3 text-sm leading-7 text-[var(--brand-text-muted)]"
                >
                  {rule}
                </div>
              ))}
            </div>
          </div>
        </Surface>

        <Surface
          eyebrow="Audience segments"
          title="Quota targets"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {adminPortalData.events.audienceStrategy.segments.map((segment) => (
              <article
                key={segment.key}
                className="rounded-[1.25rem] border border-[rgba(153,148,168,0.12)] bg-white/82 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-[var(--brand-text)]">{segment.label}</div>
                  <ToneBadge tone={segment.current >= segment.target ? "sage" : "coral"}>
                    {segment.current} / {segment.target}
                  </ToneBadge>
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">
                  {segment.note}
                </p>
              </article>
            ))}
          </div>
        </Surface>
      </div>

      <Surface
        eyebrow="Batch event control"
        title="Approve, feature, hold, and pause"
      >
        <AdminEventOperationsDesk events={adminPortalData.events.table} />
      </Surface>
    </AdminShell>
  );
}

export function AdminVenuesScreen() {
  return (
    <AdminShell
      eyebrow="Admin venues"
      title="Venue applications and approvals"
      description="Application queue and active partners."
      links={adminLinks("/admin/venues")}
      {...adminShellFrame(
        "Venues",
        { href: "/admin/revenue", label: "Review venue economics" },
        [
          {
            label: "Applications",
            value: String(adminPortalData.venues.applications.length),
            detail: "Incoming supply.",
          },
          {
            label: "Active partners",
            value: String(adminPortalData.venues.active.length),
            detail: "Verified venues.",
          },
          {
            label: "Follow-up load",
            value: String(
              adminPortalData.venues.applications.filter((application) =>
                ["waitlist", "request info"].some((state) =>
                  application.status.toLowerCase().includes(state),
                ),
              ).length,
            ),
            detail: "Needs follow-up.",
          },
          {
            label: "Matching rules",
            value: String(adminPortalData.venues.matching.length),
            detail: "Supply guidance.",
          },
        ],
      )}
    >
      <div className="grid gap-6">
        <Surface
          eyebrow="Applications"
          title="Venue application queue"
        >
          <AdminVenueApprovalConsole applications={adminPortalData.venues.applications} />
        </Surface>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Surface
            eyebrow="Active venues"
            title="Verified partners"
          >
            <FilterChips
              items={[
                { key: "all", label: "All partners", active: true, tone: "indigo" },
                { key: "verified", label: "Verified", tone: "sage" },
                { key: "nightlife", label: "Nightlife", tone: "coral" },
                { key: "premium", label: "Premium fit", tone: "sand" },
              ]}
            />
            <DashboardTable
              columns={["Venue", "Area", "Type", "Rating", "Lead note"]}
              rows={adminPortalData.venues.active.map((venue) => ({
                key: venue.key,
                cells: [
                  venue.name,
                  venue.area,
                  venue.type,
                  String(venue.rating),
                  venue.note,
                ],
              }))}
            />
          </Surface>

          <Surface
            eyebrow="Matching rules"
            title="Supply guidance"
          >
            <div className="space-y-3">
              {adminPortalData.venues.matching.map((note) => (
                <div
                  key={note}
                  className="rounded-[1.2rem] border border-[rgba(153,148,168,0.12)] bg-white/80 px-4 py-3 text-sm leading-7 text-[var(--brand-text-muted)]"
                >
                  {note}
                </div>
              ))}
            </div>
          </Surface>
        </div>
      </div>

      <Surface
        eyebrow="Venue operations desk"
        title="Batch supply and approval handling"
      >
        <AdminVenueOperationsDesk
          applications={adminPortalData.venues.applications}
          active={adminPortalData.venues.active}
        />
      </Surface>
    </AdminShell>
  );
}

export function AdminRevenueScreen() {
  return (
    <AdminShell
      eyebrow="Admin revenue"
      title="Transactions and pricing"
      description="Revenue sources, transactions, and plans."
      links={adminLinks("/admin/revenue")}
      {...adminShellFrame(
        "Revenue",
        { href: "/admin/events", label: "Open monetized event supply" },
        [
          {
            label: "Transactions",
            value: String(adminPortalData.revenue.transactions.length),
            detail: "Recent activity.",
          },
          {
            label: "Plans",
            value: String(adminPortalData.revenue.plans.length),
            detail: "Pricing tiers.",
          },
          {
            label: "Top source",
            value: `${adminPortalData.revenue.sources[0]?.value ?? 0}%`,
            detail: "Leading revenue mix.",
          },
          {
            label: "Guardrails",
            value: String(adminPortalData.revenue.policies.length),
            detail: "Hard pricing rules.",
          },
        ],
      )}
    >
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Surface
          eyebrow="Sources"
          title="Revenue mix"
        >
          <TrendChart
            data={adminPortalData.revenue.sources}
            tone="coral"
            formatValue={(value) => `${value}%`}
          />
        </Surface>

        <Surface
          eyebrow="Transactions"
          title="Recent activity"
        >
          <FilterChips
            items={[
              { key: "all", label: "All money", active: true, tone: "indigo" },
              { key: "subscriptions", label: "Subscriptions", tone: "sage" },
              { key: "commissions", label: "Commissions", tone: "coral" },
              { key: "payouts", label: "Payout watch", tone: "sand" },
            ]}
          />
          <DashboardTable
            columns={["Source", "Amount", "Status", "When"]}
            rows={adminPortalData.revenue.transactions.map((transaction) => ({
              key: transaction.key,
              cells: [
                transaction.source,
                transaction.amount,
                <ToneBadge key="status" tone={statusTone(transaction.status)}>
                  {transaction.status}
                </ToneBadge>,
                transaction.when,
              ],
            }))}
          />
        </Surface>
      </div>

      <Surface
        eyebrow="Plans"
        title="Pricing controls"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {adminPortalData.revenue.plans.map((plan) => (
            <article
              key={plan.name}
              className="rounded-[1.3rem] border border-[rgba(153,148,168,0.12)] bg-white/82 p-4"
            >
              <ToneBadge tone="sand">{plan.price}</ToneBadge>
              <div className="font-editorial mt-4 text-2xl tracking-[-0.04em] text-[var(--brand-text)]">
                {plan.name}
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">
                {plan.description}
              </p>
            </article>
          ))}
        </div>
      </Surface>

      <Surface
        eyebrow="Policies"
        title="Revenue guardrails"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {adminPortalData.revenue.policies.map((policy) => (
            <article
              key={policy.label}
              className="rounded-[1.3rem] border border-[rgba(153,148,168,0.12)] bg-white/82 p-4"
            >
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-text-light)]">
                {policy.label}
              </div>
              <div className="mt-3 font-semibold text-[var(--brand-text)]">
                {policy.value}
              </div>
            </article>
          ))}
        </div>
      </Surface>

      <Surface
        eyebrow="Revenue control desk"
        title="Edit plans and guardrails"
      >
        <AdminRevenueControlDesk
          plans={adminPortalData.revenue.plans}
          policies={adminPortalData.revenue.policies}
        />
      </Surface>

      <Surface
        eyebrow="Revenue operations"
        title="Payouts, fee holds, and anomalies"
      >
        <AdminRevenueOperationsDesk
          transactions={adminPortalData.revenue.transactions}
          sources={adminPortalData.revenue.sources}
        />
      </Surface>
    </AdminShell>
  );
}

export function AdminAnalyticsScreen() {
  return (
    <AdminShell
      eyebrow="Admin analytics"
      title="Growth, engagement, and revenue"
      description="Charts, heat grid, and geography."
      links={adminLinks("/admin/analytics")}
      {...adminShellFrame(
        "Analytics",
        { href: "/admin/revenue", label: "Compare growth to revenue" },
        [
          {
            label: "Chart deck",
            value: String(adminPortalData.analyticsDeck.length),
            detail: "Analytics charts.",
          },
          {
            label: "Heat cells",
            value: String(
              adminPortalData.heatGrid.columns.length * adminPortalData.heatGrid.rows.length,
            ),
            detail: "Time density grid.",
          },
          {
            label: "Geo slices",
            value: String(adminPortalData.geography.length),
            detail: "Geographic segments.",
          },
          {
            label: "Growth endpoint",
            value: String(
              adminPortalData.growthChart[adminPortalData.growthChart.length - 1]?.value ?? 0,
            ),
            detail: "Current scale.",
          },
        ],
      )}
    >
      <Surface
        eyebrow="Chart deck"
        title="Operating charts"
      >
        <FilterChips
          items={[
            { key: "all", label: "All charts", active: true, tone: "indigo" },
            { key: "growth", label: "Growth", tone: "sage" },
            { key: "revenue", label: "Revenue", tone: "coral" },
            { key: "supply", label: "Supply quality", tone: "sand" },
          ]}
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {adminPortalData.analyticsDeck.map((chart) => (
            <article
              key={chart.key}
              className="rounded-[1.35rem] border border-[rgba(153,148,168,0.12)] bg-white/82 p-4"
            >
              <div className="font-semibold text-[var(--brand-text)]">{chart.title}</div>
              <div className="mt-4">
                <TrendChart
                  data={chart.data.map((value, index) => ({
                    label: String(index + 1),
                    value,
                  }))}
                  tone={chart.tone}
                  formatValue={(value) => `${value}`}
                  heightClassName="h-36"
                />
              </div>
            </article>
          ))}
        </div>
      </Surface>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Surface
          eyebrow="Heat"
          title="Time and day heat grid"
        >
          <HeatGrid
            columns={adminPortalData.heatGrid.columns}
            rows={adminPortalData.heatGrid.rows}
          />
        </Surface>

        <Surface
          eyebrow="Geo"
          title="Geographic mix"
        >
          <KeyValueList
            items={adminPortalData.geography.map((entry) => ({
              key: entry.label,
              label: entry.label,
              value: entry.value,
            }))}
          />
        </Surface>
      </div>

      <Surface
        eyebrow="Analytics watch"
        title="Signal escalation"
      >
        <AdminAnalyticsOperationsDesk
          charts={adminPortalData.analyticsDeck}
          heatRows={adminPortalData.heatGrid.rows}
          geography={adminPortalData.geography}
        />
      </Surface>
    </AdminShell>
  );
}

export function AdminContentScreen() {
  return (
    <AdminShell
      eyebrow="Admin content"
      title="Homepage and editorial"
      description="Homepage sections, categories, and blog queue."
      links={adminLinks("/admin/content")}
      {...adminShellFrame(
        "Content",
        { href: "/admin/comms", label: "Push content into comms" },
        [
          {
            label: "Homepage sections",
            value: String(adminPortalData.content.sections.length),
            detail: "Editorial surface.",
          },
          {
            label: "Categories",
            value: String(adminPortalData.content.categories.length),
            detail: "Active categories.",
          },
          {
            label: "Blog queue",
            value: String(adminPortalData.content.blogQueue.length),
            detail: "Publishing queue.",
          },
          {
            label: "Needs refresh",
            value: String(
              adminPortalData.content.sections.filter((section) =>
                section.status.toLowerCase().includes("refresh"),
              ).length,
            ),
            detail: "Stale content.",
          },
        ],
      )}
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Surface
          eyebrow="Homepage"
          title="Homepage editor"
        >
          <div className="space-y-4">
            {adminPortalData.content.sections.map((section) => (
              <div
                key={section.key}
                className="rounded-[1.25rem] border border-[rgba(153,148,168,0.12)] bg-white/80 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-[var(--brand-text)]">{section.title}</div>
                  <ToneBadge tone={statusTone(section.status)}>{section.status}</ToneBadge>
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">
                  {section.note}
                </p>
              </div>
            ))}
          </div>
        </Surface>

        <div className="space-y-6">
          <Surface
            eyebrow="Categories"
            title="Category management"
          >
            <div className="grid gap-3 md:grid-cols-2">
              {adminPortalData.content.categories.map((category) => (
                <div
                  key={category.key}
                  className="rounded-[1.15rem] border border-[rgba(153,148,168,0.12)] bg-white/80 px-4 py-3"
                >
                  <div className="font-semibold text-[var(--brand-text)]">{category.name}</div>
                  <div className="text-sm text-[var(--brand-text-muted)]">
                    {category.count} active items
                  </div>
                </div>
              ))}
            </div>
          </Surface>

          <Surface
            eyebrow="Blog"
            title="Editorial queue"
          >
            <DashboardTable
              columns={["Title", "Category", "Status"]}
              rows={adminPortalData.content.blogQueue.map((post) => ({
                key: post.key,
                cells: [
                  post.title,
                  post.category,
                  <ToneBadge key="status" tone={statusTone(post.status)}>
                    {post.status}
                  </ToneBadge>,
                ],
              }))}
            />
          </Surface>
        </div>
      </div>

      <Surface
        eyebrow="Action desk"
        title="Homepage and editorial operations"
      >
        <AdminContentControlCenter
          sections={adminPortalData.content.sections}
          categories={adminPortalData.content.categories}
          blogQueue={adminPortalData.content.blogQueue}
        />
      </Surface>
    </AdminShell>
  );
}

export function AdminModerationScreen() {
  return (
    <AdminShell
      eyebrow="Admin moderation"
      title="Reports, bans, and audit"
      description="Moderation workspace and audit trails."
      links={adminLinks("/admin/moderation")}
      {...adminShellFrame(
        "Moderation",
        { href: "/admin/users", label: "Open account command center" },
        [
          {
            label: "Reports",
            value: String(adminPortalData.moderation.reports.length),
            detail: "Active reports.",
          },
          {
            label: "Pending approvals",
            value: String(adminPortalData.moderation.pendingApproval.length),
            detail: "Awaiting review.",
          },
          {
            label: "Auto flags",
            value: String(adminPortalData.moderation.autoFlagged.length),
            detail: "System-detected.",
          },
          {
            label: "Banned accounts",
            value: String(adminPortalData.moderation.banned.length),
            detail: "Current bans.",
          },
        ],
      )}
    >
      <Surface
        eyebrow="Tabs"
        title="Moderation workspace"
      >
        <FilterChips
          items={[
            { key: "reports", label: "Reports", active: true, tone: "coral" },
            { key: "pending", label: "Pending approval", tone: "indigo" },
            { key: "auto", label: "Auto-flagged", tone: "sage" },
            { key: "banned", label: "Banned", tone: "sand" },
            { key: "audit", label: "Audit log", tone: "indigo" },
          ]}
        />
      </Surface>

      <Surface
        eyebrow="Action console"
        title="Resolve, escalate, ban, and restore"
      >
        <AdminModerationConsole
          reports={adminPortalData.moderation.reports}
          banned={adminPortalData.moderation.banned}
        />
      </Surface>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="space-y-6">
          <Surface
            eyebrow="Pending approval"
            title="Approval-dependent items"
          >
            <div className="space-y-3">
              {adminPortalData.moderation.pendingApproval.map((item) => (
                <div
                  key={item}
                  className="rounded-[1.15rem] border border-[rgba(153,148,168,0.12)] bg-white/80 px-4 py-3 text-sm font-semibold text-[var(--brand-text)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </Surface>

          <Surface
            eyebrow="Auto-flagged"
            title="System-triggered signals"
          >
            <div className="space-y-3">
              {adminPortalData.moderation.autoFlagged.map((item) => (
                <div
                  key={item}
                  className="rounded-[1.15rem] border border-[rgba(153,148,168,0.12)] bg-white/80 px-4 py-3 text-sm leading-7 text-[var(--brand-text-muted)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </Surface>
        </div>

        <Surface
          eyebrow="Audit"
          title="Admin action log"
        >
          <DashboardTable
            columns={["Action", "Actor", "When"]}
            rows={adminPortalData.moderation.auditLog.map((entry) => ({
              key: entry.key,
              cells: [entry.action, entry.actor, entry.when],
            }))}
          />
        </Surface>
      </div>

      <Surface
        eyebrow="Moderation batch desk"
        title="Batch resolve and escalate"
      >
        <AdminModerationOperationsDesk reports={adminPortalData.moderation.reports} />
      </Surface>
    </AdminShell>
  );
}

export function AdminCommsScreen() {
  return (
    <AdminShell
      eyebrow="Admin communications"
      title="Announcements and email"
      description="Audiences, templates, and send history."
      links={adminLinks("/admin/comms")}
      {...adminShellFrame(
        "Communications",
        { href: "/admin/content", label: "Open editorial control" },
        [
          {
            label: "Audience lanes",
            value: String(adminPortalData.comms.audiences.length),
            detail: "Target segments.",
          },
          {
            label: "Templates",
            value: String(adminPortalData.comms.templates.length),
            detail: "Reusable templates.",
          },
          {
            label: "Recent sends",
            value: String(adminPortalData.comms.history.length),
            detail: "Send history.",
          },
          {
            label: "Top open rate",
            value:
              adminPortalData.comms.history.find((entry) =>
                entry.result.toLowerCase().includes("open rate"),
              )?.result.replace(" open rate", "") ?? "n/a",
            detail: "Best performance.",
          },
        ],
      )}
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Surface
          eyebrow="Compose"
          title={adminPortalData.comms.draft.subject}
          description={adminPortalData.comms.draft.preview}
        >
          <FilterChips
            items={adminPortalData.comms.audiences.map((audience, index) => ({
              key: audience.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
              label: audience,
              active: index === 0,
              tone: index % 3 === 0 ? "indigo" : index % 3 === 1 ? "coral" : "sage",
            }))}
          />
          <div className="flex flex-wrap gap-2">
            {adminPortalData.comms.audiences.map((audience, index) => (
              <ToneBadge
                key={audience}
                tone={index === 0 ? "indigo" : index % 2 === 0 ? "sage" : "sand"}
              >
                {audience}
              </ToneBadge>
            ))}
          </div>
        </Surface>

        <Surface
          eyebrow="Templates"
          title="Email and notification templates"
        >
          <div className="grid gap-3 md:grid-cols-2">
            {adminPortalData.comms.templates.map((template) => (
              <article
                key={template.key}
                className="rounded-[1.15rem] border border-[rgba(153,148,168,0.12)] bg-white/82 px-4 py-3 text-sm font-semibold text-[var(--brand-text)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>{template.name}</div>
                  <ToneBadge tone={template.tone}>{template.audience}</ToneBadge>
                </div>
                <div className="mt-2 text-xs leading-6 text-[var(--brand-text-muted)]">
                  {template.subject}
                </div>
              </article>
            ))}
          </div>
        </Surface>
      </div>

      <Surface
        eyebrow="History"
        title="Send history"
      >
        <DashboardTable
          columns={["Title", "Audience", "Sent", "Result"]}
          rows={adminPortalData.comms.history.map((entry) => ({
            key: entry.key,
            cells: [entry.title, entry.audience, entry.sent, entry.result],
          }))}
        />
      </Surface>

      <Surface
        eyebrow="Studio"
        title="Audience targeting and send queue"
      >
        <AdminCommsStudio
          audiences={adminPortalData.comms.audiences}
          draft={adminPortalData.comms.draft}
          templates={adminPortalData.comms.templates}
          history={adminPortalData.comms.history}
        />
      </Surface>
    </AdminShell>
  );
}

export function AdminSettingsScreen() {
  return (
    <AdminShell
      eyebrow="Admin settings"
      title="Feature flags and platform controls"
      description="Configuration and platform settings."
      links={adminLinks("/admin/settings")}
      {...adminShellFrame(
        "Settings",
        { href: "/admin/revenue", label: "Review money-critical config" },
        [
          {
            label: "Config sections",
            value: String(adminPortalData.settings.length),
            detail: "Configuration domains.",
          },
          {
            label: "Payment rules",
            value: String(
              adminPortalData.settings.find((section) => section.key === "payments")?.items
                .length ?? 0,
            ),
            detail: "Commercial settings.",
          },
          {
            label: "Risk controls",
            value: String(
              adminPortalData.settings.find((section) => section.key === "maintenance")?.items
                .length ?? 0,
            ),
            detail: "Safety toggles.",
          },
          {
            label: "Feature flags",
            value: String(
              adminPortalData.settings.find((section) => section.key === "feature-flags")
                ?.items.length ?? 0,
            ),
            detail: "Product controls.",
          },
        ],
      )}
    >
      <Surface
        eyebrow="Tabs"
        title="Platform settings"
      >
        <FilterChips
          items={adminPortalData.settings.map((section, index) => ({
            key: section.key,
            label: section.title,
            active: index === 0,
            tone: index % 3 === 0 ? "indigo" : index % 3 === 1 ? "coral" : "sage",
          }))}
        />
      </Surface>

      <AdminSettingsControlCenter sections={adminPortalData.settings} />
    </AdminShell>
  );
}
