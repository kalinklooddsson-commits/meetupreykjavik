import Link from "next/link";
import Image from "next/image";
import type { Route } from "next";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Clock3,
  Compass,
  FileText,
  Globe2,
  HandCoins,
  HeartHandshake,
  MapPin,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Ticket,
  UsersRound,
} from "lucide-react";
import { ContactForm } from "@/components/public/contact-form";
import {
  FilterChips,
  KeyValueList,
  Surface as BaseSurface,
  ToneBadge,
} from "@/components/dashboard/primitives";
import { categories } from "@/lib/home-data";
import {
  minimumTicketPriceIsk,
  aboutStats,
  aboutTeam,
  blogPosts,
  organizerTiers,
  pricingFaq,
  publicCategoryOptions,
  publicEvents,
  publicGroups,
  publicVenues,
  ticketCommissionRate,
  type BlogPost,
  type PublicEvent,
  type PublicGroup,
  type PublicVenue,
  userTiers,
  venueTiers,
} from "@/lib/public-data";
import { organizerPortalData, venuePortalData } from "@/lib/dashboard-data";
import {
  getFeaturedSourcedPlaces,
  getReykjavikSourceReport,
  type SourcedPlace,
} from "@/lib/reykjavik-source-data";
import { cn } from "@/lib/utils";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "Atlantic/Reykjavik",
});

const weekdayFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  timeZone: "Atlantic/Reykjavik",
});

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Atlantic/Reykjavik",
});

const generatedAtFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Atlantic/Reykjavik",
});


function eventHref(slug: string) {
  return `/events/${slug}` as Route;
}

function groupHref(slug: string) {
  return `/groups/${slug}` as Route;
}

function categoriesHref() {
  return "/categories" as Route;
}

function categoryHref(slug: string) {
  return `/categories/${slug}` as Route;
}

function venueHref(slug: string) {
  return `/venues/${slug}` as Route;
}

function blogHref(slug: string) {
  return `/blog/${slug}` as Route;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const categoryProfiles = {
  "nightlife-and-social": {
    description:
      "Hosted social rooms, lighter nightlife, and better arrival flow for people who want to meet without the usual chaos.",
    keywords: ["social", "nightlife", "expat"],
    audience: "Best for newcomers, hosted mingling, and repeat social formats.",
    venueSignal: "Works best in venues with a visible host desk, table clusters, and calmer early energy.",
  },
  "outdoors-and-hiking": {
    description:
      "Trail groups, movement-led meetups, and formats where the room is replaced by clear pacing and reliable hosts.",
    keywords: ["outdoors", "hike", "sports"],
    audience: "Best for people who prefer shared activity over standing-room conversation.",
    venueSignal: "Trailheads, pickup coordination, and simple post-hike cafe finishes matter more than venue polish.",
  },
  "tech-and-startups": {
    description:
      "Practical workshops, founder sessions, and discussion rooms that reward strong hosts and real implementation depth.",
    keywords: ["tech", "professional", "language"],
    audience: "Best for builders, operators, career switchers, and product-minded communities.",
    venueSignal: "Projector support, coffee, quiet seating, and repeatable classroom-style setups perform best.",
  },
  "music-and-arts": {
    description:
      "Gallery nights, live music, creative circles, and cultural formats that need atmosphere without losing structure.",
    keywords: ["arts", "music", "books"],
    audience: "Best for people who want softer social energy and more conversational room texture.",
    venueSignal: "Rooms with a stronger visual identity, softer lighting, and flexible linger space fit best.",
  },
  "food-and-drink": {
    description:
      "Tastings, supper-style formats, and hosted culinary events where the venue experience is part of the product.",
    keywords: ["food", "social"],
    audience: "Best for premium small-group formats and hosted discovery nights.",
    venueSignal: "Service quality, seated layouts, and clear pacing matter more than pure volume.",
  },
  "sports-and-fitness": {
    description:
      "Run clubs, active circles, and repeatable movement formats that depend on reliability more than spectacle.",
    keywords: ["sports", "outdoors"],
    audience: "Best for routine-led communities and low-friction recurring attendance.",
    venueSignal: "Pickup points, lockers, showers, and route clarity outperform elaborate branding.",
  },
  "language-exchange": {
    description:
      "Conversation-led rooms, newcomer integration, and bilingual formats that help Reykjavik feel more open.",
    keywords: ["language", "expat", "social"],
    audience: "Best for international members, mixed-language circles, and soft introductions.",
    venueSignal: "Quieter rooms, round tables, and moderators who can guide transitions work best.",
  },
  "expat-community": {
    description:
      "A social bridge for people building a life in Reykjavik and looking for events with better structure and trust.",
    keywords: ["expat", "social", "language"],
    audience: "Best for first-month arrivals, social resets, and repeat community touchpoints.",
    venueSignal: "Arrival visibility and host warmth matter more than novelty.",
  },
  "books-and-culture": {
    description:
      "Reading circles, cultural salons, and slower-paced rooms that benefit from editorial framing and calm venues.",
    keywords: ["books", "arts", "professional"],
    audience: "Best for reflective formats, small groups, and repeat conversation-based communities.",
    venueSignal: "Cafe-lounge hybrids and quieter partner rooms outperform nightlife spaces.",
  },
  professional: {
    description:
      "Career circles, operator meetups, and practical peer rooms that sit between community and serious work.",
    keywords: ["professional", "tech", "language"],
    audience: "Best for peer learning, small founder circles, and skill-sharing formats.",
    venueSignal: "Reliable Wi-Fi, presentation support, and lower-noise spaces make the difference.",
  },
} as const;

const categoryDirectory = categories.map((category) => {
  const slug = slugify(category.name);
  const profile = categoryProfiles[slug as keyof typeof categoryProfiles];

  return {
    ...category,
    slug,
    description: profile?.description ?? "A city-specific category with clear local event, group, and venue context.",
    keywords: profile?.keywords ?? [category.name.toLowerCase()],
    audience: profile?.audience ?? "Best for members looking for clearer local discovery.",
    venueSignal: profile?.venueSignal ?? "Works best when hosts, rooms, and event format reinforce each other.",
  };
});

function matchesCategoryText(text: string, keywords: readonly string[]) {
  const normalized = text.toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword));
}

function getCategoryBundle(slug: string) {
  const category = categoryDirectory.find((item) => item.slug === slug);

  if (!category) {
    return null;
  }

  const events = publicEvents.filter((event) =>
    matchesCategoryText(
      `${event.category} ${event.summary} ${event.groupName} ${event.area}`,
      category.keywords,
    ),
  );
  const groups = publicGroups.filter((group) =>
    matchesCategoryText(
      `${group.category} ${group.summary} ${group.tags.join(" ")} ${group.organizer}`,
      category.keywords,
    ),
  );
  const venues = publicVenues.filter((venue) => {
    const venueText = `${venue.type} ${venue.summary} ${venue.amenities.join(" ")}`;
    const venueEventMatch = venue.upcomingEventSlugs.some((eventSlug) =>
      events.some((event) => event.slug === eventSlug),
    );

    return venueEventMatch || matchesCategoryText(venueText, category.keywords);
  });

  return { category, events, groups, venues };
}

function formatEventDate(startsAt: string) {
  const date = new Date(startsAt);
  return `${weekdayFormatter.format(date)} ${dateFormatter.format(date)}`;
}

function formatEventTimeRange(startsAt: string, endsAt: string) {
  return `${timeFormatter.format(new Date(startsAt))} - ${timeFormatter.format(new Date(endsAt))}`;
}

function occupancyPercent(attendees: number, capacity: number) {
  if (!capacity) {
    return 0;
  }

  return Math.min(Math.round((attendees / capacity) * 100), 100);
}

function categoryTone(category: string) {
  const normalized = category.toLowerCase();

  if (normalized.includes("outdoor") || normalized.includes("sports")) {
    return "sage" as const;
  }

  if (normalized.includes("tech") || normalized.includes("language")) {
    return "indigo" as const;
  }

  if (normalized.includes("arts") || normalized.includes("music")) {
    return "sand" as const;
  }

  return "coral" as const;
}

function categoryBadgeClass(tone: (typeof categories)[number]["tone"]) {
  if (tone === "sage") {
    return "bg-[rgba(124,154,130,0.12)] text-[var(--brand-sage)]";
  }

  if (tone === "indigo") {
    return "bg-[var(--brand-indigo-soft)] text-[var(--brand-indigo)]";
  }

  if (tone === "sand") {
    return "bg-[var(--brand-sand)] text-[var(--brand-text)]";
  }

  return "bg-[var(--brand-coral-soft)] text-[var(--brand-coral-dark)]";
}

