"use client";

import Link from "next/link";
import Image from "next/image";
import type { Route } from "next";
import { useTranslations } from "next-intl";
import { RsvpButton, AttendeeCount } from "@/components/public/rsvp-button";
import { ShareButton } from "@/components/ui/share-button";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  Globe2,
  HandHeart,
  Heart,
  Lightbulb,
  Mail,
  MapPin,
  MessageSquare,
  Search,
  Shield,
  Sparkles,
  Star,
  Target,
  Ticket,
  TrendingUp,
  Users,
  UsersRound,
  Zap,
} from "lucide-react";
import { ContactForm } from "@/components/public/contact-form";
import { FaqSearchableContent } from "@/components/public/faq-search";
import { KeyValueList, ToneBadge } from "@/components/dashboard/primitives";
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
import type { SourcedPlace } from "@/lib/reykjavik-source-data";
import { cn } from "@/lib/utils";
import { VenueMap } from "@/components/maps/venue-map";

/* ── Formatters ────────────────────────────────────────── */

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

/* ── Avatar placeholder colors (deterministic per-slot) ── */
const AVATAR_COLORS = [
  "#7C5CFC", "#E8614D", "#3B9B72", "#D97706",
  "#6366F1", "#EC4899", "#14B8A6", "#8B5CF6",
];

/* ── Blur placeholder for hero images ──────────────────── */
const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzJhMjYzOCIvPjwvc3ZnPg==";

/* ── Helpers ───────────────────────────────────────────── */

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

function formatEventDate(startsAt: string) {
  const date = new Date(startsAt);
  return `${weekdayFormatter.format(date)} ${dateFormatter.format(date)}`;
}

function formatEventTimeRange(startsAt: string, endsAt: string) {
  return `${timeFormatter.format(new Date(startsAt))} - ${timeFormatter.format(new Date(endsAt))}`;
}

function occupancyPercent(attendees: number, capacity: number) {
  if (!capacity) return 0;
  return Math.min(Math.round((attendees / capacity) * 100), 100);
}

function categoryTone(category: string) {
  const normalized = category.toLowerCase();
  if (normalized.includes("outdoor") || normalized.includes("sports")) return "sage" as const;
  if (normalized.includes("tech") || normalized.includes("language")) return "indigo" as const;
  if (normalized.includes("arts") || normalized.includes("music")) return "sand" as const;
  return "coral" as const;
}

function categoryBadgeStyle(tone: (typeof categories)[number]["tone"]): React.CSSProperties {
  if (tone === "sage") return { backgroundColor: "rgba(124,154,130,0.12)", color: "#7C9A82" };
  if (tone === "indigo") return { backgroundColor: "#c7d2fe", color: "#3730a3" };
  if (tone === "sand") return { backgroundColor: "#f5f0e8", color: "#2a2638" };
  return { backgroundColor: "#fde8e4", color: "#d4503d" };
}

function groupArchetype(group: PublicGroup) {
  if (group.category === "Outdoors") {
    return "For people who want a clear plan, a warm host, and a social rhythm around movement.";
  }
  if (group.category === "Tech") {
    return "For builders, operators, and teams who want practical sessions with useful follow-through.";
  }
  if (group.category === "Food") {
    return "For members who care about hospitality, tastings, and premium formats that justify a ticket.";
  }
  if (group.category === "Social" || group.category === "Expat") {
    return "For people trying to build a real social circle in the city faster and with less friction.";
  }
  return "For members who want recurring community, recognizable hosts, and a reason to come back weekly.";
}

function venueFitSummary(venue: PublicVenue) {
  const type = venue.type.toLowerCase();
  if (type.includes("coworking")) {
    return "Best for workshops, founder nights, and sessions where the room needs to support focus and discussion.";
  }
  if (type.includes("wine") || type.includes("restaurant")) {
    return "Best for premium seated formats, curated dinners, and smaller events that should feel worth paying for.";
  }
  if (type.includes("cafe") || type.includes("music")) {
    return "Best for intimate listening rooms, cultural nights, and conversation-led gatherings.";
  }
  return "Best for hosted social formats, recurring mixers, and events that rely on easy arrival flow.";
}

function areaHighlights(venues: PublicVenue[]) {
  return Array.from(
    venues.reduce(
      (map, venue) => {
        const rating = venue.rating ?? 0;
        const current = map.get(venue.area) ?? {
          area: venue.area,
          venues: 0,
          capacity: 0,
          topVenue: venue.name,
          topRating: rating,
        };
        current.venues += 1;
        current.capacity += venue.capacity ?? 0;
        if (rating > (current.topRating ?? 0)) {
          current.topRating = rating;
          current.topVenue = venue.name;
        }
        map.set(venue.area, current);
        return map;
      },
      new Map<
        string,
        {
          area: string;
          venues: number;
          capacity: number;
          topVenue: string;
          topRating: number;
        }
      >(),
    ).values(),
  ).sort((left, right) => right.venues - left.venues || right.capacity - left.capacity);
}

function discoveryLanes(events: PublicEvent[], t: (key: string, values?: Record<string, string | number>) => string) {
  const premium = [...events]
    .filter((event) => !event.isFree)
    .sort((left, right) => {
      const leftPrice = Number.parseInt(left.priceLabel.replace(/[^0-9]/g, ""), 10) || 0;
      const rightPrice = Number.parseInt(right.priceLabel.replace(/[^0-9]/g, ""), 10) || 0;
      return rightPrice - leftPrice;
    })[0];
  const newcomer = [...events].find((event) =>
    `${event.summary} ${event.approvalLabel} ${event.visibilityLabel}`.toLowerCase().includes("new"),
  );
  const fillingFast = [...events].sort(
    (left, right) =>
      occupancyPercent(right.attendees, right.capacity) -
      occupancyPercent(left.attendees, left.capacity),
  )[0];

  return [
    premium
      ? {
          label: t("premiumFormat"),
          title: premium.title,
          detail: `${premium.priceLabel} · ${premium.venueName} · ${premium.summary}`,
          href: eventHref(premium.slug),
        }
      : null,
    newcomer
      ? {
          label: t("newcomerFriendly"),
          title: newcomer.title,
          detail: `${newcomer.approvalLabel} · ${newcomer.groupName}`,
          href: eventHref(newcomer.slug),
        }
      : null,
    fillingFast
      ? {
          label: t("fillingFast"),
          title: fillingFast.title,
          detail: `${t("percentFull", { percent: occupancyPercent(fillingFast.attendees, fillingFast.capacity) })} · ${fillingFast.venueName}`,
          href: eventHref(fillingFast.slug),
        }
      : null,
  ].filter(Boolean) as Array<{ label: string; title: string; detail: string; href: Route }>;
}

function eventFormatSignals(event: PublicEvent, t: (key: string) => string) {
  return [
    {
      label: t("visibility"),
      value: event.visibilityLabel,
      detail: t("visibilityDetail"),
    },
    {
      label: t("approval"),
      value: event.approvalLabel,
      detail: t("approvalDetail"),
    },
    {
      label: t("reminderFlow"),
      value: event.reminderLabel,
      detail: t("reminderFlowDetail"),
    },
  ];
}

function groupOperatingSignals(group: PublicGroup, upcomingEvents: PublicEvent[], t: (key: string, values?: Record<string, string | number>) => string) {
  return [
    {
      label: t("memberBase"),
      value: t("membersValue", { count: group.members }),
      detail: t("memberBaseDetail"),
    },
    {
      label: t("activity"),
      value: t("activityValue", { percent: group.activity }),
      detail: t("activityDetail"),
    },
    {
      label: t("upcomingRhythm"),
      value: upcomingEvents.length ? t("upcomingValue", { count: upcomingEvents.length }) : t("buildingNext"),
      detail: t("upcomingRhythmDetail"),
    },
  ];
}

function sourcedPlaceSignals(place: SourcedPlace, t: (key: string) => string) {
  return [
    {
      label: t("area"),
      value: place.area || "Reykjavik",
      detail: t("areaDetail"),
    },
    {
      label: t("category"),
      value: place.kindLabel,
      detail: t("categoryDetail"),
    },
    {
      label: t("claimPath"),
      value: place.website ? t("claimWithWebsite") : t("claimReady"),
      detail: t("claimPathDetail"),
    },
  ];
}

function blogSignals(posts: BlogPost[], t: (key: string, values?: Record<string, string | number>) => string) {
  return [
    {
      label: t("signals.editorialFocus.label"),
      value: t("signals.editorialFocus.value"),
      detail: t("signals.editorialFocus.detail"),
    },
    {
      label: t("signals.publishedPieces.label"),
      value: String(posts.length),
      detail: t("signals.publishedPieces.detail"),
    },
    {
      label: t("signals.averageDepth.label"),
      value: t("signals.averageDepth.sections", { count: Math.round(posts.reduce((sum, post) => sum + post.sections.length, 0) / posts.length) }),
      detail: t("signals.averageDepth.detail"),
    },
  ];
}

/** Extract image URL from gradient+url art strings or plain URLs */
function extractImageUrl(art: string | undefined | null): string | null {
  if (!art) return null;
  // Plain URL (Supabase storage, external images)
  if (art.startsWith("http://") || art.startsWith("https://") || art.startsWith("/")) {
    // Reject malformed Wikipedia thumbnail URLs (contain nested paths like .jpg/1200px-)
    if (/\.\w{3,4}\/\d+px-/i.test(art)) return null;
    return art;
  }
  // CSS url() syntax inside gradients
  const match = art.match(/url\(['"]?([^'")\s]+)['"]?\)/);
  if (match) {
    const url = match[1];
    if (/\.\w{3,4}\/\d+px-/i.test(url)) return null;
    return url;
  }
  return null;
}

/* ── Category directory ────────────────────────────────── */

const categoryDirectory = categories.map((category) => {
  const slug = slugify(category.name);
  return { ...category, slug };
});

function matchesCategoryText(text: string, keywords: readonly string[]) {
  const normalized = text.toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword));
}

const categoryKeywords: Record<string, readonly string[]> = {
  "nightlife-and-social": ["social", "nightlife", "expat"],
  "outdoors-and-hiking": ["outdoors", "hike", "sports"],
  "tech-and-startups": ["tech", "professional", "language"],
  "music-and-arts": ["arts", "music", "books"],
  "food-and-drink": ["food", "social"],
  "sports-and-fitness": ["sports", "outdoors"],
  "language-exchange": ["language", "expat", "social"],
  "expat-community": ["expat", "social", "language"],
  "books-and-culture": ["books", "arts", "professional"],
  professional: ["professional", "tech", "language"],
};

function getCategoryBundle(slug: string) {
  const category = categoryDirectory.find((item) => item.slug === slug);
  if (!category) return null;

  const keywords = categoryKeywords[slug] ?? [category.name.toLowerCase()];
  const events = publicEvents.filter((event) =>
    matchesCategoryText(
      `${event.category} ${event.summary} ${event.groupName} ${event.area}`,
      keywords,
    ),
  );
  const groups = publicGroups.filter((group) =>
    matchesCategoryText(
      `${group.category} ${group.summary} ${(group.tags ?? []).join(" ")} ${group.organizer}`,
      keywords,
    ),
  );
  const venues = publicVenues.filter((venue) => {
    const venueText = `${venue.type} ${venue.summary} ${(venue.amenities ?? []).join(" ")}`;
    const venueEventMatch = (venue.upcomingEventSlugs ?? []).some((eventSlug) =>
      events.some((event) => event.slug === eventSlug),
    );
    return venueEventMatch || matchesCategoryText(venueText, keywords);
  });

  return { category, events, groups, venues };
}

/* ── Shared layout components ──────────────────────────── */

