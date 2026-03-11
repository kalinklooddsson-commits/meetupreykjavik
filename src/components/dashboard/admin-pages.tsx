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
  CommandCenterDeck,
  DashboardTable,
  FilterChips,
  HeatGrid,
  KeyValueList,
  SignalRail,
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
      description="The admin overview now covers the 8 stat cards, growth chart, category mix, urgent queues, and system health surfaces called for in the spec."
      links={adminLinks("/admin")}
      {...adminShellFrame(
        "Overview",
        { href: "/admin/events", label: "Triage live event supply" },
        [
          {
            label: "Urgent queues",
            value: String(adminPortalData.urgentQueues.length),
            detail: "Venue reviews, moderation, and content all need active attention today.",
          },
          {
            label: "Revenue pulse",
            value: adminPortalData.metrics[4]?.value ?? "0 ISK",
            detail: "Subscriptions, commissions, and promoted placements need to stay in the first scan.",
          },
          {
            label: "Pending actions",
            value: adminPortalData.metrics[6]?.value ?? "0",
            detail: "This is the working backlog the control room is currently carrying.",
          },
          {
            label: "System posture",
            value: adminPortalData.metrics[7]?.value ?? "Healthy",
            detail: "Operations, queues, and money movement all depend on stable platform health.",
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

      <CommandCenterDeck
        eyebrow="Platform command"
        title="Operate growth, trust, and revenue from one surface"
        description="The admin overview should feel like a real control room: member growth, venue supply, moderation risk, curated audiences, and money movement all visible before deeper drill-down."
        prompt="Scan the client curation queue, venue approvals, moderation load, and the revenue controls that matter today."
        action={{ href: "/admin/events", label: "Open event controls" }}
        secondaryAction={{ href: "/admin/revenue", label: "Open revenue view" }}
        suggestions={[
          "client curation",
          "venue approvals",
          "moderation",
          "payments",
          "feature flags",
          "content push",
        ]}
        stats={[
          {
            icon: Users,
            label: "Users in scope",
            value: String(adminPortalData.users.length),
            detail:
              "The admin workspace should keep the people layer visible because curation, moderation, and growth all start there.",
            tone: "indigo",
          },
          {
            icon: Flag,
            label: "Urgent queues",
            value: String(adminPortalData.urgentQueues.length),
            detail:
              "The first scan should tell admin exactly how many operational queues need attention right now.",
            tone: "coral",
          },
          {
            icon: CreditCard,
            label: "Revenue pulse",
            value: adminPortalData.metrics[4]?.value ?? "0 ISK",
            detail:
              "Payments and subscriptions need to feel like part of the dashboard spine, not a separate finance afterthought.",
            tone: "coral",
          },
          {
            icon: Store,
            label: "Venue network",
            value: adminPortalData.metrics[5]?.value ?? "0",
            detail:
              "Venue supply belongs in the same scan as demand and moderation because room quality affects the whole marketplace.",
            tone: "sage",
          },
        ]}
      />

      <SignalRail
        eyebrow="Priority lanes"
        title="What the platform must protect today"
        description="This rail turns the platform into three visible operating lanes so admin can see growth, trust, and monetization pressure before diving into tools."
        items={[
          {
            key: "growth",
            label: "Growth lane",
            value: adminPortalData.metrics[0]?.value ?? "0",
            detail: "User growth only matters if the active queue and supply base can absorb it cleanly.",
            tone: "indigo",
          },
          {
            key: "trust",
            label: "Trust lane",
            value: String(adminPortalData.urgentQueues.length),
            detail: "Urgent queues are the fastest proxy for moderation, approvals, and operational risk concentration.",
            tone: "coral",
          },
          {
            key: "money",
            label: "Monetization lane",
            value: adminPortalData.metrics[4]?.value ?? "0 ISK",
            detail: "Subscriptions, commissions, and paid placement must stay visible as one platform-level money signal.",
            tone: "sage",
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Surface
          eyebrow="Growth"
          title="Platform growth"
          description="A compact growth chart for top-line member expansion."
        >
          <TrendChart
            data={adminPortalData.growthChart}
            tone="indigo"
            formatValue={(value) => `${value}`}
          />
        </Surface>

        <Surface
          eyebrow="Categories"
          title="Where activity is concentrated"
          description="The category mix helps admin keep editorial focus and venue supply aligned with demand."
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
        description="Moderation, venue approvals, and content refresh all surface together on the main admin landing page."
      >
        <ActivityFeed items={adminPortalData.urgentQueues} />
      </Surface>

      <Surface
        eyebrow="Power"
        title="Super-admin powers"
        description="This layer is where admin can act across the entire platform: impersonate accounts, hand-pick event audiences, override approvals, resolve moderation, and flip platform controls."
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
              note: "Flip registration, payments, maintenance, privacy, and feature flags from one place.",
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
        title="Run the daily admin queue from one inbox"
        description="This is the missing operating layer between summary metrics and deep page-specific tools: one inbox for revenue, trust, supply, and editorial execution, plus a visible handoff trail."
      >
        <AdminOpsInboxDesk
          items={adminPortalData.opsInbox}
          handoffs={adminPortalData.handoffLog}
        />
      </Surface>

      <Surface
        eyebrow="Incident command"
        title="Keep ownership and reliability pressure visible"
        description="Incident handling should stay inside the admin overview too, with issue state, lane ownership, and active load all visible before someone gets pulled into a fire drill."
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
      description="Users are now shown with role, status, activity, and monetization context, with a detail rail for a selected account."
      links={adminLinks("/admin/users")}
      {...adminShellFrame(
        "Users",
        { href: "/admin/events", label: "Open curated audience control" },
        [
          {
            label: "Users in view",
            value: String(adminPortalData.users.length),
            detail: "People, role power, and trust signals live together here.",
          },
          {
            label: "Flagged accounts",
            value: String(
              adminPortalData.users.filter((user) =>
                user.status.toLowerCase().includes("flag"),
              ).length,
            ),
            detail: "Account review pressure needs to stay visible during user operations.",
          },
          {
            label: "Trusted signals",
            value: String(adminPortalData.selectedUser.trustSignals.length),
            detail: "Trust posture should be visible before promotion, curation, or impersonation.",
          },
          {
            label: "Dossier notes",
            value: String(adminPortalData.clientDossier.adminNotes.length),
            detail: "Curation depth matters when admin is hand-picking people for rooms.",
          },
        ],
      )}
    >
      <CommandCenterDeck
        eyebrow="Users command"
        title="Search people, assess trust, and act without losing dossier context"
        description="The admin users page should feel like a true operator surface: directory state, impersonation readiness, trust signals, and invite-worthiness all visible before action."
        prompt="Scan the directory, compare the selected user against the client dossier, and move into promotion, suspension, impersonation, or curation with the right context."
        action={{ href: "/admin/events", label: "Open event curation" }}
        secondaryAction={{ href: "/admin/moderation", label: "Review moderation" }}
        suggestions={[
          "impersonate ready",
          "trust signals",
          "client dossier",
          "invite candidate",
          "role changes",
          "monetization context",
        ]}
        stats={[
          {
            icon: Users,
            label: "Directory size",
            value: String(adminPortalData.users.length),
            detail:
              "The user table is a live control surface for roles, access, and commercial relevance, not just a CRM-style listing.",
            tone: "indigo",
          },
          {
            icon: ShieldAlert,
            label: "Trust signals",
            value: String(adminPortalData.selectedUser.trustSignals.length),
            detail:
              "The selected user view should make trust posture obvious before admin promotes, curates, or limits access.",
            tone: "sage",
          },
          {
            icon: CreditCard,
            label: "Revenue context",
            value: adminPortalData.users[0]?.revenue ?? "0 ISK",
            detail:
              "Role and revenue data need to stay attached so admin can reason about power users and paid operators correctly.",
            tone: "coral",
          },
          {
            icon: Flag,
            label: "Curation depth",
            value: String(adminPortalData.clientDossier.adminNotes.length),
            detail:
              "The client dossier exists so admin can hand-pick audiences and moderate edge cases with more than a spreadsheet mindset.",
            tone: "indigo",
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Surface
          eyebrow="Directory"
          title="Users table"
          description="Avatar, name, email, account type, status, joined date, activity, groups, events, and revenue context."
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
        title="Roles, profile state, and account actions"
        description="Admin can search every account, inspect client profile context, and immediately promote, suspend, restore, or impersonate."
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
          title="Attendance, venue fit, and privacy constraints"
          description="This is the context admin needs when hand-picking clients for events, boosting waitlists, or reviewing borderline approvals."
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
        title="Invite strategy, trust flags, and access controls"
        description="Admin can keep a live operating stance on a client profile: priority, cooldown, messaging rules, room-fit notes, and relationship history all stay attached."
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
      description="Approval queue, active groups, health flags, and intervention context are all rendered here."
      links={adminLinks("/admin/groups")}
      {...adminShellFrame(
        "Groups",
        { href: "/admin/content", label: "Review featuring decisions" },
        [
          {
            label: "Approval queue",
            value: String(adminPortalData.groups.queue.length),
            detail: "New group inventory still depends on admin review speed.",
          },
          {
            label: "Live groups",
            value: String(adminPortalData.groups.table.length),
            detail: "This is the active community base the platform is currently carrying.",
          },
          {
            label: "Feature pressure",
            value: String(
              adminPortalData.groups.queue.filter((group) =>
                group.status.toLowerCase().includes("feature"),
              ).length,
            ),
            detail: "Editorial upside is part of the group-ops decision, not a separate lane.",
          },
          {
            label: "Cadence risks",
            value: String(
              adminPortalData.groups.table.filter((group) =>
                group.health.toLowerCase().includes("needs"),
              ).length,
            ),
            detail: "Groups that lose rhythm weaken demand and homepage quality at the same time.",
          },
        ],
      )}
    >
      <CommandCenterDeck
        eyebrow="Groups command"
        title="Balance approvals, featuring, and recovery work from one control surface"
        description="Admin group management should immediately show queue pressure, feature opportunities, and which communities are drifting before they become dead inventory."
        prompt="Scan the approval queue, spot health issues, and decide whether a group needs a feature boost, an organizer nudge, or moderation attention."
        action={{ href: "/admin/events", label: "Open event controls" }}
        secondaryAction={{ href: "/admin/moderation", label: "Review moderation queues" }}
        suggestions={[
          "approval queue",
          "feature candidates",
          "cadence risk",
          "organizer nudges",
          "health flags",
          "community quality",
        ]}
        stats={[
          {
            icon: Users,
            label: "Queue pressure",
            value: String(adminPortalData.groups.queue.length),
            detail:
              "The approval queue is the first thing admin should see because it controls what new community inventory reaches the marketplace.",
            tone: "coral",
          },
          {
            icon: LayoutTemplate,
            label: "Live groups",
            value: String(adminPortalData.groups.table.length),
            detail:
              "The active group table needs to feel like a real operating inventory, not a static directory of names and counts.",
            tone: "indigo",
          },
          {
            icon: BellElectric,
            label: "Feature upside",
            value: String(
              adminPortalData.groups.queue.filter((group) =>
                group.status.toLowerCase().includes("feature"),
              ).length +
                adminPortalData.groups.table.filter((group) =>
                  group.status.toLowerCase().includes("feature"),
                ).length,
            ),
            detail:
              "Feature candidates should stay close to group approvals so editorial and operational decisions do not drift apart.",
            tone: "sage",
          },
          {
            icon: Flag,
            label: "Cadence risks",
            value: String(
              adminPortalData.groups.queue.filter((group) =>
                group.status.toLowerCase().includes("health"),
              ).length +
                adminPortalData.groups.table.filter((group) =>
                  group.health.toLowerCase().includes("needs"),
                ).length,
            ),
            detail:
              "Groups that are losing event rhythm need earlier intervention than the public surface alone would reveal.",
            tone: "coral",
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Surface
          eyebrow="Approval queue"
          title="Needs admin review"
          description="New groups, feature candidates, and health flags stay visible together."
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
          description="Featured state, health status, and admin action intent are explicit in the table."
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
        title="Feature, rescue, archive, and approve from one desk"
        description="Admin should be able to run group inventory from the dashboard itself instead of flipping between passive tables and separate notes."
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
      description="Event status, category, venue, date, and intervention actions are all visible alongside a simple calendar rail."
      links={adminLinks("/admin/events")}
      {...adminShellFrame(
        "Events",
        { href: "/admin/users", label: "Open user curation lane" },
        [
          {
            label: "Managed events",
            value: String(adminPortalData.events.table.length),
            detail: "The current live event stack needs active moderation and featuring decisions.",
          },
          {
            label: "Curated seats",
            value: String(adminPortalData.events.audiencePicker.selectedIds.length),
            detail: "Audience shaping is already part of the event workflow, not a side action.",
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
            detail: "Paid-event quality needs to stay close to moderation and venue fit.",
          },
          {
            label: "Calendar stack",
            value: String(adminPortalData.events.calendar.length),
            detail: "Date clustering drives featuring, waitlist pressure, and venue assignment.",
          },
        ],
      )}
    >
      <CommandCenterDeck
        eyebrow="Events command"
        title="Moderate supply, shape the room, and keep revenue logic visible"
        description="Admin event control should surface the live event stack, audience curation power, and monetization signals before anyone starts toggling statuses."
        prompt="Review the live event table, decide which events deserve curation or featuring, and keep paid-event quality visible next to moderation work."
        action={{ href: "/admin/users", label: "Open user curation" }}
        secondaryAction={{ href: "/admin/revenue", label: "Review revenue controls" }}
        suggestions={[
          "feature candidates",
          "paid events",
          "audience curation",
          "stacked dates",
          "waitlist quality",
          "venue fit",
        ]}
        stats={[
          {
            icon: LayoutTemplate,
            label: "Managed events",
            value: String(adminPortalData.events.table.length),
            detail:
              "This page should immediately show how much live event supply admin is actively shaping across categories and venues.",
            tone: "indigo",
          },
          {
            icon: BellElectric,
            label: "Feature candidates",
            value: String(
              adminPortalData.events.table.filter((event) =>
                event.action.toLowerCase().includes("feature"),
              ).length,
            ),
            detail:
              "Featuring decisions should sit next to moderation because homepage and digest inventory are part of the same control problem.",
            tone: "sage",
          },
          {
            icon: CreditCard,
            label: "Paid-event watch",
            value: String(
              adminPortalData.events.table.filter(
                (event) =>
                  event.status.toLowerCase().includes("paid") ||
                  event.action.toLowerCase().includes("payout"),
              ).length,
            ),
            detail:
              "Paid events need explicit visibility or admin loses the commercial quality signal inside general event moderation.",
            tone: "coral",
          },
          {
            icon: Users,
            label: "Curated seats",
            value: String(adminPortalData.events.audiencePicker.selectedIds.length),
            detail:
              "Audience curation is real leverage here, and the interface should show how much of that work has already been committed.",
            tone: "indigo",
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Surface
          eyebrow="Events"
          title="Moderation and feature controls"
          description="This table is the operational view for feature, approve, cancel, and edit workflows."
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
          title="Pick and choose clients for this event"
          description="Admin can curate exactly which clients get invites, priority approvals, or waitlist promotions for a selected event."
        >
          <AdminEventAudiencePicker audience={adminPortalData.events.audiencePicker} />
        </Surface>
      </div>

      <Surface
        eyebrow="Calendar"
        title="March event stack"
        description="A schedule-side view helps admin spot clustering and homepage feature candidates."
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
          title="How admin wants the room to feel"
          description="Audience curation is not only who gets in. It is also the room shape, conversation quality, and how safely newcomers enter the event."
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
          title="Quota targets for this event"
          description="These target bands keep the room balanced between experts, operators, emerging attendees, and strategic partner presence."
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
        title="Approve, feature, hold, and pause from one event desk"
        description="This is the operational side of admin event work: not only inspecting rows, but moving event inventory through real status and featuring decisions in one place."
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
      description="Application queue, active venue table, and matching guidance are all surfaced together here."
      links={adminLinks("/admin/venues")}
      {...adminShellFrame(
        "Venues",
        { href: "/admin/revenue", label: "Review venue economics" },
        [
          {
            label: "Applications",
            value: String(adminPortalData.venues.applications.length),
            detail: "Incoming supply quality starts here.",
          },
          {
            label: "Active partners",
            value: String(adminPortalData.venues.active.length),
            detail: "Verified supply needs to stay visible next to the queue.",
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
            detail: "Partial approvals and missing info are where venue ops usually slow down.",
          },
          {
            label: "Matching rules",
            value: String(adminPortalData.venues.matching.length),
            detail: "Supply guidance keeps event placement deliberate instead of random.",
          },
        ],
      )}
    >
      <CommandCenterDeck
        eyebrow="Venues command"
        title="Control supply quality, approval speed, and venue economics together"
        description="Venue admin should open with the approval queue, active partner base, and matching rules that shape how good the marketplace inventory actually is."
        prompt="Work the incoming venue queue, keep verified partners visible, and use matching guidance so event placement stays deliberate instead of random."
        action={{ href: "/admin/events", label: "Open event matching" }}
        secondaryAction={{ href: "/admin/revenue", label: "Review venue economics" }}
        suggestions={[
          "application queue",
          "verified partners",
          "pricing risk",
          "matching rules",
          "weekend fit",
          "premium supply",
        ]}
        stats={[
          {
            icon: Store,
            label: "Applications open",
            value: String(adminPortalData.venues.applications.length),
            detail:
              "The application queue is part of the marketplace supply engine, so it should be visible before the admin drops into individual approvals.",
            tone: "coral",
          },
          {
            icon: Users,
            label: "Active partners",
            value: String(adminPortalData.venues.active.length),
            detail:
              "Admin needs a clear count of live partners to understand whether supply is healthy enough for the event pipeline.",
            tone: "indigo",
          },
          {
            icon: Flag,
            label: "Needs follow-up",
            value: String(
              adminPortalData.venues.applications.filter((application) =>
                ["waitlist", "request info"].some((state) =>
                  application.status.toLowerCase().includes(state),
                ),
              ).length,
            ),
            detail:
              "Waitlisted and incomplete applications are where operational slippage starts if they are not clearly surfaced.",
            tone: "coral",
          },
          {
            icon: CreditCard,
            label: "Matching rules live",
            value: String(adminPortalData.venues.matching.length),
            detail:
              "Venue-side commercial and fit rules should stay close to approvals so admin does not admit supply that weakens the paid side of the product.",
            tone: "sage",
          },
        ]}
      />

      <div className="grid gap-6">
        <Surface
          eyebrow="Applications"
          title="Venue application queue"
          description="Approve, reject, waitlist, or request info with the queue in one place."
        >
          <AdminVenueApprovalConsole applications={adminPortalData.venues.applications} />
        </Surface>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Surface
            eyebrow="Active venues"
            title="Verified and live partners"
            description="Operational visibility into currently active venue partners."
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
            description="These notes keep admin matchmaking decisions explicit and consistent."
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
        title="Batch-handle supply, approvals, and partner guidance"
        description="This extends venue admin past individual approvals so the team can move supply through the right lanes and keep live partner notes current without leaving the dashboard."
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
      title="Transactions and pricing controls"
      description="Revenue sources, transaction logs, and pricing plans are now represented as a complete operating surface."
      links={adminLinks("/admin/revenue")}
      {...adminShellFrame(
        "Revenue",
        { href: "/admin/events", label: "Open monetized event supply" },
        [
          {
            label: "Transactions",
            value: String(adminPortalData.revenue.transactions.length),
            detail: "Money movement belongs in the first scan of the page.",
          },
          {
            label: "Plans",
            value: String(adminPortalData.revenue.plans.length),
            detail: "The pricing stack spans organizers, venues, and members.",
          },
          {
            label: "Top source",
            value: `${adminPortalData.revenue.sources[0]?.value ?? 0}%`,
            detail: "The leading revenue mix should guide product and supply decisions.",
          },
          {
            label: "Guardrails",
            value: String(adminPortalData.revenue.policies.length),
            detail: "Hard pricing rules are part of the product contract.",
          },
        ],
      )}
    >
      <CommandCenterDeck
        eyebrow="Revenue command"
        title="Track money movement, plan posture, and commercial rules in one scan"
        description="Revenue admin should open with transaction pressure, pricing surface, and platform guardrails so the business model feels explicit everywhere."
        prompt="Review the latest captured money, compare subscription and commission mix, and keep the pricing stack aligned with how events and venues actually convert."
        action={{ href: "/admin/events", label: "Open event supply controls" }}
        secondaryAction={{ href: "/admin/venues", label: "Review venue partners" }}
        suggestions={[
          "ticket commission",
          "captured revenue",
          "pricing plans",
          "promoted listings",
          "minimum ticket",
          "payout watch",
        ]}
        stats={[
          {
            icon: CreditCard,
            label: "Transaction rows",
            value: String(adminPortalData.revenue.transactions.length),
            detail:
              "Recent money movement should feel like a live control feed, not a buried reporting table.",
            tone: "coral",
          },
          {
            icon: LayoutTemplate,
            label: "Commercial plans",
            value: String(adminPortalData.revenue.plans.length),
            detail:
              "Organizer, venue, and member plans are part of the same business surface and should stay visible together.",
            tone: "indigo",
          },
          {
            icon: BellElectric,
            label: "Top revenue source",
            value: `${adminPortalData.revenue.sources[0]?.value ?? 0}%`,
            detail:
              "The current leading revenue lane needs to remain visible so pricing and supply decisions stay grounded in what actually makes money.",
            tone: "sage",
          },
          {
            icon: Flag,
            label: "Policy guardrails",
            value: String(adminPortalData.revenue.policies.length),
            detail:
              "Hard rules like minimum ticket price and platform commission are core product logic, not footer-level detail.",
            tone: "indigo",
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Surface
          eyebrow="Sources"
          title="Revenue mix"
          description="Top-line source contribution across subscriptions, commissions, and promoted placements."
        >
          <TrendChart
            data={adminPortalData.revenue.sources}
            tone="coral"
            formatValue={(value) => `${value}%`}
          />
        </Surface>

        <Surface
          eyebrow="Transactions"
          title="Recent money movement"
          description="Captured subscriptions and event fee logs stay in one table."
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
        description="Organizer, venue, and member plans stay visible together so admin can review the full commercial stack."
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
        description="Admin can see the hard commercial rules the public product is built around."
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
        title="Edit plans and platform guardrails without leaving admin"
        description="This keeps pricing changes, commercial positioning, and policy edits inside the dashboard instead of pushing them out into code or external docs."
      >
        <AdminRevenueControlDesk
          plans={adminPortalData.revenue.plans}
          policies={adminPortalData.revenue.policies}
        />
      </Surface>

      <Surface
        eyebrow="Revenue operations"
        title="Work payouts, fee holds, and finance anomalies from admin"
        description="This turns the revenue page into an active back-office tool instead of a passive report by giving admin a local money-movement desk and action journal."
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
      title="Growth, engagement, and revenue charts"
      description="This page now renders the chart-heavy analytics suite: 12 chart cards, a heat grid, and geography context."
      links={adminLinks("/admin/analytics")}
      {...adminShellFrame(
        "Analytics",
        { href: "/admin/revenue", label: "Compare growth to revenue" },
        [
          {
            label: "Chart deck",
            value: String(adminPortalData.analyticsDeck.length),
            detail: "The analytics surface is intentionally dense and wide.",
          },
          {
            label: "Heat cells",
            value: String(
              adminPortalData.heatGrid.columns.length * adminPortalData.heatGrid.rows.length,
            ),
            detail: "Time density is one of the clearest marketplace-shape signals.",
          },
          {
            label: "Geo slices",
            value: String(adminPortalData.geography.length),
            detail: "Geographic mix shows where growth is really deepening.",
          },
          {
            label: "Growth endpoint",
            value: String(
              adminPortalData.growthChart[adminPortalData.growthChart.length - 1]?.value ?? 0,
            ),
            detail: "Top-line growth keeps the rest of the chart deck anchored to reality.",
          },
        ],
      )}
    >
      <CommandCenterDeck
        eyebrow="Analytics command"
        title="Read platform momentum, time density, and commercial movement without losing context"
        description="Analytics should feel like a control surface for the whole marketplace: chart density, time heat, geography, and business movement all aligned before deeper interpretation starts."
        prompt="Scan the chart deck, check where demand is clustering in time and geography, and connect growth signals back to revenue and supply quality."
        action={{ href: "/admin/revenue", label: "Open revenue controls" }}
        secondaryAction={{ href: "/admin/content", label: "Review content operations" }}
        suggestions={[
          "growth trend",
          "time density",
          "geo mix",
          "revenue movement",
          "ticket funnel",
          "venue ranking",
        ]}
        stats={[
          {
            icon: LayoutTemplate,
            label: "Chart cards",
            value: String(adminPortalData.analyticsDeck.length),
            detail:
              "The analytics deck should immediately convey that this is a dense, decision-ready operator surface rather than a thin reporting page.",
            tone: "indigo",
          },
          {
            icon: BellElectric,
            label: "Heat cells",
            value: String(
              adminPortalData.heatGrid.columns.length * adminPortalData.heatGrid.rows.length,
            ),
            detail:
              "Time-density awareness matters because many product decisions depend on when the city is actually active, not just on total counts.",
            tone: "coral",
          },
          {
            icon: Users,
            label: "Geo segments",
            value: String(adminPortalData.geography.length),
            detail:
              "Location mix helps admin understand whether growth is deepening in core Reykjavik zones or diffusing outward.",
            tone: "sage",
          },
          {
            icon: CreditCard,
            label: "Growth endpoint",
            value: String(adminPortalData.growthChart[adminPortalData.growthChart.length - 1]?.value ?? 0),
            detail:
              "The current growth endpoint is a useful top-line signal that keeps the rest of the analytics deck anchored to actual platform scale.",
            tone: "indigo",
          },
        ]}
      />

      <Surface
        eyebrow="Chart deck"
        title="Twelve operating charts"
        description="The exact chart data is mocked, but the screen now has the density and structure the spec expects."
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
          description="A simple heat grid is enough to make the time-density analysis concrete."
        >
          <HeatGrid
            columns={adminPortalData.heatGrid.columns}
            rows={adminPortalData.heatGrid.rows}
          />
        </Surface>

        <Surface
          eyebrow="Geo"
          title="Geographic mix"
          description="Geo concentration is shown here as an operator-friendly list."
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
        title="Escalate weak signals before they become product problems"
        description="This gives admin a real watch lane for chart anomalies, time-density pressure, and geography shifts instead of leaving analytics as read-only context."
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
      title="Homepage and editorial control"
      description="Homepage sections, categories, and blog queue all render here now as a real content operating area."
      links={adminLinks("/admin/content")}
      {...adminShellFrame(
        "Content",
        { href: "/admin/comms", label: "Push content into comms" },
        [
          {
            label: "Homepage sections",
            value: String(adminPortalData.content.sections.length),
            detail: "Editorial surface area stays visible before content changes get made.",
          },
          {
            label: "Categories",
            value: String(adminPortalData.content.categories.length),
            detail: "Category health shapes discovery and homepage balance.",
          },
          {
            label: "Blog queue",
            value: String(adminPortalData.content.blogQueue.length),
            detail: "The publishing queue should sit close to homepage control.",
          },
          {
            label: "Needs refresh",
            value: String(
              adminPortalData.content.sections.filter((section) =>
                section.status.toLowerCase().includes("refresh"),
              ).length,
            ),
            detail: "Editorial staleness should be obvious from the first scan.",
          },
        ],
      )}
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Surface
          eyebrow="Homepage"
          title="Homepage editor"
          description="Hero, featured events, editor picks, group rail, and banner all expose a live state."
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
            description="Counts and visual tone stay visible for quick editorial checks."
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
            description="Published and draft-review posts stay visible next to homepage controls."
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
        description="This is the working content console for status changes, featured category picks, and blog publishing decisions."
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
      title="Reports, bans, and audit trails"
      description="The moderation center now contains all of the required tabs in rendered form: reports, pending approval, auto-flagged, banned, and audit log."
      links={adminLinks("/admin/moderation")}
      {...adminShellFrame(
        "Moderation",
        { href: "/admin/users", label: "Open account command center" },
        [
          {
            label: "Reports",
            value: String(adminPortalData.moderation.reports.length),
            detail: "Manual moderation workload starts with the active reports queue.",
          },
          {
            label: "Pending approvals",
            value: String(adminPortalData.moderation.pendingApproval.length),
            detail: "Content and venue approvals can overlap with trust operations.",
          },
          {
            label: "Auto flags",
            value: String(adminPortalData.moderation.autoFlagged.length),
            detail: "System-detected anomalies are part of the admin attention model.",
          },
          {
            label: "Banned accounts",
            value: String(adminPortalData.moderation.banned.length),
            detail: "The ban surface stays visible because appeals and reversals matter.",
          },
        ],
      )}
    >
      <Surface
        eyebrow="Tabs"
        title="Moderation workspace"
        description="Every moderation domain from the spec is represented below."
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
        description="This is the active moderation workstation where admin can close reports and reverse bans."
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
            description="Items currently blocked on admin approval."
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
            description="Auto-flagged items give moderators a second queue."
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
          description="Every significant moderation or admin action leaves a visible trail."
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
        title="Resolve, escalate, and ban in admin cohorts"
        description="This gives the admin team a higher-throughput moderation lane for moments when multiple reports need the same decision pattern."
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
      title="Announcements and email control"
      description="Compose target audiences, template inventory, and notification history all render here now."
      links={adminLinks("/admin/comms")}
      {...adminShellFrame(
        "Communications",
        { href: "/admin/content", label: "Open editorial control" },
        [
          {
            label: "Audience lanes",
            value: String(adminPortalData.comms.audiences.length),
            detail: "Segmentation needs to stay visible before sends are composed.",
          },
          {
            label: "Templates",
            value: String(adminPortalData.comms.templates.length),
            detail: "Reusable message assets belong in the first scan of the page.",
          },
          {
            label: "Recent sends",
            value: String(adminPortalData.comms.history.length),
            detail: "Performance and send history shape which message goes out next.",
          },
          {
            label: "Top open rate",
            value:
              adminPortalData.comms.history.find((entry) =>
                entry.result.toLowerCase().includes("open rate"),
              )?.result.replace(" open rate", "") ?? "n/a",
            detail: "Demand-shaping outbound work should carry real performance context.",
          },
        ],
      )}
    >
      <CommandCenterDeck
        eyebrow="Comms command"
        title="Control who hears what, when, and why"
        description="Communications should read like part of the operating system: audience targeting, template readiness, and recent performance visible before a message gets edited or sent."
        prompt="Choose the right audience, pull the right template, and treat email and announcements as a real demand-shaping lever for the marketplace."
        action={{ href: "/admin/content", label: "Open content operations" }}
        secondaryAction={{ href: "/admin/users", label: "Review user segments" }}
        suggestions={[
          "weekly digest",
          "venue upgrades",
          "new members",
          "template inventory",
          "open rate",
          "send history",
        ]}
        stats={[
          {
            icon: Users,
            label: "Audience lanes",
            value: String(adminPortalData.comms.audiences.length),
            detail:
              "Audience count should stay visible so the admin keeps segmentation in mind before drafting broad messages.",
            tone: "indigo",
          },
          {
            icon: LayoutTemplate,
            label: "Template library",
            value: String(adminPortalData.comms.templates.length),
            detail:
              "Templates are part of the operating backbone and should feel production-ready, not like secondary content assets.",
            tone: "sage",
          },
          {
            icon: BellElectric,
            label: "Recent sends",
            value: String(adminPortalData.comms.history.length),
            detail:
              "Send history should be treated as a live performance signal, especially when product growth depends on city-specific outbound communication.",
            tone: "coral",
          },
          {
            icon: CreditCard,
            label: "Best open rate",
            value:
              adminPortalData.comms.history.find((entry) =>
                entry.result.toLowerCase().includes("open rate"),
              )?.result.replace(" open rate", "") ?? "n/a",
            detail:
              "Performance context matters because outbound communication influences event demand, venue upgrades, and paid conversion.",
            tone: "indigo",
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
          description="Template availability stays next to the compose surface."
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
        title="Outbound communication history"
        description="Sent announcements and email campaigns remain visible with performance context."
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
        description="Admin can select audiences, load templates, edit message copy, and queue test or live sends locally."
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
      description="Every settings tab from the spec now exists as a rendered admin configuration section."
      links={adminLinks("/admin/settings")}
      {...adminShellFrame(
        "Settings",
        { href: "/admin/revenue", label: "Review money-critical config" },
        [
          {
            label: "Config sections",
            value: String(adminPortalData.settings.length),
            detail: "The full control surface is now broad enough to need better first-scan orientation.",
          },
          {
            label: "Payment rules",
            value: String(
              adminPortalData.settings.find((section) => section.key === "payments")?.items
                .length ?? 0,
            ),
            detail: "Commercial settings must stay visible and close to platform controls.",
          },
          {
            label: "Risk controls",
            value: String(
              adminPortalData.settings.find((section) => section.key === "maintenance")?.items
                .length ?? 0,
            ),
            detail: "Maintenance and safety toggles should never feel buried.",
          },
          {
            label: "Feature flags",
            value: String(
              adminPortalData.settings.find((section) => section.key === "feature-flags")
                ?.items.length ?? 0,
            ),
            detail: "Forward-edge product controls are part of admin’s daily operating model.",
          },
        ],
      )}
    >
      <CommandCenterDeck
        eyebrow="Settings command"
        title="Keep policy, payments, onboarding, and risk controls aligned"
        description="Settings should feel like a platform command surface: core configuration domains, monetization rules, and operational safety switches visible before toggles get touched."
        prompt="Review the main configuration lanes, spot payment and registration rules quickly, and keep maintenance and feature flags close to the rest of the control model."
        action={{ href: "/admin/revenue", label: "Review commercial rules" }}
        secondaryAction={{ href: "/admin/moderation", label: "Open moderation controls" }}
        suggestions={[
          "payment rules",
          "open signup",
          "venue gate",
          "feature flags",
          "maintenance mode",
          "privacy defaults",
        ]}
        stats={[
          {
            icon: LayoutTemplate,
            label: "Config sections",
            value: String(adminPortalData.settings.length),
            detail:
              "The number of configuration domains tells admin how broad the live platform-control surface has become.",
            tone: "indigo",
          },
          {
            icon: CreditCard,
            label: "Payment rules",
            value: String(
              adminPortalData.settings.find((section) => section.key === "payments")?.items
                .length ?? 0,
            ),
            detail:
              "Payments deserve explicit visibility because the money model is a core operating concern, not a backend-only configuration.",
            tone: "coral",
          },
          {
            icon: ShieldAlert,
            label: "Risk controls",
            value: String(
              adminPortalData.settings.find((section) => section.key === "maintenance")?.items
                .length ?? 0,
            ),
            detail:
              "Maintenance and incident controls should stay visible enough that the platform can be steered under pressure without hunting for tabs.",
            tone: "sage",
          },
          {
            icon: Flag,
            label: "Feature flags",
            value: String(
              adminPortalData.settings.find((section) => section.key === "feature-flags")
                ?.items.length ?? 0,
            ),
            detail:
              "Feature flags represent the forward edge of the product and should feel operationally close to the rest of the settings surface.",
            tone: "indigo",
          },
        ]}
      />

      <Surface
        eyebrow="Tabs"
        title="Platform settings"
        description="General, registration, events, venues, payments, email, privacy, maintenance, and feature flags."
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
