import Link from "next/link";
import type { Route } from "next";
import {
  Award,
  Globe,
  Heart,
  Shield,
  Bell,
} from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import {
  Surface,
  DashboardTable,
  ToneBadge,
  AvatarStamp,
  KeyValueList,
  ActivityFeed,
  ProgressSteps,
  StatCard,
} from "@/components/dashboard/primitives";
import type { DashboardTone } from "@/components/dashboard/primitives";
import { getMemberProfile, getMemberPortalData } from "@/lib/dashboard-fetchers";
import { shouldShowPremiumBadge } from "@/lib/features/member-features";

/* ── Shared helpers ──────────────────────────────────────────── */

function memberLinks(activeKey: string) {
  return [
    { key: "overview", label: "Overview", href: "/dashboard" as Route },
    { key: "events", label: "My Events", href: "/dashboard/calendar" as Route },
    { key: "groups", label: "Groups", href: "/dashboard/groups" as Route },
    { key: "messages", label: "Messages", href: "/dashboard/messages" as Route },
    { key: "transactions", label: "Payments", href: "/dashboard/transactions" as Route },
    { key: "profile", label: "Profile", href: "/profile/baldvin" as Route },
  ].map((l) => ({ href: l.href, label: l.label, active: l.key === activeKey }));
}

function statusTone(s: string): DashboardTone {
  if (/active|published|approved|going|accepted|completed/i.test(s)) return "sage";
  if (/pending|draft|waitlisted|waitlist/i.test(s)) return "sand";
  if (/cancelled|rejected|suspended|declined/i.test(s)) return "coral";
  return "neutral";
}

/* ── Profile Screen ──────────────────────────────────────────── */

export async function MemberProfileScreen({ slug }: { slug?: string }) {
  const profile = await getMemberProfile();
  const showBadge = shouldShowPremiumBadge(profile.tier);
  const completionPct = parseInt(profile.completion, 10) || 0;

  return (
    <PortalShell
      eyebrow="Member portal"
      title={profile.name}
      description={`Profile overview for ${profile.name}.`}
      links={memberLinks("profile")}
      roleMode="member"
      primaryAction={{ href: "/dashboard/settings" as Route, label: "Edit settings" }}
    >
      {/* ── Identity header ─────────────────────────────────── */}
      <Surface
        eyebrow="Identity"
        title={profile.name}
        description={profile.bio}
        actionLabel="Edit profile"
        actionHref={"/dashboard/settings" as Route}
      >
        <div className="flex flex-wrap items-start gap-5">
          <AvatarStamp name={profile.name} size="lg" />
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {showBadge ? (
                <ToneBadge tone="indigo">{profile.tier}</ToneBadge>
              ) : (
                <ToneBadge tone="neutral">{profile.tier}</ToneBadge>
              )}
              <ToneBadge tone="neutral">{profile.city}</ToneBadge>
              {profile.pronouns ? (
                <ToneBadge tone="neutral">{profile.pronouns}</ToneBadge>
              ) : null}
            </div>
            <div className="text-sm text-brand-text-muted">
              Member since {profile.memberSince}
            </div>
            {/* Completion bar */}
            <div className="flex items-center gap-3">
              <div className="h-2 w-36 overflow-hidden rounded-full bg-brand-sand">
                <div
                  className="h-full rounded-full bg-brand-indigo transition-all"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
              <span className="text-xs font-medium text-brand-text-muted">
                {profile.completion} complete
              </span>
            </div>
            {/* Languages */}
            <div className="flex items-center gap-2">
              <Globe className="h-3.5 w-3.5 text-brand-text-muted" />
              <span className="text-sm text-brand-text-muted">
                {profile.languages.join(", ")}
              </span>
            </div>
          </div>
        </div>
      </Surface>

      {/* ── Stats ───────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {profile.stats.map((s, i) => (
          <StatCard
            key={s.key}
            label={s.label}
            value={s.value}
            tone={i === 0 ? "indigo" : i === 1 ? "sage" : i === 2 ? "coral" : "sand"}
          />
        ))}
      </div>

      {/* ── Interests & badges ──────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Surface eyebrow="Preferences" title="Interests">
          <div className="flex flex-wrap gap-1.5">
            {profile.interests.map((i) => (
              <ToneBadge key={i} tone="indigo">{i}</ToneBadge>
            ))}
          </div>
        </Surface>
        <Surface eyebrow="Recognition" title="Badges">
          <div className="flex flex-wrap gap-1.5">
            {profile.badges.map((b) => (
              <span
                key={b}
                className="inline-flex items-center gap-1.5 rounded-md border border-[rgba(124,154,130,0.24)] bg-[rgba(124,154,130,0.08)] px-2.5 py-1 text-xs font-medium text-brand-sage"
              >
                <Award className="h-3 w-3" />
                {b}
              </span>
            ))}
          </div>
        </Surface>
      </div>

      {/* ── Format affinities (progress bars) ───────────────── */}
      <Surface
        eyebrow="Preferences"
        title="Format affinities"
        description="How well different event formats match your attendance patterns."
      >
        <div className="space-y-4">
          {profile.formatAffinities.map((f) => (
            <div key={f.key}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-brand-text">{f.label}</span>
                <span className="text-sm font-semibold text-brand-text">{f.score}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-brand-sand">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${f.score}%`,
                    backgroundColor:
                      f.score >= 80
                        ? "var(--brand-sage)"
                        : f.score >= 60
                          ? "var(--brand-indigo)"
                          : "var(--brand-coral)",
                  }}
                />
              </div>
              <p className="mt-1 text-xs text-brand-text-muted">{f.note}</p>
            </div>
          ))}
        </div>
      </Surface>

      {/* ── Recent attendance ────────────────────────────────── */}
      <Surface
        eyebrow="History"
        title="Recent attendance"
        description="Events you recently attended."
      >
        <DashboardTable
          columns={["Event", "Venue", "Note"]}
          rows={profile.recentAttendance.map((a, i) => ({
            key: `att-${i}`,
            cells: [
              <span key="title" className="font-medium">{a.title}</span>,
              a.venue,
              <span key="note" className="text-brand-text-muted">{a.note}</span>,
            ],
          }))}
          caption="Recent attendance"
        />
      </Surface>

      {/* ── Relationship timeline ───────────────────────────── */}
      <Surface
        eyebrow="Journey"
        title="Relationship timeline"
        description="Key milestones in your community journey."
      >
        <ProgressSteps
          steps={profile.relationshipTimeline.map((r, i) => ({
            key: r.key,
            title: `${r.title} — ${r.meta}`,
            detail: r.detail,
            status: i === profile.relationshipTimeline.length - 1 ? "active" as const : "done" as const,
          }))}
        />
      </Surface>

      {/* ── Community style & privacy ───────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Surface eyebrow="Style" title="Community preferences">
          <KeyValueList
            items={profile.communityStyle.map((c) => ({
              key: c.label,
              label: c.label,
              value: c.value,
            }))}
          />
        </Surface>
        <Surface eyebrow="Privacy" title="Visibility settings">
          <KeyValueList
            items={profile.privacySnapshot.map((p) => ({
              key: p.label,
              label: p.label,
              value: p.value,
            }))}
          />
        </Surface>
      </div>

      {/* ── Organizer guidance ──────────────────────────────── */}
      <Surface
        eyebrow="For organizers"
        title="Organizer guidance"
        description="Notes for event organizers about how to get the best experience."
      >
        <ul className="space-y-2">
          {profile.organizerGuidance.map((g, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-brand-text-muted">
              <Heart className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-coral" />
              {g}
            </li>
          ))}
        </ul>
      </Surface>

      {/* ── Venue preferences ───────────────────────────────── */}
      <Surface
        eyebrow="Venues"
        title="Venue preferences"
        description="Venues you enjoy most and why."
      >
        <DashboardTable
          columns={["Venue", "Why it works"]}
          rows={profile.venuePreferences.map((v, i) => ({
            key: `venue-${i}`,
            cells: [
              <span key="venue" className="font-medium">{v.venue}</span>,
              <span key="reason" className="text-brand-text-muted">{v.reason}</span>,
            ],
          }))}
          caption="Venue preferences"
        />
      </Surface>
    </PortalShell>
  );
}

