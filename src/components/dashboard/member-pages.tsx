import type { Route } from "next";
import {
  BellRing,
  BookmarkCheck,
  CalendarDays,
  Compass,
  HeartHandshake,
  Languages,
  MessageSquareMore,
  ShieldCheck,
  Sparkles,
  UserRound,
  WalletCards,
} from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import {
  ActivityFeed,
  CalendarMatrix,
  FilterChips,
  KeyValueList,
  QuickActionCard,
  StatCard,
  StreamCard,
  Surface,
  ToneBadge,
} from "@/components/dashboard/primitives";
import { memberPortalData, memberProfile } from "@/lib/dashboard-data";
import { MemberSettingsStudio } from "@/components/dashboard/operations-panels";
import type { ComponentProps } from "react";

function memberLinks(
  profileSlug: string,
  activeKey:
    | "overview"
    | "calendar"
    | "messages"
    | "notifications"
    | "profile"
    | "settings",
) {
  return [
    { href: "/dashboard" as Route, label: "Overview", active: activeKey === "overview" },
    {
      href: "/dashboard/calendar" as Route,
      label: "Calendar",
      active: activeKey === "calendar",
    },
    {
      href: "/dashboard/messages" as Route,
      label: "Messages",
      active: activeKey === "messages",
    },
    {
      href: "/dashboard/notifications" as Route,
      label: "Notifications",
      active: activeKey === "notifications",
    },
    {
      href: `/profile/${profileSlug}` as Route,
      label: "Profile",
      active: activeKey === "profile",
    },
    { href: "/settings" as Route, label: "Settings", active: activeKey === "settings" },
  ];
}

function statusTone(status: string) {
  if (status.toLowerCase().includes("wait")) {
    return "coral" as const;
  }

  if (status.toLowerCase().includes("confirm") || status.toLowerCase().includes("approved")) {
    return "sage" as const;
  }

  return "indigo" as const;
}