function HeroBand({
  eyebrow,
  title,
  description,
  background,
  metrics,
  primaryAction,
  secondaryAction,
}: {
  eyebrow: string;
  title: string;
  description: string;
  background: string;
  metrics: Array<{ label: string; value: string }>;
  primaryAction?: { href: Route; label: string };
  secondaryAction?: { href: Route; label: string };
}) {
  return (
    <section
      className="grain-overlay relative overflow-hidden border-b border-[rgba(221,215,203,0.76)]"
      style={{ background }}
    >
      <div className="ambient-orb float-slow left-[-5rem] top-[-4rem] h-52 w-52 bg-white/12" />
      <div className="ambient-orb drift-slow bottom-[-6rem] right-[-3rem] h-72 w-72 bg-[rgba(232,97,77,0.24)]" />
      <div className="ambient-orb drift-slow left-[45%] top-[16%] h-44 w-44 bg-[rgba(124,154,130,0.16)]" />
      <div className="section-shell relative z-10 py-16 text-white sm:py-20">
        <span className="eyebrow bg-white/10 px-4 py-2 text-white/70">{eyebrow}</span>
        <div className="mt-6 grid gap-10 xl:grid-cols-[1.05fr_0.95fr] xl:items-end">
          <div>
            <h1 className="font-editorial max-w-4xl text-5xl leading-[0.95] tracking-[-0.06em] sm:text-6xl lg:text-[4.8rem]">
              {title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/72">{description}</p>
            {primaryAction || secondaryAction ? (
              <div className="mt-8 flex flex-wrap gap-3">
                {primaryAction ? (
                  <Link
                    href={primaryAction.href}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--brand-coral)] px-6 py-3 text-sm font-bold text-white shadow-[0_18px_40px_rgba(232,97,77,0.28)] transition hover:-translate-y-0.5"
                  >
                    {primaryAction.label}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : null}
                {secondaryAction ? (
                  <Link
                    href={secondaryAction.href}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/18 bg-white/8 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                  >
                    {secondaryAction.label}
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="glass-panel rounded-[1.4rem] p-5"
              >
                <div className="text-xs font-bold uppercase tracking-[0.22em] text-white/54">
                  {metric.label}
                </div>
                <div className="font-editorial mt-3 text-4xl tracking-[-0.05em] text-white">
                  {metric.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MarketConfidenceStrip({
  items,
}: {
  items: Array<{
    title: string;
    description: string;
    tone: "indigo" | "coral" | "sage";
    icon: typeof Compass;
  }>;
}) {
  return (
    <section className="section-shell relative z-20 -mt-6 pb-3 sm:-mt-8 sm:pb-4">
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <article key={item.title} className="market-signal-card p-5">
            <div className="flex items-start gap-4">
              <span className="editorial-icon-chip">
                <item.icon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-bold tracking-[-0.02em] text-[var(--brand-text)]">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">
                  {item.description}
                </p>
                <div className="mt-3">
                  <ToneBadge tone={item.tone}>
                    {item.tone === "indigo"
                      ? "Trust signal"
                      : item.tone === "coral"
                        ? "Revenue signal"
                        : "Quality signal"}
                  </ToneBadge>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function DiscoveryCommandDeck({
  eyebrow,
  title,
  description,
  prompt,
  action,
  secondaryAction,
  suggestions,
  stats,
}: {
  eyebrow: string;
  title: string;
  description: string;
  prompt: string;
  action: { href: Route; label: string };
  secondaryAction?: { href: Route; label: string };
  suggestions: string[];
  stats: Array<{
    label: string;
    value: string;
    description: string;
    icon: typeof Compass;
  }>;
}) {
  return (
    <Surface
      eyebrow={eyebrow}
      title={title}
      description={description}
      className="overflow-hidden"
    >
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="market-command-panel p-5 sm:p-6">
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-text-light)]">
            Search-led flow
          </div>
          <div className="market-command-input mt-4 p-4 sm:p-5">
            <div className="flex items-start gap-4">
              <span className="editorial-icon-chip shrink-0">
                <ScanSearch className="h-5 w-5" />
              </span>
              <div>
                <div className="text-base font-semibold tracking-[-0.02em] text-[var(--brand-text)]">
                  {prompt}
                </div>
                <p className="mt-2 max-w-xl text-sm leading-7 text-[var(--brand-text-muted)]">
                  Search should be the primary conversion action. This surface frames
                  discovery the way a serious marketplace does: clear entry points,
                  trust filters, and a visible next step.
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <ToneBadge
                  key={suggestion}
                  tone={index % 3 === 0 ? "indigo" : index % 3 === 1 ? "coral" : "sage"}
                >
                  {suggestion}
                </ToneBadge>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={action.href}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--brand-indigo)] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5"
              >
                {action.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
              {secondaryAction ? (
                <Link
                  href={secondaryAction.href}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[rgba(79,70,229,0.16)] bg-white/78 px-5 py-3 text-sm font-semibold text-[var(--brand-indigo)] transition hover:-translate-y-0.5"
                >
                  {secondaryAction.label}
                </Link>
              ) : null}
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              {
                icon: MapPin,
                label: "Neighborhood-first",
                value: "Laugavegur, Grandi, Harbor",
              },
              {
                icon: ShieldCheck,
                label: "Trust filters",
                value: "Host-approved, newcomer-safe, venue-backed",
              },
            ].map((item) => (
              <div key={item.label} className="market-metric-tile p-4">
                <div className="flex items-center gap-3">
                  <span className="editorial-icon-chip h-10 w-10 rounded-[0.95rem]">
                    <item.icon className="h-4 w-4" />
                  </span>
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-text-light)]">
                    {item.label}
                  </div>
                </div>
                <div className="mt-3 text-sm leading-7 text-[var(--brand-text)]">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {stats.map((stat) => (
            <article key={stat.label} className="market-metric-tile p-5">
              <span className="editorial-icon-chip">
                <stat.icon className="h-5 w-5" />
              </span>
              <div className="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-text-light)]">
                {stat.label}
              </div>
              <div className="font-editorial mt-2 text-3xl tracking-[-0.05em] text-[var(--brand-text)]">
                {stat.value}
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">
                {stat.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </Surface>
  );
}

type EditorialSurfaceProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: Route;
  children: ReactNode;
  className?: string;
};

function Surface({
  eyebrow,
  title,
  description,
  actionLabel,
  actionHref,
  children,
  className,
}: EditorialSurfaceProps) {
  return (
    <BaseSurface
      eyebrow={eyebrow}
      title={title}
      description={description}
      actionLabel={actionLabel}
      actionHref={actionHref}
      className={cn(
        "paper-panel-premium editorial-shell rounded-[1.9rem] border border-[rgba(255,255,255,0.74)]",
        className,
      )}
    >
      {children}
    </BaseSurface>
  );
}

function EventCard({
  event,
  href = eventHref(event.slug),
}: {
  event: PublicEvent;
  href?: Route;
}) {
  const fill = occupancyPercent(event.attendees, event.capacity);
  const startsAt = new Date(event.startsAt);
  const badgeDay = startsAt.toLocaleString("en-GB", {
    day: "numeric",
    timeZone: "Atlantic/Reykjavik",
  });
  const badgeMonth = startsAt
    .toLocaleString("en-GB", {
      month: "short",
      timeZone: "Atlantic/Reykjavik",
    })
    .toUpperCase();

  return (
    <article className="marketplace-card rounded-[1.7rem]">
      <div className="grain-overlay relative h-48" style={{ background: event.art }} aria-hidden="true">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(30,27,46,0.06),rgba(30,27,46,0.58))]" />
        <div className="relative z-10 flex h-full flex-col justify-between p-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="rounded-2xl bg-white px-3 py-2 text-center text-[var(--brand-text)] shadow-[0_10px_24px_rgba(42,38,56,0.16)]">
              <div className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-[var(--brand-coral)]">
                {badgeMonth}
              </div>
              <div className="text-2xl font-black tracking-[-0.05em]">{badgeDay}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              <ToneBadge tone={categoryTone(event.category)}>{event.category}</ToneBadge>
              <span className="rounded-full bg-white/12 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-white/88">
                {event.eventType.replace("_", " ")}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/14 px-3 py-1.5 text-xs font-semibold text-white/88">
              {event.priceLabel}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/74">
              {event.ageLabel}
            </span>
          </div>
        </div>
      </div>
      <div className="p-5 sm:p-6">
        <h2 className="font-editorial mt-4 text-3xl tracking-[-0.05em] text-[var(--brand-text)]">
          {event.title}
        </h2>
        <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">{event.summary}</p>
        <div className="mt-5 grid gap-3 text-sm text-[var(--brand-text-muted)] sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-[var(--brand-coral)]" />
            {formatEventDate(event.startsAt)}
          </div>
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-[var(--brand-coral)]" />
            {formatEventTimeRange(event.startsAt, event.endsAt)}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[var(--brand-coral)]" />
            {event.venueName}
          </div>
          <div className="flex items-center gap-2">
            <UsersRound className="h-4 w-4 text-[var(--brand-coral)]" />
            {event.attendees} / {event.capacity} going
          </div>
        </div>
        <div className="mt-5">
          <div className="flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-text-light)]">
            <span>Seat fill</span>
            <span>{fill}%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-[rgba(245,240,232,0.9)]">
            <div
              className="h-2 rounded-full bg-[linear-gradient(90deg,var(--brand-indigo),var(--brand-coral))]"
              style={{ width: `${fill}%` }}
            />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-[var(--brand-text)]">{event.groupName}</div>
            <div className="mt-1 text-sm text-[var(--brand-text-muted)]">{event.priceLabel}</div>
          </div>
          <Link
            href={href}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--brand-indigo)] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5"
          >
            View event
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function GroupCard({
  group,
  upcomingTitle,
}: {
  group: PublicGroup;
  upcomingTitle?: string;
}) {
  return (
    <article className="marketplace-card rounded-[1.7rem]">
      <div className="relative h-40" style={{ background: group.banner }} aria-hidden="true">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(30,27,46,0.04),rgba(30,27,46,0.42))]" />
      </div>
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <ToneBadge tone={categoryTone(group.category)}>{group.category}</ToneBadge>
          <ToneBadge tone="sage">{group.activity}% active</ToneBadge>
        </div>
        <h2 className="font-editorial mt-4 text-3xl tracking-[-0.05em] text-[var(--brand-text)]">
          {group.name}
        </h2>
        <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">{group.summary}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {group.tags.map((tag) => (
            <ToneBadge key={tag} tone="neutral">
              {tag}
            </ToneBadge>
          ))}
        </div>
        <div className="mt-6 grid gap-3 text-sm text-[var(--brand-text-muted)] sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <UsersRound className="h-4 w-4 text-[var(--brand-coral)]" />
            {group.members} members
          </div>
          <div className="flex items-center gap-2">
            <HeartHandshake className="h-4 w-4 text-[var(--brand-coral)]" />
            Organized by {group.organizer}
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-[var(--brand-text-muted)]">
            {upcomingTitle ? `Next up: ${upcomingTitle}` : "No public event queued yet"}
          </div>
          <Link
            href={groupHref(group.slug)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--brand-indigo)] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5"
          >
            View group
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function VenueCard({ venue }: { venue: PublicVenue }) {
  const nextEvent = publicEvents.find((event) => venue.upcomingEventSlugs.includes(event.slug));

  return (
    <article className="marketplace-card rounded-[1.7rem]">
      <div className="relative h-40" style={{ background: venue.art }} aria-hidden="true">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(30,27,46,0.06),rgba(30,27,46,0.52))]" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-white">
          <div>
            <div className="text-lg font-bold tracking-[-0.02em]">{venue.name}</div>
            <div className="mt-1 text-sm text-white/76">{venue.type} · {venue.area}</div>
          </div>
          <span className="rounded-full bg-white/12 px-3 py-1.5 text-sm font-bold text-white/92">
            {venue.rating}
          </span>
        </div>
      </div>
      <div className="p-5 sm:p-6">
        <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">{venue.summary}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {venue.amenities.slice(0, 3).map((amenity) => (
            <ToneBadge key={amenity} tone="neutral">
              {amenity}
            </ToneBadge>
          ))}
        </div>
        <div className="mt-6 grid gap-3 text-sm text-[var(--brand-text-muted)] sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-[var(--brand-coral)]" />
            {venue.rating} rating
          </div>
          <div className="flex items-center gap-2">
            <UsersRound className="h-4 w-4 text-[var(--brand-coral)]" />
            Capacity {venue.capacity}
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-[var(--brand-text-muted)]">
            {nextEvent ? `Upcoming: ${nextEvent.title}` : "Open for new bookings"}
          </div>
          <Link
            href={venueHref(venue.slug)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--brand-indigo)] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5"
          >
            View venue
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="paper-panel-premium overflow-hidden rounded-[1.7rem]">
      <div className="relative h-44" style={{ background: post.hero }} aria-hidden="true">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(30,27,46,0.02),rgba(30,27,46,0.52))]" />
      </div>
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <ToneBadge tone="indigo">{post.category}</ToneBadge>
          <ToneBadge tone="sand">{post.readTime}</ToneBadge>
        </div>
        <h2 className="font-editorial mt-4 text-3xl tracking-[-0.05em] text-[var(--brand-text)]">
          {post.title}
        </h2>
        <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">{post.excerpt}</p>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-[var(--brand-text-muted)]">{post.publishedAt}</div>
          <Link
            href={blogHref(post.slug)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--brand-indigo)] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5"
          >
            Read article
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function SourcedPlaceCard({ place }: { place: SourcedPlace }) {
  return (
    <article className="photo-card">
      <div className="relative h-52 bg-[linear-gradient(135deg,rgba(30,27,46,0.96),rgba(79,70,229,0.84),rgba(232,97,77,0.72))]">
        {place.image?.localPath ? (
          <Image
            fill
            alt={place.name}
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
            src={place.image.localPath}
          />
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(30,27,46,0.08),rgba(30,27,46,0.62))]" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <div className="flex flex-wrap items-center gap-2">
            <ToneBadge tone="sand">{place.laneLabel}</ToneBadge>
            <ToneBadge tone="coral">{place.kindLabel}</ToneBadge>
          </div>
          <h3 className="font-editorial mt-3 text-3xl tracking-[-0.05em]">
            {place.name}
          </h3>
          <p className="mt-2 text-sm text-white/74">{place.area}</p>
        </div>
      </div>
      <div className="space-y-4 p-5">
        <p className="text-sm leading-7 text-[var(--brand-text-muted)]">
          {place.summary}
        </p>
        <div className="space-y-2 text-sm text-[var(--brand-text-muted)]">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[var(--brand-coral)]" />
            {place.address || place.area}
          </div>
          {place.website ? (
            <a
              href={place.website}
              className="inline-flex items-center gap-2 font-semibold text-[var(--brand-indigo)]"
              rel="noreferrer"
              target="_blank"
            >
              <Globe2 className="h-4 w-4" />
              Website
            </a>
          ) : null}
        </div>
        {place.image ? (
          <div className="rounded-[1.1rem] bg-[rgba(245,240,232,0.92)] px-4 py-3 text-xs leading-6 text-[var(--brand-text-muted)]">
            Photo credit: {place.image.credit || "Wikimedia Commons"} · {place.image.license}
          </div>
        ) : null}
      </div>
    </article>
  );
}

function GlassStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Compass;
  label: string;
  value: string;
}) {
  return (
    <div className="paper-panel-premium rounded-[1.35rem] p-4">
      <span className="editorial-icon-chip">
        <Icon className="h-5 w-5" />
      </span>
      <div className="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-text-light)]">
        {label}
      </div>
      <div className="font-editorial mt-2 text-3xl tracking-[-0.05em] text-[var(--brand-text)]">
        {value}
      </div>
    </div>
  );
}