function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: Array<{ href: Route; label: string; primary?: boolean }>;
}) {
  return (
    <section className="border-b border-gray-200 bg-white">
      <div className="section-shell py-12 sm:py-16">
        <span className="text-xs font-semibold uppercase tracking-widest text-brand-indigo">
          {eyebrow}
        </span>
        <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-4 max-w-2xl text-base text-gray-600 sm:text-lg">{description}</p>
        ) : null}
        {actions?.length ? (
          <div className="mt-6 flex flex-wrap gap-3">
            {actions.map((action) =>
              action.primary ? (
                <Link
                  key={action.label}
                  href={action.href}
                  className="inline-flex items-center gap-2 rounded-full bg-brand-indigo px-6 py-3 text-sm font-semibold !text-white transition hover:opacity-90"
                >
                  {action.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link
                  key={action.label}
                  href={action.href}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  {action.label}
                </Link>
              ),
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function DetailHero({
  eyebrow,
  title,
  description,
  art,
  children,
  actions,
  rsvpSlot,
}: {
  eyebrow: string;
  title: string;
  description: string;
  art: string;
  children?: React.ReactNode;
  actions?: Array<{ href: Route; label: string; primary?: boolean }>;
  rsvpSlot?: React.ReactNode;
}) {
  const imageUrl = extractImageUrl(art);

  return (
    <section className="relative overflow-hidden border-b border-gray-200 bg-gray-900">
      {imageUrl ? (
        <>
          <Image
            fill
            alt=""
            role="presentation"
            className="object-cover opacity-40"
            sizes="100vw"
            src={imageUrl}
            unoptimized={imageUrl.startsWith("https://")}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/30 to-gray-900/80" />
        </>
      ) : (
        <div className="absolute inset-0" style={{ background: art }} />
      )}
      <div className="section-shell relative z-10 py-10 text-white sm:py-14 md:py-20">
        <span className="text-xs font-semibold uppercase tracking-widest text-white/85">
          {eyebrow}
        </span>
        <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-base text-white/85 sm:text-lg">{description}</p>
        {actions?.length ? (
          <div className="mt-6 flex flex-wrap gap-3">
            {actions.map((action) =>
              action.primary ? (
                <Link
                  key={action.label}
                  href={action.href}
                  className="inline-flex items-center gap-2 rounded-full bg-brand-coral px-6 py-3 text-sm font-semibold !text-white transition hover:opacity-90"
                >
                  {action.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link
                  key={action.label}
                  href={action.href}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold !text-white transition hover:bg-white/20"
                >
                  {action.label}
                </Link>
              ),
            )}
          </div>
        ) : null}
        {rsvpSlot ? <div id="rsvp" className="mt-5">{rsvpSlot}</div> : null}
        {children}
      </div>
    </section>
  );
}

function Section({
  title,
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-gray-200 bg-white p-4 sm:p-6", className)}>
      {title ? (
        <h2 className="mb-4 text-lg font-semibold text-gray-900">{title}</h2>
      ) : null}
      {children}
    </div>
  );
}

/* ── Card components ───────────────────────────────────── */

function EventCard({ event }: { event: PublicEvent }) {
  const tCta = useTranslations("cta");
  const tCards = useTranslations("cards");
  const fill = occupancyPercent(event.attendees, event.capacity);
  const startsAt = new Date(event.startsAt);
  const badgeWeekday = startsAt.toLocaleString("en-GB", {
    weekday: "short",
    timeZone: "Atlantic/Reykjavik",
  });
  const badgeDay = startsAt.toLocaleString("en-GB", {
    day: "numeric",
    timeZone: "Atlantic/Reykjavik",
  });
  const badgeMonth = startsAt
    .toLocaleString("en-GB", { month: "short", timeZone: "Atlantic/Reykjavik" })
    .toUpperCase();
  const imageUrl = extractImageUrl(event.art);
  const avgRating =
    event.ratings && event.ratings.length > 0
      ? event.ratings.reduce((sum, r) => sum + r.rating, 0) /
        event.ratings.length
      : null;

  return (
    <Link href={eventHref(event.slug)} className="group block overflow-hidden rounded-xl border border-brand-border-light bg-white shadow-[0_1px_4px_rgba(42,38,56,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(42,38,56,0.12)]">
      {/* ── Image area ── */}
      <div className="relative h-48 overflow-hidden bg-gray-200">
        {imageUrl ? (
          <>
            <Image
              fill
              alt={event.title}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
              src={imageUrl}
              unoptimized={imageUrl.startsWith("https://")}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(30,27,46,0.55)]" />
          </>
        ) : (
          <div className="absolute inset-0" style={{ background: event.art }} />
        )}

        {/* Date badge */}
        <div className="absolute left-4 top-4 z-10 rounded-lg bg-white px-3 py-1.5 text-center shadow-md">
          <div className="text-[0.55rem] font-semibold uppercase tracking-wide text-gray-500">
            {badgeWeekday}
          </div>
          <div className="text-xl font-bold leading-tight text-gray-900">{badgeDay}</div>
          <div className="text-[0.6rem] font-bold uppercase tracking-wider text-brand-coral">
            {badgeMonth}
          </div>
        </div>

        {/* Top-right badges: age + format */}
        <div className="absolute right-4 top-4 z-10 flex flex-col items-end gap-1.5">
          {event.isFree ? (
            <span className="rounded-full bg-emerald-500 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm">
              {tCards("free")}
            </span>
          ) : null}
          {event.ageLabel ? (
            <span className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm",
              event.ageLabel === "All ages" ? "bg-emerald-500/80" : "bg-black/40",
            )}>
              {event.ageLabel}
            </span>
          ) : null}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-5">
        {/* Title */}
        <h2 className="text-lg font-bold leading-snug text-gray-900 transition-colors group-hover:text-brand-indigo">
          {event.title}
        </h2>

        {/* Category + price row */}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <ToneBadge tone={categoryTone(event.category)}>{event.category}</ToneBadge>
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
            {event.priceLabel}
          </span>
          {avgRating !== null ? (
            <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-amber-600">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {avgRating.toFixed(1)}
            </span>
          ) : null}
        </div>

        {/* Summary */}
        <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-gray-600">
          {event.summary}
        </p>

        {/* Date + time */}
        <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
            {formatEventDate(event.startsAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock3 className="h-3.5 w-3.5 text-gray-400" />
            {formatEventTimeRange(event.startsAt, event.endsAt)}
          </span>
        </div>

        {/* Venue */}
        <div className="mt-1.5 flex items-center gap-1.5 text-sm text-gray-600">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          <span className="truncate">{event.venueName}</span>
        </div>

        {/* Group */}
        <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-600">
          <UsersRound className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          <span className="truncate">{event.groupName}</span>
        </div>

        {/* Attendee avatars + going count */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex -space-x-2">
            {AVATAR_COLORS.slice(0, Math.min(event.attendees, 4)).map((color, i) => (
              <div
                key={i}
                className="h-7 w-7 rounded-full border-2 border-white"
                style={{ background: color }}
              />
            ))}
            {event.attendees > 4 ? (
              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-[10px] font-bold text-gray-600">
                +{event.attendees - 4}
              </div>
            ) : null}
          </div>
          <span className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{event.attendees}</span> {tCards("going")}
          </span>
          {/* In person badge */}
          <span className="ml-auto rounded-full bg-brand-indigo/10 px-2.5 py-0.5 text-[11px] font-medium text-brand-indigo">
            {tCards("inPerson")}
          </span>
        </div>

        {/* Capacity bar — always shown */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {event.attendees}/{event.capacity} {tCards("spots")}
            </span>
            {fill >= 95 ? (
              <span className="font-semibold text-red-600">{tCards("waitlist")}</span>
            ) : fill > 75 ? (
              <span className="font-semibold text-brand-coral">{tCards("fillingFast")}</span>
            ) : (
              <span className="text-gray-400">{fill}%</span>
            )}
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-gray-100">
            <div
              className={cn(
                "h-1.5 rounded-full transition-all",
                fill >= 95 ? "bg-red-500" : fill > 75 ? "bg-brand-coral" : fill > 50 ? "bg-brand-indigo" : "bg-emerald-400",
              )}
              style={{ width: `${Math.max(Math.min(fill, 100), 3)}%` }}
            />
          </div>
        </div>

        {/* CTA */}
        <div className="mt-5 flex items-center justify-end">
          <span
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-indigo px-4 py-2 text-sm font-semibold !text-white transition group-hover:opacity-90"
          >
            {tCta("viewEvent")}
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function GroupCard({
  group,
  upcomingTitle,
}: {
  group: PublicGroup;
  upcomingTitle?: string;
}) {
  const tCta = useTranslations("cta");
  const tCards = useTranslations("cards");
  const imageUrl = extractImageUrl(group.banner);
  const isHot = group.activity > 80;

  return (
    <Link href={groupHref(group.slug)} className="group block overflow-hidden rounded-xl border border-[#EBE6DC] bg-white shadow-[0_1px_4px_rgba(42,38,56,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(42,38,56,0.12)]">
      {/* Banner image with overlay badge */}
      <div className="relative h-40 overflow-hidden bg-gray-200">
        {imageUrl ? (
          <>
            <Image
              fill
              alt={group.name}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
              src={imageUrl}
              unoptimized={imageUrl.startsWith("https://")}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0" style={{ background: group.banner }} />
        )}

        {/* Category badge overlaid on banner */}
        <div className="absolute top-3 left-3">
          <ToneBadge tone={categoryTone(group.category)}>{group.category}</ToneBadge>
        </div>

        {/* Hot badge */}
        {isHot && (
          <div className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-brand-coral/90 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            <TrendingUp className="h-3 w-3" />
            {tCards("hot")}
          </div>
        )}

        {/* Member count on banner */}
        <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
          <UsersRound className="h-3.5 w-3.5" />
          {group.members} {tCards("members")}
        </div>
      </div>

      {/* Activity progress bar */}
      <div className="h-1 w-full bg-gray-200">
        <div
          className="h-full bg-brand-indigo transition-all duration-500"
          style={{ width: `${Math.min(group.activity, 100)}%` }}
        />
      </div>

      {/* Card body */}
      <div className="p-5">
        <h2 className="text-lg font-bold leading-snug text-gray-900">{group.name}</h2>
        <p className="mt-1.5 line-clamp-2 text-sm text-gray-600">{group.summary}</p>

        {/* Tags (first 3 + overflow) */}
        {(group.tags ?? []).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {(group.tags ?? []).slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600"
              >
                {tag}
              </span>
            ))}
            {(group.tags ?? []).length > 3 && (
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                +{(group.tags ?? []).length - 3}
              </span>
            )}
          </div>
        )}

        {/* Organizer */}
        <p className="mt-3 text-xs text-gray-400">
          {tCards("organizedBy")}{" "}
          <span className="font-medium text-gray-600">{group.organizer}</span>
        </p>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
          <div className="text-sm text-gray-500">
            {upcomingTitle ? tCards("nextEvent", { title: upcomingTitle }) : tCards("noUpcoming")}
          </div>
          <span
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-indigo px-4 py-2 text-sm font-semibold !text-white transition group-hover:opacity-90"
          >
            {tCta("viewGroup")}
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function VenueCard({ venue }: { venue: PublicVenue }) {
  const tCta = useTranslations("cta");
  const tCards = useTranslations("cards");
  const slugs = venue.upcomingEventSlugs ?? [];
  const nextEvent = slugs.length > 0 ? publicEvents.find((event) => slugs.includes(event.slug)) : undefined;
  const imageUrl = extractImageUrl(venue.art);
  const rating = venue.rating ?? 0;
  const fullStars = Math.floor(rating);
  const emptyStars = 5 - fullStars;

  return (
    <Link href={venueHref(venue.slug)} className="group block overflow-hidden rounded-xl border border-brand-border-light bg-white shadow-[0_1px_4px_rgba(42,38,56,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(42,38,56,0.12)]">
      {/* ── Image section ── */}
      <div className="relative h-44 overflow-hidden bg-gray-200">
        {imageUrl ? (
          <>
            <Image
              fill
              alt={venue.name}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
              src={imageUrl}
              unoptimized={imageUrl.startsWith("https://")}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-indigo/30 to-brand-coral/20" style={venue.art ? { background: venue.art } : undefined} />
        )}

        {/* Venue type badge – top left */}
        <div className="absolute left-3 top-3">
          <span className="flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-gray-800 backdrop-blur-sm">
            <Building2 className="h-3 w-3" />
            {venue.type}
          </span>
        </div>

        {/* Member deal badge – top right */}
        {venue.deal ? (
          <div className="absolute right-3 top-3">
            <span className="rounded-full bg-brand-coral px-2.5 py-1 text-xs font-bold !text-white">
              {tCards("memberDeal")}
            </span>
          </div>
        ) : null}

        {/* Venue name overlay – bottom */}
        <div className="absolute inset-x-0 bottom-0 px-4 pb-3">
          <h3 className="text-lg font-bold leading-tight text-white drop-shadow-sm">{venue.name}</h3>
        </div>
      </div>

      {/* ── Content section ── */}
      <div className="p-5">
        {/* Star rating + area badge row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: fullStars }).map((_, i) => (
              <Star key={`f${i}`} className="h-3.5 w-3.5 fill-current text-amber-500" />
            ))}
            {Array.from({ length: emptyStars }).map((_, i) => (
              <Star key={`e${i}`} className="h-3.5 w-3.5 fill-current text-gray-300" />
            ))}
            <span className="ml-1 text-sm font-semibold text-gray-700">{rating}</span>
          </div>
          <span className="rounded-full bg-brand-indigo-soft px-2.5 py-0.5 text-xs font-medium text-brand-indigo">
            {venue.area}
          </span>
        </div>

        {/* Summary */}
        <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-gray-600">{venue.summary}</p>

        {/* Capacity */}
        <div className="mt-3 flex items-center gap-1.5 text-sm text-gray-500">
          <UsersRound className="h-4 w-4 text-gray-400" />
          <span>{venue.capacity} {tCards("seats")}</span>
        </div>

        {/* Amenity pills */}
        {(venue.amenities ?? []).length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {(venue.amenities ?? []).slice(0, 4).map((amenity) => (
              <span key={amenity} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
                {amenity}
              </span>
            ))}
            {(venue.amenities ?? []).length > 4 && (
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                +{(venue.amenities ?? []).length - 4}
              </span>
            )}
          </div>
        ) : null}

        {/* Member deal detail */}
        {venue.deal ? (
          <div className="mt-3 rounded-lg border border-brand-coral/20 bg-brand-coral/5 px-3 py-2 text-xs font-medium text-brand-coral">
            {venue.deal}
          </div>
        ) : null}

        {/* Divider + bottom row */}
        <div className="mt-4 border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between gap-2">
            {/* Next event or open status */}
            <div className="min-w-0 flex-1 text-sm text-gray-500">
              {nextEvent ? (
                <span className="flex items-center gap-1.5 truncate">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0 text-brand-indigo" />
                  <span className="truncate">{nextEvent.title}</span>
                </span>
              ) : (
                <span className="text-gray-400">{tCards("openForBookings")}</span>
              )}
            </div>
            <span
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand-indigo px-4 py-2 text-sm font-semibold !text-white transition group-hover:opacity-90"
            >
              {tCta("viewVenue")}
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}


function BlogCard({ post }: { post: BlogPost }) {
  const tCta = useTranslations("cta");

  return (
    <Link href={blogHref(post.slug)} className="group block overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-48 overflow-hidden">
        <Image
          src={extractImageUrl(post.hero) ?? "/place-images/reykjavik/reykjavik-871-2-78434189.jpg"}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          unoptimized={(extractImageUrl(post.hero) ?? "").startsWith("https://")}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-brand-indigo backdrop-blur-sm">
          {post.category}
        </span>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold tracking-tight text-gray-900 group-hover:text-brand-indigo transition-colors">
          {post.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 line-clamp-2">{post.excerpt}</p>
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span className="flex items-center gap-2">
            {post.publishedAt}
            {post.readTime ? (
              <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                <Clock3 className="h-3 w-3" />
                {post.readTime}
              </span>
            ) : null}
          </span>
          <span className="font-medium text-brand-indigo">{tCta("readArticle")} &rarr;</span>
        </div>
      </div>
    </Link>
  );
}

function SourcedPlaceCard({ place }: { place: SourcedPlace }) {
  const tCta = useTranslations("cta");
  const tCards = useTranslations("cards");
  const imageSrc = place.image?.localPath || place.image?.remoteUrl;
  const hasPhoto = place.image?.kind === "photo";
  const displaySummary = cleanSourcedSummary(place);

  return (
    <article className="overflow-hidden rounded-xl border border-[#EBE6DC] bg-white shadow-[0_1px_4px_rgba(42,38,56,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(42,38,56,0.12)]">
      <div className="relative h-48 bg-gray-200">
        {imageSrc ? (
          <>
            <Image
              fill
              alt={`${place.name} in ${place.area}`}
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
              src={imageSrc}
              unoptimized={imageSrc.startsWith("https://")}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 text-white">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-black/30 px-2.5 py-1 text-xs font-medium">{place.laneLabel}</span>
                <span className="rounded-full bg-black/30 px-2.5 py-1 text-xs font-medium">{place.kindLabel}</span>
              </div>
              <h3 className="mt-2 text-xl font-bold">{place.name}</h3>
              <p className="text-sm text-white/80">{place.area}</p>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-start justify-end bg-gradient-to-br from-brand-indigo to-brand-indigo-light p-4 text-white">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-black/20 px-2.5 py-1 text-xs font-medium">{place.laneLabel}</span>
              <span className="rounded-full bg-black/20 px-2.5 py-1 text-xs font-medium">{place.kindLabel}</span>
            </div>
            <h3 className="mt-2 text-xl font-bold">{place.name}</h3>
            <p className="text-sm text-white/80">{place.area}</p>
          </div>
        )}
      </div>
      <div className="p-5 space-y-3">
        <p className="text-sm text-gray-600">{displaySummary}</p>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <MapPin className="h-4 w-4 text-gray-400" />
          {place.address || place.area}
        </div>
        {place.website ? (
          <a
            href={place.website}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-indigo"
            rel="noreferrer"
            target="_blank"
          >
            <Globe2 className="h-4 w-4" />
            {tCta("website")}
          </a>
        ) : null}
        {hasPhoto && place.image?.credit ? (
          <div className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
            {tCards("photo")}: {place.image.credit}
          </div>
        ) : null}
        <Link
          href={venueHref(place.slug)}
          className="inline-flex items-center gap-1.5 rounded-full bg-brand-indigo px-4 py-2 text-sm font-semibold !text-white transition hover:opacity-90"
        >
          {tCta("viewVenue")}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}

function TimeFilterBar({
  items,
  activeValue,
  activeCategory,
}: {
  items: Array<{ label: string; value: string }>;
  activeValue?: string;
  activeCategory?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Time filters">
      {items.map((item) => {
        const isActive = activeValue === item.value;
        const params = new URLSearchParams();
        if (!isActive) params.set("when", item.value);
        if (activeCategory) params.set("category", activeCategory);
        const qs = params.toString();
        const href = (qs ? `/events?${qs}` : "/events") as Route;
        return (
          <Link
            key={item.value}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition",
              isActive
                ? "bg-brand-indigo !text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

/* ── Breadcrumbs ─────────────────────────────────────── */

function Breadcrumbs({
  crumbs,
}: {
  crumbs: Array<{ href?: Route; label: string }>;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="section-shell py-3 text-sm text-gray-500"
    >
      <ol className="flex flex-wrap items-center gap-1.5">
        {crumbs.map((crumb, i) => (
          <li key={crumb.label} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-gray-400" aria-hidden="true">/</span>}
            {crumb.href && i < crumbs.length - 1 ? (
              <Link href={crumb.href} className="transition hover:text-brand-indigo">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-gray-900 font-medium">{crumb.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* ── Index hero (rich header with image) ──────────────── */

function IndexHero({
  eyebrow,
  title,
  description,
  imageSrc,
  stats,
  actions,
  searchAction,
  searchPlaceholder,
}: {
  eyebrow: string;
  title: string;
  description: string;
  imageSrc: string;
  stats?: Array<{ label: string; value: string }>;
  actions?: Array<{ href: Route; label: string; primary?: boolean }>;
  searchAction?: string;
  searchPlaceholder?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-gray-900">
      <Image
        fill
        alt=""
        role="presentation"
        className="object-cover opacity-30"
        sizes="100vw"
        src={imageSrc}
        priority
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/40 via-gray-900/60 to-gray-900/90" />
      <div className="section-shell relative z-10 py-10 text-white sm:py-16 md:py-24">
        <span className="text-xs font-semibold uppercase tracking-widest text-brand-coral-soft">
          {eyebrow}
        </span>
        <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
          {description}
        </p>
        {/* Inline search bar */}
        {searchAction ? (
          <form action={searchAction} method="GET" className="mt-8 flex max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="q"
                placeholder={searchPlaceholder ?? "Search..."}
                className="w-full rounded-l-full border-0 bg-white py-3.5 pl-12 pr-4 text-sm text-gray-900 shadow-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-coral"
              />
            </div>
            <button
              type="submit"
              className="rounded-r-full bg-brand-coral px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:opacity-90"
            >
              <Search className="h-5 w-5" />
            </button>
          </form>
        ) : null}
        {actions?.length ? (
          <div className={cn("flex flex-wrap gap-3", searchAction ? "mt-5" : "mt-8")}>
            {actions.map((action) =>
              action.primary ? (
                <Link
                  key={action.label}
                  href={action.href}
                  className="inline-flex items-center gap-2 rounded-full bg-brand-coral px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-coral/20 transition hover:opacity-90"
                >
                  {action.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link
                  key={action.label}
                  href={action.href}
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  {action.label}
                </Link>
              ),
            )}
          </div>
        ) : null}
        {stats?.length ? (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold sm:text-3xl">{stat.value}</div>
                <div className="mt-1 text-sm text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   PAGE SCREENS
   ══════════════════════════════════════════════════════════ */

export function EventsIndexScreen({
  events = publicEvents,
  groupCount = publicGroups.length,
  venueCount = publicVenues.length,
  searchQuery,
  activeCategory,
  activeWhen,
}: {
  events?: PublicEvent[];
  groupCount?: number;
  venueCount?: number;
  searchQuery?: string;
  activeCategory?: string;
  activeWhen?: string;
} = {}) {
  const t = useTranslations("eventsPage");
  const tCards = useTranslations("cards");
  const tSignals = useTranslations("signals");
  const featured = events[0] ?? null;
  const totalAttendees = events.reduce((sum, e) => sum + e.attendees, 0);
  const featuredImage = featured ? (extractImageUrl(featured.art) ?? "/place-images/reykjavik/reykjavik-871-2-78434189.jpg") : "/place-images/reykjavik/reykjavik-871-2-78434189.jpg";
  const lanes = discoveryLanes(events, tSignals);
  const usedCategories = Array.from(new Set(events.map((e) => e.category)));

  return (
    <>
      <IndexHero
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        description={t("hero.description")}
        imageSrc="/place-images/reykjavik/reykjavik-871-2-78434189.jpg"
        searchAction="/events"
        searchPlaceholder={tCards("searchEvents")}
        stats={[
          { label: t("stats.upcomingEvents"), value: String(events.length) },
          { label: t("stats.totalAttendees"), value: totalAttendees.toLocaleString() },
          { label: t("stats.partnerVenues"), value: String(venueCount) },
          { label: t("stats.activeGroups"), value: String(groupCount) },
        ]}
        actions={[
          { href: "/signup", label: t("actions.joinCommunity"), primary: true },
          { href: "/groups", label: t("actions.exploreGroups") },
        ]}
      />

      {/* Search results banner */}
      {searchQuery && (
        <section className="section-shell py-6">
          <div className="flex items-center gap-3 rounded-2xl border border-brand-indigo/20 bg-brand-indigo/5 px-5 py-4">
            <Search className="h-5 w-5 text-brand-indigo" />
            <div>
              <span className="font-semibold text-brand-text">
                {events.length} result{events.length !== 1 ? "s" : ""} for &ldquo;{searchQuery}&rdquo;
              </span>
            </div>
            <Link
              href={"/events" as Route}
              className="ml-auto text-sm font-medium text-brand-indigo hover:underline"
            >
              Clear search
            </Link>
          </div>
        </section>
      )}

      {/* Featured event spotlight */}
      {featured ? <section className="reveal section-shell py-12">
        <div className="mb-8 flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-brand-coral" />
          <h2 className="text-lg font-semibold text-gray-900">{t("featured.heading")}</h2>
        </div>
        <div className="paper-panel-premium overflow-hidden rounded-2xl border border-gray-200 md:grid md:grid-cols-5">
          <div className="relative h-72 md:col-span-3 md:h-auto md:min-h-[360px]">
            <Image
              fill
              alt={featured.title}
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 60vw"
              src={featuredImage}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent md:bg-gradient-to-r md:from-transparent md:via-black/20 md:to-black/60" />
            <div className="absolute bottom-4 left-4 flex gap-2">
              <ToneBadge tone={categoryTone(featured.category)}>{featured.category}</ToneBadge>
              <span className="rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                {featured.priceLabel}
              </span>
            </div>
          </div>
          <div className="flex flex-col justify-center p-6 sm:p-8 md:col-span-2">
            <div className="text-sm font-medium text-brand-indigo">
              {formatEventDate(featured.startsAt)} · {formatEventTimeRange(featured.startsAt, featured.endsAt)}
            </div>
            <h3 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">{featured.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-600 line-clamp-3">
              {featured.description?.[0] ?? featured.summary}
            </p>
            <div className="mt-5 flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {featured.venueName}
              </span>
              <span className="flex items-center gap-1.5">
                <UsersRound className="h-4 w-4" />
                {featured.attendees}/{featured.capacity}
              </span>
            </div>
            <div className="mt-3">
              <div className="h-1.5 rounded-full bg-gray-100">
                <div
                  className="h-1.5 rounded-full bg-brand-indigo"
                  style={{ width: `${occupancyPercent(featured.attendees, featured.capacity)}%` }}
                />
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={eventHref(featured.slug)}
                className="inline-flex items-center gap-2 rounded-full bg-brand-indigo px-6 py-3 text-sm font-semibold !text-white transition hover:opacity-90"
              >
                {t("featured.reserveSpot")}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={eventHref(featured.slug)}
                className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                {t("featured.readMore")}
              </Link>
            </div>
          </div>
        </div>
      </section> : null}

      {/* Filters + grid */}
      <section className="border-t border-gray-200 bg-brand-sand">
        <div className="section-shell py-10">
          <h2 className="mb-2 text-2xl font-bold text-gray-900">{t("grid.allEvents")}</h2>
          <p className="mb-6 text-sm text-gray-500">{t("grid.filterByCategory")}</p>

          {/* Category filter chips — interactive links */}
          <div className="mb-6 flex flex-wrap gap-2">
            <Link
              href="/events"
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-semibold transition",
                !activeCategory
                  ? "bg-brand-indigo !text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200",
              )}
            >
              {t("filters.all")}
            </Link>
            {publicCategoryOptions.map((cat) => {
              const isActive = activeCategory?.toLowerCase() === cat.toLowerCase();
              const catParam = cat.toLowerCase();
              const href = activeWhen
                ? (`/events?category=${encodeURIComponent(catParam)}&when=${activeWhen}` as Route)
                : (`/events?category=${encodeURIComponent(catParam)}` as Route);
              return (
                <Link
                  key={cat}
                  href={isActive ? "/events" : href}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-xs font-semibold transition",
                    isActive
                      ? "bg-brand-indigo !text-white"
                      : usedCategories.includes(cat)
                        ? "bg-brand-indigo/10 text-brand-indigo ring-1 ring-brand-indigo/20 hover:bg-brand-indigo/20"
                        : "bg-gray-100 text-gray-500 cursor-default",
                  )}
                >
                  {cat}
                </Link>
              );
            })}
          </div>

          {/* Time filters — interactive links */}
          <TimeFilterBar
            items={[
              { label: t("filters.startingSoon"), value: "starting-soon" },
              { label: t("filters.today"), value: "today" },
              { label: t("filters.thisWeek"), value: "this-week" },
              { label: t("filters.weekend"), value: "weekend" },
              { label: t("filters.month"), value: "month" },
            ]}
            activeValue={activeWhen}
            activeCategory={activeCategory}
          />

          {/* Discovery lanes */}
          {lanes.length > 0 ? (
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {lanes.map((lane, i) => {
                const laneIcon = i === 0 ? <Sparkles className="h-4 w-4" /> : i === 1 ? <UsersRound className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />;
                const laneColor = i === 0 ? "border-l-amber-500" : i === 1 ? "border-l-emerald-500" : "border-l-rose-500";
                return (
                  <Link
                    key={lane.label}
                    href={lane.href}
                    className={cn(
                      "rounded-2xl border border-brand-border-light border-l-4 bg-white p-5 shadow-[0_1px_4px_rgba(42,38,56,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(42,38,56,0.08)]",
                      laneColor,
                    )}
                  >
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">
                      {laneIcon}
                      {lane.label}
                    </div>
                    <div className="mt-3 text-xl font-bold tracking-tight text-gray-900">
                      {lane.title}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">{lane.detail}</p>
                  </Link>
                );
              })}
            </div>
          ) : null}

          {/* Event grid */}
          <div className="reveal-group mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.slug} event={event} />
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-indigo via-indigo-700 to-indigo-900 p-8 text-center text-white sm:p-10 md:p-14">
            <h3 className="text-3xl font-bold sm:text-4xl">{t("cta.title")}</h3>
            <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-white/85">
              {t("cta.description")}
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-white/80">
              {t("cta.subtitle")}
            </p>
            <Link
              href="/signup"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-10 py-4 text-base font-semibold shadow-lg shadow-black/20 transition hover:bg-white/90"
              style={{ color: "var(--color-brand-indigo-light)" }}
            >
              {t("cta.button")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export function EventDetailScreen({ event }: { event: PublicEvent }) {
  const t = useTranslations("eventDetailPage");
  const tSignals = useTranslations("signals");
  const tNav = useTranslations("nav");
  const group = publicGroups.find((item) => item.slug === event.groupSlug);
  const venue = publicVenues.find((item) => item.slug === event.venueSlug);
  const relatedEvents = publicEvents
    .filter(
      (item) =>
        item.slug !== event.slug &&
        (item.groupSlug === event.groupSlug || item.venueSlug === event.venueSlug),
    )
    .slice(0, 3);
  const formatSignals = eventFormatSignals(event, tSignals);
  const signalIcons = [Eye, TrendingUp, Sparkles];

  return (
    <>
      <Breadcrumbs
        crumbs={[
          { href: "/" as Route, label: tNav("home") },
          { href: "/events" as Route, label: tNav("events") },
          { label: event.title },
        ]}
      />
      <DetailHero
        eyebrow={`${event.category} ${t("eyebrowSuffix")}`}
        title={event.title}
        description={event.summary}
        art={event.art}
        actions={[
          { href: `/events/${event.slug}#rsvp` as Route, label: t("actions.rsvp"), primary: true },
          ...(group ? [{ href: groupHref(group.slug), label: t("actions.viewGroup") }] : []),
        ]}
        rsvpSlot={
          <div className="flex items-center gap-3">
            <RsvpButton eventSlug={event.slug} ticketType={event.isFree ? "free" : "paid"} priceLabel={event.priceLabel} />
            <ShareButton title={event.title} text={event.summary} />
          </div>
        }
      />

      <section className="section-shell py-10 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
          {/* ── Main content ── */}
          <div className="space-y-10">
            {/* About */}
            <div>
              <h2 className="font-editorial mb-5 text-2xl tracking-tight text-gray-900">
                {t("sections.aboutThisEvent")}
              </h2>
              <div className="space-y-5">
                {event.description.map((paragraph) => (
                  <p key={paragraph} className="leading-8 text-gray-700">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Format signals as icon cards */}
            <div>
              <h2 className="font-editorial mb-5 text-2xl tracking-tight text-gray-900">
                {t("sections.whyThisFormatWorks")}
              </h2>
              <div className="grid gap-5 sm:grid-cols-3">
                {formatSignals.map((signal, i) => {
                  const Icon = signalIcons[i % signalIcons.length];
                  return (
                    <div
                      key={signal.label}
                      className="paper-panel rounded-2xl p-5"
                    >
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-indigo-soft">
                        <Icon className="h-5 w-5 text-brand-indigo" />
                      </div>
                      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">
                        {signal.label}
                      </div>
                      <div className="mt-2 text-sm font-semibold leading-6 text-gray-900">
                        {signal.value}
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{signal.detail}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Gallery 2x2 grid */}
            {(event.gallery ?? []).length > 0 ? (
              <div>
                <h2 className="font-editorial mb-5 text-2xl tracking-tight text-gray-900">
                  {t("sections.gallery")}
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {event.gallery.slice(0, 4).map((art, index) => {
                    const img = extractImageUrl(art);
                    return (
                      <div key={`gallery-${index}`} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100">
                        {img ? (
                          <Image fill alt={`${event.title} — photo ${index + 1}`} className="object-cover" sizes="(max-width: 768px) 50vw, 33vw" src={img} unoptimized={img.startsWith("https://")} />
                        ) : (
                          <div className="h-full w-full" style={{ background: art }} />
                        )}
                      </div>
                    );
                  })}
                </div>
                {event.gallery.length > 4 && (
                  <p className="mt-3 text-center text-sm font-medium text-brand-indigo">
                    {t("viewAllPhotos", { count: event.gallery.length })}
                  </p>
                )}
              </div>
            ) : null}

            {/* Comments */}
            {(event.comments ?? []).length > 0 ? (
              <div>
                <h2 className="font-editorial mb-5 text-2xl tracking-tight text-gray-900">
                  {t("sections.comments")}
                </h2>
                <div className="space-y-5">
                  {event.comments.map((comment) => (
                    <div
                      key={`${comment.author}-${comment.postedAt}`}
                      className="border-b border-brand-border-light pb-5 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-indigo-soft text-sm font-bold text-brand-indigo">
                          {comment.author.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <span className="font-semibold text-gray-900">{comment.author}</span>
                          <span className="ml-2 text-xs text-gray-400">{comment.postedAt}</span>
                        </div>
                      </div>
                      <p className="mt-2.5 pl-12 leading-relaxed text-gray-700">{comment.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Ratings */}
            {(event.ratings ?? []).length > 0 ? (
              <div>
                <h2 className="font-editorial mb-5 text-2xl tracking-tight text-gray-900">
                  {t("sections.reviews")}
                </h2>
                <div className="space-y-5">
                  {event.ratings.map((rating) => (
                    <div
                      key={`${rating.author}-${rating.rating}`}
                      className="border-b border-brand-border-light pb-5 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-coral-soft text-sm font-bold text-brand-coral">
                          {rating.author.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <span className="font-semibold text-gray-900">{rating.author}</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "h-4 w-4",
                                i < rating.rating ? "fill-amber-500 text-amber-500" : "text-gray-200",
                              )}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="mt-2.5 pl-12 leading-relaxed text-gray-700">{rating.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            {/* Event details card */}
            <div className="paper-panel rounded-2xl p-5">
              <h3 className="font-editorial mb-4 text-lg tracking-tight text-gray-900">
                {t("sections.details")}
              </h3>
              <KeyValueList
                items={[
                  { key: "date", label: t("labels.date"), value: formatEventDate(event.startsAt) },
                  { key: "time", label: t("labels.time"), value: formatEventTimeRange(event.startsAt, event.endsAt) },
                  { key: "venue", label: t("labels.venue"), value: event.venueName },
                  ...(event.groupName ? [{ key: "group", label: t("labels.group"), value: event.groupName }] : []),
                  { key: "price", label: t("labels.ticket"), value: event.priceLabel },
                  ...(event.ageLabel && event.ageLabel !== "none" ? [{ key: "age", label: t("labels.age"), value: event.ageLabel }] : []),
                ].filter((item) => item.value)}
              />
              <div className="mt-4 rounded-lg bg-gray-50 p-4">
                <AttendeeCount eventSlug={event.slug} serverCount={event.attendees} capacity={event.capacity} />
              </div>
              <div className="mt-5">
                <RsvpButton eventSlug={event.slug} className="w-full justify-center" ticketType={event.isFree ? "free" : "paid"} priceLabel={event.priceLabel} />
              </div>
            </div>

            {/* Booking notes card */}
            <div className="paper-panel rounded-2xl p-5">
              <h3 className="font-editorial mb-4 text-lg tracking-tight text-gray-900">
                {t("sections.bookingNotes")}
              </h3>
              <div className="space-y-3">
                {[
                  { label: t("labels.hostContact"), value: event.hostContact },
                  { label: t("labels.shareFlow"), value: event.shareLabel },
                  { label: t("labels.roomPolicy"), value: event.approvalLabel },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg border border-brand-border-light bg-brand-sand-light px-4 py-3"
                  >
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">
                      {item.label}
                    </div>
                    <div className="mt-2 text-sm leading-relaxed text-gray-700">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Host group card */}
            {group ? (
              <div className="paper-panel rounded-2xl p-5">
                <h3 className="font-editorial mb-3 text-lg tracking-tight text-gray-900">
                  {t("sections.hostGroup")}
                </h3>
                <div className="text-lg font-bold text-gray-900">{group.name}</div>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">{group.summary}</p>
                <KeyValueList
                  items={[
                    { key: "members", label: t("labels.members"), value: String(group.members) },
                    { key: "organizer", label: t("labels.organizer"), value: group.organizer },
                  ]}
                />
                <Link
                  href={groupHref(group.slug)}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand-indigo"
                >
                  {t("labels.viewGroup")} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : null}

            {/* Venue card */}
            {venue ? (
              <div className="paper-panel rounded-2xl p-5">
                <h3 className="font-editorial mb-3 text-lg tracking-tight text-gray-900">
                  {t("sections.venue")}
                </h3>
                <div className="text-lg font-bold text-gray-900">{venue.name}</div>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">{venue.summary}</p>
                <KeyValueList
                  items={[
                    { key: "type", label: t("labels.type"), value: venue.type },
                    { key: "area", label: t("labels.area"), value: venue.area },
                    { key: "rating", label: t("labels.rating"), value: `${venue.rating}` },
                  ]}
                />
                {venue.deal ? (
                  <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    {venue.deal}
                  </div>
                ) : null}
                <Link
                  href={venueHref(venue.slug)}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand-indigo"
                >
                  {t("labels.viewVenue")} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : null}
          </div>
        </div>

        {/* Related events */}
        {relatedEvents.length > 0 ? (
          <div className="mt-14 border-t border-brand-border-light pt-10">
            <h2 className="font-editorial mb-6 text-2xl tracking-tight text-gray-900">
              {t("sections.relatedEvents")}
            </h2>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {relatedEvents.map((item) => (
                <EventCard key={item.slug} event={item} />
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </>
  );
}

export function GroupsIndexScreen({
  groups = publicGroups,
  events = publicEvents,
  eventCount,
  searchQuery,
  activeCategory,
}: {
  groups?: PublicGroup[];
  events?: PublicEvent[];
  eventCount?: number;
  searchQuery?: string;
  activeCategory?: string;
} = {}) {
  const t = useTranslations("groupsPage");
  const tCards = useTranslations("cards");
  const totalMembers = groups.reduce((sum, g) => sum + g.members, 0);
  const avgActivity = Math.round(groups.reduce((sum, g) => sum + g.activity, 0) / groups.length);
  const strongestGroups = [...groups]
    .sort((left, right) => right.activity - left.activity || right.members - left.members)
    .slice(0, 3);

  /* Derive unique categories from groups for filter chips */
  const allCategories = Array.from(new Set(groups.map((g) => g.category)));

  /* Map group slugs to their next upcoming event title */
  const resolvedEventCount = eventCount ?? events.length;
  const nextEventByGroup = new Map<string, string>();
  for (const group of groups) {
    if ((group.upcomingEventSlugs ?? []).length > 0) {
      const event = events.find((e) => e.slug === (group.upcomingEventSlugs ?? [])[0]);
      if (event) nextEventByGroup.set(group.slug, event.title);
    }
  }

  /* Activity bar color based on percentage */
  function activityBarColor(pct: number) {
    if (pct >= 80) return "bg-emerald-500";
    if (pct >= 50) return "bg-amber-400";
    return "bg-gray-300";
  }

  return (
    <>
      <IndexHero
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        description={t("hero.description")}
        imageSrc="/place-images/reykjavik/hallgrimskirkja-60f147a6.jpg"
        searchAction="/groups"
        searchPlaceholder={tCards("searchGroups")}
        stats={[
          { label: t("stats.activeGroups"), value: String(groups.length) },
          { label: t("stats.totalMembers"), value: totalMembers.toLocaleString() },
          { label: t("stats.avgActivity"), value: `${avgActivity}%` },
          { label: t("stats.weeklyEvents"), value: String(resolvedEventCount) },
        ]}
        actions={[
          { href: "/signup", label: t("actions.joinGroup"), primary: true },
          { href: "/events", label: t("actions.seeEvents") },
        ]}
      />

      {/* How groups work */}
      <section className="border-b border-gray-200 bg-white">
        <div className="section-shell py-10">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                step: "01",
                icon: UsersRound,
                title: t("howItWorks.findTitle"),
                text: t("howItWorks.findText"),
              },
              {
                step: "02",
                icon: CalendarDays,
                title: t("howItWorks.joinTitle"),
                text: t("howItWorks.joinText"),
              },
              {
                step: "03",
                icon: TrendingUp,
                title: t("howItWorks.buildTitle"),
                text: t("howItWorks.buildText"),
              },
            ].map((item) => (
              <div
                key={item.title}
                className="relative overflow-hidden rounded-xl border-l-4 border-brand-indigo bg-white p-5 shadow-[0_1px_4px_rgba(42,38,56,0.04)]"
              >
                {/* Large faded step number */}
                <span className="pointer-events-none absolute -top-3 right-3 select-none text-[5rem] font-black leading-none text-brand-indigo/[0.06]">
                  {item.step}
                </span>
                <div className="relative flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-indigo-soft">
                    <item.icon className="h-5 w-5 text-brand-indigo" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{item.title}</div>
                    <p className="mt-1 text-sm text-gray-600">{item.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Groups grid */}
      <section className="bg-brand-sand">
        <div className="section-shell py-10">
          {/* Search results banner */}
          {searchQuery && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-brand-indigo/20 bg-brand-indigo/5 px-5 py-4">
              <Search className="h-5 w-5 text-brand-indigo" />
              <span className="font-semibold text-brand-text">
                {groups.length} result{groups.length !== 1 ? "s" : ""} for &ldquo;{searchQuery}&rdquo;
              </span>
              <Link href={"/groups" as Route} className="ml-auto text-sm font-medium text-brand-indigo hover:underline">
                Clear search
              </Link>
            </div>
          )}

          {/* Strongest groups showcase */}
          <h2 className="mb-6 text-2xl font-bold text-gray-900">{t("showcase.topGroups")}</h2>
          <div className="mb-10 grid gap-4 lg:grid-cols-3">
            {strongestGroups.map((group) => {
              const nextEvent = nextEventByGroup.get(group.slug);
              return (
                <Link
                  key={group.slug}
                  href={groupHref(group.slug)}
                  className="editorial-link-card group/card relative overflow-hidden p-5 transition-all hover:border-brand-indigo/30 hover:shadow-[0_20px_48px_rgba(42,38,56,0.10)]"
                >
                  {/* Gradient border accent on hover */}
                  <span className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-[1.2rem] bg-gradient-to-r from-brand-indigo via-brand-coral to-brand-indigo opacity-0 transition-opacity group-hover/card:opacity-100" />

                  <div className="flex items-center justify-between gap-3">
                    <ToneBadge tone={categoryTone(group.category)}>{group.category}</ToneBadge>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                      <UsersRound className="h-3.5 w-3.5" />
                      {group.members}
                    </div>
                  </div>

                  <div className="mt-3 text-xl font-bold tracking-tight text-gray-900">{group.name}</div>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{group.summary || groupArchetype(group)}</p>

                  {/* Activity bar */}
                  <div className="mt-4">
                    <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-gray-500">
                      <span>{group.activity}% active</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={cn("h-full rounded-full transition-all", activityBarColor(group.activity))}
                        style={{ width: `${group.activity}%` }}
                      />
                    </div>
                  </div>

                  {/* Next event */}
                  {nextEvent && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0 text-brand-indigo" />
                      <span className="truncate">{nextEvent}</span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Category filter chips — interactive links */}
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-sm font-medium text-gray-500">{t("grid.filterByCategory")}</span>
            <Link
              href="/groups"
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
                !activeCategory
                  ? "bg-brand-indigo !text-white"
                  : "border border-brand-border-light bg-white text-gray-700 hover:border-brand-indigo/30 hover:bg-brand-indigo-soft",
              )}
            >
              {t("filters.all")}
            </Link>
            {allCategories.map((cat) => {
              const isActive = activeCategory?.toLowerCase() === cat.toLowerCase();
              const href = (`/groups?category=${encodeURIComponent(cat.toLowerCase())}`) as Route;
              return (
                <Link
                  key={cat}
                  href={isActive ? "/groups" : href}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
                    isActive
                      ? "bg-brand-indigo !text-white"
                      : "border border-brand-border-light bg-white text-gray-700 shadow-[0_1px_2px_rgba(42,38,56,0.04)] hover:border-brand-indigo/30 hover:bg-brand-indigo-soft",
                  )}
                >
                  {cat}
                </Link>
              );
            })}
          </div>

          <h2 className="mb-6 text-2xl font-bold text-gray-900">{t("grid.activeGroups")}</h2>
          <div className="reveal-group grid gap-6 md:grid-cols-2">
            {groups.map((group) => (
              <GroupCard key={group.slug} group={group} upcomingTitle={nextEventByGroup.get(group.slug)} />
            ))}
          </div>

          {/* Start a group CTA */}
          <div className="relative mt-12 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-coral via-[#e8634a] to-[#d4503d] p-6 shadow-[0_8px_32px_rgba(212,80,61,0.25)] sm:p-8 md:p-12">
            {/* Decorative dot pattern */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                backgroundSize: "24px 24px",
              }}
            />

            <div className="relative flex flex-col items-center text-center sm:flex-row sm:text-left sm:gap-8">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <Zap className="h-9 w-9 text-white" />
              </div>
              <div className="mt-4 sm:mt-0">
                <h3 className="text-xl font-bold !text-white">{t("startGroup.title")}</h3>
                <p className="mt-2 max-w-lg text-sm text-white/80">
                  {t("startGroup.description")}
                </p>
              </div>
              <div className="mt-6 shrink-0 sm:mt-0 sm:ml-auto">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition hover:scale-105 hover:shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
                  style={{ color: "var(--color-brand-indigo-light)" }}
                >
                  {t("startGroup.button")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}


export function GroupDetailScreen({ group }: { group: PublicGroup }) {
  const t = useTranslations("groupDetailPage");
  const tNav = useTranslations("nav");
  const tSignals = useTranslations("signals");
  const upcomingEvents = publicEvents.filter((event) =>
    (group.upcomingEventSlugs ?? []).includes(event.slug),
  );
  const operatingSignals = groupOperatingSignals(group, upcomingEvents, tSignals);
  const signalIcons = [Users, TrendingUp, CalendarDays];

  return (
    <>
      <Breadcrumbs
        crumbs={[
          { href: "/" as Route, label: tNav("home") },
          { href: "/groups" as Route, label: tNav("groups") },
          { label: group.name },
        ]}
      />
      <DetailHero
        eyebrow={`${group.category} ${t("eyebrowSuffix")}`}
        title={group.name}
        description={group.summary}
        art={group.banner}
        actions={[
          { href: "/signup", label: t("actions.joinThisGroup"), primary: true },
        ]}
        rsvpSlot={<ShareButton title={group.name} text={group.summary} />}
      >
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
          <div>
            <div className="text-sm text-white/80">{t("heroStats.members")}</div>
            <div className="text-2xl font-bold">{group.members}</div>
          </div>
          <div>
            <div className="text-sm text-white/80">{t("heroStats.activity")}</div>
            <div className="text-2xl font-bold">{group.activity}%</div>
          </div>
          <div>
            <div className="text-sm text-white/80">{t("heroStats.organizer")}</div>
            <div className="text-lg font-semibold">{group.organizer}</div>
          </div>
          <div>
            <div className="text-sm text-white/80">{t("heroStats.upcoming")}</div>
            <div className="text-2xl font-bold">{upcomingEvents.length}</div>
          </div>
        </div>
      </DetailHero>

      <section className="section-shell py-10 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
          {/* ── Main content ── */}
          <div className="space-y-10">
            {/* About */}
            <div>
              <h2 className="font-editorial mb-5 text-2xl tracking-tight text-gray-900">
                {t("sections.about")}
              </h2>
              <div className="space-y-5">
                {group.description.map((paragraph) => (
                  <p key={paragraph} className="leading-8 text-gray-700">{paragraph}</p>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {(group.tags ?? []).map((tag) => (
                  <ToneBadge key={tag} tone={categoryTone(group.category)}>{tag}</ToneBadge>
                ))}
              </div>
            </div>

            {/* Operating signals as icon cards */}
            <div>
              <h2 className="font-editorial mb-5 text-2xl tracking-tight text-gray-900">
                {t("sections.whyMembersStay")}
              </h2>
              <div className="grid gap-5 sm:grid-cols-3">
                {operatingSignals.map((signal, i) => {
                  const Icon = signalIcons[i % signalIcons.length];
                  return (
                    <div
                      key={signal.label}
                      className="paper-panel rounded-2xl p-5"
                    >
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-coral-soft">
                        <Icon className="h-5 w-5 text-brand-coral" />
                      </div>
                      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">
                        {signal.label}
                      </div>
                      <div className="mt-2 text-sm font-semibold leading-6 text-gray-900">
                        {signal.value}
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{signal.detail}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upcoming events as EventCards */}
            <div>
              <h2 className="font-editorial mb-5 text-2xl tracking-tight text-gray-900">
                {t("sections.upcomingEvents")}
              </h2>
              {upcomingEvents.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2">
                  {upcomingEvents.map((event) => (
                    <EventCard key={event.slug} event={event} />
                  ))}
                </div>
              ) : (
                <p className="leading-8 text-gray-500">{t("empty.noUpcomingEvents")}</p>
              )}
            </div>

            {/* Past events as compact list */}
            {group.pastEvents.length > 0 ? (
              <div>
                <h2 className="font-editorial mb-5 text-2xl tracking-tight text-gray-900">
                  {t("sections.pastEvents")}
                </h2>
                <div className="space-y-2">
                  {group.pastEvents.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-lg border border-brand-border-light bg-white px-4 py-2.5 text-sm text-gray-600"
                    >
                      <Clock3 className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Discussions with reply counts */}
            {group.discussions.length > 0 ? (
              <div>
                <h2 className="font-editorial mb-5 text-2xl tracking-tight text-gray-900">
                  {t("sections.discussions")}
                </h2>
                <div className="space-y-4">
                  {group.discussions.map((discussion) => (
                    <div
                      key={discussion.title}
                      className="paper-panel rounded-xl p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{discussion.title}</div>
                          <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{discussion.preview}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-brand-sand-light px-3 py-1.5 text-xs font-medium text-gray-600">
                          <MessageSquare className="h-3.5 w-3.5" />
                          {discussion.replies}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            {/* Group stats card */}
            <div className="paper-panel rounded-2xl p-5">
              <h3 className="font-editorial mb-4 text-lg tracking-tight text-gray-900">
                {t("sections.groupStats")}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-brand-sand-light p-3 text-center">
                  <div className="text-2xl font-bold text-gray-900">{group.members}</div>
                  <div className="text-xs font-medium text-gray-500">{t("heroStats.members")}</div>
                </div>
                <div className="rounded-lg bg-brand-sand-light p-3 text-center">
                  <div className="text-2xl font-bold text-gray-900">{group.activity}%</div>
                  <div className="text-xs font-medium text-gray-500">{t("heroStats.activity")}</div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3 border-t border-brand-border-light pt-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-indigo-soft text-sm font-bold text-brand-indigo">
                  {group.organizer.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs text-gray-500">{t("labels.organizer")}</div>
                  <div className="text-sm font-semibold text-gray-900">{group.organizer}</div>
                </div>
              </div>
            </div>

            {/* Membership info card */}
            <div className="paper-panel rounded-2xl p-5">
              <h3 className="font-editorial mb-4 text-lg tracking-tight text-gray-900">
                {t("sections.membershipRead")}
              </h3>
              <div className="space-y-3">
                {[
                  { label: t("labels.bestKnownFor"), value: (group.tags ?? []).join(" · ") },
                  {
                    label: t("labels.whyThisGroupMatters"),
                    value: group.description || groupArchetype(group),
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg border border-brand-border-light bg-brand-sand-light px-4 py-3"
                  >
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">
                      {item.label}
                    </div>
                    <div className="mt-2 text-sm leading-relaxed text-gray-700">{item.value}</div>
                  </div>
                ))}
              </div>
              <Link
                href="/signup"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-brand-indigo px-6 py-3 text-sm font-semibold !text-white transition hover:opacity-90"
              >
                {t("actions.joinThisGroup")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export function VenuesIndexScreen({
  venues = publicVenues,
  searchQuery,
  activeType,
  activeArea,
  featuredSourcedPlaces = [],
}: {
  venues?: PublicVenue[];
  searchQuery?: string;
  activeType?: string;
  activeArea?: string;
  featuredSourcedPlaces?: SourcedPlace[];
} = {}) {
  const t = useTranslations("venuesPage");
  const tCards = useTranslations("cards");
  const sourcedPlaces = featuredSourcedPlaces;
  const avgRating = venues.length > 0 ? (venues.reduce((sum, v) => sum + (v.rating ?? 0), 0) / venues.length).toFixed(1) : "0.0";
  const totalCapacity = venues.reduce((sum, v) => sum + (v.capacity ?? 0), 0);
  const neighborhoods = areaHighlights(venues).slice(0, 4);
  const allTypes = Array.from(new Set(publicVenues.map((v) => v.type)));
  const allAreas = Array.from(new Set(publicVenues.map((v) => v.area)));

  return (
    <>
      <IndexHero
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        description={t("hero.description")}
        imageSrc="/place-images/reykjavik/hof-i-deccf755.jpg"
        searchAction="/venues"
        searchPlaceholder={tCards("searchVenues")}
        stats={[
          { label: t("stats.partnerVenues"), value: String(venues.length) },
          { label: t("stats.avgRating"), value: `${avgRating}/5` },
          { label: t("stats.totalCapacity"), value: totalCapacity.toLocaleString() },
          { label: t("stats.cityLocations"), value: String(sourcedPlaces.length + venues.length) },
        ]}
        actions={[
          { href: "/venue/onboarding", label: t("actions.becomePartner"), primary: true },
          { href: "/events", label: t("actions.seeEvents") },
        ]}
      />

      {/* Why venues matter */}
      <section className="border-b border-gray-200 bg-white">
        <div className="section-shell py-10">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Building2,
                title: t("whyVenues.curatedTitle"),
                text: t("whyVenues.curatedText"),
              },
              {
                icon: Ticket,
                title: t("whyVenues.dealsTitle"),
                text: t("whyVenues.dealsText"),
              },
              {
                icon: Star,
                title: t("whyVenues.reviewsTitle"),
                text: t("whyVenues.reviewsText"),
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-coral-soft">
                  <item.icon className="h-5 w-5 text-brand-coral" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{item.title}</div>
                  <p className="mt-1 text-sm text-gray-600">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner venues */}
      <section className="bg-brand-sand">
        <div className="section-shell py-10">
          <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {neighborhoods.map((area, i) => {
              const borderColors = [
                "border-l-brand-coral",
                "border-l-brand-indigo",
                "border-l-brand-sage",
                "border-l-amber-400",
              ];
              return (
                <div
                  key={area.area}
                  className={`rounded-2xl border border-brand-border-light border-l-4 ${borderColors[i % borderColors.length]} bg-white p-5 shadow-[0_1px_4px_rgba(42,38,56,0.04)] transition hover:shadow-md`}
                >
                  <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">
                    {area.area}
                  </div>
                  <div className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900">
                    {area.venues}
                  </div>
                  <div className="text-xs font-medium text-gray-500">
                    {t("neighborhoods.venues", { count: area.venues })}
                  </div>
                  {area.topVenue && (
                    <div className="mt-3 truncate text-sm font-semibold text-gray-800">
                      <Star className="mr-1 inline h-3.5 w-3.5 fill-current text-yellow-400" />
                      {area.topVenue} {area.topRating != null ? `(${area.topRating.toFixed(1)})` : ""}
                    </div>
                  )}
                  <p className="mt-1 text-xs leading-relaxed text-gray-500">
                    {area.capacity.toLocaleString()} seats
                  </p>
                </div>
              );
            })}
          </div>

          {/* Search results banner */}
          {searchQuery && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-brand-indigo/20 bg-brand-indigo/5 px-5 py-4">
              <Search className="h-5 w-5 text-brand-indigo" />
              <span className="font-semibold text-brand-text">
                {venues.length} result{venues.length !== 1 ? "s" : ""} for &ldquo;{searchQuery}&rdquo;
              </span>
              <Link href={"/venues" as Route} className="ml-auto text-sm font-medium text-brand-indigo hover:underline">
                Clear search
              </Link>
            </div>
          )}

          {/* Type filter chips */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-sm font-medium text-gray-500">{t("grid.filterByType")}</span>
            <Link
              href="/venues"
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
                !activeType && !activeArea
                  ? "bg-brand-indigo !text-white"
                  : "border border-brand-border-light bg-white text-gray-700 hover:border-brand-indigo/30",
              )}
            >
              {t("filters.all")}
            </Link>
            {allTypes.map((vType) => {
              const isActive = activeType?.toLowerCase() === vType.toLowerCase();
              const params = new URLSearchParams();
              if (!isActive) params.set("type", vType.toLowerCase());
              if (activeArea) params.set("area", activeArea);
              const qs = params.toString();
              const href = (qs ? `/venues?${qs}` : "/venues") as Route;
              return (
                <Link
                  key={vType}
                  href={href}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
                    isActive
                      ? "bg-brand-indigo !text-white"
                      : "border border-brand-border-light bg-white text-gray-700 hover:border-brand-indigo/30",
                  )}
                >
                  {vType}
                </Link>
              );
            })}
          </div>

          {/* Area filter chips */}
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-sm font-medium text-gray-500">{t("grid.filterByArea")}</span>
            {allAreas.map((vArea) => {
              const isActive = activeArea?.toLowerCase() === vArea.toLowerCase();
              const params = new URLSearchParams();
              if (activeType) params.set("type", activeType);
              if (!isActive) params.set("area", vArea.toLowerCase());
              const qs = params.toString();
              const href = (qs ? `/venues?${qs}` : "/venues") as Route;
              return (
                <Link
                  key={vArea}
                  href={href}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
                    isActive
                      ? "bg-brand-coral !text-white"
                      : "border border-brand-border-light bg-white text-gray-700 hover:border-brand-coral/30",
                  )}
                >
                  {vArea}
                </Link>
              );
            })}
          </div>

          <h2 className="mb-6 text-2xl font-bold text-gray-900">{t("grid.partnerVenues")}</h2>
          <div className="reveal-group grid gap-6 md:grid-cols-2">
            {venues.map((venue) => (
              <VenueCard key={venue.slug} venue={venue} />
            ))}
          </div>
        </div>
      </section>

      {/* Map section */}
      <section className="border-y border-gray-200 bg-white">
        <div className="section-shell py-10">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900">{t("map.title")}</h2>
            <p className="mt-1 text-sm text-gray-600">{t("map.description")}</p>
          </div>
          <div className="h-[400px] overflow-hidden rounded-2xl border border-brand-border-light shadow-sm">
            <VenueMap
              latitude={64.1466}
              longitude={-21.9426}
              name="Reykjavik Venues"
              address="Central Reykjavik"
            />
          </div>
        </div>
      </section>

      {/* Sourced places */}
      {sourcedPlaces.length > 0 ? (
        <section className="bg-gray-50">
          <div className="section-shell py-12">
            <div className="mb-2 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">
              {t("sourced.eyebrow")}
            </div>
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{t("sourced.title")}</h2>
                <p className="mt-1 text-sm text-gray-600">{t("sourced.description")}</p>
              </div>
              <Link
                href="/venues"
                className="hidden items-center gap-1.5 text-sm font-medium text-brand-indigo sm:inline-flex"
              >
                {t("sourced.seeAll")}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {sourcedPlaces.map((place) => (
                <SourcedPlaceCard key={place.slug} place={place} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Venue partner CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="section-shell relative py-16 text-center text-white sm:py-20">
          <div className="mx-auto max-w-xl">
            <h3 className="text-3xl font-bold tracking-tight">{t("cta.title")}</h3>
            <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-white/85">
              {t("cta.description")}
            </p>
            <p className="mx-auto mt-2 text-sm text-white/80">
              {t("cta.benefit")}
            </p>
            <Link
              href="/venue/onboarding"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-coral px-10 py-4 text-sm font-semibold text-white shadow-lg shadow-brand-coral/20 transition hover:opacity-90"
            >
              {t("cta.button")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export function VenueDetailScreen({ venue }: { venue: PublicVenue }) {
  const t = useTranslations("venueDetailPage");
  const tNav = useTranslations("nav");
  const upcomingEvents = publicEvents.filter((event) =>
    (venue.upcomingEventSlugs ?? []).includes(event.slug),
  );
  const nearbyVenues = publicVenues
    .filter((item) => item.slug !== venue.slug && item.area === venue.area)
    .slice(0, 3);

  return (
    <>
      <Breadcrumbs
        crumbs={[
          { href: "/" as Route, label: tNav("home") },
          { href: "/venues" as Route, label: tNav("venues") },
          { label: venue.name },
        ]}
      />
      <DetailHero
        eyebrow={venue.type}
        title={venue.name}
        description={venue.summary}
        art={venue.art}
        actions={[
          { href: "/venue/onboarding", label: t("actions.partnerWithUs"), primary: true },
        ]}
        rsvpSlot={<ShareButton title={venue.name} text={venue.summary} />}
      >
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
          <div>
            <div className="text-sm text-white/80">{t("heroStats.area")}</div>
            <div className="text-lg font-semibold">{venue.area}</div>
          </div>
          <div>
            <div className="text-sm text-white/80">{t("heroStats.capacity")}</div>
            <div className="text-2xl font-bold">{venue.capacity}</div>
          </div>
          <div>
            <div className="text-sm text-white/80">{t("heroStats.rating")}</div>
            <div className="flex items-center gap-1 text-2xl font-bold">
              <Star className="h-5 w-5 fill-current text-yellow-400" />
              {venue.rating}
            </div>
          </div>
          <div>
            <div className="text-sm text-white/80">{t("heroStats.events")}</div>
            <div className="text-2xl font-bold">{upcomingEvents.length}</div>
          </div>
        </div>
      </DetailHero>

      <section className="section-shell py-10 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
          {/* ── Main content ── */}
          <div className="space-y-10">
            {/* About */}
            <div>
              <h2 className="font-editorial mb-5 text-2xl tracking-tight text-gray-900">
                {t("sections.about")}
              </h2>
              <div className="space-y-5">
                {venue.description.map((paragraph) => (
                  <p key={paragraph} className="leading-8 text-gray-700">{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Gallery 2x2 grid */}
            {(venue.gallery ?? []).length > 0 ? (
              <div>
                <h2 className="font-editorial mb-5 text-2xl tracking-tight text-gray-900">
                  {t("sections.gallery")}
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {venue.gallery.slice(0, 4).map((art, index) => {
                    const img = extractImageUrl(art);
                    return (
                      <div key={`gallery-${index}`} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100">
                        {img ? (
                          <Image fill alt={`${venue.name} — photo ${index + 1}`} className="object-cover" sizes="(max-width: 768px) 50vw, 33vw" src={img} unoptimized={img.startsWith("https://")} />
                        ) : (
                          <div className="h-full w-full" style={{ background: art }} />
                        )}
                      </div>
                    );
                  })}
                </div>
                {venue.gallery.length > 4 && (
                  <p className="mt-3 text-center text-sm font-medium text-brand-indigo">
                    {t("viewAllPhotos", { count: venue.gallery.length })}
                  </p>
                )}
              </div>
            ) : null}

            {/* Best-fit formats */}
            <div>
              <h2 className="font-editorial mb-5 text-2xl tracking-tight text-gray-900">
                {t("sections.bestFitFormats")}
              </h2>
              <div className="paper-panel rounded-2xl p-5">
                <p className="leading-relaxed text-gray-700">{venueFitSummary(venue)}</p>
                {upcomingEvents.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {upcomingEvents.slice(0, 3).map((event) => (
                      <Link
                        key={event.slug}
                        href={eventHref(event.slug)}
                        className="rounded-full border border-brand-border-light bg-brand-sand-light px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-brand-indigo hover:text-brand-indigo"
                      >
                        {event.title}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Upcoming events as EventCards */}
            <div>
              <h2 className="font-editorial mb-5 text-2xl tracking-tight text-gray-900">
                {t("sections.upcomingEvents")}
              </h2>
              {upcomingEvents.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2">
                  {upcomingEvents.map((event) => (
                    <EventCard key={event.slug} event={event} />
                  ))}
                </div>
              ) : (
                <p className="leading-8 text-gray-500">{t("empty.noUpcomingEvents")}</p>
              )}
            </div>

            {/* Map */}
            {venue.latitude && venue.longitude ? (
              <div>
                <h2 className="font-editorial mb-5 text-2xl tracking-tight text-gray-900">
                  {t("sections.location")}
                </h2>
                <div className="overflow-hidden rounded-2xl border border-brand-border-light">
                  <VenueMap
                    latitude={venue.latitude}
                    longitude={venue.longitude}
                    name={venue.name}
                    address={venue.address}
                  />
                </div>
              </div>
            ) : null}

            {/* Nearby venues */}
            {nearbyVenues.length > 0 ? (
              <div>
                <h2 className="font-editorial mb-5 text-2xl tracking-tight text-gray-900">
                  {t("sections.moreInArea", { area: venue.area })}
                </h2>
                <div className="grid gap-4 sm:grid-cols-3">
                  {nearbyVenues.map((item) => (
                    <Link
                      key={item.slug}
                      href={venueHref(item.slug)}
                      className="paper-panel rounded-xl p-4 transition hover:shadow-md"
                    >
                      <div className="font-semibold text-gray-900">{item.name}</div>
                      <p className="mt-1 text-sm text-gray-500">{item.type}</p>
                      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                        <span>{item.capacity} {t("labels.capacity").toLowerCase()}</span>
                        <span className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                          {item.rating}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            {/* Venue info card */}
            <div className="paper-panel rounded-2xl p-5">
              <h3 className="font-editorial mb-4 text-lg tracking-tight text-gray-900">
                {t("sections.info")}
              </h3>
              <KeyValueList
                items={[
                  { key: "type", label: t("labels.type"), value: venue.type },
                  { key: "area", label: t("labels.area"), value: venue.area },
                  { key: "address", label: t("labels.address"), value: venue.address },
                  { key: "capacity", label: t("labels.capacity"), value: String(venue.capacity) },
                  { key: "rating", label: t("labels.rating"), value: `${venue.rating}/5` },
                ]}
              />
              {venue.deal ? (
                <div className="mt-4 rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
                  {venue.deal}
                </div>
              ) : null}
            </div>

            {/* Hours card */}
            {(venue.hours ?? []).length > 0 ? (
              <div className="paper-panel rounded-2xl p-5">
                <h3 className="font-editorial mb-4 text-lg tracking-tight text-gray-900">
                  {t("sections.hours")}
                </h3>
                <div className="space-y-2.5">
                  {venue.hours.map((item) => (
                    <div key={item.day} className="flex items-center justify-between text-sm">
                      <span className={cn("text-gray-700", item.highlighted && "font-semibold")}>
                        {item.day}
                      </span>
                      <div className="flex items-center gap-2">
                        {item.highlighted ? (
                          <span className="rounded-full bg-brand-coral-soft px-2 py-0.5 text-xs font-medium text-brand-coral">
                            {t("labels.peak")}
                          </span>
                        ) : null}
                        <span className="text-gray-500">{item.open}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Amenities card */}
            {(venue.amenities ?? []).length > 0 ? (
              <div className="paper-panel rounded-2xl p-5">
                <h3 className="font-editorial mb-4 text-lg tracking-tight text-gray-900">
                  {t("sections.amenities")}
                </h3>
                <div className="grid grid-cols-1 gap-2.5">
                  {venue.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2.5 text-sm text-gray-700">
                      <BadgeCheck className="h-4 w-4 shrink-0 text-brand-sage" />
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}

function cleanSourcedSummary(place: { summary?: string; name: string; area?: string; category?: string }): string {
  const raw = place.summary ?? "";
  // Detect auto-generated boilerplate patterns
  if (/Website (not listed|listed)/.test(raw) || /Hours (not listed|listed)/.test(raw)) {
    // Generate a better summary from available metadata
    const areaLabel = place.area ? ` in ${place.area}` : " in Reykjavik";
    const typeLabel = place.category ?? "venue";
    return `${place.name} is a ${typeLabel.toLowerCase()}${areaLabel}. Visit their page to learn more or claim this venue to add details.`;
  }
  return raw;
}

export function SourcedVenueDetailScreen({ place, relatedPlaces = [] }: { place: SourcedPlace; relatedPlaces?: SourcedPlace[] }) {
  const tNav = useTranslations("nav");
  const t = useTranslations("sourcedVenueDetail");
  const tSignals = useTranslations("signals");
  const imageSrc = place.image?.localPath || place.image?.remoteUrl;
  const hasPhoto = place.image?.kind === "photo";
  const signals = sourcedPlaceSignals(place, tSignals);
  const displaySummary = cleanSourcedSummary(place);

  return (
    <>
      <Breadcrumbs
        crumbs={[
          { href: "/" as Route, label: tNav("home") },
          { href: "/venues" as Route, label: tNav("venues") },
          { label: place.name },
        ]}
      />
      <section className="relative overflow-hidden border-b border-gray-200 bg-gray-900">
        {imageSrc ? (
          <>
            <Image
              fill
              alt={`${place.name} in ${place.area}`}
              className="object-cover opacity-30"
              sizes="100vw"
              src={imageSrc}
              unoptimized={imageSrc.startsWith("https://")}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900/30 to-gray-900/80" />
          </>
        ) : null}
        <div className="section-shell relative z-10 py-10 text-white sm:py-14 md:py-20">
          <span className="text-xs font-semibold uppercase tracking-widest text-white/85">{t("eyebrow")}</span>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">{place.name}</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80">{displaySummary}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/venue/onboarding"
              className="inline-flex items-center gap-2 rounded-full bg-brand-coral px-6 py-3 text-sm font-semibold !text-white transition hover:opacity-90"
            >
              {t("claimVenue")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            {place.website ? (
              <a
                href={place.website}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold !text-white transition hover:bg-white/20"
                rel="noreferrer"
                target="_blank"
              >
                {t("visitWebsite")}
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <section className="section-shell py-8">
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <Section title={t("about")}>
              <p className="text-sm leading-relaxed text-gray-600">{displaySummary}</p>
              {place.address ? (
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {place.address}
                </div>
              ) : null}
            </Section>

            {place.latitude && place.longitude ? (
              <Section title={t("location")}>
                <VenueMap
                  latitude={place.latitude}
                  longitude={place.longitude}
                  name={place.name}
                  address={place.address || "Reykjavik"}
                />
              </Section>
            ) : null}

            <Section title={t("venueRead")}>
              <div className="grid gap-4 md:grid-cols-3">
                {signals.map((signal) => (
                  <div
                    key={signal.label}
                    className="rounded-xl border border-brand-border-light bg-brand-sand-light p-4"
                  >
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">
                      {signal.label}
                    </div>
                    <div className="mt-3 text-sm font-semibold leading-6 text-gray-900">
                      {signal.value}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">{signal.detail}</p>
                  </div>
                ))}
              </div>
            </Section>

            {hasPhoto && place.image?.credit ? (
              <Section title={t("photoAttribution")}>
                <p className="text-sm text-gray-600">{place.image.credit}</p>
                {place.image.license ? (
                  <p className="mt-1 text-sm text-gray-500">{place.image.license}</p>
                ) : null}
              </Section>
            ) : null}
          </div>

          <div className="space-y-6">
            <Section title={t("details")}>
              <KeyValueList
                items={[
                  { key: "type", label: t("type"), value: place.kindLabel },
                  { key: "area", label: t("area"), value: place.area || "Reykjavik" },
                  { key: "address", label: t("address"), value: place.address || t("notAvailable") },
                  { key: "website", label: t("website"), value: place.website ? t("available") : t("notAvailable") },
                ]}
              />
            </Section>

            <Section title={t("partnerPath")}>
              <div className="space-y-3">
                {[
                  { label: t("profileState"), value: t("readyForClaim") },
                  { label: t("venueLane"), value: place.laneLabel },
                  {
                    label: t("externalReference"),
                    value: place.website ? t("officialWebsiteFound") : t("manualOutreachRequired"),
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg border border-brand-border-light bg-brand-sand-light px-4 py-3"
                  >
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">
                      {item.label}
                    </div>
                    <div className="mt-2 text-sm leading-relaxed text-gray-700">{item.value}</div>
                  </div>
                ))}
              </div>
            </Section>

            {relatedPlaces.length > 0 ? (
              <Section title={t("similarPlaces")}>
                <div className="space-y-3">
                  {relatedPlaces.map((item) => (
                    <Link
                      key={item.slug}
                      href={venueHref(item.slug)}
                      className="block rounded-lg bg-gray-50 p-3 transition hover:bg-gray-100"
                    >
                      <div className="font-medium text-gray-900">{item.name}</div>
                      <p className="mt-1 text-sm text-gray-500">
                        {item.kindLabel} · {item.area || "Reykjavik"}
                      </p>
                    </Link>
                  ))}
                </div>
              </Section>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}

export function BlogIndexScreen() {
  const t = useTranslations("blogPage");
  const featured = blogPosts[0] ?? null;
  const rest = blogPosts.slice(1);
  const featuredImage = featured ? (extractImageUrl(featured.hero) ?? "/place-images/reykjavik/hallgrimskirkja-60f147a6.jpg") : "/place-images/reykjavik/hallgrimskirkja-60f147a6.jpg";

  return (
    <>
      {/* Hero with latest eyebrow */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-brand-basalt">
        <div className="absolute inset-0 opacity-20">
          <Image fill alt="" role="presentation" className="object-cover" sizes="100vw" src="/place-images/reykjavik/arb-jarsafn-c71d7348.jpg" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 to-gray-900/90" />
        <div className="section-shell relative z-10 py-16 text-white sm:py-24">
          <span className="text-xs font-semibold uppercase tracking-widest text-brand-coral-soft">{t("hero.eyebrow")}</span>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">{t("hero.title")}</h1>
          <p className="mt-5 max-w-2xl text-base text-white/85 sm:text-lg">{t("hero.description")}</p>
        </div>
      </section>

      {/* Featured post — large card */}
      {featured ? <section className="bg-white">
        <div className="section-shell py-12">
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-indigo">{t("latestEyebrow")}</span>
          </div>
          <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm md:grid md:grid-cols-2">
            <div className="relative h-72 md:h-auto">
              <Image
                fill
                alt={featured.title}
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                src={featuredImage}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:bg-gradient-to-r" />
            </div>
            <div className="flex flex-col justify-center p-7 sm:p-10">
              <div className="flex items-center gap-3">
                <ToneBadge tone="indigo">{featured.category}</ToneBadge>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock3 className="h-3 w-3" />
                  {featured.readTime}
                </span>
              </div>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{featured.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">{featured.excerpt}</p>
              <div className="mt-4 text-sm text-gray-500">{featured.publishedAt}</div>
              <Link
                href={blogHref(featured.slug)}
                className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-brand-indigo px-6 py-3 text-sm font-semibold !text-white transition hover:opacity-90"
              >
                {t("readArticle")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section> : null}

      {/* Article grid */}
      {rest.length > 0 ? (
        <section className="border-t border-gray-200 bg-brand-sand">
          <div className="section-shell py-12">
            <h2 className="mb-8 text-2xl font-bold text-gray-900">{t("moreArticles")}</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}

export function BlogDetailScreen({ post }: { post: BlogPost }) {
  const t = useTranslations("blogPage");
  const tNav = useTranslations("nav");
  const related = blogPosts.filter((item) => item.slug !== post.slug).slice(0, 2);
  const imageUrl = extractImageUrl(post.hero);

  return (
    <>
      <Breadcrumbs
        crumbs={[
          { href: "/" as Route, label: tNav("home") },
          { href: "/blog" as Route, label: tNav("blog") },
          { label: post.title },
        ]}
      />
      <section className="relative overflow-hidden border-b border-gray-200 bg-gray-900">
        {imageUrl ? (
          <>
            <Image fill alt="" role="presentation" className="object-cover opacity-40" sizes="100vw" src={imageUrl} unoptimized={imageUrl.startsWith("https://")} />
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900/30 to-gray-900/80" />
          </>
        ) : (
          <div className="absolute inset-0" style={{ background: post.hero }} />
        )}
        <div className="section-shell relative z-10 py-10 text-white sm:py-14 md:py-20">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium">{post.category}</span>
            <span className="text-sm text-white/80">{post.readTime}</span>
          </div>
          <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80">{post.excerpt}</p>
          <p className="mt-4 text-sm text-white/80">{post.publishedAt}</p>
        </div>
      </section>

      <section className="section-shell py-8">
        <div className="mx-auto max-w-3xl space-y-8">
          <Section title={t("detail.editorialAngle")}>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  label: t("detail.category"),
                  value: post.category,
                  detail: t("detail.categoryDetail"),
                },
                {
                  label: t("detail.readTime"),
                  value: post.readTime,
                  detail: t("detail.readTimeDetail"),
                },
                {
                  label: t("detail.published"),
                  value: post.publishedAt,
                  detail: t("detail.publishedDetail"),
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-brand-border-light bg-brand-sand-light p-4"
                >
                  <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">
                    {item.label}
                  </div>
                  <div className="mt-3 text-sm font-semibold leading-6 text-gray-900">
                    {item.value}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.detail}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title={t("detail.whyMatters")}>
            <p className="text-base leading-relaxed text-gray-600">
              {t("detail.whyMattersBody")}
            </p>
          </Section>

          {post.sections.map((section) => (
            <div key={section.heading}>
              <h2 className="text-xl font-bold text-gray-900">{section.heading}</h2>
              <p className="mt-3 text-base leading-relaxed text-gray-600">{section.body}</p>
            </div>
          ))}
        </div>

        {related.length > 0 ? (
          <div className="mx-auto mt-12 max-w-3xl">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">{t("detail.continueReading")}</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  href={blogHref(item.slug)}
                  className="rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50"
                >
                  <div className="font-medium text-gray-900">{item.title}</div>
                  <p className="mt-2 text-sm text-gray-600">{item.excerpt}</p>
                  <div className="mt-3 text-xs font-medium text-gray-500">
                    {item.category} · {item.readTime}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </>
  );
}

export function AboutScreen({ stats }: { stats?: { label: string; value: string }[] } = {}) {
  const t = useTranslations("aboutPage");

  const values = [
    { icon: Heart, title: t("values.community.title"), text: t("values.community.text"), color: "bg-brand-coral-soft text-brand-coral" },
    { icon: Shield, title: t("values.trust.title"), text: t("values.trust.text"), color: "bg-brand-indigo-soft text-brand-indigo" },
    { icon: Target, title: t("values.quality.title"), text: t("values.quality.text"), color: "bg-[rgba(124,154,130,0.12)] text-brand-sage" },
    { icon: Lightbulb, title: t("values.local.title"), text: t("values.local.text"), color: "bg-amber-50 text-amber-600" },
  ];

  return (
    <>
      {/* Large hero banner with brand gradient */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-indigo via-[#4338ca] to-[#312e81]">
        <div className="absolute inset-0 opacity-20">
          <Image fill alt="" role="presentation" className="object-cover" sizes="100vw" src="/place-images/reykjavik/jo-leikhusi-52f6c2dd.jpg" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-brand-indigo/40 to-[#312e81]/80" />
        <div className="section-shell relative z-10 py-20 text-center text-white sm:py-28 md:py-36">
          <span className="text-xs font-semibold uppercase tracking-widest text-brand-coral-soft">{t("hero.eyebrow")}</span>
          <h1 className="mx-auto mt-4 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">{t("hero.title")}</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/85">{t("hero.description")}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold shadow-lg transition hover:bg-white/90"
              style={{ color: "var(--color-brand-indigo-light)" }}
            >
              {t("hero.exploreEvents")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              {t("hero.getInTouch")}
            </Link>
          </div>
        </div>
      </section>

      {/* Mission statement */}
      <section className="bg-white">
        <div className="section-shell py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-editorial text-3xl leading-snug text-gray-900 sm:text-4xl">{t("mission.title")}</h2>
            <p className="mt-8 text-lg leading-relaxed text-gray-600">{t("mission.paragraph1")}</p>
            <p className="mt-5 text-lg leading-relaxed text-gray-600">{t("mission.paragraph2")}</p>
          </div>
        </div>
      </section>

      {/* Stats section */}
      <section className="border-t border-gray-200 bg-brand-sand">
        <div className="section-shell py-16">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(stats ?? aboutStats).map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-gray-200 bg-white p-7 text-center transition hover:shadow-md">
                <div className="text-4xl font-bold tracking-tight text-brand-indigo">{stat.value}</div>
                <div className="mt-2 text-sm font-medium text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-gray-200 bg-white">
        <div className="section-shell py-16">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">{t("howItWorks.title")}</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: UsersRound, title: t("howItWorks.membersTitle"), text: t("howItWorks.membersText"), color: "bg-brand-indigo-soft text-brand-indigo" },
              { icon: CalendarDays, title: t("howItWorks.organizersTitle"), text: t("howItWorks.organizersText"), color: "bg-brand-coral-soft text-brand-coral" },
              { icon: Building2, title: t("howItWorks.venuesTitle"), text: t("howItWorks.venuesText"), color: "bg-[rgba(124,154,130,0.12)] text-brand-sage" },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-gray-200 bg-white p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className={cn("mx-auto flex h-16 w-16 items-center justify-center rounded-2xl", item.color)}>
                  <item.icon className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-xl font-bold text-gray-900">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="border-t border-gray-200 bg-brand-sand">
        <div className="section-shell py-16">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">{t("team.title")}</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {aboutTeam.map((member, i) => {
              const colors = ["bg-brand-indigo !text-white", "bg-brand-coral !text-white", "bg-brand-sage text-white"];
              return (
                <div key={member.name} className="rounded-2xl border border-gray-200 bg-white p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className={cn("mx-auto flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold", colors[i % colors.length])}>
                    {member.name.charAt(0)}
                  </div>
                  <div className="mt-5 text-xl font-bold text-gray-900">{member.name}</div>
                  <div className="mt-1 text-sm font-semibold text-brand-indigo">{member.role}</div>
                  <p className="mt-4 text-sm leading-relaxed text-gray-600">{member.note}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-t border-gray-200 bg-white">
        <div className="section-shell py-16">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">{t("values.heading")}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((item) => (
              <div key={item.title} className="rounded-2xl border border-gray-200 bg-white p-7 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className={cn("mx-auto flex h-14 w-14 items-center justify-center rounded-2xl", item.color)}>
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-indigo via-[#4338ca] to-[#312e81]">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="section-shell relative z-10 py-16 text-center text-white sm:py-20">
          <h3 className="text-3xl font-bold">{t("cta.title")}</h3>
          <p className="mx-auto mt-4 max-w-lg text-base text-white/85">{t("cta.description")}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/signup" className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold shadow-lg transition hover:bg-white/90" style={{ color: "var(--color-brand-indigo-light)" }}>
              {t("cta.createAccount")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/events" className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20">
              {t("cta.browseEvents")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export function PricingScreen() {
  const t = useTranslations("pricingPage");

  const allPlansFeatures = [
    t("allPlans.feature1"),
    t("allPlans.feature2"),
    t("allPlans.feature3"),
    t("allPlans.feature4"),
  ];

  return (
    <>
      {/* Pricing hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-indigo via-[#4338ca] to-[#312e81]">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="section-shell relative z-10 py-16 text-center text-white sm:py-24">
          <span className="text-xs font-semibold uppercase tracking-widest text-brand-coral-soft">{t("hero.eyebrow")}</span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">{t("hero.title")}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-white/85 sm:text-lg">{t("hero.description", { commission: ticketCommissionRate })}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/signup" className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold shadow-lg transition hover:bg-white/90" style={{ color: "var(--color-brand-indigo-light)" }}>
              {t("hero.getStartedFree")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20">
              {t("hero.talkToUs")}
            </Link>
          </div>
        </div>
      </section>

      {/* All plans include */}
      <section className="bg-white">
        <div className="section-shell py-12">
          <div className="mx-auto max-w-3xl rounded-2xl border border-brand-border-light bg-brand-sand-light p-8">
            <h2 className="mb-6 text-center text-lg font-bold text-gray-900">{t("allPlans.heading")}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {allPlansFeatures.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-sage" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Member plans */}
      <section className="border-t border-gray-200 bg-white">
        <div className="section-shell py-14">
          <div className="mb-10 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-indigo-soft px-4 py-1.5 text-xs font-semibold text-brand-indigo">
              <UsersRound className="h-3.5 w-3.5" />
              {t("members.badge")}
            </span>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">{t("members.title")}</h2>
            <p className="mt-2 text-sm text-gray-600">{t("members.description")}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {userTiers.map((tier, i) => (
              <article key={tier.name} className={cn("sales-tier-card rounded-2xl border bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg", i === 1 ? "border-brand-indigo ring-2 ring-brand-indigo/20 shadow-lg" : "border-gray-200")}>
                {i === 1 ? (<div className="rounded-t-2xl bg-brand-indigo py-2 text-center text-xs font-bold uppercase tracking-wider text-white">{t("members.mostPopular")}</div>) : null}
                <div className="border-b border-gray-100 p-7">
                  <div className="text-sm font-semibold text-gray-500">{tier.name}</div>
                  <div className="mt-3 text-4xl font-bold text-gray-900">{tier.price}</div>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">{tier.description}</p>
                </div>
                <div className="p-7 space-y-3">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-sage" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="px-7 pb-7">
                  <Link href="/signup" className={cn("flex w-full items-center justify-center rounded-full py-3.5 text-sm font-semibold transition", i === 1 ? "bg-brand-indigo text-white hover:opacity-90" : "border border-gray-300 text-gray-700 hover:bg-gray-50")}>
                    {tier.price === "0 ISK" ? t("members.joinFree") : t("members.getStarted")}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Organizer plans */}
      <section className="border-t border-gray-200 bg-brand-sand">
        <div className="section-shell py-14">
          <div className="mb-10 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-coral-soft px-4 py-1.5 text-xs font-semibold text-brand-coral">
              <CalendarDays className="h-3.5 w-3.5" />
              {t("organizers.badge")}
            </span>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">{t("organizers.title")}</h2>
            <p className="mt-2 text-sm text-gray-600">{t("organizers.description", { commission: ticketCommissionRate })}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {organizerTiers.map((tier, i) => (
              <article key={tier.name} className={cn("sales-tier-card rounded-2xl border bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg", i === 1 ? "border-brand-coral ring-2 ring-brand-coral/20 shadow-lg" : "border-gray-200")}>
                {i === 1 ? (<div className="rounded-t-2xl bg-brand-coral py-2 text-center text-xs font-bold uppercase tracking-wider text-white">{t("organizers.recommended")}</div>) : null}
                <div className="border-b border-gray-100 p-7">
                  <div className="text-sm font-semibold text-gray-500">{tier.name}</div>
                  <div className="mt-3 text-4xl font-bold text-gray-900">{tier.price}</div>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">{tier.description}</p>
                </div>
                <div className="p-7 space-y-3">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-sage" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="px-7 pb-7">
                  <Link href="/signup" className={cn("flex w-full items-center justify-center rounded-full py-3.5 text-sm font-semibold transition", i === 1 ? "bg-brand-coral text-white hover:opacity-90" : "border border-gray-300 text-gray-700 hover:bg-gray-50")}>
                    {t("organizers.startOrganizing")}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Venue plans */}
      <section className="border-t border-gray-200 bg-white">
        <div className="section-shell py-14">
          <div className="mb-10 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(124,154,130,0.12)] px-4 py-1.5 text-xs font-semibold text-brand-sage">
              <Building2 className="h-3.5 w-3.5" />
              {t("venues.badge")}
            </span>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">{t("venues.title")}</h2>
            <p className="mt-2 text-sm text-gray-600">{t("venues.description")}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {venueTiers.map((tier, i) => (
              <article key={tier.name} className={cn("sales-tier-card rounded-2xl border bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg", i === 1 ? "border-brand-sage ring-2 ring-brand-sage/20 shadow-lg" : "border-gray-200")}>
                {i === 1 ? (<div className="rounded-t-2xl bg-brand-sage py-2 text-center text-xs font-bold uppercase tracking-wider text-white">{t("venues.bestValue")}</div>) : null}
                <div className="border-b border-gray-100 p-7">
                  <div className="text-sm font-semibold text-gray-500">{tier.name}</div>
                  <div className="mt-3 text-4xl font-bold text-gray-900">{tier.price}</div>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">{tier.description}</p>
                </div>
                <div className="p-7 space-y-3">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-sage" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="px-7 pb-7">
                  <Link href="/venue/onboarding" className={cn("flex w-full items-center justify-center rounded-full py-3.5 text-sm font-semibold transition", i === 1 ? "bg-brand-sage text-white hover:opacity-90" : "border border-gray-300 text-gray-700 hover:bg-gray-50")}>
                    {tier.price === "0 ISK" ? t("venues.listFree") : t("venues.applyNow")}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Feature comparison */}
      <section className="overflow-hidden border-t border-gray-200 bg-brand-basalt">
        <div className="section-shell py-12">
          <h2 className="mb-2 text-center text-2xl font-bold !text-white">{t("comparison.title")}</h2>
          <p className="mb-8 text-center text-sm text-gray-400">{t("comparison.description")}</p>
          <div className="mb-10">
            <h3 className="mb-4 text-lg font-semibold text-white">{t("comparison.memberPlans")}</h3>
            <div className="overflow-x-auto rounded-xl border border-white/15">
              <table className="w-full min-w-[540px] text-left text-sm">
                <thead><tr className="border-b border-white/15 bg-white/5"><th className="px-5 py-3 font-medium text-gray-400">{t("comparison.feature")}</th>{userTiers.map((ti) => (<th key={ti.name} className="px-5 py-3 font-semibold text-white">{ti.name}</th>))}</tr></thead>
                <tbody className="text-gray-300">
                  {[[t("comparison.memberFeatures.browseEventsVenues"), true, true, true],[t("comparison.memberFeatures.ticketCheckout"), true, true, true],[t("comparison.memberFeatures.standardRsvp"), true, true, true],[t("comparison.memberFeatures.priorityWaitlist"), false, true, true],[t("comparison.memberFeatures.directMessaging"), false, true, true],[t("comparison.memberFeatures.premiumBadge"), false, true, true],[t("comparison.memberFeatures.advancedFilters"), false, false, true],[t("comparison.memberFeatures.earlyAccessFeatures"), false, false, true]].map(([feature, ...vals], ri) => (
                    <tr key={ri} className="border-b border-white/8 last:border-0"><td className="px-5 py-2.5">{feature as string}</td>{(vals as boolean[]).map((v, ci) => (<td key={ci} className="px-5 py-2.5">{v ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <span className="text-gray-400">—</span>}</td>))}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mb-10">
            <h3 className="mb-4 text-lg font-semibold text-white">{t("comparison.organizerPlans")}</h3>
            <div className="overflow-x-auto rounded-xl border border-white/15">
              <table className="w-full min-w-[540px] text-left text-sm">
                <thead><tr className="border-b border-white/15 bg-white/5"><th className="px-5 py-3 font-medium text-gray-400">{t("comparison.feature")}</th>{organizerTiers.map((ti) => (<th key={ti.name} className="px-5 py-3 font-semibold text-white">{ti.name.replace("Organizer ", "")}</th>))}</tr></thead>
                <tbody className="text-gray-300">
                  {[[t("comparison.organizerFeatures.activePublicEvents"), t("comparison.organizerFeatures.upTo3"), t("comparison.organizerFeatures.unlimited"), t("comparison.organizerFeatures.unlimited")],[t("comparison.organizerFeatures.publicTicketing"), true, true, true],[t("comparison.organizerFeatures.ticketCommission"), true, true, true],[t("comparison.organizerFeatures.basicEventAnalytics"), true, true, true],[t("comparison.organizerFeatures.recurringEvents"), false, true, true],[t("comparison.organizerFeatures.approvalWaitlistControls"), false, true, true],[t("comparison.organizerFeatures.venueRequestWorkflows"), false, true, true],[t("comparison.organizerFeatures.revenueReporting"), false, true, true],[t("comparison.organizerFeatures.prioritySupport"), false, false, true],[t("comparison.organizerFeatures.featuredPlacement"), false, false, true],[t("comparison.organizerFeatures.sponsorInventory"), false, false, true],[t("comparison.organizerFeatures.audienceSegmentation"), false, false, true]].map(([feature, ...vals], ri) => (
                    <tr key={ri} className="border-b border-white/8 last:border-0"><td className="px-5 py-2.5">{feature as string}</td>{vals.map((v, ci) => (<td key={ci} className="px-5 py-2.5">{typeof v === "string" ? (<span className="text-white font-medium">{v}</span>) : v ? (<CheckCircle2 className="h-4 w-4 text-emerald-400" />) : (<span className="text-gray-400">—</span>)}</td>))}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">{t("comparison.venuePlans")}</h3>
            <div className="overflow-x-auto rounded-xl border border-white/15">
              <table className="w-full min-w-[540px] text-left text-sm">
                <thead><tr className="border-b border-white/15 bg-white/5"><th className="px-5 py-3 font-medium text-gray-400">{t("comparison.feature")}</th>{venueTiers.map((ti) => (<th key={ti.name} className="px-5 py-3 font-semibold text-white">{ti.name.replace("Venue ", "")}</th>))}</tr></thead>
                <tbody className="text-gray-300">
                  {[[t("comparison.venueFeatures.publicListing"), true, true, true],[t("comparison.venueFeatures.applicationReview"), true, true, true],[t("comparison.venueFeatures.bookingInbox"), false, true, true],[t("comparison.venueFeatures.availabilityPlanning"), false, true, true],[t("comparison.venueFeatures.partnerDealManagement"), false, true, true],[t("comparison.venueFeatures.organizerFitInsights"), false, true, true],[t("comparison.venueFeatures.featuredPlacement"), false, false, true],[t("comparison.venueFeatures.premiumAnalytics"), false, false, true],[t("comparison.venueFeatures.priorityVenueMatching"), false, false, true],[t("comparison.venueFeatures.sponsoredInventory"), false, false, true]].map(([feature, ...vals], ri) => (
                    <tr key={ri} className="border-b border-white/8 last:border-0"><td className="px-5 py-2.5">{feature as string}</td>{(vals as boolean[]).map((v, ci) => (<td key={ci} className="px-5 py-2.5">{v ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <span className="text-gray-400">—</span>}</td>))}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ with accordion */}
      <section className="border-t border-gray-200 bg-brand-sand">
        <div className="section-shell py-14">
          <h2 className="mb-10 text-center text-2xl font-bold text-gray-900">{t("faq.title")}</h2>
          <div className="mx-auto max-w-3xl space-y-3">
            {pricingFaq.map((item) => (
              <details key={item.question} className="group rounded-2xl border border-gray-200 bg-white transition-all [&[open]]:shadow-md">
                <summary className="flex cursor-pointer items-center justify-between px-7 py-5 text-left font-semibold text-gray-900 transition hover:text-brand-indigo [&::-webkit-details-marker]:hidden">
                  <span>{item.question}</span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 group-open:rotate-90" />
                </summary>
                <div className="px-7 pb-6"><p className="text-sm leading-relaxed text-gray-600">{item.answer}</p></div>
              </details>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/faq" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-indigo transition hover:underline">
              {t("faq.moreLink")}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
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
      points: [t("sections.identity.point1"), t("sections.identity.point2"), t("sections.identity.point3")],
    },
    {
      title: t("sections.activity.title"),
      copy: t("sections.activity.copy"),
      points: [t("sections.activity.point1"), t("sections.activity.point2"), t("sections.activity.point3")],
    },
    {
      title: t("sections.comms.title"),
      copy: t("sections.comms.copy"),
      points: [t("sections.comms.point1"), t("sections.comms.point2"), t("sections.comms.point3")],
    },
  ];
  const rights = [
    { title: t("rights.access.title"), text: t("rights.access.text") },
    { title: t("rights.correct.title"), text: t("rights.correct.text") },
    { title: t("rights.billing.title"), text: t("rights.billing.text") },
    { title: t("rights.locale.title"), text: t("rights.locale.text") },
  ];

  return (
    <>
      <PageHeader
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        description={t("hero.description")}
      />

      <section className="section-shell py-8">
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            {sections.map((section) => (
              <Section key={section.title} title={section.title}>
                <p className="text-sm text-gray-600">{section.copy}</p>
                <ul className="mt-3 space-y-2">
                  {section.points.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-sm text-gray-600">
                      <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-sage" />
                      {point}
                    </li>
                  ))}
                </ul>
              </Section>
            ))}
          </div>

          <Section title={t("rightsTitle")}>
            <div className="space-y-4">
              {rights.map((item) => (
                <div key={item.title}>
                  <div className="font-medium text-gray-900">{item.title}</div>
                  <p className="mt-1 text-sm text-gray-600">{item.text}</p>
                </div>
              ))}
            </div>
          </Section>
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
      points: [t("sections.accounts.point1"), t("sections.accounts.point2"), t("sections.accounts.point3")],
    },
    {
      title: t("sections.events.title"),
      copy: t("sections.events.copy"),
      points: [t("sections.events.point1"), t("sections.events.point2"), t("sections.events.point3")],
    },
    {
      title: t("sections.moderation.title"),
      copy: t("sections.moderation.copy"),
      points: [t("sections.moderation.point1"), t("sections.moderation.point2"), t("sections.moderation.point3")],
    },
  ];
  const reminders = [t("reminders.one"), t("reminders.two"), t("reminders.three")];

  return (
    <>
      <PageHeader
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        description={t("hero.description")}
        actions={[
          { href: "/contact" as Route, label: t("hero.primaryCta"), primary: true },
          { href: "/privacy", label: t("hero.secondaryCta") },
        ]}
      />

      <section className="section-shell py-8">
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            {sections.map((section) => (
              <Section key={section.title} title={section.title}>
                <p className="text-sm text-gray-600">{section.copy}</p>
                <ul className="mt-3 space-y-2">
                  {section.points.map((point) => (
                    <li key={point} className="text-sm text-gray-600">{point}</li>
                  ))}
                </ul>
              </Section>
            ))}
          </div>

          <div className="space-y-6">
            <Section title={t("stanceTitle")}>
              <KeyValueList
                items={[
                  { key: "trust", label: t("stance.trust.label"), value: t("stance.trust.value") },
                  { key: "rooms", label: t("stance.rooms.label"), value: t("stance.rooms.value") },
                  { key: "providers", label: t("stance.providers.label"), value: t("stance.providers.value") },
                  { key: "appeals", label: t("stance.appeals.label"), value: t("stance.appeals.value") },
                ]}
              />
            </Section>

            <Section title={t("remindersTitle")}>
              <div className="space-y-2">
                {reminders.map((item) => (
                  <div key={item} className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
                    {item}
                  </div>
                ))}
              </div>
            </Section>
          </div>
        </div>
      </section>
    </>
  );
}

export function ContactScreen() {
  const t = useTranslations("contactPage");
  const channels = [
    { title: t("channels.general.title"), detail: "support@meetupreykjavik.is", note: t("channels.general.note"), icon: Mail },
    { title: t("channels.organizer.title"), detail: "organizers@meetupreykjavik.is", note: t("channels.organizer.note"), icon: UsersRound },
    { title: t("channels.venue.title"), detail: "venues@meetupreykjavik.is", note: t("channels.venue.note"), icon: MapPin },
    { title: t("channels.trust.title"), detail: "trust@meetupreykjavik.is", note: t("channels.trust.note"), icon: Shield },
  ];

  const expectations = [
    t("expectations.one"),
    t("expectations.two"),
    t("expectations.three"),
  ];

  return (
    <>
      <PageHeader
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        description={t("hero.description")}
      />

      {/* Channel cards */}
      <section className="section-shell py-10">
        <h2 className="mb-6 text-xl font-bold text-gray-900">{t("channelsTitle")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {channels.map((channel) => {
            const Icon = channel.icon;
            return (
              <div key={channel.title} className="rounded-2xl border border-gray-200 bg-white p-6 transition hover:shadow-md">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-indigo/8">
                    <Icon className="h-5 w-5 text-brand-indigo" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{channel.title}</div>
                    <a href={`mailto:${channel.detail}`} className="mt-1 block text-sm font-medium text-brand-indigo transition-colors hover:text-brand-indigo-light">
                      {channel.detail}
                    </a>
                    <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{channel.note}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Response times + Form */}
      <section className="border-t border-gray-200 bg-brand-sand-light">
        <div className="section-shell grid gap-10 py-12 lg:grid-cols-2">
          <div>
            <h2 className="mb-2 text-xl font-bold text-gray-900">{t("expectationsTitle")}</h2>
            <p className="mb-6 text-sm text-gray-600">{t("expectationsDescription")}</p>
            <div className="space-y-3">
              {expectations.map((item, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl bg-white p-4">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-indigo text-xs font-bold !text-white">
                    {i + 1}
                  </div>
                  <p className="text-sm leading-relaxed text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <ContactForm />
        </div>
      </section>
    </>
  );
}

export function CategoriesIndexScreen() {
  const t = useTranslations("categoriesPage");
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
      <IndexHero
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        description={t("hero.description")}
        imageSrc="/place-images/reykjavik/hafnarborg-1be7b43b.jpg"
        actions={[
          { href: "/events", label: t("hero.browseEvents"), primary: true },
          { href: "/groups", label: t("hero.seeGroups") },
        ]}
      />

      <section className="section-shell py-8">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredCategories.map((item) => (
            <Link
              key={item.category.slug}
              href={categoryHref(item.category.slug)}
              className="rounded-xl border border-gray-200 bg-white p-6 transition hover:border-gray-300 hover:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <span
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold"
                  style={categoryBadgeStyle(item.category.tone)}
                >
                  {item.category.letter}
                </span>
              </div>
              <h2 className="mt-4 text-lg font-bold text-gray-900">{item.category.name}</h2>
              <p className="mt-1 text-sm text-gray-600">{t("meetups", { count: item.category.count })}</p>
              <div className="mt-4 flex gap-4 text-sm text-gray-500">
                <span>{t("events", { count: item.eventsCount })}</span>
                <span>{t("groups", { count: item.groupsCount })}</span>
                <span>{t("venues", { count: item.venuesCount })}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

export function CategoryDetailScreen({ slug }: { slug: string }) {
  const t = useTranslations("categoriesPage");
  const tNav = useTranslations("nav");
  const bundle = getCategoryBundle(slug);

  if (!bundle) {
    return (
      <>
        <PageHeader
          eyebrow={t("notFound.eyebrow")}
          title={t("notFound.title")}
          description={t("notFound.description")}
          actions={[{ href: categoriesHref(), label: t("notFound.browseCategories"), primary: true }]}
        />
        <section className="section-shell py-8">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {categoryDirectory.map((category) => (
              <Link
                key={category.slug}
                href={categoryHref(category.slug)}
                className="rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50"
              >
                <div className="font-medium text-gray-900">{category.name}</div>
                <p className="mt-1 text-sm text-gray-600">{t("meetups", { count: category.count })}</p>
              </Link>
            ))}
          </div>
        </section>
      </>
    );
  }

  const relatedCategories = categoryDirectory
    .filter((item) => item.slug !== bundle.category.slug)
    .slice(0, 3);

  return (
    <>
      <Breadcrumbs
        crumbs={[
          { href: "/" as Route, label: tNav("home") },
          { href: "/categories" as Route, label: tNav("categories") },
          { label: bundle.category.name },
        ]}
      />
      <PageHeader
        eyebrow={t("detail.eyebrow")}
        title={bundle.category.name}
        description={t("detail.meetupsInCategory", { count: bundle.category.count })}
        actions={[
          { href: "/signup", label: t("detail.join"), primary: true },
          { href: categoriesHref(), label: t("detail.allCategories") },
        ]}
      />

      <section className="section-shell py-8">
        <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-3 text-center sm:p-4">
            <div className="text-xl font-bold text-gray-900 sm:text-2xl">{bundle.events.length}</div>
            <div className="text-xs text-gray-500 sm:text-sm">{t("eventsLabel")}</div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-3 text-center sm:p-4">
            <div className="text-xl font-bold text-gray-900 sm:text-2xl">{bundle.groups.length}</div>
            <div className="text-xs text-gray-500 sm:text-sm">{t("groupsLabel")}</div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-3 text-center sm:p-4">
            <div className="text-xl font-bold text-gray-900 sm:text-2xl">{bundle.venues.length}</div>
            <div className="text-xs text-gray-500 sm:text-sm">{t("venuesLabel")}</div>
          </div>
        </div>

        {bundle.events.length > 0 ? (
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">{t("detail.eventsHeading")}</h2>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {bundle.events.slice(0, 3).map((event) => (
                <EventCard key={event.slug} event={event} />
              ))}
            </div>
          </div>
        ) : null}

        {bundle.groups.length > 0 ? (
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">{t("detail.groupsHeading")}</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {bundle.groups.slice(0, 4).map((group) => (
                <GroupCard
                  key={group.slug}
                  group={group}
                  upcomingTitle={
                    publicEvents.find((event) => (group.upcomingEventSlugs ?? []).includes(event.slug))?.title
                  }
                />
              ))}
            </div>
          </div>
        ) : null}

        {bundle.venues.length > 0 ? (
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">{t("detail.venuesHeading")}</h2>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {bundle.venues.slice(0, 4).map((venue) => (
                <VenueCard key={venue.slug} venue={venue} />
              ))}
            </div>
          </div>
        ) : null}

        {relatedCategories.length > 0 ? (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">{t("detail.relatedCategories")}</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {relatedCategories.map((category) => (
                <Link
                  key={category.slug}
                  href={categoryHref(category.slug)}
                  className="rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50"
                >
                  <div className="font-medium text-gray-900">{category.name}</div>
                  <p className="mt-1 text-sm text-gray-600">{t("meetups", { count: category.count })}</p>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </>
  );
}

export function FaqScreen() {
  const t = useTranslations("faqPage");
  const faqSections = [
    {
      title: t("sections.joiningProfiles.title"),
      items: [
        { question: t("sections.joiningProfiles.q1"), answer: t("sections.joiningProfiles.a1") },
        { question: t("sections.joiningProfiles.q2"), answer: t("sections.joiningProfiles.a2") },
      ],
    },
    {
      title: t("sections.eventsGroups.title"),
      items: [
        { question: t("sections.eventsGroups.q1"), answer: t("sections.eventsGroups.a1") },
        { question: t("sections.eventsGroups.q2"), answer: t("sections.eventsGroups.a2") },
      ],
    },
    {
      title: t("sections.paymentsBilling.title"),
      items: pricingFaq.slice(0, 2).map((item) => ({
        question: item.question,
        answer: item.answer,
      })),
    },
    {
      title: t("sections.trustSupport.title"),
      items: [
        { question: t("sections.trustSupport.q1"), answer: t("sections.trustSupport.a1") },
        { question: t("sections.trustSupport.q2"), answer: t("sections.trustSupport.a2") },
      ],
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        description={t("hero.description")}
        actions={[
          { href: "/contact", label: t("hero.contactUs"), primary: true },
          { href: "/pricing", label: t("hero.seePricing") },
        ]}
      />

      {/* Searchable FAQ content (client component with filtering) */}
      <section className="bg-white">
        <div className="section-shell py-8 space-y-10 pb-14">
          <FaqSearchableContent
            sections={faqSections}
            searchPlaceholder={t("searchPlaceholder")}
            noResultsMessage={t("noResults")}
          />
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-200 bg-brand-sand">
        <div className="section-shell py-14 text-center">
          <h2 className="text-2xl font-bold text-gray-900">{t("cta.heading")}</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-gray-600">{t("cta.description")}</p>
          <Link
            href="/contact"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-indigo px-8 py-3.5 text-sm font-semibold !text-white transition hover:opacity-90"
          >
            {t("hero.contactUs")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}

export function ForOrganizersScreen() {
  const t = useTranslations("forOrganizersPage");

  const features = [
    { icon: UsersRound, title: t("features.recurringGroups.title"), text: t("features.recurringGroups.text"), color: "bg-brand-coral-soft text-brand-coral" },
    { icon: Ticket, title: t("features.eventTools.title"), text: t("features.eventTools.text"), color: "bg-brand-indigo-soft text-brand-indigo" },
    { icon: Building2, title: t("features.venueMatching.title"), text: t("features.venueMatching.text"), color: "bg-[rgba(124,154,130,0.12)] text-brand-sage" },
    { icon: TrendingUp, title: t("features.analytics.title"), text: t("features.analytics.text"), color: "bg-brand-coral-soft text-brand-coral" },
    { icon: CalendarDays, title: t("features.recurringTemplates.title"), text: t("features.recurringTemplates.text"), color: "bg-brand-indigo-soft text-brand-indigo" },
    { icon: Zap, title: t("features.approvalControls.title"), text: t("features.approvalControls.text"), color: "bg-amber-50 text-amber-600" },
  ];

  const steps = [
    { num: "01", title: t("steps.create.title"), text: t("steps.create.text") },
    { num: "02", title: t("steps.configure.title"), text: t("steps.configure.text") },
    { num: "03", title: t("steps.publish.title"), text: t("steps.publish.text") },
  ];

  return (
    <>
      <IndexHero
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        description={t("hero.description", { minPrice: minimumTicketPriceIsk })}
        imageSrc="/place-images/reykjavik/ufa-40055fa7.jpg"
        actions={[
          { href: "/signup", label: t("hero.startOrganizing"), primary: true },
          { href: "/pricing", label: t("hero.seePricing") },
        ]}
      />

      {/* Feature grid */}
      <section className="bg-white">
        <div className="section-shell py-16">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-indigo">{t("features.eyebrow")}</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">{t("features.heading")}</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((item) => (
              <div key={item.title} className="group rounded-2xl border border-gray-200 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", item.color)}>
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to get started */}
      <section className="border-t border-gray-200 bg-brand-sand">
        <div className="section-shell py-16">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">{t("steps.heading")}</h2>
            <p className="mt-4 text-base text-gray-600">{t("steps.subtitle")}</p>
          </div>
          <div className="mx-auto grid max-w-3xl gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.num} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-coral text-lg font-bold !text-white">
                  {step.num}
                </div>
                <h3 className="mt-5 text-lg font-bold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-gray-200 bg-white">
        <div className="section-shell py-16">
          <h2 className="mb-10 text-center text-2xl font-bold tracking-tight text-gray-900">{t("testimonial.heading")}</h2>
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
            {[
              { quote: t("testimonial.quote"), name: t("testimonial.name"), role: t("testimonial.role") },
              { quote: t("testimonial2.quote"), name: t("testimonial2.name"), role: t("testimonial2.role") },
            ].map((item) => (
              <div key={item.name} className="rounded-2xl border border-gray-200 bg-brand-sand-light p-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-coral-soft">
                  <Heart className="h-5 w-5 text-brand-coral" />
                </div>
                <blockquote className="mt-5 font-editorial text-lg italic leading-relaxed text-gray-900">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
                <div className="mt-5">
                  <div className="font-semibold text-gray-900">{item.name}</div>
                  <div className="text-sm text-gray-500">{item.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-gray-200 bg-brand-sand">
        <div className="section-shell py-16">
          <h2 className="mb-2 text-center text-2xl font-bold text-gray-900">{t("pricing.heading")}</h2>
          <p className="mb-10 text-center text-sm text-gray-600">{t("pricing.commission", { rate: ticketCommissionRate })}</p>
          <div className="grid gap-6 md:grid-cols-3">
            {organizerTiers.map((tier, i) => (
              <article
                key={tier.name}
                className={cn(
                  "sales-tier-card rounded-2xl border bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
                  i === 1 ? "border-brand-coral ring-2 ring-brand-coral/20 shadow-lg" : "border-gray-200",
                )}
              >
                {i === 1 ? (
                  <div className="rounded-t-2xl bg-brand-coral py-2 text-center text-xs font-bold uppercase tracking-wider text-white">
                    {t("pricing.recommended")}
                  </div>
                ) : null}
                <div className="border-b border-gray-100 p-7">
                  <div className="text-sm font-semibold text-gray-500">{tier.name}</div>
                  <div className="mt-3 text-4xl font-bold text-gray-900">{tier.price}</div>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">{tier.description}</p>
                </div>
                <div className="p-7 space-y-3">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-sage" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 p-7">
                  <Link
                    href="/signup"
                    className={cn(
                      "inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold transition hover:-translate-y-0.5",
                      i === 1
                        ? "bg-brand-coral text-white shadow-lg hover:shadow-[0_12px_28px_rgba(232,97,77,0.3)]"
                        : "bg-brand-indigo text-white hover:opacity-90"
                    )}
                  >
                    {t("pricing.getStarted")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA with gradient */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-indigo via-[#4338ca] to-[#312e81]">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="section-shell relative z-10 py-16 text-center text-white sm:py-20">
          <h3 className="text-3xl font-bold">{t("cta.heading")}</h3>
          <p className="mx-auto mt-4 max-w-lg text-base text-white/85">{t("cta.description")}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/signup" className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold shadow-lg transition hover:bg-white/90" style={{ color: "var(--color-brand-indigo-light)" }}>
              {t("cta.button")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/pricing" className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20">
              {t("hero.seePricing")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export function ForVenuesScreen() {
  const t = useTranslations("forVenuesPage");

  const benefits = [
    { icon: CheckCircle2, title: t("features.structuredOnboarding.title"), text: t("features.structuredOnboarding.text"), color: "bg-[rgba(124,154,130,0.12)] text-brand-sage" },
    { icon: CalendarDays, title: t("features.bookingManagement.title"), text: t("features.bookingManagement.text"), color: "bg-brand-indigo-soft text-brand-indigo" },
    { icon: TrendingUp, title: t("features.analyticsDeals.title"), text: t("features.analyticsDeals.text"), color: "bg-brand-coral-soft text-brand-coral" },
    { icon: UsersRound, title: t("features.communityExposure.title"), text: t("features.communityExposure.text"), color: "bg-brand-indigo-soft text-brand-indigo" },
    { icon: Star, title: t("features.reviewsRatings.title"), text: t("features.reviewsRatings.text"), color: "bg-amber-50 text-amber-600" },
    { icon: Sparkles, title: t("features.featuredPlacement.title"), text: t("features.featuredPlacement.text"), color: "bg-brand-coral-soft text-brand-coral" },
  ];

  const steps = [
    { num: "01", title: t("steps.apply.title"), text: t("steps.apply.text") },
    { num: "02", title: t("steps.setup.title"), text: t("steps.setup.text") },
    { num: "03", title: t("steps.publish.title"), text: t("steps.publish.text") },
    { num: "04", title: t("steps.grow.title"), text: t("steps.grow.text") },
  ];

  return (
    <>
      <IndexHero
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        description={t("hero.description")}
        imageSrc="/place-images/reykjavik/dill-0aeca160.jpg"
        actions={[
          { href: "/venue/onboarding", label: t("hero.applyAsPartner"), primary: true },
          { href: "/venues", label: t("hero.browseVenues") },
        ]}
      />

      {/* Venue benefits grid */}
      <section className="bg-white">
        <div className="section-shell py-16">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-indigo">{t("benefits.eyebrow")}</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">{t("features.heading")}</h2>
            <p className="mt-4 text-base text-gray-600">{t("benefits.subtitle")}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((item) => (
              <div
                key={item.title}
                className="group rounded-2xl border border-gray-200 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", item.color)}>
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works for venues */}
      <section className="border-t border-gray-200 bg-brand-sand">
        <div className="section-shell py-16">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">{t("steps.heading")}</h2>
            <p className="mt-4 text-base text-gray-600">{t("steps.subtitle")}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.num} className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-sage text-lg font-bold !text-white">
                  {step.num}
                </div>
                <h3 className="mt-5 text-lg font-bold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-gray-200 bg-white">
        <div className="section-shell py-16">
          <h2 className="mb-10 text-center text-2xl font-bold text-gray-900">{t("pricing.heading")}</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {venueTiers.map((tier, i) => (
              <article
                key={tier.name}
                className={cn(
                  "sales-tier-card rounded-2xl border bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
                  i === 1
                    ? "border-brand-sage ring-2 ring-brand-sage/20 shadow-lg"
                    : "border-gray-200",
                )}
              >
                {i === 1 ? (
                  <div className="rounded-t-2xl bg-brand-sage py-2 text-center text-xs font-bold uppercase tracking-wider text-white">
                    {t("pricing.bestValue")}
                  </div>
                ) : null}
                <div className="border-b border-gray-100 p-7">
                  <div className="text-sm font-semibold text-gray-500">{tier.name}</div>
                  <div className="mt-3 text-4xl font-bold text-gray-900">{tier.price}</div>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">{tier.description}</p>
                </div>
                <div className="p-7 space-y-3">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-sage" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="px-7 pb-7">
                  <Link
                    href="/venue/onboarding"
                    className={cn(
                      "flex w-full items-center justify-center rounded-full py-3.5 text-sm font-semibold transition",
                      i === 1
                        ? "bg-brand-sage text-white hover:opacity-90"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-50",
                    )}
                  >
                    {tier.price === "0 ISK" ? t("pricing.listFree") : t("pricing.applyNow")}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-gray-200 bg-brand-sand">
        <div className="section-shell py-16">
          <h2 className="mb-10 text-center text-2xl font-bold tracking-tight text-gray-900">{t("testimonial.heading")}</h2>
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
            {[
              { quote: t("testimonial.quote"), name: t("testimonial.name"), role: t("testimonial.role") },
              { quote: t("testimonial2.quote"), name: t("testimonial2.name"), role: t("testimonial2.role") },
            ].map((item) => (
              <div key={item.name} className="rounded-2xl border border-gray-200 bg-white p-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(124,154,130,0.12)]">
                  <Star className="h-5 w-5 text-brand-sage" />
                </div>
                <blockquote className="mt-5 font-editorial text-lg italic leading-relaxed text-gray-900">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
                <div className="mt-5">
                  <div className="font-semibold text-gray-900">{item.name}</div>
                  <div className="text-sm text-gray-500">{item.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA with gradient */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-sage via-[#5a7d62] to-[#3d5c45]">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="section-shell relative z-10 py-16 text-center text-white sm:py-20">
          <h3 className="text-3xl font-bold">{t("cta.heading")}</h3>
          <p className="mx-auto mt-4 max-w-lg text-base text-white/85">
            {t("cta.description")}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/venue/onboarding"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-brand-sage shadow-lg transition hover:bg-white/90"
            >
              {t("cta.button")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/venues"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              {t("hero.browseVenues")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