function titleCaseSlug(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function MemberShell(props: ComponentProps<typeof PortalShell>) {
  return <PortalShell roleMode="member" {...props} />;
}

export function MemberOverviewScreen() {
  const links = memberLinks(memberProfile.slug, "overview");

  return (
    <MemberShell
      eyebrow="Client dashboard"
      title={`Welcome back, ${memberProfile.name.split(" ")[0]}`}
      description="Your dashboard overview."
      links={links}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {memberPortalData.metrics.map((metric, index) => (
          <StatCard
            key={metric.label}
            {...metric}
            icon={[CalendarDays, BookmarkCheck, Sparkles, ShieldCheck][index]}
            tone={index === 1 ? "sage" : index === 2 ? "coral" : "indigo"}
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Surface
          eyebrow="RSVPs"
          title="Upcoming events"
          actionLabel="Browse all events"
          actionHref="/events"
        >
          <div className="space-y-4">
            {memberPortalData.upcomingEvents.map(({ event, status, note, seat }) => (
              <StreamCard
                key={event.slug}
                eyebrow={`${event.venueName} · ${event.area} · ${seat}`}
                badge={<ToneBadge tone={statusTone(status)}>{status}</ToneBadge>}
                title={event.title}
                description={note}
              />
            ))}
          </div>
        </Surface>

        <Surface
          eyebrow="Inbox"
          title="Notifications"
        >
          <ActivityFeed items={memberPortalData.inbox} />
        </Surface>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Surface
          eyebrow="Community"
          title="Your groups"
          actionLabel="Browse groups"
          actionHref="/groups"
        >
          <div className="space-y-4">
            {memberPortalData.groups.map(({ group, role, unread, nextEvent }) => (
              <StreamCard
                key={group.slug}
                eyebrow={role}
                badge={<ToneBadge tone="indigo">{unread}</ToneBadge>}
                title={group.name}
                description={group.summary}
                meta={`Next up: ${nextEvent}`}
              />
            ))}
          </div>
        </Surface>

        <Surface
          eyebrow="Discovery"
          title="Recommended next"
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {memberPortalData.recommendations.map(({ event, reason, score }) => (
              <article
                key={event.slug}
                className="rounded-[1.35rem] border border-[rgba(153,148,168,0.12)] bg-white/80 p-4"
              >
                <div
                  className="h-28 rounded-[1.2rem]"
                  style={{ background: event.art }}
                  aria-hidden="true"
                />
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <ToneBadge tone="coral">{score} match</ToneBadge>
                  <ToneBadge tone="sand">{event.category}</ToneBadge>
                </div>
                <div className="font-editorial mt-4 text-2xl tracking-[-0.04em] text-[var(--brand-text)]">
                  {event.title}
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">
                  {reason}
                </p>
              </article>
            ))}
          </div>
        </Surface>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <QuickActionCard
          href="/events"
          title="Find tonight's events"
          description="Browse the public event feed."
          icon={Compass}
        />
        <QuickActionCard
          href="/dashboard/messages"
          title="Open your messages"
          description="Organizer notes, group threads, and venue updates."
          icon={MessageSquareMore}
        />
        <QuickActionCard
          href={`/profile/${memberProfile.slug}` as Route}
          title="Polish your profile"
          description="Complete your profile fields."
          icon={UserRound}
        />
        <QuickActionCard
          href="/venues"
          title="Compare venues"
          description="See partner venues and event formats."
          icon={HeartHandshake}
        />
      </div>
    </MemberShell>
  );
}

export function MemberMessagesScreen() {
  const links = memberLinks(memberProfile.slug, "messages");

  return (
    <MemberShell
      eyebrow="Client messages"
      title="Messages"
      description="Threads with organizers, groups, and venues."
      links={links}
    >
      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <Surface
          eyebrow="Inbox"
          title="Recent conversations"
        >
          <div className="space-y-4">
            {memberPortalData.messages.map((message) => (
              <article
                key={message.key}
                className="rounded-[1.35rem] border border-[rgba(153,148,168,0.12)] bg-white/80 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-[var(--brand-text)]">{message.counterpart}</div>
                    <div className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-text-light)]">
                      {message.role} · {message.channel}
                    </div>
                  </div>
                  <ToneBadge tone={message.status === "Read" ? "sand" : "coral"}>{message.status}</ToneBadge>
                </div>
                <div className="font-editorial mt-4 text-2xl tracking-[-0.04em] text-[var(--brand-text)]">
                  {message.subject}
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">{message.preview}</p>
                <div className="mt-4 text-sm font-semibold text-[var(--brand-indigo)]">{message.meta}</div>
              </article>
            ))}
          </div>
        </Surface>

        <div className="space-y-6">
          <Surface
            eyebrow="Routing"
            title="Message lanes"
          >
            <FilterChips
              items={[
                { key: "all", label: "All threads", active: true, tone: "indigo" },
                { key: "organizers", label: "Organizers" },
                { key: "groups", label: "Groups" },
                { key: "venues", label: "Venues" },
                { key: "saved", label: "Saved context", tone: "sage" },
              ]}
            />
          </Surface>

          <Surface
            eyebrow="Linked notifications"
            title="Related alerts"
          >
            <ActivityFeed items={memberPortalData.notifications} />
          </Surface>
        </div>
      </div>
    </MemberShell>
  );
}

export function MemberNotificationsScreen() {
  const links = memberLinks(memberProfile.slug, "notifications");

  return (
    <MemberShell
      eyebrow="Client notifications"
      title="Notifications"
      description="Waitlist movement, reminders, and account signals."
      links={links}
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Surface
          eyebrow="Alert stream"
          title="Recent notifications"
        >
          <div className="space-y-4">
            {memberPortalData.notifications.map((item) => (
              <article
                key={item.key}
                className="rounded-[1.35rem] border border-[rgba(153,148,168,0.12)] bg-white/80 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-text-light)]">
                    {item.channel}
                  </div>
                  <ToneBadge tone={item.tone}>{item.status}</ToneBadge>
                </div>
                <div className="font-editorial mt-4 text-2xl tracking-[-0.04em] text-[var(--brand-text)]">
                  {item.title}
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">{item.detail}</p>
                <div className="mt-4 text-sm font-semibold text-[var(--brand-indigo)]">{item.meta}</div>
              </article>
            ))}
          </div>
        </Surface>

        <Surface
          eyebrow="Filters"
          title="Notification lanes"
        >
          <FilterChips
            items={[
              { key: "all", label: "All", active: true, tone: "indigo" },
              { key: "action", label: "Action required", tone: "coral" },
              { key: "booking", label: "Booking" },
              { key: "discovery", label: "Discovery" },
              { key: "privacy", label: "Privacy", tone: "sage" },
            ]}
          />
        </Surface>
      </div>
    </MemberShell>
  );
}

export function MemberProfileScreen({ slug }: { slug: string }) {
  const profile =
    slug === memberProfile.slug
      ? memberProfile
      : {
          ...memberProfile,
          slug,
          name: titleCaseSlug(slug),
          initials: titleCaseSlug(slug)
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase(),
        };

  return (
    <MemberShell
      eyebrow="Client profile"
      title="Public member profile"
      description="Profile, trust signals, and event history."
      links={memberLinks(profile.slug, "profile")}
    >
      <Surface
        eyebrow="Identity"
        title={profile.name}
        description={profile.bio}
        actionLabel="Open settings"
        actionHref="/settings"
      >
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[1.5rem] border border-[rgba(153,148,168,0.12)] bg-white/82 p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-[1.8rem] bg-[linear-gradient(135deg,rgba(79,70,229,0.92),rgba(232,97,77,0.82))] text-2xl font-bold text-white">
                {profile.initials}
              </div>
              <div>
                <div className="font-editorial text-3xl tracking-[-0.05em] text-[var(--brand-text)]">
                  {profile.name}
                </div>
                <p className="mt-2 text-sm text-[var(--brand-text-muted)]">
                  {profile.tier} · {profile.city} · Member since {profile.memberSince}
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {profile.badges.map((badge) => (
                <ToneBadge key={badge} tone="sage">
                  {badge}
                </ToneBadge>
              ))}
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {profile.stats.map((stat) => (
                <div
                  key={stat.key}
                  className="rounded-[1.15rem] border border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.84)] px-4 py-3"
                >
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-text-light)]">
                    {stat.label}
                  </div>
                  <div className="font-editorial mt-2 text-2xl tracking-[-0.04em] text-[var(--brand-text)]">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <KeyValueList
              items={[
                { key: "pronouns", label: "Pronouns", value: profile.pronouns },
                {
                  key: "languages",
                  label: "Languages",
                  value: profile.languages.join(", "),
                },
                { key: "completion", label: "Profile strength", value: profile.completion },
                { key: "city", label: "Home base", value: profile.city },
              ]}
            />
            <div className="rounded-[1.35rem] border border-[rgba(153,148,168,0.12)] bg-white/80 p-4">
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-text-light)]">
                Interests
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <ToneBadge key={interest} tone="indigo">
                    {interest}
                  </ToneBadge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Surface>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Surface
          eyebrow="Highlights"
          title="What organizers should know"
        >
          <ActivityFeed
            items={profile.highlights.map((highlight, index) => ({
              key: `highlight-${index}`,
              title: highlight,
              detail: index === 0 ? "Core signal" : "Profile note",
              meta: index === 0 ? "Core signal" : "Profile note",
              tone: index === 1 ? "sage" : "indigo",
            }))}
          />
        </Surface>

        <Surface
          eyebrow="Recent history"
          title="Groups and attended formats"
        >
          <div className="grid gap-4 md:grid-cols-2">
            {memberPortalData.groups.map(({ group, nextEvent }) => (
              <div
                key={group.slug}
                className="rounded-[1.35rem] border border-[rgba(153,148,168,0.12)] bg-white/78 p-4"
              >
                <div className="font-semibold text-[var(--brand-text)]">{group.name}</div>
                <p className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">
                  {group.summary}
                </p>
                <div className="mt-3 text-sm font-semibold text-[var(--brand-text)]">
                  Next event: {nextEvent}
                </div>
              </div>
            ))}
          </div>
        </Surface>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Surface
          eyebrow="Attendance"
          title="Recent event trail"
        >
          <div className="space-y-4">
            {profile.recentAttendance.map((item) => (
              <div
                key={item.title}
                className="rounded-[1.25rem] border border-[rgba(153,148,168,0.12)] bg-white/78 p-4"
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
        </Surface>

        <Surface
          eyebrow="Preferences"
          title="Venue fit and privacy"
        >
          <div className="space-y-5">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-text-light)]">
                Preferred venues
              </div>
              <div className="mt-3 space-y-3">
                {profile.venuePreferences.map((item) => (
                  <div
                    key={item.venue}
                    className="rounded-[1.15rem] border border-[rgba(153,148,168,0.12)] bg-white/78 p-4"
                  >
                    <div className="font-semibold text-[var(--brand-text)]">{item.venue}</div>
                    <p className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">
                      {item.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-text-light)]">
                Privacy and messaging
              </div>
              <div className="mt-3">
                <KeyValueList
                  items={profile.privacySnapshot.map((item) => ({
                    key: item.label,
                    label: item.label,
                    value: item.value,
                  }))}
                />
              </div>
            </div>
          </div>
        </Surface>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.96fr_1.04fr]">
        <Surface
          eyebrow="Fit profile"
          title="Format affinity map"
        >
          <div className="space-y-4">
            {profile.formatAffinities.map((affinity) => (
              <article
                key={affinity.key}
                className="rounded-[1.25rem] border border-[rgba(153,148,168,0.12)] bg-white/82 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-[var(--brand-text)]">{affinity.label}</div>
                  <ToneBadge
                    tone={
                      affinity.score >= 85
                        ? "sage"
                        : affinity.score >= 65
                          ? "coral"
                          : "basalt"
                    }
                  >
                    {affinity.score}%
                  </ToneBadge>
                </div>
                <div className="mt-4 h-2 rounded-full bg-[rgba(245,240,232,0.92)]">
                  <div
                    className={
                      affinity.score >= 85
                        ? "h-2 rounded-full bg-[var(--brand-sage)]"
                        : affinity.score >= 65
                          ? "h-2 rounded-full bg-[var(--brand-coral)]"
                          : "h-2 rounded-full bg-[var(--brand-basalt)]"
                    }
                    style={{ width: `${affinity.score}%` }}
                  />
                </div>
                <p className="mt-4 text-sm leading-7 text-[var(--brand-text-muted)]">
                  {affinity.note}
                </p>
              </article>
            ))}
          </div>
        </Surface>

        <Surface
          eyebrow="Organizer handoff"
          title="How this member tends to show up"
        >
          <div className="space-y-5">
            <KeyValueList
              items={profile.communityStyle.map((item) => ({
                key: item.label,
                label: item.label,
                value: item.value,
              }))}
            />

            <div>
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-text-light)]">
                Organizer guidance
              </div>
              <div className="mt-3 space-y-3">
                {profile.organizerGuidance.map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.15rem] border border-[rgba(153,148,168,0.12)] bg-white/78 px-4 py-3 text-sm leading-7 text-[var(--brand-text-muted)]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-text-light)]">
                Relationship timeline
              </div>
              <div className="mt-3">
                <ActivityFeed
                  items={profile.relationshipTimeline.map((item) => ({
                    key: item.key,
                    title: item.title,
                    detail: item.detail,
                    meta: item.meta,
                    tone: "indigo" as const,
                  }))}
                />
              </div>
            </div>
          </div>
        </Surface>
      </div>
    </MemberShell>
  );
}