function TierCard({
  title,
  price,
  description,
  features,
  tone,
}: {
  title: string;
  price: string;
  description: string;
  features?: readonly string[];
  tone: "indigo" | "coral" | "sage";
}) {
  const accentClass =
    tone === "coral"
      ? "from-[rgba(232,97,77,0.18)] to-[rgba(245,240,232,0.9)]"
      : tone === "sage"
        ? "from-[rgba(124,154,130,0.18)] to-[rgba(245,240,232,0.92)]"
        : "from-[rgba(79,70,229,0.16)] to-[rgba(245,240,232,0.92)]";

  return (
    <article className="sales-tier-card rounded-[1.8rem]">
      <div className={`bg-gradient-to-br ${accentClass} p-6`}>
        <div className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-text-light)]">
          {title}
        </div>
        <div className="font-editorial mt-4 text-5xl tracking-[-0.06em] text-[var(--brand-text)]">
          {price}
        </div>
        <p className="mt-4 max-w-sm text-sm leading-7 text-[var(--brand-text-muted)]">
          {description}
        </p>
      </div>
      {features ? (
        <div className="p-6">
          <div className="space-y-3">
            {features.map((feature) => (
              <div
                key={feature}
                className="editorial-list-card flex items-start gap-3 px-4 py-3"
              >
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-sage)]" />
                <span className="text-sm text-[var(--brand-text)]">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}

export function EventsIndexScreen() {
  const paidEvents = publicEvents.filter((event) => !event.isFree).length;
  const venueCount = new Set(publicEvents.map((event) => event.venueSlug)).size;

  return (
    <>
      <HeroBand
        eyebrow="Events"
        title="Browse the city one well-shaped event at a time."
        description="The event layer is built around quality: hosted formats, clear venue context, and discovery that feels curated instead of noisy."
        background="linear-gradient(160deg, rgba(30,27,46,1) 0%, rgba(55,48,163,0.96) 42%, rgba(232,97,77,0.86) 100%)"
        metrics={[
          { label: "Live events", value: String(publicEvents.length) },
          { label: "Paid formats", value: String(paidEvents) },
          { label: "Partner venues", value: String(venueCount) },
          { label: "Ticket floor", value: `${minimumTicketPriceIsk} ISK` },
        ]}
        primaryAction={{ href: "/signup", label: "Create account" }}
        secondaryAction={{ href: "/groups", label: "Explore groups" }}
      />

      <MarketConfidenceStrip
        items={[
          {
            icon: ShieldCheck,
            title: "Hosted arrival matters",
            description:
              "The strongest events make solo attendance legible from the first minute, not just exciting in the hero copy.",
            tone: "indigo",
          },
          {
            icon: Ticket,
            title: "Paid formats set a floor",
            description:
              `Ticketed experiences now start at ${minimumTicketPriceIsk} ISK, which positions the platform as a serious marketplace instead of a hobby feed.`,
            tone: "coral",
          },
          {
            icon: Store,
            title: "Venue context raises trust",
            description:
              "Partner venues and room-fit cues make discovery feel calmer and more credible than a generic city events list.",
            tone: "sage",
          },
        ]}
      />

      <section className="section-shell py-10">
        <DiscoveryCommandDeck
          eyebrow="Discovery command"
          title="Search-first discovery, not a passive feed"
          description="The index page now signals how members should evaluate formats: by trust, venue, timing, and price clarity."
          prompt="Search events, hosts, formats, and rooms across Reykjavik."
          action={{ href: "/signup", label: "Start browsing as a member" }}
          secondaryAction={{ href: "/pricing", label: "See ticket economics" }}
          suggestions={[
            "newcomer-friendly",
            "host-approved",
            "500-1500 ISK",
            "weekend social",
            "premium seated",
            "partner venue",
          ]}
          stats={[
            {
              icon: CalendarDays,
              label: "Weekly shape",
              value: "2 flagship nights",
              description:
                "The strongest revenue and community formats are anchored around weekend and post-work attendance windows.",
            },
            {
              icon: Ticket,
              label: "Paid density",
              value: `${paidEvents} / ${publicEvents.length}`,
              description:
                "The live set now reads as monetizable inventory instead of a mostly free community board.",
            },
            {
              icon: Sparkles,
              label: "Curated lanes",
              value: "Social, expat, tech",
              description:
                "The current inventory clusters around categories that are easiest to curate, review, and repeat.",
            },
            {
              icon: MapPin,
              label: "Venue spread",
              value: `${venueCount} neighborhoods`,
              description:
                "Venue-backed discovery gives the marketplace a city-map feel even before live map filtering is wired.",
            },
          ]}
        />

        <Surface
          eyebrow="Discovery filters"
          title="This week across Reykjavik"
          description="This is the operational discovery layer: category, timing, price, and venue signals arranged the way a strong city marketplace should present them."
        >
          <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <FilterChips
                items={publicCategoryOptions.map((category, index) => ({
                  key: category,
                  label: category,
                  active: index === 0,
                  tone:
                    index % 3 === 0 ? "indigo" : index % 3 === 1 ? "coral" : "sage",
                }))}
              />
              <FilterChips
                items={["Today", "This Week", "Weekend", "Month"].map((label, index) => ({
                  key: label,
                  label,
                  active: label === "This Week",
                  tone: index % 2 === 0 ? "coral" : "sage",
                }))}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <GlassStat icon={CalendarDays} label="Weekend-heavy" value="2 flagship nights" />
              <GlassStat icon={Ticket} label="Paid formats" value={`${paidEvents} monetized events`} />
              <GlassStat icon={Store} label="Venue spread" value="5 neighborhoods" />
            </div>
          </div>
        </Surface>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="grid gap-6">
            {publicEvents.map((event) => (
              <EventCard key={event.slug} event={event} />
            ))}
          </div>

          <div className="space-y-6">
            <Surface
              eyebrow="Signals"
              title="What the feed is emphasizing"
              description="The strongest inventory right now clusters around hosted social, expat onboarding, and practical technical sessions."
            >
              <div className="space-y-3">
                {[
                  "Hosted formats are outperforming unstructured drop-in events.",
                  "Venue-backed arrivals are a consistent quality signal for newcomers.",
                  "Premium small-format inventory is limited but highly reviewable.",
                ].map((item) => (
                  <div
                    key={item}
                    className="editorial-list-card px-4 py-3 text-sm leading-7 text-[var(--brand-text-muted)]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </Surface>

            <Surface
              eyebrow="Next move"
              title="Need a steadier social rhythm?"
              description="Events work better when they sit inside real communities. If the feed helps you discover a format, the group layer helps you keep it."
              actionHref="/groups"
              actionLabel="See groups"
            >
              <div className="grid gap-3">
                {publicGroups.slice(0, 3).map((group) => (
                  <Link
                    key={group.slug}
                    href={groupHref(group.slug)}
                    className="editorial-link-card px-4 py-4 text-sm"
                  >
                    <div className="font-semibold text-[var(--brand-text)]">{group.name}</div>
                    <p className="mt-2 leading-7 text-[var(--brand-text-muted)]">
                      {group.summary}
                    </p>
                  </Link>
                ))}
              </div>
            </Surface>
          </div>
        </div>
      </section>
    </>
  );
}

export function EventDetailScreen({ event }: { event: PublicEvent }) {
  const group = publicGroups.find((item) => item.slug === event.groupSlug);
  const venue = publicVenues.find((item) => item.slug === event.venueSlug);
  const relatedEvents = publicEvents
    .filter(
      (item) =>
        item.slug !== event.slug &&
        (item.groupSlug === event.groupSlug || item.venueSlug === event.venueSlug),
    )
    .slice(0, 3);

  return (
    <>
      <HeroBand
        eyebrow={`${event.category} event`}
        title={event.title}
        description={event.summary}
        background={event.art}
        metrics={[
          { label: "Date", value: formatEventDate(event.startsAt) },
          { label: "Time", value: timeFormatter.format(new Date(event.startsAt)) },
          { label: "Attendees", value: `${event.attendees}/${event.capacity}` },
          { label: "Price", value: event.priceLabel },
        ]}
        primaryAction={{ href: "/signup", label: "RSVP or join" }}
        secondaryAction={group ? { href: groupHref(group.slug), label: "View host group" } : undefined}
      />

      <MarketConfidenceStrip
        items={[
          {
            icon: ShieldCheck,
            title: "Host quality stays legible",
            description:
              event.approvalLabel,
            tone: "indigo",
          },
          {
            icon: HandCoins,
            title: event.isFree ? "Seat value is still visible" : "Paid seat logic is explicit",
            description: event.isFree
              ? "Free events still need clear room quality, host context, and reminder discipline so attendance feels intentional."
              : `${event.priceLabel} tickets are easier to justify when the page shows the host, the room, and what the format is actually buying people.`,
            tone: "coral",
          },
          {
            icon: Store,
            title: "Venue fit supports conversion",
            description: venue
              ? `${venue.name} gives the event a stronger sense of room quality, arrival feel, and local trust before someone commits.`
              : "Venue context belongs on the detail page so members can judge the room before checkout.",
            tone: "sage",
          },
        ]}
      />

      <section className="section-shell py-10">
        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-6">
            <Surface
              eyebrow="Event format"
              title="Why this event belongs on the platform"
              description="This event detail view combines the atmosphere, logistics, host context, and social proof that the spec expects."
            >
              <div className="space-y-4">
                {event.description.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-sm leading-8 text-[var(--brand-text-muted)]"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </Surface>

            <Surface
              eyebrow="Gallery direction"
              title="Visual atmosphere"
              description="The detail page already supports a richer gallery rhythm instead of a single hero image."
            >
              <div className="grid gap-4 md:grid-cols-3">
                {event.gallery.map((art, index) => (
                  <div
                    key={`${event.slug}-gallery-${index}`}
                    className="h-40 rounded-[1.35rem]"
                    style={{ background: art }}
                    aria-hidden="true"
                  />
                ))}
              </div>
            </Surface>

            <div className="grid gap-6 xl:grid-cols-2">
              <Surface
                eyebrow="Comments"
                title="Community pulse"
                description="Short comments help newcomers assess whether the format is welcoming and well run."
              >
                <div className="space-y-3">
                  {event.comments.map((comment) => (
                    <div
                      key={`${comment.author}-${comment.postedAt}`}
                      className="editorial-list-card p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-semibold text-[var(--brand-text)]">
                          {comment.author}
                        </div>
                        <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-text-light)]">
                          {comment.postedAt}
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">
                        {comment.text}
                      </p>
                    </div>
                  ))}
                </div>
              </Surface>

              <Surface
                eyebrow="Ratings"
                title="Attendee feedback"
                description="Ratings reinforce trust on both the event and venue side."
              >
                <div className="space-y-3">
                  {event.ratings.map((rating) => (
                    <div
                      key={`${rating.author}-${rating.rating}`}
                      className="editorial-list-card p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-semibold text-[var(--brand-text)]">
                          {rating.author}
                        </div>
                        <div className="flex items-center gap-1 text-[var(--brand-coral)]">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="text-sm font-semibold">{rating.rating}/5</span>
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">
                        {rating.text}
                      </p>
                    </div>
                  ))}
                </div>
              </Surface>
            </div>
          </div>

          <div className="space-y-6">
            <Surface
              eyebrow="Quick facts"
              title="Seat, venue, and access"
              description="Everything a member needs before deciding whether this is the right room, time, and format."
            >
              <KeyValueList
                items={[
                  { key: "date", label: "Date", value: formatEventDate(event.startsAt) },
                  {
                    key: "time",
                    label: "Time",
                    value: formatEventTimeRange(event.startsAt, event.endsAt),
                  },
                  { key: "venue", label: "Venue", value: event.venueName },
                  { key: "group", label: "Host group", value: event.groupName },
                  { key: "price", label: "Ticket", value: event.priceLabel },
                  { key: "age", label: "Age", value: event.ageLabel },
                ]}
              />
              <div className="editorial-muted-panel mt-5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-[var(--brand-text)]">
                    Capacity progress
                  </div>
                  <div className="text-sm text-[var(--brand-text-muted)]">
                    {event.attendees}/{event.capacity} seats
                  </div>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white/90">
                  <div
                    className="h-2 rounded-full bg-[linear-gradient(90deg,var(--brand-indigo),var(--brand-coral))]"
                    style={{ width: `${occupancyPercent(event.attendees, event.capacity)}%` }}
                  />
                </div>
              </div>
            </Surface>

            <Surface
              eyebrow="Decision tools"
              title="The details that drive conversion"
              description="Strong event products make the trust and logistics obvious before someone commits. This page now carries the same kind of decision clarity."
            >
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  {
                    title: "Visibility",
                    body: event.visibilityLabel,
                    Icon: Globe2,
                  },
                  {
                    title: "Approval model",
                    body: event.approvalLabel,
                    Icon: BadgeCheck,
                  },
                  {
                    title: "Reminder cadence",
                    body: event.reminderLabel,
                    Icon: CalendarDays,
                  },
                  {
                    title: "Host line",
                    body: `${event.hostContact}. ${event.shareLabel}.`,
                    Icon: HeartHandshake,
                  },
                ].map(({ title, body, Icon }) => (
                  <div key={title} className="editorial-list-card p-4">
                    <span className="editorial-icon-chip">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="mt-4 font-semibold text-[var(--brand-text)]">{title}</div>
                    <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">
                      {body}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Link
                  href="/signup"
                  className="editorial-link-card flex items-center justify-between gap-3 px-4 py-4"
                >
                  <div>
                    <div className="font-semibold text-[var(--brand-text)]">Reserve your seat</div>
                    <p className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">
                      Save the event, pay, and get reminders in one flow.
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-[var(--brand-indigo)]" />
                </Link>
                <Link
                  href={group ? groupHref(group.slug) : ("/contact" as Route)}
                  className="editorial-link-card flex items-center justify-between gap-3 px-4 py-4"
                >
                  <div>
                    <div className="font-semibold text-[var(--brand-text)]">Contact the host lane</div>
                    <p className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">
                      Review the group, ask questions, and understand the room before checkout.
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-[var(--brand-indigo)]" />
                </Link>
              </div>
            </Surface>

            {group ? (
              <Surface
                eyebrow="Host group"
                title={group.name}
                description={group.summary}
                actionHref={groupHref(group.slug)}
                actionLabel="Open group"
              >
                <KeyValueList
                  items={[
                    { key: "members", label: "Members", value: String(group.members) },
                    { key: "activity", label: "Activity", value: `${group.activity}%` },
                    { key: "organizer", label: "Organizer", value: group.organizer },
                  ]}
                />
              </Surface>
            ) : null}

            {venue ? (
              <Surface
                eyebrow="Venue partner"
                title={venue.name}
                description={venue.summary}
                actionHref={venueHref(venue.slug)}
                actionLabel="Open venue"
              >
                <KeyValueList
                  items={[
                    { key: "type", label: "Type", value: venue.type },
                    { key: "area", label: "Area", value: venue.area },
                    { key: "rating", label: "Rating", value: `${venue.rating}` },
                    { key: "deal", label: "Partner deal", value: venue.deal },
                  ]}
                />
              </Surface>
            ) : null}
          </div>
        </div>

        {relatedEvents.length ? (
          <div className="mt-8">
            <Surface
              eyebrow="More to explore"
              title="Related events"
              description="Similar rooms, host groups, or venue partners that someone interested in this event will likely want next."
            >
              <div className="grid gap-6 xl:grid-cols-3">
                {relatedEvents.map((item) => (
                  <EventCard key={item.slug} event={item} />
                ))}
              </div>
            </Surface>
          </div>
        ) : null}
      </section>
    </>
  );
}

export function GroupsIndexScreen() {
  const totalMembers = publicGroups.reduce((sum, group) => sum + group.members, 0);

  return (
    <>
      <HeroBand
        eyebrow="Groups"
        title="Communities with a point of view."
        description="Groups carry the recurring identity of the platform. They turn one-off event discovery into real participation and give organizers a durable layer to grow from."
        background="linear-gradient(160deg, rgba(245,240,232,0.96) 0%, rgba(79,70,229,0.84) 42%, rgba(232,97,77,0.9) 100%)"
        metrics={[
          { label: "Active groups", value: String(publicGroups.length) },
          { label: "Combined members", value: totalMembers.toLocaleString() },
          { label: "Recurring organizers", value: "12" },
          { label: "High-activity groups", value: "3" },
        ]}
        primaryAction={{ href: "/groups/new", label: "Start a group" }}
        secondaryAction={{ href: "/events", label: "See events" }}
      />

      <MarketConfidenceStrip
        items={[
          {
            icon: UsersRound,
            title: "Recurring identity wins",
            description:
              "Groups turn the platform from a transactional events board into a repeatable local network with memory and momentum.",
            tone: "indigo",
          },
          {
            icon: HeartHandshake,
            title: "Hosts stay accountable",
            description:
              "Organizer identity, discussion history, and visible past formats make groups feel safer and more trustworthy to join.",
            tone: "sage",
          },
          {
            icon: HandCoins,
            title: "Better groups support revenue",
            description:
              "Recurring communities create the right base for ticket sales, organizer subscriptions, and venue repeat business.",
            tone: "coral",
          },
        ]}
      />

      <section className="section-shell py-10">
        <DiscoveryCommandDeck
          eyebrow="Community finder"
          title="Search by host style, not just category"
          description="Strong groups are distinguished by cadence, organizer quality, and the type of social energy they create over time."
          prompt="Search weekly groups, newcomer circles, practical workshops, and recurring communities."
          action={{ href: "/groups/new", label: "Launch a group" }}
          secondaryAction={{ href: "/for-organizers", label: "See organizer positioning" }}
          suggestions={[
            "weekly rhythm",
            "newcomer-safe",
            "clear host",
            "discussion-led",
            "outdoor pace",
            "career-minded",
          ]}
          stats={[
            {
              icon: UsersRound,
              label: "Member network",
              value: totalMembers.toLocaleString(),
              description:
                "Group discovery now frames the network as a real participation layer, not a loose appendix to events.",
            },
            {
              icon: CalendarDays,
              label: "Recurring hosts",
              value: "12 active",
              description:
                "Repeat organizers are the operating backbone of the platform and should remain visible in the UI.",
            },
            {
              icon: Sparkles,
              label: "Best-fit lanes",
              value: "Expat, hiking, tech",
              description:
                "These lanes already show strong signals for repeat attendance and cleaner newcomer onboarding.",
            },
            {
              icon: FileText,
              label: "Discussion depth",
              value: "Threads + archive",
              description:
                "Conversation between events makes group pages feel alive even before real messaging data is wired.",
            },
          ]}
        />

        <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
          <div className="grid gap-6">
            {publicGroups.map((group) => (
              <GroupCard
                key={group.slug}
                group={group}
                upcomingTitle={
                  publicEvents.find((event) => group.upcomingEventSlugs.includes(event.slug))
                    ?.title
                }
              />
            ))}
          </div>

          <div className="space-y-6">
            <Surface
              eyebrow="What strong groups have in common"
              title="Signals the product should keep rewarding"
              description="The healthiest groups are legible, recurring, and easy for a first-timer to understand."
            >
              <div className="space-y-3">
                {[
                  "Clear arrival instructions and host structure beat vague social copy.",
                  "Groups with strong venue fit produce better repeat attendance.",
                  "A useful discussion layer keeps momentum alive between events.",
                ].map((item) => (
                  <div
                    key={item}
                    className="editorial-list-card px-4 py-3 text-sm leading-7 text-[var(--brand-text-muted)]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </Surface>

            <Surface
              eyebrow="Category mix"
              title="Where community energy is concentrated"
              description="This list mirrors the homepage taxonomy while giving groups their own discovery context."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {categories.map((category) => (
                  <div
                    key={category.name}
                    className="editorial-list-card px-4 py-3"
                  >
                    <div className="font-semibold text-[var(--brand-text)]">
                      {category.name}
                    </div>
                    <div className="mt-1 text-sm text-[var(--brand-text-muted)]">
                      {category.count} live signals
                    </div>
                  </div>
                ))}
              </div>
            </Surface>
          </div>
        </div>
      </section>
    </>
  );
}

export function GroupDetailScreen({ group }: { group: PublicGroup }) {
  const upcomingEvents = publicEvents.filter((event) =>
    group.upcomingEventSlugs.includes(event.slug),
  );

  return (
    <>
      <HeroBand
        eyebrow={`${group.category} group`}
        title={group.name}
        description={group.summary}
        background={group.banner}
        metrics={[
          { label: "Members", value: String(group.members) },
          { label: "Activity", value: `${group.activity}%` },
          { label: "Organizer", value: group.organizer },
          { label: "Upcoming events", value: String(upcomingEvents.length) },
        ]}
        primaryAction={{ href: "/signup", label: "Join this group" }}
        secondaryAction={{ href: "/events", label: "See events" }}
      />

      <MarketConfidenceStrip
        items={[
          {
            icon: UsersRound,
            title: "Recurring identity beats one-off reach",
            description:
              "Groups give the platform memory, rhythm, and clearer expectations than isolated events ever can.",
            tone: "indigo",
          },
          {
            icon: ShieldCheck,
            title: "Organizer trust stays visible",
            description: `${group.organizer} is attached to the page alongside activity, discussions, and past formats so newcomers can judge fit before joining.`,
            tone: "sage",
          },
          {
            icon: HandCoins,
            title: "Groups create commercial depth",
            description:
              "The strongest paid events usually emerge from recurring communities with clear hosts, not from cold listings with no history.",
            tone: "coral",
          },
        ]}
      />

      <section className="section-shell py-10">
        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-6">
            <Surface
              eyebrow="Group story"
              title="What this community is built around"
              description="A good group page should explain both the vibe and the operating logic."
            >
              <div className="space-y-4">
                {group.description.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-sm leading-8 text-[var(--brand-text-muted)]"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {group.tags.map((tag) => (
                  <ToneBadge key={tag} tone={categoryTone(group.category)}>
                    {tag}
                  </ToneBadge>
                ))}
              </div>
            </Surface>

            <Surface
              eyebrow="Discussion layer"
              title="What members are talking about"
              description="Discussion threads are part of the product depth, not an afterthought."
            >
              <div className="space-y-3">
                {group.discussions.map((discussion) => (
                  <div
                    key={discussion.title}
                    className="editorial-list-card p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold text-[var(--brand-text)]">
                        {discussion.title}
                      </div>
                      <ToneBadge tone="indigo">{discussion.replies} replies</ToneBadge>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">
                      {discussion.preview}
                    </p>
                  </div>
                ))}
              </div>
            </Surface>
          </div>

          <div className="space-y-6">
            <Surface
              eyebrow="At a glance"
              title="Membership and rhythm"
              description="The summary card gives first-time visitors enough context to decide whether to join."
            >
              <KeyValueList
                items={[
                  { key: "members", label: "Members", value: String(group.members) },
                  { key: "activity", label: "Activity score", value: `${group.activity}%` },
                  { key: "organizer", label: "Organizer", value: group.organizer },
                  {
                    key: "past-events",
                    label: "Past formats",
                    value: `${group.pastEvents.length} visible`,
                  },
                ]}
              />
            </Surface>

            <Surface
              eyebrow="Upcoming"
              title="Next events"
              description="Upcoming group events should stay attached directly to group identity."
            >
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <Link
                    key={event.slug}
                    href={eventHref(event.slug)}
                    className="editorial-link-card block p-4"
                  >
                    <div className="font-semibold text-[var(--brand-text)]">{event.title}</div>
                    <p className="mt-2 text-sm text-[var(--brand-text-muted)]">
                      {formatEventDate(event.startsAt)} · {event.venueName}
                    </p>
                  </Link>
                ))}
              </div>
            </Surface>

            <Surface
              eyebrow="Archive"
              title="Recent past events"
              description="Past event history helps a group feel real and gives newcomers a sense of the recurring format."
            >
              <div className="space-y-3">
                {group.pastEvents.map((item) => (
                  <div
                    key={item}
                    className="editorial-list-card px-4 py-3 text-sm text-[var(--brand-text-muted)]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </Surface>
          </div>
        </div>
      </section>
    </>
  );
}

export function VenuesIndexScreen() {
  const averageRating = (
    publicVenues.reduce((sum, venue) => sum + venue.rating, 0) / publicVenues.length
  ).toFixed(1);
  const sourceReport = getReykjavikSourceReport();
  const sourcedPlaces = getFeaturedSourcedPlaces(6);
  const generatedLabel = sourceReport.generatedAt
    ? generatedAtFormatter.format(new Date(sourceReport.generatedAt))
    : "";

  return (
    <>
      <HeroBand
        eyebrow="Venues"
        title="The rooms shape the community."
        description="Venue partnerships are a core layer of the product, not an add-on. Good rooms improve trust, event quality, and the local business loop at the same time."
        background="linear-gradient(160deg, rgba(30,27,46,1) 0%, rgba(79,70,229,0.92) 36%, rgba(245,240,232,0.92) 100%)"
        metrics={[
          { label: "Venue partners", value: String(publicVenues.length) },
          { label: "Average rating", value: averageRating },
          { label: "Premium inventory", value: "2 flagship rooms" },
          { label: "Open applications", value: "3" },
        ]}
        primaryAction={{ href: "/venue/onboarding", label: "Become a partner" }}
        secondaryAction={{ href: "/events", label: "See events" }}
      />

      <MarketConfidenceStrip
        items={[
          {
            icon: Store,
            title: "Rooms are part of the product",
            description:
              "Venue fit influences trust, arrival quality, event pacing, and the willingness of people to pay for a seat.",
            tone: "indigo",
          },
          {
            icon: Globe2,
            title: "Local place intake is real",
            description:
              "The frontend now has a live sourcebook path using Reykjavik place data and image matches instead of only mock venue art.",
            tone: "sage",
          },
          {
            icon: HandCoins,
            title: "Partner revenue is explicit",
            description:
              "Venue plans, member deals, and repeat bookings are treated as revenue surfaces, not just nice extras.",
            tone: "coral",
          },
        ]}
      />

      <section className="section-shell py-10">
        <DiscoveryCommandDeck
          eyebrow="Venue sourcebook"
          title="Search rooms by fit, capacity, and business value"
          description="Good venue discovery should let organizers judge the room, the commercial upside, and the local context in one pass."
          prompt="Search venue partners, room layouts, deal-ready hosts, and neighborhood context."
          action={{ href: "/venue/onboarding", label: "Apply as a venue partner" }}
          secondaryAction={{ href: "/for-venues", label: "See venue offer" }}
          suggestions={[
            "partner-ready",
            "quiet lounge",
            "nightlife room",
            "25-80 capacity",
            "premium tasting",
            "repeat bookings",
          ]}
          stats={[
            {
              icon: Store,
              label: "Partner rooms",
              value: String(publicVenues.length),
              description:
                "The venue layer is already presented as active commercial inventory instead of passive directory listings.",
            },
            {
              icon: Star,
              label: "Average rating",
              value: averageRating,
              description:
                "Quality scoring helps organizers shortlist rooms faster and gives members a clearer expectation of the experience.",
            },
            {
              icon: Globe2,
              label: "Source intake",
              value: `${sourceReport.counts.totalPlaces} places`,
              description:
                "The Reykjavik place intake gives us a live path to richer cards, images, and location intelligence.",
            },
            {
              icon: Sparkles,
              label: "Image matches",
              value: String(sourceReport.counts.imageCandidates),
              description:
                "Real image candidates reduce the reliance on generic gradients as we keep replacing mock visuals.",
            },
          ]}
        />

        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="grid gap-6">
            {publicVenues.map((venue) => (
              <VenueCard key={venue.slug} venue={venue} />
            ))}
          </div>

          <div className="space-y-6">
            <Surface
              eyebrow="Why venue partnerships matter"
              title="What strong partner rooms unlock"
              description="A venue-aware product can be calmer, more trustworthy, and more monetizable than a generic event feed."
            >
              <div className="space-y-3">
                {[
                  "Hosts can count on arrival support, layout, and clearer operating expectations.",
                  "Members learn which rooms fit which formats instead of guessing each time.",
                  "Venue deals and repeat bookings create a healthier business loop for the city.",
                ].map((item) => (
                  <div
                    key={item}
                    className="editorial-list-card px-4 py-3 text-sm leading-7 text-[var(--brand-text-muted)]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </Surface>

            <Surface
              eyebrow="Partner applications"
              title="What the venue product already covers"
              description="The platform now includes a real local onboarding wizard for venue partners, not just a placeholder shell."
            >
              <div className="grid gap-3">
                {[
                  "Business identity and legal profile",
                  "Address, capacity, and room constraints",
                  "Availability, deals, contacts, and billing",
                ].map((item) => (
                  <div
                    key={item}
                    className="editorial-list-card px-4 py-3 text-sm text-[var(--brand-text-muted)]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </Surface>

            {sourceReport.counts.totalPlaces ? (
              <Surface
                eyebrow="Live sourcebook"
                title="Real Reykjavik place intake has started"
                description={
                  generatedLabel
                    ? `This local source snapshot was generated on ${generatedLabel} from open-source place data and Wikimedia image matches.`
                    : "This local source snapshot is built from open-source place data and Wikimedia image matches."
                }
              >
                <KeyValueList
                  items={[
                    {
                      key: "places",
                      label: "Sourced places",
                      value: String(sourceReport.counts.totalPlaces),
                    },
                    {
                      key: "websites",
                      label: "With website",
                      value: String(sourceReport.counts.withWebsite),
                    },
                    {
                      key: "images",
                      label: "Image matches",
                      value: String(sourceReport.counts.imageCandidates),
                    },
                    {
                      key: "downloads",
                      label: "Downloaded locally",
                      value: String(sourceReport.counts.downloadedImages),
                    },
                  ]}
                />
                <div className="mt-5 grid gap-3">
                  {sourceReport.lanes.slice(0, 4).map((lane) => (
                    <div
                      key={lane.key}
                      className="editorial-list-card flex items-center justify-between gap-4 px-4 py-3"
                    >
                      <div className="font-semibold text-[var(--brand-text)]">
                        {lane.label}
                      </div>
                      <ToneBadge tone="indigo">{lane.count}</ToneBadge>
                    </div>
                  ))}
                </div>
              </Surface>
            ) : null}
          </div>
        </div>

        {sourcedPlaces.length ? (
          <div className="mt-8">
            <Surface
              eyebrow="Reykjavik source preview"
              title="Real place cards from the intake pipeline"
              description="These are sourced place records with local image files and attribution metadata. They give the frontend a path away from placeholder art while we keep building the product."
            >
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {sourcedPlaces.map((place) => (
                  <SourcedPlaceCard key={place.slug} place={place} />
                ))}
              </div>
            </Surface>
          </div>
        ) : null}
      </section>
    </>
  );
}

export function VenueDetailScreen({ venue }: { venue: PublicVenue }) {
  const upcomingEvents = publicEvents.filter((event) =>
    venue.upcomingEventSlugs.includes(event.slug),
  );

  return (
    <>
      <HeroBand
        eyebrow={`${venue.type} partner`}
        title={venue.name}
        description={venue.summary}
        background={venue.art}
        metrics={[
          { label: "Area", value: venue.area },
          { label: "Capacity", value: String(venue.capacity) },
          { label: "Rating", value: `${venue.rating}` },
          { label: "Upcoming", value: String(upcomingEvents.length) },
        ]}
        primaryAction={{ href: "/venue/onboarding", label: "Apply as a venue" }}
        secondaryAction={{ href: "/events", label: "See events here" }}
      />

      <MarketConfidenceStrip
        items={[
          {
            icon: Store,
            title: "Room fit is a conversion lever",
            description: `${venue.type} rooms that clearly explain capacity, atmosphere, and operating cues convert better with both organizers and members.`,
            tone: "indigo",
          },
          {
            icon: HandCoins,
            title: "Commercial upside is visible",
            description: `${venue.deal} signals that the venue layer is meant to drive repeat bookings, partner value, and real paid inventory.`,
            tone: "coral",
          },
          {
            icon: ShieldCheck,
            title: "Access context lowers friction",
            description:
              "Hours, address, amenities, and upcoming events give this venue page the confidence cues a serious booking product needs.",
            tone: "sage",
          },
        ]}
      />

      <section className="section-shell py-10">
        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-6">
            <Surface
              eyebrow="Venue story"
              title="What this room is good at"
              description="The venue page combines physical context, operational feel, and event fit in one place."
            >
              <div className="space-y-4">
                {venue.description.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-sm leading-8 text-[var(--brand-text-muted)]"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </Surface>

            <Surface
              eyebrow="Amenities"
              title="Room and service profile"
              description="These cues help organizers understand whether the space actually supports the event format."
            >
              <div className="grid gap-3 md:grid-cols-2">
                {venue.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="editorial-list-card px-4 py-3 text-sm text-[var(--brand-text-muted)]"
                  >
                    {amenity}
                  </div>
                ))}
              </div>
            </Surface>

            <Surface
              eyebrow="Gallery"
              title="Atmosphere previews"
              description="Venue detail pages should feel rich enough to judge the room before booking."
            >
              <div className="grid gap-4 md:grid-cols-3">
                {venue.gallery.map((art, index) => (
                  <div
                    key={`${venue.slug}-gallery-${index}`}
                    className="h-40 rounded-[1.35rem]"
                    style={{ background: art }}
                    aria-hidden="true"
                  />
                ))}
              </div>
            </Surface>
          </div>

          <div className="space-y-6">
            <Surface
              eyebrow="Quick facts"
              title="Access and operating context"
              description="The fact rail helps members, organizers, and venues converge on the same expectations."
            >
              <KeyValueList
                items={[
                  { key: "type", label: "Type", value: venue.type },
                  { key: "area", label: "Area", value: venue.area },
                  { key: "address", label: "Address", value: venue.address },
                  { key: "capacity", label: "Capacity", value: String(venue.capacity) },
                  { key: "deal", label: "Partner deal", value: venue.deal },
                ]}
              />
            </Surface>

            <Surface
              eyebrow="Hours"
              title="Opening and best-fit windows"
              description="Hours become more useful when the platform eventually aligns them with booking and availability logic."
            >
              <div className="space-y-3">
                {venue.hours.map((item) => (
                  <div
                    key={item.day}
                    className="editorial-list-card flex items-center justify-between gap-4 px-4 py-3"
                  >
                    <div className="font-semibold text-[var(--brand-text)]">{item.day}</div>
                    <div className="flex items-center gap-3">
                      {item.highlighted ? <ToneBadge tone="coral">Peak</ToneBadge> : null}
                      <div className="text-sm text-[var(--brand-text-muted)]">{item.open}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Surface>

            <Surface
              eyebrow="Upcoming"
              title="Public events at this venue"
              description="Upcoming events tie the venue page back into discovery."
            >
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <Link
                    key={event.slug}
                    href={eventHref(event.slug)}
                    className="editorial-link-card block p-4"
                  >
                    <div className="font-semibold text-[var(--brand-text)]">{event.title}</div>
                    <p className="mt-2 text-sm text-[var(--brand-text-muted)]">
                      {formatEventDate(event.startsAt)} · {event.groupName}
                    </p>
                  </Link>
                ))}
              </div>
            </Surface>
          </div>
        </div>
      </section>
    </>
  );
}

export function BlogIndexScreen() {
  return (
    <>
      <HeroBand
        eyebrow="Blog"
        title="Writing about local community design, not generic growth hacks."
        description="The editorial layer gives the product a stronger point of view: why formats work, how venues improve quality, and what makes a city-specific network feel better."
        background="linear-gradient(160deg, rgba(55,48,163,1) 0%, rgba(30,27,46,0.96) 50%, rgba(232,97,77,0.82) 100%)"
        metrics={[
          { label: "Published posts", value: String(blogPosts.length) },
          { label: "Editorial themes", value: "Product, community, venues" },
          { label: "Average read", value: "5 min" },
          { label: "Local focus", value: "100% Reykjavik" },
        ]}
      />

      <MarketConfidenceStrip
        items={[
          {
            icon: FileText,
            title: "Editorial voice is part of the brand",
            description:
              "The writing layer helps the product feel intentional before every operational system is fully live.",
            tone: "indigo",
          },
          {
            icon: ShieldCheck,
            title: "Good content improves trust",
            description:
              "Explaining how groups, events, and venues fit together makes the platform easier to understand and easier to buy into.",
            tone: "sage",
          },
          {
            icon: Sparkles,
            title: "Local angle beats generic advice",
            description:
              "A Reykjavik-specific editorial perspective is stronger than publishing interchangeable startup content.",
            tone: "coral",
          },
        ]}
      />

      <section className="section-shell py-10">
        <DiscoveryCommandDeck
          eyebrow="Editorial command"
          title="Show the product thesis through calm, local writing"
          description="The blog should help the brand dominate through clarity: why the marketplace exists, how the venue layer matters, and what better local event design actually looks like."
          prompt="Search community design, venue quality, host operations, and Reykjavik-specific product thinking."
          action={{ href: "/about", label: "See the product thesis" }}
          secondaryAction={{ href: "/events", label: "Browse live inventory" }}
          suggestions={[
            "local-first",
            "room quality",
            "host trust",
            "repeat communities",
            "venue economics",
            "editorial voice",
          ]}
          stats={[
            {
              icon: FileText,
              label: "Published posts",
              value: String(blogPosts.length),
              description:
                "The editorial layer already exists as a real route structure, not a dead marketing promise.",
            },
            {
              icon: Compass,
              label: "Content lane",
              value: "Product + community",
              description:
                "The strongest posts anchor the brand around local quality, better rooms, and more intentional formats.",
            },
            {
              icon: Store,
              label: "Venue angle",
              value: "Built in",
              description:
                "Editorial content keeps reinforcing that venues are operating partners inside the marketplace, not extras.",
            },
            {
              icon: Sparkles,
              label: "Brand tone",
              value: "Calm, premium, local",
              description:
                "That tone needs to be consistent across the blog, public routes, and dashboard surfaces.",
            },
          ]}
        />

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="grid gap-6">
            {blogPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>

          <div className="space-y-6">
            <Surface
              eyebrow="Editorial brief"
              title="What the content layer is doing"
              description="Blog content is not filler here. It reinforces product direction, community quality, and venue logic."
            >
              <div className="space-y-3">
                {[
                  "Explain why structure matters for newcomers.",
                  "Show how venue partnerships improve community quality.",
                  "Give the brand a calm, city-specific editorial voice.",
                ].map((item) => (
                  <div
                    key={item}
                    className="editorial-list-card px-4 py-3 text-sm leading-7 text-[var(--brand-text-muted)]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </Surface>
          </div>
        </div>
      </section>
    </>
  );
}

export function BlogDetailScreen({ post }: { post: BlogPost }) {
  const related = blogPosts.filter((item) => item.slug !== post.slug).slice(0, 2);

  return (
    <>
      <HeroBand
        eyebrow={post.category}
        title={post.title}
        description={post.excerpt}
        background={post.hero}
        metrics={[
          { label: "Published", value: post.publishedAt },
          { label: "Reading time", value: post.readTime },
          { label: "Category", value: post.category },
          { label: "Perspective", value: "Local-first" },
        ]}
      />

      <MarketConfidenceStrip
        items={[
          {
            icon: FileText,
            title: "Articles should sharpen the product thesis",
            description:
              "A strong post reinforces why the marketplace is structured the way it is instead of drifting into generic opinion.",
            tone: "indigo",
          },
          {
            icon: ShieldCheck,
            title: "Editorial trust compounds",
            description:
              "The more clearly the product explains room quality, host design, and local context, the easier it is for new users to trust it.",
            tone: "sage",
          },
          {
            icon: Sparkles,
            title: "Point of view matters",
            description:
              "The brand wins faster when its writing sounds like Reykjavik and product conviction, not copywriting filler.",
            tone: "coral",
          },
        ]}
      />

      <section className="section-shell py-10">
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            {post.sections.map((section) => (
              <Surface
                key={section.heading}
                eyebrow="Article section"
                title={section.heading}
                description="Each article section is rendered as a real editorial panel rather than placeholder prose."
              >
                <p className="text-sm leading-8 text-[var(--brand-text-muted)]">{section.body}</p>
              </Surface>
            ))}
          </div>

          <div className="space-y-6">
            <Surface
              eyebrow="Why it matters"
              title="Product context"
              description="Editorial content should always reinforce the product thesis instead of feeling disconnected from it."
            >
              <div className="space-y-3">
                {[
                  "City-specific products win when they understand local context better than global feeds.",
                  "Trust grows when event, group, and venue pages all tell the same story clearly.",
                  "A good brand voice makes the product feel intentional before the account system is even live.",
                ].map((item) => (
                  <div
                    key={item}
                    className="editorial-list-card px-4 py-3 text-sm leading-7 text-[var(--brand-text-muted)]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </Surface>

            {related.length ? (
              <Surface
                eyebrow="Continue reading"
                title="Related posts"
                description="Keep the editorial layer linked together."
              >
                <div className="space-y-4">
                  {related.map((item) => (
                    <Link
                      key={item.slug}
                      href={blogHref(item.slug)}
                      className="editorial-link-card block p-4"
                    >
                      <div className="font-semibold text-[var(--brand-text)]">{item.title}</div>
                      <p className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">
                        {item.excerpt}
                      </p>
                    </Link>
                  ))}
                </div>
              </Surface>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}

export function AboutScreen() {
  return (
    <>
      <HeroBand
        eyebrow="About"
        title="A local product for finding people, formats, and rooms that actually fit."
        description="MeetupReykjavik is designed as a warmer, sharper local layer for events, groups, and venue partnerships in Reykjavik."
        background="linear-gradient(160deg, rgba(245,240,232,1) 0%, rgba(79,70,229,0.86) 44%, rgba(30,27,46,0.96) 100%)"
        metrics={aboutStats.map((stat) => ({ label: stat.label, value: stat.value }))}
      />

      <MarketConfidenceStrip
        items={[
          {
            icon: Compass,
            title: "Local-first is the strategy",
            description:
              "This product is designed to feel more precise, calmer, and more useful in Reykjavik than generic global event feeds.",
            tone: "indigo",
          },
          {
            icon: HandCoins,
            title: "The business model is intentional",
            description:
              "The public product, organizer tooling, and venue partnerships are all designed to support a real company, not a side project.",
            tone: "coral",
          },
          {
            icon: Store,
            title: "Venues are in the core loop",
            description:
              "Room quality, partner deals, and venue operations are central to the marketplace rather than an afterthought.",
            tone: "sage",
          },
        ]}
      />

      <section className="section-shell py-10">
        <DiscoveryCommandDeck
          eyebrow="Product command"
          title="Understand the marketplace as one operating loop"
          description="The about page should quickly explain the full system: discovery, recurring communities, venue quality, and the commercial model that keeps it all coherent."
          prompt="Search people, events, groups, venue partners, and the business logic that connects them."
          action={{ href: "/events", label: "Explore the marketplace" }}
          secondaryAction={{ href: "/pricing", label: "See the revenue model" }}
          suggestions={[
            "local-first",
            "trust layers",
            "venue partners",
            "paid events",
            "recurring groups",
            "city context",
          ]}
          stats={[
            {
              icon: CalendarDays,
              label: "Public events",
              value: String(publicEvents.length),
              description:
                "The marketplace starts with live public discovery, not just a thesis slide and empty pages.",
            },
            {
              icon: UsersRound,
              label: "Recurring groups",
              value: String(publicGroups.length),
              description:
                "Groups give the system memory, host accountability, and better repeat participation.",
            },
            {
              icon: Store,
              label: "Venue partners",
              value: String(publicVenues.length),
              description:
                "Venue pages and partner workflows are already positioned as part of product quality and revenue.",
            },
            {
              icon: HandCoins,
              label: "Revenue rails",
              value: "Tickets + SaaS",
              description:
                "The product is explicitly built around paid events, organizer plans, and venue plans from the start.",
            },
          ]}
        />

        <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Surface
            eyebrow="Mission"
            title="What the platform is trying to improve"
            description="The product is not trying to be a generic marketplace. It is trying to make local discovery calmer, more trustworthy, and more connected to real venues."
          >
            <div className="space-y-4 text-sm leading-8 text-[var(--brand-text-muted)]">
              <p>
                Reykjavik is small enough that quality matters fast. If events feel random, hosts
                feel weak, or the rooms do not fit the format, people notice immediately.
              </p>
              <p>
                The platform responds to that by bringing event context, group identity, and venue
                fit into one system. That is the difference between a feed and an actual local
                product.
              </p>
            </div>
          </Surface>

          <Surface
            eyebrow="Pillars"
            title="The product loop"
            description="Three layers reinforce each other: people, organizers, and partner venues."
          >
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: UsersRound,
                  title: "Members",
                  text: "Profiles, RSVPs, and trust signals make attendance more legible.",
                },
                {
                  icon: Sparkles,
                  title: "Organizers",
                  text: "Recurring groups, event templates, and approvals create stronger formats.",
                },
                {
                  icon: Store,
                  title: "Venues",
                  text: "Rooms, deals, and availability tie community quality back to the city.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="editorial-list-card p-4"
                >
                  <span className="editorial-icon-chip">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <div className="font-semibold mt-4 text-[var(--brand-text)]">{item.title}</div>
                  <p className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </Surface>
        </div>

        <div className="mt-8">
          <Surface
            eyebrow="Team"
            title="Who is shaping it"
            description="The team layer is intentionally small, local, and product-minded."
          >
            <div className="grid gap-6 md:grid-cols-3">
              {aboutTeam.map((member) => (
                <div
                  key={member.name}
                  className="editorial-list-card p-5"
                >
                  <div className="font-editorial text-3xl tracking-[-0.05em] text-[var(--brand-text)]">
                    {member.name}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-[var(--brand-indigo)]">
                    {member.role}
                  </div>
                  <p className="mt-4 text-sm leading-7 text-[var(--brand-text-muted)]">
                    {member.note}
                  </p>
                </div>
              ))}
            </div>
          </Surface>
        </div>
      </section>
    </>
  );
}

export function PricingScreen() {
  return (
    <>
      <HeroBand
        eyebrow="Pricing"
        title="Built for paid events, paid organizers, and serious venue partners."
        description={`Members can join free, but the business model is deliberate: public ticketing starts at ${minimumTicketPriceIsk} ISK, organizers pay monthly to run the platform seriously, venues pay for workflow depth, and the platform earns ${ticketCommissionRate}% on paid ticket sales.`}
        background="linear-gradient(160deg, rgba(30,27,46,1) 0%, rgba(79,70,229,0.92) 42%, rgba(232,97,77,0.84) 100%)"
        metrics={[
          { label: "Member tiers", value: String(userTiers.length) },
          { label: "Organizer tiers", value: String(organizerTiers.length) },
          { label: "Ticket floor", value: `${minimumTicketPriceIsk} ISK` },
          { label: "Commission", value: `${ticketCommissionRate}%` },
        ]}
        primaryAction={{ href: "/for-organizers", label: "See organizer plans" }}
        secondaryAction={{ href: "/for-venues", label: "See venue plans" }}
      />

      <MarketConfidenceStrip
        items={[
          {
            icon: HandCoins,
            title: "The business model is deliberate",
            description:
              "Paid events, organizer subscriptions, and venue plans are positioned up front so the product reads like a real company from the first visit.",
            tone: "coral",
          },
          {
            icon: ShieldCheck,
            title: "Trust supports conversion",
            description:
              "The commercial model works better when members can see host quality, venue fit, and approval logic before they buy a ticket.",
            tone: "indigo",
          },
          {
            icon: Store,
            title: "Venues are revenue partners",
            description:
              "Venue workflows, featured placement, and repeat bookings are part of the operating model, not side benefits.",
            tone: "sage",
          },
        ]}
      />

      <section className="section-shell py-10">
        <DiscoveryCommandDeck
          eyebrow="Revenue model"
          title="How the platform compounds revenue across the marketplace"
          description="The pricing page now sells a coherent business system instead of just listing plans. That matters if this is supposed to dominate, not merely exist."
          prompt="Pick the lane that matches how you earn: attend, host, or operate a venue."
          action={{ href: "/for-organizers", label: "See organizer offer" }}
          secondaryAction={{ href: "/for-venues", label: "See venue offer" }}
          suggestions={[
            "500 ISK floor",
            "5% commission",
            "creator SaaS",
            "venue SaaS",
            "premium inventory",
            "repeat bookings",
          ]}
          stats={[
            {
              icon: Ticket,
              label: "Ticket economics",
              value: `${minimumTicketPriceIsk} ISK+`,
              description:
                "The public ticket floor prevents the product from looking like a free community board with no commercial discipline.",
            },
            {
              icon: HandCoins,
              label: "Platform take",
              value: `${ticketCommissionRate}%`,
              description:
                "The success-based commission aligns the platform with events that actually sell, not just listings that go live.",
            },
            {
              icon: Sparkles,
              label: "Organizer ladder",
              value: `${organizerTiers[0]?.price} to ${organizerTiers[2]?.price}`,
              description:
                "Organizers step up from simple public publishing into repeatable event operations, approvals, and audience tooling.",
            },
            {
              icon: Store,
              label: "Venue ladder",
              value: `${venueTiers[0]?.price} to ${venueTiers[2]?.price}`,
              description:
                "Venue plans move from visibility into real workflow software, analytics, and featured commercial inventory.",
            },
          ]}
        />

        <Surface
          eyebrow="Members"
          title="Member plans"
          description="Member access can stay low-friction while the operator side pays for the business. These plans support retention, priority access, and higher-intent usage."
        >
          <div className="grid gap-6 xl:grid-cols-3">
            {userTiers.map((tier, index) => (
              <TierCard
                key={tier.name}
                title={tier.name}
                price={tier.price}
                description={tier.description}
                features={tier.features}
                tone={index === 0 ? "indigo" : index === 1 ? "coral" : "sage"}
              />
            ))}
          </div>
        </Surface>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Surface
            eyebrow="Organizers"
            title="Creator plans"
            description="If someone is using MeetupReykjavik to publish, sell, and operate events, they should be paying for that operating layer."
          >
            <div className="grid gap-6 xl:grid-cols-3">
              {organizerTiers.map((tier, index) => (
                <TierCard
                  key={tier.name}
                  title={tier.name}
                  price={tier.price}
                  description={tier.description}
                  features={tier.features}
                  tone={index === 0 ? "indigo" : index === 1 ? "coral" : "sage"}
                />
              ))}
            </div>
          </Surface>

          <Surface
            eyebrow="Event economics"
            title="How the platform makes money"
            description="The commercial model is visible early so the product does not feel like an accidental hobby app later."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: "Paid public inventory",
                  body: `Default public ticket floor starts at ${minimumTicketPriceIsk} ISK so even smaller events have a real commercial baseline.`,
                },
                {
                  title: "Success-based take",
                  body: `${ticketCommissionRate}% commission aligns the platform with events that actually sell rather than just get posted.`,
                },
                {
                  title: "Organizer SaaS",
                  body: "Recurring hosts pay monthly for approvals, analytics, venue matching, and audience operations.",
                },
                {
                  title: "Venue SaaS",
                  body: "Venue partners pay for booking workflows, availability logic, deals, and featured visibility.",
                },
              ].map((item) => (
                <div key={item.title} className="editorial-list-card p-4">
                  <div className="font-semibold text-[var(--brand-text)]">{item.title}</div>
                  <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </Surface>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <Surface
            eyebrow="Venues"
            title="Venue partnership plans"
            description="Venue pricing starts with visibility, then moves into operational tooling, featured inventory, and premium analytics."
          >
            <div className="grid gap-6 xl:grid-cols-3">
              {venueTiers.map((tier, index) => (
                <TierCard
                  key={tier.name}
                  title={tier.name}
                  price={tier.price}
                  description={tier.description}
                  features={tier.features}
                  tone={index === 0 ? "indigo" : index === 1 ? "sage" : "coral"}
                />
              ))}
            </div>
          </Surface>

          <Surface
            eyebrow="FAQ"
            title="Commercial model notes"
            description="These answers stay visible even before payments, payouts, and subscriptions are live."
          >
            <div className="space-y-4">
              {pricingFaq.map((item) => (
                <div
                  key={item.question}
                  className="editorial-list-card p-4"
                >
                  <div className="font-semibold text-[var(--brand-text)]">{item.question}</div>
                  <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </Surface>
        </div>
      </section>
    </>
  );
}

export function PrivacyScreen() {
  const t = useTranslations("privacyPage");
  const sections = [
    {
      title: t("sections.identity.title"),
      copy: t("sections.identity.copy"),
      points: [
        t("sections.identity.point1"),
        t("sections.identity.point2"),
        t("sections.identity.point3"),
      ],
    },
    {
      title: t("sections.activity.title"),
      copy: t("sections.activity.copy"),
      points: [
        t("sections.activity.point1"),
        t("sections.activity.point2"),
        t("sections.activity.point3"),
      ],
    },
    {
      title: t("sections.comms.title"),
      copy: t("sections.comms.copy"),
      points: [
        t("sections.comms.point1"),
        t("sections.comms.point2"),
        t("sections.comms.point3"),
      ],
    },
  ];
  const rights = [
    {
      icon: ScanSearch,
      title: t("rights.access.title"),
      text: t("rights.access.text"),
    },
    {
      icon: FileText,
      title: t("rights.correct.title"),
      text: t("rights.correct.text"),
    },
    {
      icon: HandCoins,
      title: t("rights.billing.title"),
      text: t("rights.billing.text"),
    },
    {
      icon: Globe2,
      title: t("rights.locale.title"),
      text: t("rights.locale.text"),
    },
  ];

  return (
    <>
      <HeroBand
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        description={t("hero.description")}
        background="linear-gradient(160deg, rgba(245,240,232,0.98) 0%, rgba(79,70,229,0.8) 40%, rgba(30,27,46,0.96) 100%)"
        metrics={[
          { label: t("hero.metrics.visibility"), value: t("hero.values.visibility") },
          { label: t("hero.metrics.analytics"), value: t("hero.values.analytics") },
          { label: t("hero.metrics.export"), value: t("hero.values.export") },
          { label: t("hero.metrics.locale"), value: t("hero.values.locale") },
        ]}
      />

      <MarketConfidenceStrip
        items={[
          {
            icon: ShieldCheck,
            title: "Privacy is part of trust, not legal filler",
            description:
              "A local community product needs visible data boundaries if people are going to trust profiles, RSVPs, and room-based discovery.",
            tone: "indigo",
          },
          {
            icon: ScanSearch,
            title: "Member rights stay understandable",
            description:
              "Access, correction, export, and billing context should be legible from a page like this without sending people into support loops.",
            tone: "sage",
          },
          {
            icon: Globe2,
            title: "Locale-aware product behavior matters",
            description:
              "Language, communication settings, and account visibility are part of a premium local product experience.",
            tone: "coral",
          },
        ]}
      />

      <section className="section-shell py-10">
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            {sections.map((section) => (
              <Surface
                key={section.title}
                eyebrow={t("sectionsEyebrow")}
                title={section.title}
                description={section.copy}
              >
                <div className="space-y-3">
                  {section.points.map((point) => (
                    <div
                      key={point}
                      className="editorial-list-card flex items-start gap-3 px-4 py-3"
                    >
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-sage)]" />
                      <span className="text-sm leading-7 text-[var(--brand-text-muted)]">
                        {point}
                      </span>
                    </div>
                  ))}
                </div>
              </Surface>
            ))}
          </div>

          <div className="space-y-6">
            <Surface
              eyebrow={t("rightsEyebrow")}
              title={t("rightsTitle")}
              description={t("rightsDescription")}
            >
              <div className="space-y-4">
                {rights.map((item) => (
                  <div
                    key={item.title}
                    className="editorial-list-card p-4"
                  >
                    <span className="editorial-icon-chip">
                      <item.icon className="h-5 w-5" />
                    </span>
                    <div className="mt-4 font-semibold text-[var(--brand-text)]">
                      {item.title}
                    </div>
                    <p className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </Surface>
          </div>
        </div>
      </section>
    </>
  );
}

export function TermsScreen() {
  const t = useTranslations("termsPage");
  const sections = [
    {
      title: t("sections.accounts.title"),
      copy: t("sections.accounts.copy"),
      points: [
        t("sections.accounts.point1"),
        t("sections.accounts.point2"),
        t("sections.accounts.point3"),
      ],
    },
    {
      title: t("sections.events.title"),
      copy: t("sections.events.copy"),
      points: [
        t("sections.events.point1"),
        t("sections.events.point2"),
        t("sections.events.point3"),
      ],
    },
    {
      title: t("sections.moderation.title"),
      copy: t("sections.moderation.copy"),
      points: [
        t("sections.moderation.point1"),
        t("sections.moderation.point2"),
        t("sections.moderation.point3"),
      ],
    },
  ];
  const reminders = [
    t("reminders.one"),
    t("reminders.two"),
    t("reminders.three"),
  ];

  return (
    <>
      <HeroBand
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        description={t("hero.description")}
        background="linear-gradient(160deg, rgba(30,27,46,1) 0%, rgba(55,48,163,0.92) 42%, rgba(124,154,130,0.78) 100%)"
        metrics={[
          { label: t("hero.metrics.roles"), value: t("hero.values.roles") },
          { label: t("hero.metrics.domains"), value: t("hero.values.domains") },
          { label: t("hero.metrics.principle"), value: t("hero.values.principle") },
          { label: t("hero.metrics.support"), value: t("hero.values.support") },
        ]}
        primaryAction={{ href: "/contact" as Route, label: t("hero.primaryCta") }}
        secondaryAction={{ href: "/privacy", label: t("hero.secondaryCta") }}
      />

      <MarketConfidenceStrip
        items={[
          {
            icon: ShieldCheck,
            title: "Platform rules support room quality",
            description:
              "Terms matter here because hosts, members, and venues all share the same operating space and need the same baseline expectations.",
            tone: "indigo",
          },
          {
            icon: Store,
            title: "Partner behavior needs structure",
            description:
              "Venue partners and organizers are part of the commercial product, so their obligations should read clearly from the public site.",
            tone: "sage",
          },
          {
            icon: HandCoins,
            title: "Commercial rules should stay visible",
            description:
              "Paid events, subscriptions, and moderation decisions are easier to trust when the legal stance is explicit early.",
            tone: "coral",
          },
        ]}
      />

      <section className="section-shell py-10">
        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-6">
            {sections.map((section) => (
              <Surface
                key={section.title}
                eyebrow={t("sectionsEyebrow")}
                title={section.title}
                description={section.copy}
              >
                <div className="space-y-3">
                  {section.points.map((point) => (
                    <div
                      key={point}
                      className="editorial-list-card px-4 py-3 text-sm leading-7 text-[var(--brand-text-muted)]"
                    >
                      {point}
                    </div>
                  ))}
                </div>
              </Surface>
            ))}
          </div>

          <div className="space-y-6">
            <Surface
              eyebrow={t("stanceEyebrow")}
              title={t("stanceTitle")}
              description={t("stanceDescription")}
            >
              <KeyValueList
                items={[
                  { key: "trust", label: t("stance.trust.label"), value: t("stance.trust.value") },
                  { key: "rooms", label: t("stance.rooms.label"), value: t("stance.rooms.value") },
                  { key: "providers", label: t("stance.providers.label"), value: t("stance.providers.value") },
                  { key: "appeals", label: t("stance.appeals.label"), value: t("stance.appeals.value") },
                ]}
              />
            </Surface>

            <Surface
              eyebrow={t("remindersEyebrow")}
              title={t("remindersTitle")}
              description={t("remindersDescription")}
            >
              <div className="space-y-3">
                {reminders.map((item) => (
                  <div
                    key={item}
                    className="editorial-muted-panel px-4 py-3 text-sm leading-7 text-[var(--brand-text-muted)]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </Surface>
          </div>
        </div>
      </section>
    </>
  );
}

export function ContactScreen() {
  const t = useTranslations("contactPage");
  const channels = [
    {
      title: t("channels.general.title"),
      detail: "support@meetupreykjavik.is",
      note: t("channels.general.note"),
    },
    {
      title: t("channels.organizer.title"),
      detail: "organizers@meetupreykjavik.is",
      note: t("channels.organizer.note"),
    },
    {
      title: t("channels.venue.title"),
      detail: "venues@meetupreykjavik.is",
      note: t("channels.venue.note"),
    },
    {
      title: t("channels.trust.title"),
      detail: "trust@meetupreykjavik.is",
      note: t("channels.trust.note"),
    },
  ];
  const expectations = [t("expectations.one"), t("expectations.two"), t("expectations.three")];

  return (
    <>
      <HeroBand
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        description={t("hero.description")}
        background="linear-gradient(160deg, rgba(245,240,232,0.98) 0%, rgba(232,97,77,0.82) 48%, rgba(55,48,163,0.88) 100%)"
        metrics={[
          { label: t("hero.metrics.lanes"), value: t("hero.values.lanes") },
          { label: t("hero.metrics.reply"), value: t("hero.values.reply") },
          { label: t("hero.metrics.organizer"), value: t("hero.values.organizer") },
          { label: t("hero.metrics.trust"), value: t("hero.values.trust") },
        ]}
        primaryAction={{ href: "/signup", label: t("hero.primaryCta") }}
        secondaryAction={{ href: "/terms" as Route, label: t("hero.secondaryCta") }}
      />

      <MarketConfidenceStrip
        items={[
          {
            icon: Clock3,
            title: "Support needs clear lanes",
            description:
              "General help, organizer issues, venue operations, and trust reports should not collapse into one inbox.",
            tone: "indigo",
          },
          {
            icon: ShieldCheck,
            title: "Trust cases need a direct route",
            description:
              "Moderation and safety concerns should be visible and easy to route from the public site.",
            tone: "sage",
          },
          {
            icon: HandCoins,
            title: "Commercial support matters too",
            description:
              "Paid organizers and venue partners need the page to signal that operational questions will be handled seriously.",
            tone: "coral",
          },
        ]}
      />

      <section className="section-shell py-10">
        <DiscoveryCommandDeck
          eyebrow="Support command"
          title="Route people into the right support lane before they write"
          description="The contact page should feel like support infrastructure: clear lanes, visible trust handling, and a form that respects the difference between members, organizers, and venues."
          prompt="Search general support, organizer help, venue operations, billing questions, and trust concerns."
          action={{ href: "/faq", label: "Check the FAQ first" }}
          secondaryAction={{ href: "/pricing", label: "Review pricing and plans" }}
          suggestions={[
            "member help",
            "organizer ops",
            "venue support",
            "trust report",
            "billing lane",
            "response target",
          ]}
          stats={[
            {
              icon: Clock3,
              label: "Response target",
              value: t("hero.values.reply"),
              description:
                "This makes the support promise explicit before live email tooling is fully wired.",
            },
            {
              icon: UsersRound,
              label: "Support lanes",
              value: t("hero.values.lanes"),
              description:
                "The page is segmented enough now that members, organizers, and venues do not feel like the same ticket queue.",
            },
            {
              icon: ShieldCheck,
              label: "Trust path",
              value: t("hero.values.trust"),
              description:
                "Safety and moderation remain visible as a first-class support lane, not a hidden footer item.",
            },
            {
              icon: HandCoins,
              label: "Commercial path",
              value: organizerTiers[0]?.price ?? "4,900 ISK / mo",
              description:
                "Paid operators need to see that support is part of the product, not an afterthought.",
            },
          ]}
        />

        <div className="mt-8 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <Surface
              eyebrow={t("channelsEyebrow")}
              title={t("channelsTitle")}
              description={t("channelsDescription")}
            >
              <div className="space-y-4">
                {channels.map((channel) => (
                  <article
                    key={channel.title}
                    className="editorial-list-card p-4"
                  >
                    <div className="font-semibold text-[var(--brand-text)]">{channel.title}</div>
                    <div className="mt-2 text-sm font-semibold text-[var(--brand-indigo)]">
                      {channel.detail}
                    </div>
                    <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">
                      {channel.note}
                    </p>
                  </article>
                ))}
              </div>
            </Surface>

            <Surface
              eyebrow={t("expectationsEyebrow")}
              title={t("expectationsTitle")}
              description={t("expectationsDescription")}
            >
              <div className="space-y-3">
                {expectations.map((item) => (
                  <div
                    key={item}
                    className="editorial-muted-panel px-4 py-3 text-sm leading-7 text-[var(--brand-text-muted)]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </Surface>
          </div>

          <ContactForm />
        </div>
      </section>
    </>
  );
}

export function CategoriesIndexScreen() {
  const featuredCategories = categoryDirectory.map((category) => {
    const bundle = getCategoryBundle(category.slug);

    return {
      category,
      eventsCount: bundle?.events.length ?? 0,
      groupsCount: bundle?.groups.length ?? 0,
      venuesCount: bundle?.venues.length ?? 0,
    };
  });

  return (
    <>
      <HeroBand
        eyebrow="Categories"
        title="Browse the city by social rhythm, not just by date."
        description="Categories are where the product becomes legible. They connect event discovery, recurring groups, and venue fit into pages that feel curated instead of generic."
        background="linear-gradient(160deg, rgba(245,240,232,0.98) 0%, rgba(79,70,229,0.84) 38%, rgba(232,97,77,0.86) 100%)"
        metrics={[
          { label: "Category lanes", value: String(categoryDirectory.length) },
          { label: "Live events", value: String(publicEvents.length) },
          { label: "Active groups", value: String(publicGroups.length) },
          { label: "Partner venues", value: String(publicVenues.length) },
        ]}
        primaryAction={{ href: "/events", label: "Browse events" }}
        secondaryAction={{ href: "/groups", label: "See groups" }}
      />

      <MarketConfidenceStrip
        items={[
          {
            icon: Compass,
            title: "Categories shape discovery",
            description:
              "The strongest city marketplace pages help people browse by social rhythm and room fit, not just by date and topic.",
            tone: "indigo",
          },
          {
            icon: HeartHandshake,
            title: "Groups and venues stay connected",
            description:
              "Each category lane works better when community and room context live together instead of splitting across disconnected pages.",
            tone: "sage",
          },
          {
            icon: Ticket,
            title: "Category quality affects revenue",
            description:
              "Clearer lanes make it easier to discover higher-intent formats that actually justify paid tickets and repeat attendance.",
            tone: "coral",
          },
        ]}
      />

      <section className="section-shell py-10">
        <DiscoveryCommandDeck
          eyebrow="Category command"
          title="Browse the city by the kind of room you want to enter"
          description="Categories are not decoration. They are the public information architecture for how discovery, groups, and venues should connect."
          prompt="Search category lanes, recurring communities, and the rooms that match them."
          action={{ href: "/events", label: "Browse all events" }}
          secondaryAction={{ href: "/groups", label: "See recurring groups" }}
          suggestions={[
            "hosted social",
            "outdoor rhythm",
            "practical workshops",
            "premium food",
            "expat-friendly",
            "career-minded",
          ]}
          stats={[
            {
              icon: Compass,
              label: "Category lanes",
              value: String(categoryDirectory.length),
              description:
                "The category system turns a broad city feed into a clearer map of behavior and intent.",
            },
            {
              icon: Ticket,
              label: "Public events",
              value: String(publicEvents.length),
              description:
                "Each event becomes easier to judge when it appears inside a recognizable lane instead of a flat list.",
            },
            {
              icon: UsersRound,
              label: "Recurring groups",
              value: String(publicGroups.length),
              description:
                "Group context gives categories persistence and prevents the site from feeling like a one-off listings board.",
            },
            {
              icon: Store,
              label: "Partner venues",
              value: String(publicVenues.length),
              description:
                "Room fit is part of why category pages can feel more premium and useful than basic topic filters.",
            },
          ]}
        />

        <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
          <div className="grid gap-6 md:grid-cols-2">
            {featuredCategories.map((item) => (
              <Link
                key={item.category.slug}
                href={categoryHref(item.category.slug)}
                className="paper-panel-premium editorial-shell block rounded-[1.9rem] border border-[rgba(255,255,255,0.74)] p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <span
                    className={cn(
                      "inline-flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-black",
                      categoryBadgeClass(item.category.tone),
                    )}
                  >
                    {item.category.letter}
                  </span>
                  <ToneBadge tone={item.category.tone}>{item.eventsCount} live events</ToneBadge>
                </div>
                <h2 className="font-editorial mt-5 text-3xl tracking-[-0.05em] text-[var(--brand-text)]">
                  {item.category.name}
                </h2>
                <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">
                  {item.category.description}
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="editorial-list-card px-4 py-3">
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-text-light)]">
                      Events
                    </div>
                    <div className="mt-2 font-editorial text-2xl tracking-[-0.04em] text-[var(--brand-text)]">
                      {item.eventsCount}
                    </div>
                  </div>
                  <div className="editorial-list-card px-4 py-3">
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-text-light)]">
                      Groups
                    </div>
                    <div className="mt-2 font-editorial text-2xl tracking-[-0.04em] text-[var(--brand-text)]">
                      {item.groupsCount}
                    </div>
                  </div>
                  <div className="editorial-list-card px-4 py-3">
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-text-light)]">
                      Venues
                    </div>
                    <div className="mt-2 font-editorial text-2xl tracking-[-0.04em] text-[var(--brand-text)]">
                      {item.venuesCount}
                    </div>
                  </div>
                </div>
                <div className="mt-5 text-sm font-semibold text-[var(--brand-indigo)]">
                  {item.category.audience}
                </div>
              </Link>
            ))}
          </div>

          <div className="space-y-6">
            <Surface
              eyebrow="Why this layout matters"
              title="Pages with clearer room logic"
              description="The skill pass reinforced the right pattern here: category pages should show active community proof, real examples, and obvious next actions."
            >
              <div className="space-y-3">
                {[
                  "Discovery becomes faster when categories explain the room shape, not just the topic label.",
                  "Groups and venues feel more connected when they appear inside the same category lane.",
                  "These pages give marketing depth without flattening the product into a generic listing site.",
                ].map((item) => (
                  <div
                    key={item}
                    className="editorial-list-card px-4 py-3 text-sm leading-7 text-[var(--brand-text-muted)]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </Surface>

            <Surface
              eyebrow="Fast routes"
              title="Go deeper by role"
              description="Not everyone lands on the product from the same angle. These pages create cleaner entry points."
            >
              <div className="grid gap-3">
                {[
                  {
                    href: "/for-organizers" as Route,
                    title: "For organizers",
                    body: "See the event, approval, venue-match, and recurring-group layout before logging in.",
                  },
                  {
                    href: "/for-venues" as Route,
                    title: "For venues",
                    body: "See onboarding, bookings, deals, analytics, and the public venue storefront together.",
                  },
                  {
                    href: "/faq" as Route,
                    title: "Frequently asked questions",
                    body: "Get the high-level product answers without digging through pricing, privacy, or support pages.",
                  },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="editorial-link-card block p-4"
                  >
                    <div className="font-semibold text-[var(--brand-text)]">{item.title}</div>
                    <p className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">
                      {item.body}
                    </p>
                  </Link>
                ))}
              </div>
            </Surface>
          </div>
        </div>
      </section>
    </>
  );
}

export function CategoryDetailScreen({ slug }: { slug: string }) {
  const bundle = getCategoryBundle(slug);

  if (!bundle) {
    return (
      <>
        <HeroBand
          eyebrow="Category"
          title="That category is not in the directory yet."
          description="The category route exists, but this specific slug does not map to an active discovery lane yet."
          background="linear-gradient(160deg, rgba(30,27,46,1) 0%, rgba(79,70,229,0.9) 46%, rgba(245,240,232,0.9) 100%)"
          metrics={[
            { label: "Known categories", value: String(categoryDirectory.length) },
            { label: "Public events", value: String(publicEvents.length) },
            { label: "Public groups", value: String(publicGroups.length) },
            { label: "Partner venues", value: String(publicVenues.length) },
          ]}
          primaryAction={{ href: categoriesHref(), label: "Browse categories" }}
          secondaryAction={{ href: "/events", label: "See all events" }}
        />
        <section className="section-shell py-10">
          <Surface
            eyebrow="Available now"
            title="Open one of the active category layouts"
            description="These category pages are already built and connected to real public event, group, and venue data."
          >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {categoryDirectory.map((category) => (
                <Link
                  key={category.slug}
                  href={categoryHref(category.slug)}
                  className="editorial-link-card block p-4"
                >
                  <div className="font-semibold text-[var(--brand-text)]">{category.name}</div>
                  <p className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">
                    {category.description}
                  </p>
                </Link>
              ))}
            </div>
          </Surface>
        </section>
      </>
    );
  }

  const relatedCategories = categoryDirectory
    .filter((item) => item.slug !== bundle.category.slug)
    .slice(0, 3);

  return (
    <>
      <HeroBand
        eyebrow="Category spotlight"
        title={bundle.category.name}
        description={bundle.category.description}
        background="linear-gradient(160deg, rgba(245,240,232,0.98) 0%, rgba(79,70,229,0.88) 40%, rgba(232,97,77,0.88) 100%)"
        metrics={[
          { label: "Events", value: String(bundle.events.length) },
          { label: "Groups", value: String(bundle.groups.length) },
          { label: "Venues", value: String(bundle.venues.length) },
          { label: "Live signals", value: String(bundle.category.count) },
        ]}
        primaryAction={{ href: "/signup", label: "Join this lane" }}
        secondaryAction={{ href: categoriesHref(), label: "All categories" }}
      />

      <MarketConfidenceStrip
        items={[
          {
            icon: Compass,
            title: "Category pages shape discovery",
            description:
              "A good category page should make the lane feel legible fast: who it is for, which rooms work, and what kind of events dominate it.",
            tone: "indigo",
          },
          {
            icon: UsersRound,
            title: "Groups give the lane memory",
            description:
              "Recurring communities are what stop a category from feeling like a loose tag cloud with no social depth.",
            tone: "sage",
          },
          {
            icon: Store,
            title: "Venue fit keeps quality high",
            description:
              "The room signal matters because category quality often depends on where the format actually happens.",
            tone: "coral",
          },
        ]}
      />

      <section className="section-shell py-10">
        <DiscoveryCommandDeck
          eyebrow="Category command"
          title="Move from interest into the specific rooms and hosts that make the lane work"
          description="This category screen should feel like a discovery control room: event inventory, recurring groups, venue fit, and the right next route."
          prompt="Search the category by event format, recurring community, room type, and best next action."
          action={{ href: "/events", label: "See city-wide events" }}
          secondaryAction={{ href: "/groups", label: "See recurring groups" }}
          suggestions={[
            bundle.category.name.toLowerCase(),
            "best-fit rooms",
            "repeat hosts",
            "newcomer-safe",
            "category signals",
            "cross-discovery",
          ]}
          stats={[
            {
              icon: CalendarDays,
              label: "Event formats",
              value: String(bundle.events.length),
              description:
                "These are the public event types currently giving this category shape inside the marketplace.",
            },
            {
              icon: UsersRound,
              label: "Recurring groups",
              value: String(bundle.groups.length),
              description:
                "Groups turn category interest into something with memory, leadership, and repeat attendance.",
            },
            {
              icon: Store,
              label: "Venue fit",
              value: String(bundle.venues.length),
              description:
                "The venue layer helps the category read as a real local lane rather than a feed filter.",
            },
            {
              icon: Sparkles,
              label: "Live signals",
              value: String(bundle.category.count),
              description:
                "These counts now work more like a marketplace health readout than generic taxonomy numbers.",
            },
          ]}
        />

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-6">
            <Surface
              eyebrow="What makes it work"
              title="The local shape of this category"
              description="Strong category pages should explain not just what happens here, but why these rooms work in Reykjavik."
            >
              <div className="space-y-4 text-sm leading-8 text-[var(--brand-text-muted)]">
                <p>{bundle.category.audience}</p>
                <p>{bundle.category.venueSignal}</p>
              </div>
            </Surface>

            {bundle.events.length ? (
              <Surface
                eyebrow="Events"
                title="Best current event formats"
                description="These are the events currently carrying this category in the public feed."
              >
                <div className="grid gap-6">
                  {bundle.events.slice(0, 3).map((event) => (
                    <EventCard key={event.slug} event={event} />
                  ))}
                </div>
              </Surface>
            ) : null}

            {bundle.groups.length ? (
              <Surface
                eyebrow="Groups"
                title="Recurring communities in this lane"
                description="Groups turn category interest into repeat participation."
              >
                <div className="grid gap-6 md:grid-cols-2">
                  {bundle.groups.slice(0, 4).map((group) => (
                    <GroupCard
                      key={group.slug}
                      group={group}
                      upcomingTitle={
                        publicEvents.find((event) => group.upcomingEventSlugs.includes(event.slug))
                          ?.title
                      }
                    />
                  ))}
                </div>
              </Surface>
            ) : null}

            {bundle.venues.length ? (
              <Surface
                eyebrow="Venues"
                title="Rooms that fit this category"
                description="The venue layer matters because format quality often starts with the room itself."
              >
                <div className="scroll-strip">
                  {bundle.venues.slice(0, 4).map((venue) => (
                    <div key={venue.slug} className="min-w-[286px] max-w-[286px]">
                      <VenueCard venue={venue} />
                    </div>
                  ))}
                </div>
              </Surface>
            ) : null}
          </div>

          <div className="space-y-6">
            <Surface
              eyebrow="At a glance"
              title="How to use this page"
              description="This layout is built to help visitors decide whether to browse events, join a group, or look for the right venue."
            >
              <KeyValueList
                items={[
                  { key: "lane", label: "Category lane", value: bundle.category.name },
                  { key: "events", label: "Strongest inventory", value: `${bundle.events.length} event formats` },
                  { key: "groups", label: "Community depth", value: `${bundle.groups.length} groups` },
                  { key: "venues", label: "Venue fit", value: `${bundle.venues.length} partner rooms` },
                ]}
              />
            </Surface>

            <Surface
              eyebrow="Best next step"
              title="Where to go from here"
              description="These links keep the category page connected to the rest of the public site instead of becoming a dead end."
            >
              <div className="grid gap-3">
                {[
                  { href: "/events" as Route, title: "Browse all events", body: "See the broader city-wide event feed." },
                  { href: "/groups" as Route, title: "Explore groups", body: "Join a recurring community instead of only one-off events." },
                  { href: "/for-organizers" as Route, title: "For organizers", body: "See how the organizer-side layouts support stronger formats." },
                  { href: "/for-venues" as Route, title: "For venues", body: "See how venues fit into the category and event ecosystem." },
                ].map((item) => (
                  <Link key={item.href} href={item.href} className="editorial-link-card block p-4">
                    <div className="font-semibold text-[var(--brand-text)]">{item.title}</div>
                    <p className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">
                      {item.body}
                    </p>
                  </Link>
                ))}
              </div>
            </Surface>

            <Surface
              eyebrow="Related lanes"
              title="Cross over into adjacent categories"
              description="People rarely live in just one category. These related pages make cross-discovery feel intentional."
            >
              <div className="space-y-3">
                {relatedCategories.map((category) => (
                  <Link
                    key={category.slug}
                    href={categoryHref(category.slug)}
                    className="editorial-link-card block p-4"
                  >
                    <div className="font-semibold text-[var(--brand-text)]">{category.name}</div>
                    <p className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">
                      {category.description}
                    </p>
                  </Link>
                ))}
              </div>
            </Surface>
          </div>
        </div>
      </section>
    </>
  );
}

export function FaqScreen() {
  const faqSections = [
    {
      eyebrow: "Accounts",
      title: "Joining and profiles",
      items: [
        {
          question: "Do I need to pay to browse or RSVP?",
          answer:
            "No. The public product is designed so discovery stays open. Paid layers show up only when a specific event or membership tier actually requires them.",
        },
        {
          question: "Why do member profiles matter?",
          answer:
            "Profiles make rooms safer and easier to shape. Organizers and venues get better context, and members get clearer expectations around format fit and privacy.",
        },
      ],
    },
    {
      eyebrow: "Events",
      title: "Groups, RSVPs, and room quality",
      items: [
        {
          question: "Why are some events manual approval and others open RSVP?",
          answer:
            "The product supports both. Approval is useful when hosts want tighter room shape, while open RSVP works for simpler formats with lower social friction.",
        },
        {
          question: "How are venues involved?",
          answer:
            "Venue partners are not just listings. They affect arrival flow, room fit, deals, booking confidence, and the overall trust level of the event.",
        },
      ],
    },
    {
      eyebrow: "Payments",
      title: "Memberships, ticketing, and support",
      items: pricingFaq.slice(0, 2).map((item) => ({
        question: item.question,
        answer: item.answer,
      })),
    },
    {
      eyebrow: "Trust",
      title: "Moderation, privacy, and support",
      items: [
        {
          question: "How does support work before live email delivery is wired?",
          answer:
            "The contact layout already exists and stores drafts locally so the full support flow can be built and tested before external email services are connected.",
        },
        {
          question: "Can organizers message anyone directly?",
          answer:
            "Not automatically. Messaging and privacy settings are meant to be role-aware, so organizer outreach respects the member's allowed access lane.",
        },
      ],
    },
  ];

  return (
    <>
      <HeroBand
        eyebrow="FAQ"
        title="The pages that explain the product without turning into boilerplate."
        description="This FAQ is built as a real route, not a throwaway section. It connects accounts, discovery, venues, trust, and the commercial model in one place."
        background="linear-gradient(160deg, rgba(30,27,46,1) 0%, rgba(55,48,163,0.92) 42%, rgba(232,97,77,0.82) 100%)"
        metrics={[
          { label: "Question groups", value: String(faqSections.length) },
          { label: "Pricing FAQs", value: String(pricingFaq.length) },
          { label: "Support lanes", value: "4" },
          { label: "Live route", value: "Yes" },
        ]}
        primaryAction={{ href: "/contact", label: "Contact support" }}
        secondaryAction={{ href: "/pricing", label: "See pricing" }}
      />

      <MarketConfidenceStrip
        items={[
          {
            icon: ShieldCheck,
            title: "FAQ as trust layer",
            description:
              "A serious product answers support, moderation, and payments questions clearly before people need to ask them in chat.",
            tone: "indigo",
          },
          {
            icon: HandCoins,
            title: "Commercial clarity matters",
            description:
              "Ticket floors, organizer pricing, and venue plans should be understandable from public pages, not only from sales calls.",
            tone: "coral",
          },
          {
            icon: Globe2,
            title: "Route-driven support is cleaner",
            description:
              "FAQ works best when it points people into the right public pages instead of trying to answer everything in one long wall of text.",
            tone: "sage",
          },
        ]}
      />

      <section className="section-shell py-10">
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            {faqSections.map((section) => (
              <Surface
                key={section.title}
                eyebrow={section.eyebrow}
                title={section.title}
                description="Each answer here is meant to bridge product understanding and the actual page structure."
              >
                <div className="space-y-4">
                  {section.items.map((item) => (
                    <div key={item.question} className="editorial-list-card p-4">
                      <div className="font-semibold text-[var(--brand-text)]">{item.question}</div>
                      <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">
                        {item.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </Surface>
            ))}
          </div>

          <div className="space-y-6">
            <Surface
              eyebrow="Fast paths"
              title="Jump to the right layout"
              description="Sometimes the best answer is a better page, not more text."
            >
              <div className="grid gap-3">
                {[
                  { href: categoriesHref(), title: "Categories", body: "Browse the city by discovery lane." },
                  { href: "/for-organizers" as Route, title: "For organizers", body: "See the group and event operating surfaces." },
                  { href: "/for-venues" as Route, title: "For venues", body: "See the partner venue product and dashboard logic." },
                  { href: "/privacy" as Route, title: "Privacy", body: "Read the dedicated privacy layout and member-rights overview." },
                ].map((item) => (
                  <Link key={item.href} href={item.href} className="editorial-link-card block p-4">
                    <div className="font-semibold text-[var(--brand-text)]">{item.title}</div>
                    <p className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">
                      {item.body}
                    </p>
                  </Link>
                ))}
              </div>
            </Surface>
          </div>
        </div>
      </section>
    </>
  );
}

export function ForOrganizersScreen() {
  return (
    <>
      <HeroBand
        eyebrow="For organizers"
        title="Run groups and events with more control than a simple post form."
        description={`This page explains the organizer-side layouts as a real business tool: recurring groups, paid events from ${minimumTicketPriceIsk} ISK upward, attendee approvals, venue matching, and the operating surfaces behind stronger formats.`}
        background="linear-gradient(160deg, rgba(30,27,46,1) 0%, rgba(79,70,229,0.94) 36%, rgba(245,240,232,0.92) 100%)"
        metrics={[
          { label: "Managed groups", value: String(organizerPortalData.groups.length) },
          { label: "Paid plan from", value: organizerTiers[0]?.price ?? "4,900 ISK / mo" },
          { label: "Ticket floor", value: `${minimumTicketPriceIsk} ISK` },
          { label: "Commission", value: `${ticketCommissionRate}%` },
        ]}
        primaryAction={{ href: "/groups/new", label: "Start a group" }}
        secondaryAction={{ href: "/events/new", label: "Create an event" }}
      />

      <MarketConfidenceStrip
        items={[
          {
            icon: Sparkles,
            title: "Hosts need more than publishing",
            description:
              "Recurring groups, approvals, and format design are what separate strong organizers from people just posting events.",
            tone: "indigo",
          },
          {
            icon: HandCoins,
            title: "Revenue has to be operational",
            description:
              `Paid public formats from ${minimumTicketPriceIsk} ISK upward only work well when the organizer product already supports pricing, approvals, and venue fit.`,
            tone: "coral",
          },
          {
            icon: Store,
            title: "Venue matching is leverage",
            description:
              "Better room matching means better conversion, calmer arrivals, and stronger repeat attendance for the next edition.",
            tone: "sage",
          },
        ]}
      />

      <section className="section-shell py-10">
        <DiscoveryCommandDeck
          eyebrow="Organizer command"
          title="Show the operator what they can control before they sign in"
          description="This page should read like a real operating product: event economics, group identity, venue matching, and audience control in one public surface."
          prompt="Search organizer tooling, recurring group control, and paid event operations."
          action={{ href: "/events/new", label: "Open the event wizard" }}
          secondaryAction={{ href: "/pricing", label: "See organizer pricing" }}
          suggestions={[
            "500 ISK floor",
            "approval flow",
            "venue fit",
            "repeat series",
            "waitlist control",
            "audience ops",
          ]}
          stats={[
            {
              icon: UsersRound,
              label: "Managed groups",
              value: String(organizerPortalData.groups.length),
              description:
                "The organizer side is already framed around recurring communities, not just isolated event posts.",
            },
            {
              icon: CalendarDays,
              label: "Event ops",
              value: String(organizerPortalData.events.length),
              description:
                "The event surfaces already carry enough operational depth to justify product-led sales framing.",
            },
            {
              icon: Store,
              label: "Venue matches",
              value: String(organizerPortalData.venueMatches.length),
              description:
                "Venue-fit guidance is one of the clearest public differentiators for organizer conversion.",
            },
            {
              icon: HandCoins,
              label: "Plan ladder",
              value: organizerTiers[0]?.price ?? "4,900 ISK / mo",
              description:
                "The organizer pricing ladder is visible enough now that this page can function as a real sales surface.",
            },
          ]}
        />

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Surface
            eyebrow="Why this layout exists"
            title="Organizers need operating clarity"
            description="The product gets better when organizers can shape the room, control approvals, and make money on formats that justify repeat attendance."
          >
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "Recurring groups",
                  text: "Group identity, join mode, co-hosts, and discussion rhythm create a real community layer.",
                },
                {
                  title: "Better events",
                  text: "Templates, ticket floors, approval modes, and attendee curation make formats stronger, more repeatable, and more commercially viable.",
                },
                {
                  title: "Venue matching",
                  text: "Rooms, arrival flow, and venue operations are part of event quality, not a separate concern.",
                },
              ].map((item) => (
                <div key={item.title} className="editorial-list-card p-4">
                  <div className="font-semibold text-[var(--brand-text)]">{item.title}</div>
                  <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </Surface>

          <Surface
            eyebrow="Page map"
            title="Organizer routes already built"
            description="These routes exist now and are structured as real product pages, not placeholders."
          >
            <div className="space-y-3">
              {[
                { path: "/organizer", label: "Overview and health" },
                { path: "/organizer/groups", label: "Group management" },
                { path: "/organizer/events", label: "Event operations" },
                { path: "/events/new", label: "Create event wizard" },
                { path: "/organizer/venues", label: "Venue matching and requests" },
              ].map((item) => (
                <div key={item.path} className="editorial-list-card flex items-center justify-between gap-4 px-4 py-3">
                  <div className="font-semibold text-[var(--brand-text)]">{item.label}</div>
                  <div className="text-sm text-[var(--brand-text-muted)]">{item.path}</div>
                </div>
              ))}
            </div>
          </Surface>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
          <Surface
            eyebrow="Example layouts"
            title="What organizer pages are built around"
            description="These event examples show the kind of operating detail the organizer side is already carrying."
          >
            <div className="space-y-4">
              {organizerPortalData.events.slice(0, 3).map((event) => (
                <div key={event.slug} className="editorial-list-card p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-semibold text-[var(--brand-text)]">{event.title}</div>
                    <ToneBadge tone="sand">{event.groupName}</ToneBadge>
                    <ToneBadge tone="indigo">{event.status}</ToneBadge>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">
                    {event.notes}
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="editorial-muted-panel px-4 py-3 text-sm text-[var(--brand-text-muted)]">
                      {event.rsvps} RSVPs
                    </div>
                    <div className="editorial-muted-panel px-4 py-3 text-sm text-[var(--brand-text-muted)]">
                      {event.waitlist} waitlist
                    </div>
                    <div className="editorial-muted-panel px-4 py-3 text-sm text-[var(--brand-text-muted)]">
                      {event.revenue}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Surface>

          <Surface
            eyebrow="Venue fit"
            title="Partner rooms matched to format"
            description="Venue matching is one of the strongest layout differentiators in the organizer side."
          >
            <div className="space-y-3">
              {organizerPortalData.venueMatches.map((item) => (
                <div key={item.venue.slug} className="editorial-list-card p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-semibold text-[var(--brand-text)]">{item.venue.name}</div>
                    <ToneBadge tone="coral">{item.score} fit</ToneBadge>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">
                    {item.fit}
                  </p>
                  <div className="mt-3 text-sm font-semibold text-[var(--brand-indigo)]">
                    Next slot: {item.nextSlot}
                  </div>
                </div>
              ))}
            </div>
          </Surface>
        </div>

        <div className="mt-8">
          <Surface
            eyebrow="Business model"
            title="What organizers are paying for"
            description="The organizer side is meant to carry enough operational leverage that charging monthly is justified from day one."
          >
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  title: organizerTiers[0]?.name ?? "Organizer Starter",
                  body: organizerTiers[0]?.description ?? "Launch public events with paid ticketing and basic controls.",
                },
                {
                  title: organizerTiers[1]?.name ?? "Organizer Pro",
                  body: organizerTiers[1]?.description ?? "Run recurring formats with better approvals, analytics, and venue workflows.",
                },
                {
                  title: "Platform take",
                  body: `${ticketCommissionRate}% ticket commission keeps the platform aligned with events that actually convert and check in.`,
                },
              ].map((item) => (
                <div key={item.title} className="editorial-list-card p-4">
                  <div className="font-semibold text-[var(--brand-text)]">{item.title}</div>
                  <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </Surface>
        </div>
      </section>
    </>
  );
}

export function ForVenuesScreen() {
  return (
    <>
      <HeroBand
        eyebrow="For venues"
        title="Turn a listing into a real partner venue product."
        description="The venue-side layouts are designed around operations and monetization: onboarding, bookings, availability, deals, analytics, and a public profile that helps organizers choose the room for the right paid format."
        background="linear-gradient(160deg, rgba(245,240,232,0.98) 0%, rgba(232,97,77,0.86) 40%, rgba(55,48,163,0.92) 100%)"
        metrics={[
          { label: "Onboarding steps", value: String(venuePortalData.onboarding.steps.length) },
          { label: "Partner plan from", value: venueTiers[1]?.price ?? "9,900 ISK / mo" },
          { label: "Premium plan", value: venueTiers[2]?.price ?? "19,900 ISK / mo" },
          { label: "Active deals", value: String(venuePortalData.deals.length) },
        ]}
        primaryAction={{ href: "/venue/onboarding", label: "Apply as a venue" }}
        secondaryAction={{ href: "/venues", label: "Browse venue pages" }}
      />

      <MarketConfidenceStrip
        items={[
          {
            icon: Store,
            title: "Venues need workflow, not exposure",
            description:
              "The strongest venue product is operational software first and directory visibility second.",
            tone: "indigo",
          },
          {
            icon: HandCoins,
            title: "Venue plans must feel justified",
            description:
              "Availability, bookings, deals, and analytics need to be visible in the UI early so the paid partnership makes sense.",
            tone: "coral",
          },
          {
            icon: Sparkles,
            title: "Better rooms shape better events",
            description:
              "Venue-side quality signals improve organizer trust, member experience, and the overall tone of the marketplace.",
            tone: "sage",
          },
        ]}
      />

      <section className="section-shell py-10">
        <DiscoveryCommandDeck
          eyebrow="Venue command"
          title="Make the venue product read like business infrastructure"
          description="A strong venue landing page should show onboarding, commercial workflows, and room performance clearly enough that a serious operator understands the value immediately."
          prompt="Search venue onboarding, booking workflows, availability planning, and partner analytics."
          action={{ href: "/venue/onboarding", label: "Open venue onboarding" }}
          secondaryAction={{ href: "/pricing", label: "See venue pricing" }}
          suggestions={[
            "booking inbox",
            "availability",
            "deal engine",
            "organizer fit",
            "featured placement",
            "room analytics",
          ]}
          stats={[
            {
              icon: FileText,
              label: "Onboarding steps",
              value: String(venuePortalData.onboarding.steps.length),
              description:
                "The venue onboarding flow already signals that this is a structured commercial intake, not a bare contact form.",
            },
            {
              icon: CalendarDays,
              label: "Incoming bookings",
              value: String(venuePortalData.bookings.incoming.length),
              description:
                "The booking layer makes the venue portal feel like a real operating product rather than a static profile manager.",
            },
            {
              icon: Ticket,
              label: "Active deals",
              value: String(venuePortalData.deals.length),
              description:
                "Partner offers and deal surfaces create a clearer revenue story for venue operators.",
            },
            {
              icon: HandCoins,
              label: "Partner plan",
              value: venueTiers[1]?.price ?? "9,900 ISK / mo",
              description:
                "The plan floor is explicit enough now that this page can function as a real venue sales page.",
            },
          ]}
        />

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Surface
            eyebrow="What venues get"
            title="Operational pages, not just exposure"
            description="A serious venue product has to support decisions, repeat bookings, and revenue, not just impressions."
          >
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "Onboarding",
                  text: "Business identity, capacity, hours, docs, media, billing, and final review are all mapped into a real step flow.",
                },
                {
                  title: "Bookings",
                  text: "Incoming requests, counter offers, guest-fit context, and booking history stay in one surface.",
                },
                {
                  title: "Deals and analytics",
                  text: "Partner offers, event-type performance, repeat organizer behavior, and plan value all have their own page logic.",
                },
              ].map((item) => (
                <div key={item.title} className="editorial-list-card p-4">
                  <div className="font-semibold text-[var(--brand-text)]">{item.title}</div>
                  <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </Surface>

          <Surface
            eyebrow="Page map"
            title="Venue routes already built"
            description="These are live page surfaces now, with layout structure and local workflow depth."
          >
            <div className="space-y-3">
              {[
                { path: "/venue/onboarding", label: "Onboarding wizard" },
                { path: "/venue/dashboard", label: "Venue overview" },
                { path: "/venue/bookings", label: "Bookings and responses" },
                { path: "/venue/availability", label: "Availability planning" },
                { path: "/venue/deals", label: "Deals and partner offers" },
                { path: "/venue/analytics", label: "Venue analytics" },
                { path: "/venue/profile", label: "Venue profile editor" },
              ].map((item) => (
                <div key={item.path} className="editorial-list-card flex items-center justify-between gap-4 px-4 py-3">
                  <div className="font-semibold text-[var(--brand-text)]">{item.label}</div>
                  <div className="text-sm text-[var(--brand-text-muted)]">{item.path}</div>
                </div>
              ))}
            </div>
          </Surface>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <Surface
            eyebrow="Booking operations"
            title="The kind of requests venue pages can already handle"
            description="These examples show the type of operational visibility the venue side is carrying now."
          >
            <div className="space-y-4">
              {venuePortalData.bookings.incoming.map((booking) => (
                <div key={booking.key} className="editorial-list-card p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-semibold text-[var(--brand-text)]">{booking.event}</div>
                    <ToneBadge tone="indigo">{booking.status}</ToneBadge>
                  </div>
                  <p className="mt-2 text-sm text-[var(--brand-text-muted)]">
                    {booking.organizer} · {booking.date} · {booking.attendance}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">
                    {booking.message}
                  </p>
                </div>
              ))}
            </div>
          </Surface>

          <Surface
            eyebrow="Deals and availability"
            title="How the room stays competitive"
            description="Deals and schedule clarity are part of the layout story, not buried admin details."
          >
            <div className="space-y-3">
              {venuePortalData.deals.map((deal) => (
                <div key={deal.key} className="editorial-list-card p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-semibold text-[var(--brand-text)]">{deal.title}</div>
                    <ToneBadge tone={deal.status === "Active" ? "sage" : "sand"}>
                      {deal.status}
                    </ToneBadge>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">
                    {deal.note}
                  </p>
                </div>
              ))}
              <div className="editorial-muted-panel px-4 py-4 text-sm leading-7 text-[var(--brand-text-muted)]">
                Best recurring slot right now: {venuePortalData.availability.recurring[2]}
              </div>
            </div>
          </Surface>
        </div>

        <div className="mt-8">
          <Surface
            eyebrow="Commercial model"
            title="Why venues pay"
            description="Venue subscriptions need to feel earned, so the page spells out the operational value rather than hiding behind generic exposure language."
          >
            <div className="grid gap-4 md:grid-cols-3">
              {venueTiers.map((tier) => (
                <div key={tier.name} className="editorial-list-card p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-semibold text-[var(--brand-text)]">{tier.name}</div>
                    <ToneBadge tone="sand">{tier.price}</ToneBadge>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">
                    {tier.description}
                  </p>
                </div>
              ))}
            </div>
          </Surface>
        </div>
      </section>
    </>
  );
}