/* ── Settings Screen ─────────────────────────────────────────── */

export async function MemberSettingsScreen() {
  const [profile, data] = await Promise.all([
    getMemberProfile(),
    getMemberPortalData(),
  ]);

  return (
    <PortalShell
      eyebrow="Member portal"
      title="Settings"
      description="Manage your profile, notifications, privacy, and billing."
      links={memberLinks("profile")}
      roleMode="member"
      breadcrumbs={["Dashboard", "Settings"]}
    >
      {data.settingsSections.map((section) => (
        <Surface
          key={section.key}
          eyebrow="Settings"
          title={section.title}
          description={section.description}
          actionLabel={section.key === "profile" ? "Edit profile" : undefined}
          actionHref={section.key === "profile" ? ("/dashboard/settings/edit" as Route) : undefined}
        >
          <KeyValueList
            items={section.items.map((item) => ({
              key: item.label,
              label: item.label,
              value: item.value,
            }))}
          />
        </Surface>
      ))}
    </PortalShell>
  );
}

/* ── Notifications Screen ────────────────────────────────────── */

export async function MemberNotificationsScreen() {
  const data = await getMemberPortalData();

  return (
    <PortalShell
      eyebrow="Member portal"
      title="Notifications"
      description="Action items, alerts, and system updates."
      links={memberLinks("profile")}
      roleMode="member"
      breadcrumbs={["Dashboard", "Notifications"]}
    >
      {/* ── Stats ───────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Active notifications"
          value={String(data.notifications.length)}
          detail="Alerts and action items from events, groups, and the platform."
          icon={Bell}
          tone="indigo"
        />
        <StatCard
          label="Needs action"
          value={String(
            data.notifications.filter(
              (n) => n.status === "Action required" || n.status === "New",
            ).length,
          )}
          detail="Notifications that need your attention."
          icon={Shield}
          tone="coral"
        />
      </div>

      {/* ── Notification feed ───────────────────────────────── */}
      <Surface
        eyebrow="All notifications"
        title="Recent alerts"
        description="Your latest notifications across all channels."
      >
        <ActivityFeed
          items={data.notifications.map((n) => ({
            key: n.key,
            title: n.title,
            detail: `${n.detail} (${n.channel} — ${n.status})`,
            meta: n.meta,
            tone: n.tone,
          }))}
        />
      </Surface>

      {/* ── Notifications table for more detail ─────────────── */}
      <Surface
        eyebrow="Detail view"
        title="Notification log"
        description="Full detail of each notification."
      >
        <DashboardTable
          columns={["Notification", "Channel", "Status", "When"]}
          rows={data.notifications.map((n) => ({
            key: `table-${n.key}`,
            cells: [
              <div key="body">
                <div className="font-medium">{n.title}</div>
                <div className="mt-0.5 text-xs text-brand-text-muted">{n.detail}</div>
              </div>,
              <ToneBadge key="channel" tone="neutral">{n.channel}</ToneBadge>,
              <ToneBadge key="status" tone={statusTone(n.status)}>
                {n.status}
              </ToneBadge>,
              <span key="meta" className="text-sm text-brand-text-muted">{n.meta}</span>,
            ],
          }))}
          caption="Notification log"
        />
      </Surface>
    </PortalShell>
  );
}