export function MemberSettingsScreen() {
  return (
    <MemberShell
      eyebrow="Client settings"
      title="Settings"
      description="Profile, account, notifications, language, privacy, and billing."
      links={memberLinks(memberProfile.slug, "settings")}
    >
      <Surface
        eyebrow="Tabs"
        title="Settings overview"
      >
        <FilterChips
          items={memberPortalData.settingsSections.map((section, index) => ({
            key: section.key,
            label: section.title,
            active: index === 0,
            tone: index % 3 === 0 ? "indigo" : index % 3 === 1 ? "coral" : "sage",
          }))}
        />
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {memberPortalData.settingsSections.map((section, index) => (
            <article
              key={section.key}
              className="rounded-[1.4rem] border border-[rgba(153,148,168,0.12)] bg-white/80 p-5"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(79,70,229,0.08)] text-[var(--brand-indigo)]">
                  {[UserRound, ShieldCheck, BellRing, Languages, Compass, WalletCards][index] ? (
                    (() => {
                      const Icon = [UserRound, ShieldCheck, BellRing, Languages, Compass, WalletCards][index];
                      return <Icon className="h-5 w-5" />;
                    })()
                  ) : null}
                </span>
                <div>
                  <div className="font-semibold text-[var(--brand-text)]">{section.title}</div>
                  <p className="mt-1 text-sm text-[var(--brand-text-muted)]">
                    {section.description}
                  </p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {section.items.map((item) => (
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
              </div>
            </article>
          ))}
        </div>
      </Surface>

      <Surface
        eyebrow="Editor"
        title="Interactive settings studio"
      >
        <MemberSettingsStudio sections={memberPortalData.settingsSections} />
      </Surface>
    </MemberShell>
  );
}

export function MemberCalendarScreen() {
  return (
    <MemberShell
      eyebrow="Client calendar"
      title="Monthly RSVP calendar"
      description="Your confirmed events and upcoming schedule."
      links={memberLinks(memberProfile.slug, "calendar")}
    >
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Surface
          eyebrow="March 2026"
          title="Your RSVP month"
        >
          <CalendarMatrix
            monthLabel="March 2026"
            weekdays={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]}
            days={memberPortalData.calendarDays}
          />
        </Surface>

        <Surface
          eyebrow="Agenda"
          title="Next reminders"
        >
          <div className="space-y-4">
            {memberPortalData.upcomingEvents.map(({ event, status, note }) => (
              <div
                key={event.slug}
                className="rounded-[1.35rem] border border-[rgba(153,148,168,0.12)] bg-white/78 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-[var(--brand-text)]">{event.title}</div>
                  <ToneBadge tone={statusTone(status)}>{status}</ToneBadge>
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">
                  {note}
                </p>
              </div>
            ))}
          </div>
        </Surface>
      </div>
    </MemberShell>
  );
}
