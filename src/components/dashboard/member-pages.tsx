import type { Route } from "next";
import {
  BellRing,
  BookmarkCheck,
  CalendarDays,
  Compass,
  Mail,
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
  AvatarStamp,
  CalendarMatrix,
  CommandCenterDeck,
  FilterChips,
  KeyValueList,
  QuickActionCard,
  StatCard,
  StreamCard,
  Surface,
  ToneBadge,
} from "@/components/dashboard/primitives";
import {
  getDashboardAvatar,
  memberPortalData,
  memberProfile,
} from "@/lib/dashboard-data";
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
      description="Upcoming RSVPs, joined groups, smart recommendations, inbox updates, and fast actions are all visible from the member home."
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

      <CommandCenterDeck
        eyebrow="Member command"
        title="Plan your next week around trusted rooms and easy yeses"
        description="The member overview should feel like a decision surface: confirmed seats, group rhythm, inbox changes, and discovery cues all visible in one scan."
        prompt="Scan upcoming RSVPs, venue-backed recommendations, and the groups most likely to produce your next good room."
        action={{ href: "/events", label: "Browse live events" }}
        secondaryAction={{ href: "/dashboard/calendar", label: "Open calendar" }}
        suggestions={[
          "confirmed seats",
          "venue-backed",
          "newcomer-safe",
          "tonight in Reykjavik",
          "group rhythm",
          "premium formats",
        ]}
        stats={[
          {
            icon: CalendarDays,
            label: "Upcoming seats",
            value: String(memberPortalData.upcomingEvents.length),
            detail:
              "Confirmed and waitlisted events stay visible here so the week does not fragment across multiple screens.",
            tone: "indigo",
          },
          {
            icon: HeartHandshake,
            label: "Joined groups",
            value: String(memberPortalData.groups.length),
            detail:
              "Recurring communities are what keep discovery from feeling random after the first RSVP.",
            tone: "sage",
          },
          {
            icon: Sparkles,
            label: "Fresh matches",
            value: String(memberPortalData.recommendations.length),
            detail:
              "Recommendations now feel like actual next moves rather than a passive recommendation box.",
            tone: "coral",
          },
          {
            icon: BellRing,
            label: "Inbox nudges",
            value: String(memberPortalData.inbox.length),
            detail:
              "Queue updates, waitlist movement, and group notes stay close to the main planning surface.",
            tone: "indigo",
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Surface
          eyebrow="RSVPs"
          title="Upcoming events"
          description="This panel mirrors the spec: confirmed seats, waitlist position, and pre-event notes stay visible without making members jump through multiple pages."
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
          title="Notifications and nudges"
          description="Group activity, waitlist movement, and venue updates stay visible here."
        >
          <ActivityFeed items={memberPortalData.inbox} />
        </Surface>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Surface
          eyebrow="Community"
          title="Your groups"
          description="A compact view of joined groups, role context, and what is worth opening next."
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
          description="Recommendations stay grounded in real group history, venue preference, and format fit."
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
          description="Jump back into city discovery and browse the public event feed."
          icon={Compass}
        />
        <QuickActionCard
          href="/dashboard/messages"
          title="Open your messages"
          description="Keep organizer notes, group threads, and venue updates inside one inbox."
          icon={MessageSquareMore}
        />
        <QuickActionCard
          href={`/profile/${memberProfile.slug}` as Route}
          title="Polish your profile"
          description="Complete the last profile fields so organizers can read your preferences quickly."
          icon={UserRound}
        />
        <QuickActionCard
          href="/venues"
          title="Compare venues"
          description="See which partner venues fit your preferred event formats and neighborhoods."
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
      title="Threads with organizers, groups, and venues"
      description="Members need one clean workspace for attendance questions, group discussion, and venue logistics instead of relying on scattered update cards."
      links={links}
    >
      <CommandCenterDeck
        eyebrow="Inbox command"
        title="Keep event questions and group coordination in one place"
        description="This workspace compresses the conversation layer into a focused inbox so the member journey stays inside the product."
        prompt="Scan who needs a reply, which thread affects tonight's arrival, and what messages are worth saving for later."
        action={{ href: "/events", label: "Browse events" }}
        secondaryAction={{ href: "/dashboard/notifications", label: "Open notifications" }}
        suggestions={["needs reply", "arrival notes", "group thread", "venue detail", "saved context", "tonight"]}
        stats={[
          {
            icon: MessageSquareMore,
            label: "Open threads",
            value: String(memberPortalData.messages.length),
            detail: "Organizer notes, venue perks, and group coordination all resolve through this inbox.",
            tone: "indigo",
          },
          {
            icon: BellRing,
            label: "Unread items",
            value: String(memberPortalData.messages.filter((item) => item.status !== "Read").length),
            detail: "Unread count stays visible so live event preparation does not get buried under passive discovery.",
            tone: "coral",
          },
          {
            icon: Mail,
            label: "Channels",
            value: "3",
            detail: "Direct messages, group threads, and venue notes are distinct but handled in the same interface.",
            tone: "sage",
          },
          {
            icon: CalendarDays,
            label: "Tonight-linked",
            value: "2",
            detail: "The most important member messages are usually tied to arrival or seat confirmation, not social chatter.",
            tone: "indigo",
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <Surface
          eyebrow="Inbox"
          title="Recent conversations"
          description="Each thread keeps the counterpart, channel, status, and decision context visible in one scan."
        >
          <div className="space-y-4">
            {memberPortalData.messages.map((message) => (
              <StreamCard
                key={message.key}
                avatarName={message.counterpart}
                avatarSrc={getDashboardAvatar(message.counterpart)}
                avatarTone={
                  message.role.includes("Venue")
                    ? "coral"
                    : message.role.includes("Group")
                      ? "sage"
                      : "indigo"
                }
                eyebrow={
                  <>
                    <span className="text-[var(--brand-text)]">{message.counterpart}</span>
                    <span className="mx-2 text-[var(--brand-border)]">·</span>
                    {message.role} · {message.channel}
                  </>
                }
                badge={
                  <ToneBadge tone={message.status === "Read" ? "sand" : "coral"}>
                    {message.status}
                  </ToneBadge>
                }
                title={message.subject}
                description={message.preview}
                meta={message.meta}
              />
            ))}
          </div>
        </Surface>

        <div className="space-y-6">
          <Surface
            eyebrow="Routing"
            title="Message lanes"
            description="Separate the kinds of member conversations that actually need different response behavior."
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
            title="Signals tied to your inbox"
            description="These are the messages-adjacent notifications most likely to change what the member does next."
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
      title="Waitlist movement, reminders, and account signals"
      description="Notifications need their own workspace so members can manage alerts, not just glance at them on the overview."
      links={links}
    >
      <CommandCenterDeck
        eyebrow="Notification command"
        title="Separate what is urgent from what is merely informative"
        description="The member notification surface should help users act fast on seat changes, reminder windows, and trust settings."
        prompt="Scan alerts that change tonight's plan, what can wait until later, and which signal should turn into a message thread."
        action={{ href: "/settings", label: "Tune notification rules" }}
        secondaryAction={{ href: "/dashboard/messages", label: "Open messages" }}
        suggestions={["action required", "seat changes", "privacy", "digests", "reminders", "venue perks"]}
        stats={[
          {
            icon: BellRing,
            label: "Live alerts",
            value: String(memberPortalData.notifications.length),
            detail: "Critical seat and reminder updates belong in a dedicated notification layer, not hidden inside the feed.",
            tone: "coral",
          },
          {
            icon: ShieldCheck,
            label: "Account signals",
            value: "1",
            detail: "Privacy, visibility, and billing alerts stay close to behavioral event notifications.",
            tone: "sage",
          },
          {
            icon: CalendarDays,
            label: "Event-linked",
            value: "2",
            detail: "The most important notification count is the number connected to a real upcoming event.",
            tone: "indigo",
          },
          {
            icon: Sparkles,
            label: "Discovery nudges",
            value: "1",
            detail: "Recommendation refreshes are useful, but they should not drown out operational alerts.",
            tone: "indigo",
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Surface
          eyebrow="Alert stream"
          title="Recent notifications"
          description="Every item exposes the channel, urgency, and timing so members can decide quickly what matters."
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
          description="Use clear lanes so operational alerts, account state, and discovery signals do not collapse into the same noise."
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
      description="Photo, languages, interests, event history, and the social trust signals that help organizers understand who is showing up."
      links={memberLinks(profile.slug, "profile")}
    >
      <CommandCenterDeck
        eyebrow="Profile command"
        title="Shape how organizers and venues read this member"
        description="This profile page should feel like a trust and fit surface, not a static bio. It carries event reliability, venue preference, social context, and room-fit signals."
        prompt="Scan trust markers, recent attendance, venue preferences, and the guidance a host actually needs before approving or welcoming this member."
        action={{ href: "/settings", label: "Edit profile settings" }}
        secondaryAction={{ href: "/events", label: "Browse matching events" }}
        suggestions={[
          "trust signals",
          "attendance trail",
          "venue fit",
          "profile strength",
          "organizer guidance",
          "privacy snapshot",
        ]}
        stats={[
          {
            icon: ShieldCheck,
            label: "Trust markers",
            value: String(profile.badges.length + profile.highlights.length),
            detail:
              "Badges and visible highlights are what make the profile useful for approvals instead of decorative.",
            tone: "sage",
          },
          {
            icon: CalendarDays,
            label: "Recent attendance",
            value: String(profile.recentAttendance.length),
            detail:
              "Attendance history gives hosts a clearer read on format fit, reliability, and social pacing.",
            tone: "indigo",
          },
          {
            icon: HeartHandshake,
            label: "Venue preferences",
            value: String(profile.venuePreferences.length),
            detail:
              "Preferred rooms help organizers seat people better and keep venue quality aligned with the member.",
            tone: "coral",
          },
          {
            icon: Sparkles,
            label: "Profile strength",
            value: profile.completion,
            detail:
              "Completion should feel like a useful quality score because stronger profiles improve trust across the marketplace.",
            tone: "indigo",
          },
        ]}
      />

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
              <AvatarStamp
                name={profile.name}
                src={getDashboardAvatar(profile.name)}
                tone="indigo"
                size="lg"
              />
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
          description="This public-facing context helps with approvals, seating, and event fit."
        >
          <ActivityFeed
            items={profile.highlights.map((highlight, index) => ({
              key: `highlight-${index}`,
              title: highlight,
              detail: "This is visible as part of the member trust layer inside organizer workflows.",
              meta: index === 0 ? "Core signal" : "Profile note",
              tone: index === 1 ? "sage" : "indigo",
            }))}
          />
        </Surface>

        <Surface
          eyebrow="Recent history"
          title="Groups and attended formats"
          description="A lighter version of event history and recurring community participation."
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
          description="A richer attendance record helps organizers and admin understand event fit, reliability, and social context."
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
          title="Venue fit and privacy snapshot"
          description="This combines venue preference signals with the profile privacy controls that shape what other users can see."
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
          description="This turns the profile into something organizers can actually use when deciding approvals, seating, and intros."
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
          description="These details help hosts greet the right way, keep the room comfortable, and avoid placing someone in the wrong format."
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
  const totalSettingsItems = memberPortalData.settingsSections.reduce(
    (count, section) => count + section.items.length,
    0,
  );

  return (
    <MemberShell
      eyebrow="Client settings"
      title="Profile, account, notifications, language, privacy, and billing"
      description="The settings area now covers the exact tab set from the spec, using clear section cards that can later bind directly to Supabase profile and billing data."
      links={memberLinks(memberProfile.slug, "settings")}
    >
      <CommandCenterDeck
        eyebrow="Settings command"
        title="Control visibility, language, notifications, and billing from one place"
        description="Settings should feel operational, not buried. This surface needs to make privacy, communication, and account controls easy to scan before the user starts editing."
        prompt="Review the settings lanes, decide what needs to change, and move into the interactive editor without losing account context."
        action={{ href: `/profile/${memberProfile.slug}` as Route, label: "Preview public profile" }}
        secondaryAction={{ href: "/dashboard", label: "Return to dashboard" }}
        suggestions={[
          "privacy controls",
          "notification rules",
          "language",
          "billing",
          "profile visibility",
          "saved drafts",
        ]}
        stats={[
          {
            icon: UserRound,
            label: "Settings tabs",
            value: String(memberPortalData.settingsSections.length),
            detail:
              "The member settings surface now mirrors the full product contract instead of collapsing into a few generic fields.",
            tone: "indigo",
          },
          {
            icon: BellRing,
            label: "Editable fields",
            value: String(totalSettingsItems),
            detail:
              "Breaking settings into specific values makes the eventual Supabase-backed version easier to trust and maintain.",
            tone: "coral",
          },
          {
            icon: Languages,
            label: "Locale-aware",
            value: "EN + IS",
            detail:
              "Language choice belongs close to communication and discovery settings because it changes the feel of the whole app.",
            tone: "sage",
          },
          {
            icon: WalletCards,
            label: "Billing lane",
            value: "Member-ready",
            detail:
              "Even before live billing is wired, the settings layer should already make premium and paid-event account behavior legible.",
            tone: "coral",
          },
        ]}
      />

      <Surface
        eyebrow="Tabs"
        title="Settings overview"
        description="Each section below corresponds to a real settings tab in the product contract."
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
        description="Edit section values locally, apply a privacy-safe preset, and save per-tab drafts without touching any live account."
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
      description="The calendar view turns RSVPs into a proper month surface so members can see crowded days, double-booking risk, and reminder timing at a glance."
      links={memberLinks(memberProfile.slug, "calendar")}
    >
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Surface
          eyebrow="March 2026"
          title="Your RSVP month"
          description="Confirmed events, waitlist positions, and stacked same-day events are all visible in one place."
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
          description="This companion rail keeps the next actions and member settings attached to the calendar."
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
