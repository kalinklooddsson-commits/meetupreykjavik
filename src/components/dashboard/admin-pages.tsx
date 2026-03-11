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
  DecisionStrip,
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
              className="rounded-lg border border-[var(--brand-border-light)] bg-white p-3"
            >
              <div className="font-semibold text-[var(--brand-text)]">{item.title}</div>
              <p className="mt-3 text-sm leading-relaxed text-[var(--brand-text-muted)]">
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
  const flaggedUsers = adminPortalData.users.filter((user) =>
    user.status.toLowerCase().includes("flag"),
  ).length;
  const organizerAccounts = adminPortalData.users.filter((user) =>
    user.type.toLowerCase().includes("organizer"),
  ).length;

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
      <DecisionStrip
        eyebrow="User read"
        title="What account operations need from admin"
        description="Read the account mix, trust posture, and curation pressure before acting inside the directory."
        items={[
          {
            key: "risk",
            label: "Risk",
            summary: `${flaggedUsers} accounts need extra attention or review.`,
            meta: "Flagged profiles should be resolved before they bleed into invites, approvals, or premium surfaces.",
            tone: "coral",
          },
          {
            key: "supply",
            label: "Organizer supply",
            summary: `${organizerAccounts} organizer accounts are currently in the live user set.`,
            meta: "These accounts shape event quality, so profile trust and operational health matter more than raw user count.",
            tone: "indigo",
          },
          {
            key: "curation",
            label: "Curation",
            summary: `${adminPortalData.clientDossier.adminNotes.length} admin playbook notes support high-trust attendee selection.`,
            meta: "The client dossier is where admin turns raw profile data into room-shaping decisions.",
            tone: "sage",
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Surface
          eyebrow="Directory"
          title="User directory"
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
          eyebrow="Live profile read"
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
              <div className="text-xs font-medium uppercase tracking-wider text-[var(--brand-text-light)]">
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
              <div className="text-xs font-medium uppercase tracking-wider text-[var(--brand-text-light)]">
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
            <div className="text-xs font-medium uppercase tracking-wider text-[var(--brand-text-light)]">
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
              <div className="text-xs font-medium uppercase tracking-wider text-[var(--brand-text-light)]">
                Recent attendance
              </div>
              <div className="mt-3 space-y-3">
                {adminPortalData.clientDossier.recentAttendance.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-lg border border-[var(--brand-border-light)] bg-white p-3"
                  >
                    <div className="font-semibold text-[var(--brand-text)]">{item.title}</div>
                    <div className="mt-1 text-sm text-[var(--brand-text-muted)]">
                      {item.venue}
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-[var(--brand-text-muted)]">
                      {item.note}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-[var(--brand-text-light)]">
                  Venue preferences
                </div>
                <div className="mt-3 space-y-3">
                  {adminPortalData.clientDossier.venuePreferences.map((item) => (
                    <div
                      key={item.venue}
                      className="rounded-lg border border-[var(--brand-border-light)] bg-white p-3"
                    >
                      <div className="font-semibold text-[var(--brand-text)]">{item.venue}</div>
                      <p className="mt-3 text-sm leading-relaxed text-[var(--brand-text-muted)]">
                        {item.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-[var(--brand-text-light)]">
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
                      className="rounded-md border border-[var(--brand-border-light)] bg-white px-3 py-2 text-sm leading-relaxed text-[var(--brand-text-muted)]"
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
  const featureCandidates = adminPortalData.groups.queue.filter((group) =>
    group.status.toLowerCase().includes("feature"),
  ).length;
  const cadenceRisks = adminPortalData.groups.table.filter((group) =>
    group.health.toLowerCase().includes("needs"),
  ).length;

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
      <DecisionStrip
        eyebrow="Group read"
        title="Where group quality needs shaping"
        description="See approval pressure, featuring opportunities, and cadence risk before working the queue."
        items={[
          {
            key: "approval",
            label: "Approval queue",
            summary: `${adminPortalData.groups.queue.length} groups are waiting for an admin decision.`,
            meta: "The queue is small enough to keep quality high if decisions stay fast and consistent.",
            tone: "coral",
          },
          {
            key: "feature",
            label: "Featuring",
            summary: `${featureCandidates} groups are pushing toward feature-level visibility.`,
            meta: "Strong groups need editorial support early or they flatten into the same generic discovery lane.",
            tone: "indigo",
          },
          {
            key: "cadence",
            label: "Cadence risk",
            summary: `${cadenceRisks} live groups are losing rhythm and need intervention.`,
            meta: "Prompting hosts, fixing format fit, or rescuing venue cadence usually matters more than raw member count.",
            tone: "sage",
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Surface
          eyebrow="Approval queue"
          title="Needs review"
        >
          <div className="space-y-4">
            {adminPortalData.groups.queue.map((group) => (
              <div
                key={group.key}
                className="rounded-lg border border-[var(--brand-border-light)] bg-white p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-[var(--brand-text)]">{group.name}</div>
                  <ToneBadge tone={statusTone(group.status)}>{group.status}</ToneBadge>
                </div>
                <p className="mt-2 text-sm text-[var(--brand-text-muted)]">
                  Organizer: {group.organizer}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[var(--brand-text-muted)]">
                  {group.note}
                </p>
              </div>
            ))}
          </div>
        </Surface>

        <Surface
          eyebrow="Live groups"
          title="Group directory"
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
          title="Event operations"
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
          title="Audience curation"
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
              className="flex items-center justify-between gap-3 rounded-md border border-[var(--brand-border-light)] bg-white px-3 py-2"
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
                  className="rounded-md border border-[var(--brand-border-light)] bg-white px-3 py-2 text-sm leading-relaxed text-[var(--brand-text-muted)]"
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
                className="rounded-lg border border-[var(--brand-border-light)] bg-white p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-[var(--brand-text)]">{segment.label}</div>
                  <ToneBadge tone={segment.current >= segment.target ? "sage" : "coral"}>
                    {segment.current} / {segment.target}
                  </ToneBadge>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[var(--brand-text-muted)]">
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
  const followUpLoad = adminPortalData.venues.applications.filter((application) =>
    ["waitlist", "request info"].some((state) =>
      application.status.toLowerCase().includes(state),
    ),
  ).length;
  const areaCounts = adminPortalData.venues.active.reduce<Record<string, number>>(
    (accumulator, venue) => {
      accumulator[venue.area] = (accumulator[venue.area] ?? 0) + 1;
      return accumulator;
    },
    {},
  );
  const strongestArea = Object.entries(areaCounts).sort((left, right) => right[1] - left[1])[0];
  const premiumReadyVenues = adminPortalData.venues.active.filter((venue) => venue.rating >= 4.8);
  const averageRating =
    adminPortalData.venues.active.reduce((sum, venue) => sum + venue.rating, 0) /
    Math.max(adminPortalData.venues.active.length, 1);

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
            value: String(followUpLoad),
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
      <DecisionStrip
        eyebrow="Supply read"
        title="Where venue operations need admin attention"
        description="Read supply pressure, approval load, and strongest partner inventory before working the queue."
        items={[
          {
            key: "applications",
            label: "Applications",
            summary: `${adminPortalData.venues.applications.length} venue applications are open and ${followUpLoad} need follow-up today.`,
            meta: "The fastest admin win is clearing waitlist and request-info threads before they stall new supply.",
            tone: "coral",
          },
          {
            key: "supply-depth",
            label: "Supply depth",
            summary: strongestArea
              ? `${strongestArea[0]} currently has the deepest active venue inventory with ${strongestArea[1]} live partners.`
              : "Active venue coverage is still thin.",
            meta: "Use the current area stack to decide where featured formats can be routed without creating venue mismatch.",
            tone: "indigo",
          },
          {
            key: "premium-fit",
            label: "Premium fit",
            summary: `${premiumReadyVenues.length} active venues are already rated 4.8 or higher and are ready for premium or featured supply.`,
            meta: "High-rated rooms are the easiest supply lane to fast-track for paid formats and launch-quality hosts.",
            tone: "sage",
          },
        ]}
      />

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
            title="Verified partner directory"
            description="Use this directory to route demand toward the rooms that are already verified and commercially ready."
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
              caption="Verified venue partners with area, type, rating, and lead note."
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
            eyebrow="Supply signals"
            title="Routing and approval guidance"
          >
            <KeyValueList
              items={[
                {
                  key: "coverage",
                  label: "Strongest area",
                  value: strongestArea ? `${strongestArea[0]} (${strongestArea[1]})` : "N/A",
                },
                {
                  key: "premium-ready",
                  label: "Premium-ready rooms",
                  value: String(premiumReadyVenues.length),
                },
                {
                  key: "rating",
                  label: "Average rating",
                  value: averageRating.toFixed(1),
                },
              ]}
            />
            <div className="mt-5 space-y-3">
              {adminPortalData.venues.matching.map((note) => (
                <div
                  key={note}
                  className="rounded-md border border-[var(--brand-border-light)] bg-white px-3 py-2 text-sm leading-relaxed text-[var(--brand-text-muted)]"
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
  const topSource = adminPortalData.revenue.sources[0];
  const pendingPayouts = adminPortalData.revenue.transactions.filter((transaction) =>
    transaction.status.toLowerCase().includes("pending"),
  ).length;
  const capturedTransactions = adminPortalData.revenue.transactions.filter((transaction) =>
    transaction.status.toLowerCase().includes("captured"),
  ).length;

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
      <DecisionStrip
        eyebrow="Revenue read"
        title="What platform monetization needs from admin"
        description="Read revenue mix, payout pressure, and plan posture before opening pricing controls or finance operations."
        items={[
          {
            key: "mix",
            label: "Revenue mix",
            summary: topSource
              ? `${topSource.label} is still the leading revenue source at ${topSource.value}% of current mix.`
              : "No revenue leader available.",
            meta: "If one source dominates too hard, the business gets brittle even when topline looks healthy.",
            tone: "indigo",
          },
          {
            key: "payouts",
            label: "Payout pressure",
            summary: `${pendingPayouts} transactions currently need payout or finance follow-up.`,
            meta: "Pending payout threads are where finance friction becomes partner distrust fastest.",
            tone: "coral",
          },
          {
            key: "capture",
            label: "Captured flow",
            summary: `${capturedTransactions} recent transactions are already captured and stable.`,
            meta: "Captured volume is only useful if the plan structure and guardrails still match how the marketplace is evolving.",
            tone: "sage",
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Surface
          eyebrow="Sources"
          title="Revenue mix"
          description="Use this mix to see which business line is actually carrying the platform, not just which one sounds strategic."
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
          description="This is the live finance lane for subscriptions, commissions, and payout-sensitive movement."
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
            caption="Recent revenue transactions with source, amount, status, and timestamp."
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
        description="Pricing should reflect what the marketplace is actually able to sustain, not just what looks tidy in a plan table."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {adminPortalData.revenue.plans.map((plan) => (
            <article
              key={plan.name}
              className="rounded-lg border border-[var(--brand-border-light)] bg-white p-3"
            >
              <ToneBadge tone="sand">{plan.price}</ToneBadge>
              <div className="mt-2 text-base font-semibold text-[var(--brand-text)]">
                {plan.name}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[var(--brand-text-muted)]">
                {plan.description}
              </p>
            </article>
          ))}
        </div>
      </Surface>

      <Surface
        eyebrow="Policies"
        title="Revenue guardrails"
        description="Guardrails define which monetization behavior is allowed before finance or trust quality starts slipping."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {adminPortalData.revenue.policies.map((policy) => (
            <article
              key={policy.label}
              className="rounded-lg border border-[var(--brand-border-light)] bg-white p-3"
            >
              <div className="text-xs font-medium uppercase tracking-wider text-[var(--brand-text-light)]">
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
  const chartLeader = adminPortalData.analyticsDeck
    .slice()
    .sort(
      (left, right) =>
        (right.data[right.data.length - 1] ?? 0) - (left.data[left.data.length - 1] ?? 0),
    )[0];
  const hottestSlot = adminPortalData.heatGrid.rows
    .flatMap((row) =>
      row.values.map((value, index) => ({
        label: `${row.label} · ${adminPortalData.heatGrid.columns[index]}`,
        value,
      })),
    )
    .sort((left, right) => right.value - left.value)[0];
  const largestGeo = adminPortalData.geography[0];

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
      <DecisionStrip
        eyebrow="Analytics read"
        title="What the operating data is really saying"
        description="Scan the strongest chart signal, the busiest time slot, and the largest geography slice before opening the full deck."
        items={[
          {
            key: "chart-leader",
            label: "Leading chart",
            summary: chartLeader
              ? `${chartLeader.title} is currently the strongest visible signal in the chart deck.`
              : "No chart leader available.",
            meta: "Treat the leading signal as a prompt for action, not just a visual report.",
            tone: "indigo",
          },
          {
            key: "heat",
            label: "Busiest slot",
            summary: hottestSlot
              ? `${hottestSlot.label} is the hottest demand window at ${hottestSlot.value}.`
              : "No heat signal available.",
            meta: "Time-density pressure should shape approvals, featuring, and venue routing before it becomes a capacity problem.",
            tone: "coral",
          },
          {
            key: "geography",
            label: "Geography",
            summary: largestGeo
              ? `${largestGeo.label} remains the largest geographic slice at ${largestGeo.value}.`
              : "No geography signal available.",
            meta: "If one district dominates too hard, discovery and supply need to be rebalanced before the marketplace narrows.",
            tone: "sage",
          },
        ]}
      />

      <Surface
        eyebrow="Chart deck"
        title="Operating charts"
        description="This is the live chart stack for growth, monetization, supply quality, and demand pressure."
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
              className="rounded-lg border border-[var(--brand-border-light)] bg-white p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold text-[var(--brand-text)]">{chart.title}</div>
                <ToneBadge tone={chart.tone}>
                  {chart.data[chart.data.length - 1] ?? 0}
                </ToneBadge>
              </div>
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
          description="This view should tell admin when the platform is under pressure, not just where activity exists."
        >
          <HeatGrid
            columns={adminPortalData.heatGrid.columns}
            rows={adminPortalData.heatGrid.rows}
          />
        </Surface>

        <Surface
          eyebrow="Geo"
          title="Geographic mix"
          description="Use geographic concentration to spot where the marketplace is over-performing or becoming too centralized."
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
  const refreshNeeded = adminPortalData.content.sections.filter((section) =>
    section.status.toLowerCase().includes("refresh"),
  ).length;
  const publishedPosts = adminPortalData.content.blogQueue.filter((post) =>
    post.status.toLowerCase().includes("published"),
  ).length;
  const leadCategory = adminPortalData.content.categories
    .slice()
    .sort((left, right) => Number(right.count) - Number(left.count))[0];

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
            value: String(refreshNeeded),
            detail: "Stale content.",
          },
        ],
      )}
    >
      <DecisionStrip
        eyebrow="Editorial read"
        title="What content operations need from admin"
        description="See homepage freshness, editorial backlog, and strongest category weight before opening the editors."
        items={[
          {
            key: "homepage",
            label: "Homepage freshness",
            summary: `${refreshNeeded} homepage sections currently need a refresh or swap.`,
            meta: "Homepage surfaces go stale faster than operators think, especially when featured inventory changes weekly.",
            tone: "coral",
          },
          {
            key: "blog",
            label: "Editorial queue",
            summary: `${publishedPosts} blog posts are published and ${adminPortalData.content.blogQueue.length - publishedPosts} are still draft-side or in review.`,
            meta: "Editorial rhythm matters most when it reinforces current marketplace inventory instead of lagging it.",
            tone: "indigo",
          },
          {
            key: "categories",
            label: "Category weight",
            summary: leadCategory
              ? `${leadCategory.name} is currently the heaviest active category lane with ${leadCategory.count} items.`
              : "No category leader available.",
            meta: "If one category dominates too hard, discovery starts looking repetitive and city coverage narrows.",
            tone: "sage",
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Surface
          eyebrow="Homepage"
          title="Homepage editor"
          description="This is the live editorial surface shaping the first impression of the marketplace."
        >
          <div className="space-y-4">
            {adminPortalData.content.sections.map((section) => (
              <div
                key={section.key}
                className="rounded-lg border border-[var(--brand-border-light)] bg-white p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-[var(--brand-text)]">{section.title}</div>
                  <ToneBadge tone={statusTone(section.status)}>{section.status}</ToneBadge>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[var(--brand-text-muted)]">
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
            description="Categories should shape discovery lanes, not just count content."
          >
            <div className="grid gap-3 md:grid-cols-2">
              {adminPortalData.content.categories.map((category) => (
                <div
                  key={category.key}
                  className="rounded-md border border-[var(--brand-border-light)] bg-white px-3 py-2"
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
              caption="Editorial blog queue with title, category, and publishing state."
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
  const openReports = adminPortalData.moderation.reports.filter((report) =>
    report.status.toLowerCase().includes("open") ||
    report.status.toLowerCase().includes("investigating") ||
    report.status.toLowerCase().includes("escalated"),
  ).length;
  const highPriorityReports = adminPortalData.moderation.reports.filter((report) =>
    report.priority.toLowerCase().includes("high"),
  ).length;
  const activeBans = adminPortalData.moderation.banned.length;

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
      <DecisionStrip
        eyebrow="Trust read"
        title="What moderation needs from admin"
        description="Read active report pressure, high-priority risk, and current bans before opening the moderation consoles."
        items={[
          {
            key: "reports",
            label: "Open reports",
            summary: `${openReports} moderation reports are currently active or in progress.`,
            meta: "Open reports are where trust debt compounds if decisions stall or consistency drops.",
            tone: "coral",
          },
          {
            key: "priority",
            label: "High priority",
            summary: `${highPriorityReports} reports are currently marked high priority.`,
            meta: "These should shape the queue first because they usually hit safety, fraud, or platform trust directly.",
            tone: "indigo",
          },
          {
            key: "bans",
            label: "Active bans",
            summary: `${activeBans} accounts are currently banned from the marketplace.`,
            meta: "Bans should stay traceable and reversible, but never invisible to the operating team.",
            tone: "sage",
          },
        ]}
      />

      <Surface
        eyebrow="Tabs"
        title="Moderation workspace"
        description="This workspace separates live trust issues from slower review lanes and audit history."
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
                  className="rounded-md border border-[var(--brand-border-light)] bg-white px-3 py-2 text-sm font-semibold text-[var(--brand-text)]"
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
                  className="rounded-md border border-[var(--brand-border-light)] bg-white px-3 py-2 text-sm leading-relaxed text-[var(--brand-text-muted)]"
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
            caption="Moderation audit log with action, actor, and timestamp."
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
  const topSend = adminPortalData.comms.history.find((entry) =>
    entry.result.toLowerCase().includes("open rate"),
  );
  const draftTemplate = adminPortalData.comms.templates.find(
    (template) => template.key === adminPortalData.comms.draft.templateKey,
  );

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
      <DecisionStrip
        eyebrow="Comms read"
        title="What audience communications need from admin"
        description="Read send performance, audience spread, and current draft posture before opening the comms studio."
        items={[
          {
            key: "audiences",
            label: "Audience spread",
            summary: `${adminPortalData.comms.audiences.length} audience lanes are currently addressable from the comms desk.`,
            meta: "If audience lanes are vague, even strong copy turns into generic broadcast noise.",
            tone: "indigo",
          },
          {
            key: "draft",
            label: "Current draft",
            summary: draftTemplate
              ? `${draftTemplate.name} is the active draft lane behind the current send plan.`
              : "No active template draft available.",
            meta: "The live draft should always match what the marketplace most needs to surface this week.",
            tone: "coral",
          },
          {
            key: "performance",
            label: "Best performance",
            summary: topSend
              ? `${topSend.title} is still the strongest recent send at ${topSend.result}.`
              : "No recent performance signal available.",
            meta: "Past send performance should shape targeting and packaging, not just be archived as marketing trivia.",
            tone: "sage",
          },
        ]}
      />

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
          description="These are the reusable message patterns shaping platform announcements, digests, and conversion prompts."
        >
          <div className="grid gap-3 md:grid-cols-2">
            {adminPortalData.comms.templates.map((template) => (
              <article
                key={template.key}
                className="rounded-md border border-[var(--brand-border-light)] bg-white px-3 py-2 text-sm font-semibold text-[var(--brand-text)]"
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
        description="This is the recent comms track record by audience, timing, and result."
      >
        <DashboardTable
          caption="Recent send history with audience, timestamp, and result."
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
