import Link from "next/link";
import Image from "next/image";
import type { Route } from "next";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Globe2,
  MapPin,
  Sparkles,
  Star,
  Ticket,
  TrendingUp,
  UsersRound,
  Zap,
} from "lucide-react";
import { ContactForm } from "@/components/public/contact-form";
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
import {
  getFeaturedSourcedPlaces,
  type SourcedPlace,
} from "@/lib/reykjavik-source-data";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/public/reveal";

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

function categoryBadgeClass(tone: (typeof categories)[number]["tone"]) {
  if (tone === "sage") return "bg-[rgba(124,154,130,0.12)] text-[var(--brand-sage)]";
  if (tone === "indigo") return "bg-[var(--brand-indigo-soft)] text-[var(--brand-indigo)]";
  if (tone === "sand") return "bg-[var(--brand-sand)] text-[var(--brand-text)]";
  return "bg-[var(--brand-coral-soft)] text-[var(--brand-coral-dark)]";
}

/** Extract image URL from gradient+url art strings */
function extractImageUrl(art: string): string | null {
  const match = art.match(/url\(['"]?([^'")\s]+)['"]?\)/);
  return match ? match[1] : null;
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
      `${group.category} ${group.summary} ${group.tags.join(" ")} ${group.organizer}`,
      keywords,
    ),
  );
  const venues = publicVenues.filter((venue) => {
    const venueText = `${venue.type} ${venue.summary} ${venue.amenities.join(" ")}`;
    const venueEventMatch = venue.upcomingEventSlugs.some((eventSlug) =>
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
        <span className="text-xs font-semibold uppercase tracking-widest text-[var(--brand-indigo)]">
          {eyebrow}
        </span>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-4 max-w-2xl text-lg text-gray-600">{description}</p>
        ) : null}
        {actions?.length ? (
          <div className="mt-6 flex flex-wrap gap-3">
            {actions.map((action) =>
              action.primary ? (
                <Link
                  key={action.label}
                  href={action.href}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-indigo)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
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
}: {
  eyebrow: string;
  title: string;
  description: string;
  art: string;
  children?: React.ReactNode;
  actions?: Array<{ href: Route; label: string; primary?: boolean }>;
}) {
  const imageUrl = extractImageUrl(art);

  return (
    <section className="relative overflow-hidden border-b border-gray-200 bg-gray-900">
      {imageUrl ? (
        <>
          <Image
            fill
            alt=""
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
      <div className="section-shell relative z-10 py-14 text-white sm:py-20">
        <span className="text-xs font-semibold uppercase tracking-widest text-white/70">
          {eyebrow}
        </span>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-white/80">{description}</p>
        {actions?.length ? (
          <div className="mt-6 flex flex-wrap gap-3">
            {actions.map((action) =>
              action.primary ? (
                <Link
                  key={action.label}
                  href={action.href}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-coral)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  {action.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link
                  key={action.label}
                  href={action.href}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  {action.label}
                </Link>
              ),
            )}
          </div>
        ) : null}
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
    <div className={cn("rounded-xl border border-gray-200 bg-white p-6", className)}>
      {title ? (
        <h2 className="mb-4 text-lg font-semibold text-gray-900">{title}</h2>
      ) : null}
      {children}
    </div>
  );
}

/* ── Card components ───────────────────────────────────── */

function EventCard({ event }: { event: PublicEvent }) {
  const fill = occupancyPercent(event.attendees, event.capacity);
  const startsAt = new Date(event.startsAt);
  const badgeDay = startsAt.toLocaleString("en-GB", {
    day: "numeric",
    timeZone: "Atlantic/Reykjavik",
  });
  const badgeMonth = startsAt
    .toLocaleString("en-GB", { month: "short", timeZone: "Atlantic/Reykjavik" })
    .toUpperCase();
  const imageUrl = extractImageUrl(event.art);

  return (
    <article className="overflow-hidden rounded-xl border border-[#EBE6DC] bg-white shadow-[0_1px_4px_rgba(42,38,56,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(42,38,56,0.12)]">
      <div className="relative h-48 bg-gray-200">
        {imageUrl ? (
          <>
            <Image
              fill
              alt={event.title}
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              src={imageUrl}
              unoptimized={imageUrl.startsWith("https://")}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0" style={{ background: event.art }} />
        )}
        <div className="relative z-10 flex h-full flex-col justify-between p-4 text-white">
          <div className="flex items-start justify-between gap-3">
            <div className="rounded-lg bg-white px-3 py-1.5 text-center shadow-sm">
              <div className="text-[0.6rem] font-bold uppercase tracking-wider " style={{ color: "#E8614D" }}>
                {badgeMonth}
              </div>
              <div className="text-xl font-bold text-gray-900">{badgeDay}</div>
            </div>
            <ToneBadge tone={categoryTone(event.category)}>{event.category}</ToneBadge>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-black/50 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
              {event.priceLabel}
            </span>
            {event.ageLabel !== "All ages" ? (
              <span className="rounded-full bg-black/40 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                {event.ageLabel}
              </span>
            ) : null}
          </div>
        </div>
      </div>
      <div className="p-5">
        <h2 className="text-xl font-bold text-gray-900">{event.title}</h2>
        <p className="mt-2 text-sm text-gray-600">{event.summary}</p>
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-gray-400" />
            {formatEventDate(event.startsAt)}
          </div>
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-gray-400" />
            {formatEventTimeRange(event.startsAt, event.endsAt)}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            {event.venueName}
          </div>
          <div className="flex items-center gap-2">
            <UsersRound className="h-4 w-4 text-gray-400" />
            {event.attendees}/{event.capacity} going
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{fill}% full</span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-gray-100">
            <div
              className="h-1.5 rounded-full bg-[var(--brand-indigo)]"
              style={{ width: `${fill}%` }}
            />
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between">
          <div className="text-sm text-gray-500">{event.groupName}</div>
          <Link
            href={eventHref(event.slug)}
            className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-indigo)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            View event
            <ArrowRight className="h-3.5 w-3.5" />
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
  const imageUrl = extractImageUrl(group.banner);

  return (
    <article className="overflow-hidden rounded-xl border border-[#EBE6DC] bg-white shadow-[0_1px_4px_rgba(42,38,56,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(42,38,56,0.12)]">
      <div className="relative h-36 bg-gray-200">
        {imageUrl ? (
          <>
            <Image
              fill
              alt={group.name}
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              src={imageUrl}
              unoptimized={imageUrl.startsWith("https://")}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0" style={{ background: group.banner }} />
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2">
          <ToneBadge tone={categoryTone(group.category)}>{group.category}</ToneBadge>
        </div>
        <h2 className="mt-3 text-xl font-bold text-gray-900">{group.name}</h2>
        <p className="mt-2 text-sm text-gray-600">{group.summary}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {group.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <UsersRound className="h-4 w-4 text-gray-400" />
            {group.members} members
          </div>
          <div className="flex items-center gap-2">
            Organized by {group.organizer}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {upcomingTitle ? `Next: ${upcomingTitle}` : "No upcoming events"}
          </div>
          <Link
            href={groupHref(group.slug)}
            className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-indigo)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            View group
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function VenueCard({ venue }: { venue: PublicVenue }) {
  const nextEvent = publicEvents.find((event) => venue.upcomingEventSlugs.includes(event.slug));
  const imageUrl = extractImageUrl(venue.art);

  return (
    <article className="overflow-hidden rounded-xl border border-[#EBE6DC] bg-white shadow-[0_1px_4px_rgba(42,38,56,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(42,38,56,0.12)]">
      <div className="relative h-36 bg-gray-200">
        {imageUrl ? (
          <>
            <Image
              fill
              alt={venue.name}
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
              src={imageUrl}
              unoptimized={imageUrl.startsWith("https://")}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0" style={{ background: venue.art }} />
        )}
        <div className="absolute right-3 top-3">
          <span className="flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-sm font-semibold text-white backdrop-blur-sm">
            <Star className="h-3.5 w-3.5 fill-current" />
            {venue.rating}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900">{venue.name}</h3>
        <div className="mt-0.5 text-xs text-gray-500">{venue.type} · {venue.area}</div>
        <p className="mt-2 text-sm text-gray-600">{venue.summary}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {venue.amenities.slice(0, 3).map((amenity) => (
            <span key={amenity} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
              {amenity}
            </span>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {nextEvent ? `Upcoming: ${nextEvent.title}` : "Open for bookings"}
          </div>
          <Link
            href={venueHref(venue.slug)}
            className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-indigo)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            View venue
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function BlogCard({ post }: { post: BlogPost }) {
  const imageUrl = extractImageUrl(post.hero);

  return (
    <article className="overflow-hidden rounded-xl border border-[#EBE6DC] bg-white shadow-[0_1px_4px_rgba(42,38,56,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(42,38,56,0.12)]">
      <div className="relative h-44 bg-gray-200">
        {imageUrl ? (
          <>
            <Image
              fill
              alt={post.title}
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              src={imageUrl}
              unoptimized={imageUrl.startsWith("https://")}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0" style={{ background: post.hero }} />
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2">
          <ToneBadge tone="indigo">{post.category}</ToneBadge>
          <span className="text-xs text-gray-500">{post.readTime}</span>
        </div>
        <h2 className="mt-3 text-xl font-bold text-gray-900">{post.title}</h2>
        <p className="mt-2 text-sm text-gray-600">{post.excerpt}</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">{post.publishedAt}</div>
          <Link
            href={blogHref(post.slug)}
            className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-indigo)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Read article
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function SourcedPlaceCard({ place }: { place: SourcedPlace }) {
  const imageSrc = place.image?.localPath || place.image?.remoteUrl;
  const hasPhoto = place.image?.kind === "photo";

  return (
    <article className="overflow-hidden rounded-xl border border-[#EBE6DC] bg-white shadow-[0_1px_4px_rgba(42,38,56,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(42,38,56,0.12)]">
      <div className="relative h-48 bg-gray-200">
        {imageSrc ? (
          <Image
            fill
            alt={`${place.name} in ${place.area}`}
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
            src={imageSrc}
            unoptimized={imageSrc.startsWith("https://")}
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-black/30 px-2.5 py-1 text-xs font-medium">{place.laneLabel}</span>
            <span className="rounded-full bg-black/30 px-2.5 py-1 text-xs font-medium">{place.kindLabel}</span>
          </div>
          <h3 className="mt-2 text-xl font-bold">{place.name}</h3>
          <p className="text-sm text-white/80">{place.area}</p>
        </div>
      </div>
      <div className="p-5 space-y-3">
        <p className="text-sm text-gray-600">{place.summary}</p>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <MapPin className="h-4 w-4 text-gray-400" />
          {place.address || place.area}
        </div>
        {place.website ? (
          <a
            href={place.website}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--brand-indigo)]"
            rel="noreferrer"
            target="_blank"
          >
            <Globe2 className="h-4 w-4" />
            Website
          </a>
        ) : null}
        {hasPhoto && place.image?.credit ? (
          <div className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
            Photo: {place.image.credit}
          </div>
        ) : null}
        <Link
          href={venueHref(place.slug)}
          className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-indigo)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          View venue
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}

function TierCard({
  title,
  price,
  description,
  features,
}: {
  title: string;
  price: string;
  description: string;
  features?: readonly string[];
}) {
  return (
    <article className="rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-100 p-6">
        <div className="text-sm font-semibold text-gray-500">{title}</div>
        <div className="mt-2 text-3xl font-bold text-gray-900">{price}</div>
        <p className="mt-3 text-sm text-gray-600">{description}</p>
      </div>
      {features ? (
        <div className="p-6 space-y-3">
          {features.map((feature) => (
            <div key={feature} className="flex items-start gap-2">
              <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-sage)]" />
              <span className="text-sm text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}

function FilterBar({
  items,
  activeIndex = 0,
}: {
  items: readonly string[];
  activeIndex?: number;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <span
          key={item}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition",
            i === activeIndex
              ? "bg-[var(--brand-indigo)] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200",
          )}
        >
          {item}
        </span>
      ))}
    </div>
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
}: {
  eyebrow: string;
  title: string;
  description: string;
  imageSrc: string;
  stats?: Array<{ label: string; value: string }>;
  actions?: Array<{ href: Route; label: string; primary?: boolean }>;
}) {
  return (
    <section className="relative overflow-hidden bg-gray-900">
      <Image
        fill
        alt=""
        className="object-cover opacity-30"
        sizes="100vw"
        src={imageSrc}
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/40 via-gray-900/60 to-gray-900/90" />
      <div className="section-shell relative z-10 py-16 text-white sm:py-24">
        <span className="text-xs font-semibold uppercase tracking-widest text-[var(--brand-coral)]">
          {eyebrow}
        </span>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/80">
          {description}
        </p>
        {actions?.length ? (
          <div className="mt-8 flex flex-wrap gap-3">
            {actions.map((action) =>
              action.primary ? (
                <Link
                  key={action.label}
                  href={action.href}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-coral)] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[var(--brand-coral)]/20 transition hover:opacity-90"
                >
                  {action.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link
                  key={action.label}
                  href={action.href}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  {action.label}
                </Link>
              ),
            )}
          </div>
        ) : null}
        {stats?.length ? (
          <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="mt-1 text-sm text-white/60">{stat.label}</div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

/* ── Stat counter row ────────────────────────────────── */

function StatRow({
  items,
}: {
  items: Array<{ icon: React.ElementType; label: string; value: string }>;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-indigo-soft)]">
            <item.icon className="h-5 w-5 text-[var(--brand-indigo)]" />
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900">{item.value}</div>
            <div className="text-xs text-gray-500">{item.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PAGE SCREENS
   ══════════════════════════════════════════════════════════ */

export function EventsIndexScreen() {
  const featured = publicEvents[0];
  const totalAttendees = publicEvents.reduce((sum, e) => sum + e.attendees, 0);
  const featuredImage = extractImageUrl(featured.art) ?? "/place-images/reykjavik/reykjavik-871-2-78434189.jpg";

  return (
    <>
      <IndexHero
        eyebrow="Events"
        title="Events in Reykjavik"
        description="Hosted socials, workshops, tastings, and outdoor adventures — curated by real organizers in real venues across the city."
        imageSrc="/place-images/reykjavik/reykjavik-871-2-78434189.jpg"
        stats={[
          { label: "Upcoming events", value: String(publicEvents.length) },
          { label: "Total attendees", value: totalAttendees.toLocaleString() },
          { label: "Partner venues", value: String(publicVenues.length) },
          { label: "Active groups", value: String(publicGroups.length) },
        ]}
        actions={[
          { href: "/signup", label: "Join the community", primary: true },
          { href: "/groups", label: "Explore groups" },
        ]}
      />

      {/* Featured event spotlight */}
      <section className="reveal section-shell py-10">
        <div className="mb-8 flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-[var(--brand-coral)]" />
          <h2 className="text-lg font-semibold text-gray-900">Featured event</h2>
        </div>
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white md:grid md:grid-cols-2">
          <div className="relative h-64 md:h-auto">
            <Image
              fill
              alt={featured.title}
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
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
          <div className="p-8">
            <div className="text-sm font-medium text-[var(--brand-indigo)]">
              {formatEventDate(featured.startsAt)} · {formatEventTimeRange(featured.startsAt, featured.endsAt)}
            </div>
            <h3 className="mt-2 text-2xl font-bold text-gray-900">{featured.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">{featured.summary}</p>
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
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
                  className="h-1.5 rounded-full bg-[var(--brand-indigo)]"
                  style={{ width: `${occupancyPercent(featured.attendees, featured.capacity)}%` }}
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Link
                href={eventHref(featured.slug)}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-indigo)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                View event
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={groupHref(featured.groupSlug)}
                className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                {featured.groupName}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Filters + grid */}
      <section className="border-t border-gray-200 bg-[var(--brand-sand)]">
        <div className="section-shell py-10">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">All events</h2>
          <div className="space-y-4">
            <FilterBar items={publicCategoryOptions} />
            <FilterBar
              items={["Today", "This Week", "Weekend", "Month"]}
              activeIndex={1}
            />
          </div>

          <div className="reveal-group mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {publicEvents.map((event) => (
              <EventCard key={event.slug} event={event} />
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 rounded-2xl bg-[var(--brand-indigo)] p-8 text-center text-white sm:p-12">
            <h3 className="text-2xl font-bold">Ready to find your next event?</h3>
            <p className="mx-auto mt-3 max-w-lg text-sm text-white/80">
              Join the community to RSVP, get reminders, and discover events matched to your interests.
            </p>
            <Link
              href="/signup"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold transition hover:bg-white/90" style={{ color: "#3730A3" }}
            >
              Create free account
              <ArrowRight className="h-4 w-4" />
            </Link>
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
      <DetailHero
        eyebrow={`${event.category} event`}
        title={event.title}
        description={event.summary}
        art={event.art}
        actions={[
          { href: "/signup", label: "RSVP", primary: true },
          ...(group ? [{ href: groupHref(group.slug), label: "View group" }] : []),
        ]}
      />

      <section className="section-shell py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Main content */}
          <div className="space-y-6">
            <Section title="About this event">
              <div className="space-y-4">
                {event.description.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-relaxed text-gray-600">
                    {paragraph}
                  </p>
                ))}
              </div>
            </Section>

            {/* Gallery */}
            {event.gallery.length > 0 ? (
              <Section title="Gallery">
                <div className="grid gap-3 md:grid-cols-3">
                  {event.gallery.map((art, index) => {
                    const img = extractImageUrl(art);
                    return (
                      <div key={`gallery-${index}`} className="relative h-36 overflow-hidden rounded-lg bg-gray-100">
                        {img ? (
                          <Image fill alt="" className="object-cover" sizes="33vw" src={img} unoptimized={img.startsWith("https://")} />
                        ) : (
                          <div className="h-full w-full" style={{ background: art }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </Section>
            ) : null}

            {/* Comments */}
            {event.comments.length > 0 ? (
              <Section title="Comments">
                <div className="space-y-4">
                  {event.comments.map((comment) => (
                    <div key={`${comment.author}-${comment.postedAt}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{comment.author}</span>
                        <span className="text-xs text-gray-400">{comment.postedAt}</span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{comment.text}</p>
                    </div>
                  ))}
                </div>
              </Section>
            ) : null}

            {/* Ratings */}
            {event.ratings.length > 0 ? (
              <Section title="Reviews">
                <div className="space-y-4">
                  {event.ratings.map((rating) => (
                    <div key={`${rating.author}-${rating.rating}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{rating.author}</span>
                        <span className="flex items-center gap-1 text-[var(--brand-coral)]">
                          <Star className="h-4 w-4 fill-current" />
                          {rating.rating}/5
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{rating.text}</p>
                    </div>
                  ))}
                </div>
              </Section>
            ) : null}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Section title="Details">
              <KeyValueList
                items={[
                  { key: "date", label: "Date", value: formatEventDate(event.startsAt) },
                  { key: "time", label: "Time", value: formatEventTimeRange(event.startsAt, event.endsAt) },
                  { key: "venue", label: "Venue", value: event.venueName },
                  { key: "group", label: "Group", value: event.groupName },
                  { key: "price", label: "Ticket", value: event.priceLabel },
                  { key: "age", label: "Age", value: event.ageLabel },
                ]}
              />
              <div className="mt-4 rounded-lg bg-gray-50 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Capacity</span>
                  <span className="font-medium text-gray-900">{event.attendees}/{event.capacity}</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-gray-200">
                  <div
                    className="h-1.5 rounded-full bg-[var(--brand-indigo)]"
                    style={{ width: `${occupancyPercent(event.attendees, event.capacity)}%` }}
                  />
                </div>
              </div>
            </Section>

            <Section>
              <Link
                href="/signup"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--brand-indigo)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Reserve your seat
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Section>

            {group ? (
              <Section title="Host group">
                <div className="text-xl font-bold text-gray-900">{group.name}</div>
                <p className="mt-1 text-sm text-gray-600">{group.summary}</p>
                <KeyValueList
                  items={[
                    { key: "members", label: "Members", value: String(group.members) },
                    { key: "organizer", label: "Organizer", value: group.organizer },
                  ]}
                />
                <Link
                  href={groupHref(group.slug)}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--brand-indigo)]"
                >
                  View group <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Section>
            ) : null}

            {venue ? (
              <Section title="Venue">
                <div className="text-xl font-bold text-gray-900">{venue.name}</div>
                <p className="mt-1 text-sm text-gray-600">{venue.summary}</p>
                <KeyValueList
                  items={[
                    { key: "type", label: "Type", value: venue.type },
                    { key: "area", label: "Area", value: venue.area },
                    { key: "rating", label: "Rating", value: `${venue.rating}` },
                  ]}
                />
                {venue.deal ? (
                  <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    {venue.deal}
                  </div>
                ) : null}
                <Link
                  href={venueHref(venue.slug)}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--brand-indigo)]"
                >
                  View venue <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Section>
            ) : null}
          </div>
        </div>

        {relatedEvents.length > 0 ? (
          <div className="mt-10">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Related events</h2>
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

export function GroupsIndexScreen() {
  const totalMembers = publicGroups.reduce((sum, g) => sum + g.members, 0);
  const avgActivity = Math.round(publicGroups.reduce((sum, g) => sum + g.activity, 0) / publicGroups.length);

  return (
    <>
      <IndexHero
        eyebrow="Groups"
        title="Community groups"
        description="Recurring communities with a purpose. Find your people, join a group, and build real connections in Reykjavik."
        imageSrc="/place-images/reykjavik/hallgrimskirkja-60f147a6.jpg"
        stats={[
          { label: "Active groups", value: String(publicGroups.length) },
          { label: "Total members", value: totalMembers.toLocaleString() },
          { label: "Avg. activity", value: `${avgActivity}%` },
          { label: "Weekly events", value: String(publicEvents.length) },
        ]}
        actions={[
          { href: "/signup", label: "Join a group", primary: true },
          { href: "/events", label: "See events" },
        ]}
      />

      {/* How groups work */}
      <section className="border-b border-gray-200 bg-white">
        <div className="section-shell py-10">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: UsersRound,
                title: "Find your community",
                text: "Browse groups by interest — outdoors, tech, social, arts, food, and more.",
              },
              {
                icon: CalendarDays,
                title: "Join recurring events",
                text: "Groups host regular meetups with consistent formats, trusted hosts, and strong venues.",
              },
              {
                icon: TrendingUp,
                title: "Build connections",
                text: "Members, discussions, and shared experiences that grow over time.",
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-indigo-soft)]">
                  <item.icon className="h-5 w-5 text-[var(--brand-indigo)]" />
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

      {/* Groups grid */}
      <section className="bg-[var(--brand-sand)]">
        <div className="section-shell py-10">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Active groups</h2>
          <div className="reveal-group grid gap-6 md:grid-cols-2">
            {publicGroups.map((group) => (
              <GroupCard
                key={group.slug}
                group={group}
                upcomingTitle={
                  publicEvents.find((event) => group.upcomingEventSlugs.includes(event.slug))?.title
                }
              />
            ))}
          </div>

          {/* Start a group CTA */}
          <div className="mt-12 rounded-2xl border border-gray-200 bg-white p-8 sm:p-12">
            <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:gap-8">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand-coral-soft)]">
                <Zap className="h-7 w-7 text-[var(--brand-coral)]" />
              </div>
              <div className="mt-4 sm:mt-0">
                <h3 className="text-xl font-bold text-gray-900">Start your own group</h3>
                <p className="mt-2 max-w-lg text-sm text-gray-600">
                  Have a community idea? Launch a group with member management, event tools, and venue matching built in.
                </p>
              </div>
              <div className="mt-6 shrink-0 sm:mt-0 sm:ml-auto">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-coral)] px-7 py-3.5 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Get started
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
  const upcomingEvents = publicEvents.filter((event) =>
    group.upcomingEventSlugs.includes(event.slug),
  );

  return (
    <>
      <DetailHero
        eyebrow={`${group.category} group`}
        title={group.name}
        description={group.summary}
        art={group.banner}
        actions={[
          { href: "/signup", label: "Join this group", primary: true },
        ]}
      >
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
          <div>
            <div className="text-sm text-white/60">Members</div>
            <div className="text-2xl font-bold">{group.members}</div>
          </div>
          <div>
            <div className="text-sm text-white/60">Activity</div>
            <div className="text-2xl font-bold">{group.activity}%</div>
          </div>
          <div>
            <div className="text-sm text-white/60">Organizer</div>
            <div className="text-lg font-semibold">{group.organizer}</div>
          </div>
          <div>
            <div className="text-sm text-white/60">Upcoming</div>
            <div className="text-2xl font-bold">{upcomingEvents.length}</div>
          </div>
        </div>
      </DetailHero>

      <section className="section-shell py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <Section title="About">
              <div className="space-y-4">
                {group.description.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-relaxed text-gray-600">{paragraph}</p>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {group.tags.map((tag) => (
                  <ToneBadge key={tag} tone={categoryTone(group.category)}>{tag}</ToneBadge>
                ))}
              </div>
            </Section>

            {group.discussions.length > 0 ? (
              <Section title="Discussions">
                <div className="space-y-4">
                  {group.discussions.map((discussion) => (
                    <div key={discussion.title} className="rounded-lg bg-gray-50 p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{discussion.title}</span>
                        <span className="text-xs text-gray-500">{discussion.replies} replies</span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{discussion.preview}</p>
                    </div>
                  ))}
                </div>
              </Section>
            ) : null}
          </div>

          <div className="space-y-6">
            <Section title="Upcoming events">
              {upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <Link
                      key={event.slug}
                      href={eventHref(event.slug)}
                      className="block rounded-lg bg-gray-50 p-3 transition hover:bg-gray-100"
                    >
                      <div className="font-medium text-gray-900">{event.title}</div>
                      <p className="mt-1 text-sm text-gray-500">
                        {formatEventDate(event.startsAt)} · {event.venueName}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No upcoming events yet.</p>
              )}
            </Section>

            <Section title="Past events">
              <div className="space-y-2">
                {group.pastEvents.map((item) => (
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

export function VenuesIndexScreen() {
  const sourcedPlaces = getFeaturedSourcedPlaces(6);
  const avgRating = (publicVenues.reduce((sum, v) => sum + v.rating, 0) / publicVenues.length).toFixed(1);
  const totalCapacity = publicVenues.reduce((sum, v) => sum + v.capacity, 0);

  return (
    <>
      <IndexHero
        eyebrow="Venues"
        title="Venues in Reykjavik"
        description="Partner venues that host community events, offer member deals, and make every meetup feel at home."
        imageSrc="/place-images/reykjavik/hof-i-deccf755.jpg"
        stats={[
          { label: "Partner venues", value: String(publicVenues.length) },
          { label: "Avg. rating", value: `${avgRating}/5` },
          { label: "Total capacity", value: totalCapacity.toLocaleString() },
          { label: "City locations", value: String(sourcedPlaces.length + publicVenues.length) },
        ]}
        actions={[
          { href: "/venue/onboarding", label: "Become a partner", primary: true },
          { href: "/events", label: "See events" },
        ]}
      />

      {/* Why venues matter */}
      <section className="border-b border-gray-200 bg-white">
        <div className="section-shell py-10">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Building2,
                title: "Curated spaces",
                text: "Every partner venue is selected for its community fit, layout quality, and hosting potential.",
              },
              {
                icon: Ticket,
                title: "Member deals",
                text: "Partner venues offer exclusive deals for MeetupReykjavik members — from welcome drinks to group rates.",
              },
              {
                icon: Star,
                title: "Trusted reviews",
                text: "Real ratings from community members who attended events at each venue.",
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-coral-soft)]">
                  <item.icon className="h-5 w-5 text-[var(--brand-coral)]" />
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
      <section className="bg-[var(--brand-sand)]">
        <div className="section-shell py-10">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Partner venues</h2>
          <div className="reveal-group grid gap-6 md:grid-cols-2">
            {publicVenues.map((venue) => (
              <VenueCard key={venue.slug} venue={venue} />
            ))}
          </div>
        </div>
      </section>

      {/* Sourced places */}
      {sourcedPlaces.length > 0 ? (
        <section className="border-t border-gray-200 bg-white">
          <div className="section-shell py-10">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">More places in Reykjavik</h2>
                <p className="mt-1 text-sm text-gray-600">Discover venues across the city that could host your next event.</p>
              </div>
              <Link
                href="/venues"
                className="hidden items-center gap-1.5 text-sm font-medium text-[var(--brand-indigo)] sm:inline-flex"
              >
                See all
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
      <section className="bg-gray-900">
        <div className="section-shell py-12 text-center text-white sm:py-16">
          <h3 className="text-2xl font-bold">Own a venue in Reykjavik?</h3>
          <p className="mx-auto mt-3 max-w-lg text-sm text-white/70">
            Join our venue network to get bookings, host community events, and offer member deals.
          </p>
          <Link
            href="/venue/onboarding"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--brand-coral)] px-8 py-3.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Apply as a partner
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
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
      <DetailHero
        eyebrow={venue.type}
        title={venue.name}
        description={venue.summary}
        art={venue.art}
        actions={[
          { href: "/venue/onboarding", label: "Partner with us", primary: true },
        ]}
      >
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
          <div>
            <div className="text-sm text-white/60">Area</div>
            <div className="text-lg font-semibold">{venue.area}</div>
          </div>
          <div>
            <div className="text-sm text-white/60">Capacity</div>
            <div className="text-2xl font-bold">{venue.capacity}</div>
          </div>
          <div>
            <div className="text-sm text-white/60">Rating</div>
            <div className="flex items-center gap-1 text-2xl font-bold">
              <Star className="h-5 w-5 fill-current text-yellow-400" />
              {venue.rating}
            </div>
          </div>
          <div>
            <div className="text-sm text-white/60">Events</div>
            <div className="text-2xl font-bold">{upcomingEvents.length}</div>
          </div>
        </div>
      </DetailHero>

      <section className="section-shell py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <Section title="About">
              <div className="space-y-4">
                {venue.description.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-relaxed text-gray-600">{paragraph}</p>
                ))}
              </div>
            </Section>

            <Section title="Amenities">
              <div className="grid grid-cols-2 gap-2">
                {venue.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2 text-sm text-gray-700">
                    <BadgeCheck className="h-4 w-4 text-[var(--brand-sage)]" />
                    {amenity}
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Gallery">
              <div className="grid gap-3 md:grid-cols-3">
                {venue.gallery.map((art, index) => {
                  const img = extractImageUrl(art);
                  return (
                    <div key={`gallery-${index}`} className="relative h-36 overflow-hidden rounded-lg bg-gray-100">
                      {img ? (
                        <Image fill alt="" className="object-cover" sizes="33vw" src={img} unoptimized={img.startsWith("https://")} />
                      ) : (
                        <div className="h-full w-full" style={{ background: art }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </Section>
          </div>

          <div className="space-y-6">
            <Section title="Info">
              <KeyValueList
                items={[
                  { key: "type", label: "Type", value: venue.type },
                  { key: "area", label: "Area", value: venue.area },
                  { key: "address", label: "Address", value: venue.address },
                  { key: "capacity", label: "Capacity", value: String(venue.capacity) },
                ]}
              />
              {venue.deal ? (
                <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  {venue.deal}
                </div>
              ) : null}
            </Section>

            <Section title="Hours">
              <div className="space-y-2">
                {venue.hours.map((item) => (
                  <div key={item.day} className="flex items-center justify-between text-sm">
                    <span className={cn("text-gray-700", item.highlighted && "font-semibold")}>
                      {item.day}
                    </span>
                    <div className="flex items-center gap-2">
                      {item.highlighted ? (
                        <span className="rounded-full bg-[var(--brand-coral-soft)] px-2 py-0.5 text-xs font-medium text-[var(--brand-coral)]">
                          Peak
                        </span>
                      ) : null}
                      <span className="text-gray-500">{item.open}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Upcoming events">
              {upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <Link
                      key={event.slug}
                      href={eventHref(event.slug)}
                      className="block rounded-lg bg-gray-50 p-3 transition hover:bg-gray-100"
                    >
                      <div className="font-medium text-gray-900">{event.title}</div>
                      <p className="mt-1 text-sm text-gray-500">
                        {formatEventDate(event.startsAt)} · {event.groupName}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No upcoming events.</p>
              )}
            </Section>
          </div>
        </div>
      </section>
    </>
  );
}

export function SourcedVenueDetailScreen({ place }: { place: SourcedPlace }) {
  const imageSrc = place.image?.localPath || place.image?.remoteUrl;
  const hasPhoto = place.image?.kind === "photo";

  return (
    <>
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
        <div className="section-shell relative z-10 py-14 text-white sm:py-20">
          <span className="text-xs font-semibold uppercase tracking-widest text-white/70">Venue</span>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">{place.name}</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80">{place.summary}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/venue/onboarding"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-coral)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Claim this venue
              <ArrowRight className="h-4 w-4" />
            </Link>
            {place.website ? (
              <a
                href={place.website}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                rel="noreferrer"
                target="_blank"
              >
                Visit website
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <section className="section-shell py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <Section title="About">
              <p className="text-sm leading-relaxed text-gray-600">{place.summary}</p>
              {place.address ? (
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {place.address}
                </div>
              ) : null}
            </Section>

            {hasPhoto && place.image?.credit ? (
              <Section title="Photo attribution">
                <p className="text-sm text-gray-600">{place.image.credit}</p>
                {place.image.license ? (
                  <p className="mt-1 text-sm text-gray-500">{place.image.license}</p>
                ) : null}
              </Section>
            ) : null}
          </div>

          <div className="space-y-6">
            <Section title="Details">
              <KeyValueList
                items={[
                  { key: "type", label: "Type", value: place.kindLabel },
                  { key: "area", label: "Area", value: place.area || "Reykjavik" },
                  { key: "address", label: "Address", value: place.address || "Not available" },
                  { key: "website", label: "Website", value: place.website ? "Available" : "Not available" },
                ]}
              />
            </Section>
          </div>
        </div>
      </section>
    </>
  );
}

export function BlogIndexScreen() {
  const featured = blogPosts[0];
  const rest = blogPosts.slice(1);
  const featuredImage = extractImageUrl(featured.hero) ?? "/place-images/reykjavik/hallgrimskirkja-60f147a6.jpg";

  return (
    <>
      <IndexHero
        eyebrow="Blog"
        title="From the blog"
        description="Thoughts on community design, local events, and building a better social layer for Reykjavik."
        imageSrc="/place-images/reykjavik/arb-jarsafn-c71d7348.jpg"
        actions={[
          { href: "/events", label: "Explore events", primary: true },
        ]}
      />

      {/* Featured post */}
      <section className="bg-white">
        <div className="section-shell py-10">
          <div className="overflow-hidden rounded-2xl border border-gray-200 md:grid md:grid-cols-2">
            <div className="relative h-64 md:h-auto">
              <Image
                fill
                alt={featured.title}
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                src={featuredImage}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent md:bg-gradient-to-r" />
            </div>
            <div className="p-8">
              <div className="flex items-center gap-2">
                <ToneBadge tone="indigo">{featured.category}</ToneBadge>
                <span className="text-xs text-gray-500">{featured.readTime}</span>
              </div>
              <h3 className="mt-3 text-2xl font-bold text-gray-900">{featured.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">{featured.excerpt}</p>
              <div className="mt-4 text-sm text-gray-500">{featured.publishedAt}</div>
              <Link
                href={blogHref(featured.slug)}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--brand-indigo)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Read article
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* More articles */}
      {rest.length > 0 ? (
        <section className="border-t border-gray-200 bg-[var(--brand-sand)]">
          <div className="section-shell py-10">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">More articles</h2>
            <div className="grid gap-6 md:grid-cols-2">
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
  const related = blogPosts.filter((item) => item.slug !== post.slug).slice(0, 2);
  const imageUrl = extractImageUrl(post.hero);

  return (
    <>
      <section className="relative overflow-hidden border-b border-gray-200 bg-gray-900">
        {imageUrl ? (
          <>
            <Image fill alt="" className="object-cover opacity-40" sizes="100vw" src={imageUrl} unoptimized={imageUrl.startsWith("https://")} />
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900/30 to-gray-900/80" />
          </>
        ) : (
          <div className="absolute inset-0" style={{ background: post.hero }} />
        )}
        <div className="section-shell relative z-10 py-14 text-white sm:py-20">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium">{post.category}</span>
            <span className="text-sm text-white/60">{post.readTime}</span>
          </div>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80">{post.excerpt}</p>
          <p className="mt-4 text-sm text-white/60">{post.publishedAt}</p>
        </div>
      </section>

      <section className="section-shell py-8">
        <div className="mx-auto max-w-3xl space-y-8">
          {post.sections.map((section) => (
            <div key={section.heading}>
              <h2 className="text-xl font-bold text-gray-900">{section.heading}</h2>
              <p className="mt-3 text-base leading-relaxed text-gray-600">{section.body}</p>
            </div>
          ))}
        </div>

        {related.length > 0 ? (
          <div className="mx-auto mt-12 max-w-3xl">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Continue reading</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  href={blogHref(item.slug)}
                  className="rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50"
                >
                  <div className="font-medium text-gray-900">{item.title}</div>
                  <p className="mt-2 text-sm text-gray-600">{item.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </>
  );
}

export function AboutScreen() {
  return (
    <>
      <IndexHero
        eyebrow="About"
        title="About MeetupReykjavik"
        description="A local platform for events, groups, and venue partnerships — built specifically for Reykjavik."
        imageSrc="/place-images/reykjavik/jo-leikhusi-52f6c2dd.jpg"
        stats={aboutStats.map((s) => ({ label: s.label, value: s.value }))}
        actions={[
          { href: "/events", label: "Explore events", primary: true },
          { href: "/contact", label: "Get in touch" },
        ]}
      />

      {/* Mission */}
      <section className="bg-white">
        <div className="section-shell py-12">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-editorial text-3xl text-gray-900">Our mission</h2>
            <p className="mt-6 text-lg leading-relaxed text-gray-600">
              Reykjavik is small enough that quality matters fast. If events feel random, hosts
              feel weak, or the rooms do not fit the format, people notice immediately.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-gray-600">
              We bring event context, group identity, and venue fit into one system. That is the
              difference between a feed and an actual local product.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-gray-200 bg-[var(--brand-sand)]">
        <div className="section-shell py-12">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">How it works</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: UsersRound,
                title: "Members",
                text: "Find events, join groups, RSVP with confidence. Free to browse, with premium tiers for deeper access.",
                color: "bg-[var(--brand-indigo-soft)] text-[var(--brand-indigo)]",
              },
              {
                icon: CalendarDays,
                title: "Organizers",
                text: "Run recurring events with approval tools, paid ticketing, analytics, and venue matching built in.",
                color: "bg-[var(--brand-coral-soft)] text-[var(--brand-coral)]",
              },
              {
                icon: Building2,
                title: "Venues",
                text: "Partner with the platform to get bookings, host better community events, and offer member deals.",
                color: "bg-[rgba(124,154,130,0.12)] text-[var(--brand-sage)]",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-gray-200 bg-white p-6 text-center">
                <div className={cn("mx-auto flex h-14 w-14 items-center justify-center rounded-2xl", item.color)}>
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="border-t border-gray-200 bg-white">
        <div className="section-shell py-12">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">Team</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {aboutTeam.map((member) => (
              <div key={member.name} className="rounded-xl border border-gray-200 bg-white p-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand-indigo-soft)] text-lg font-bold text-[var(--brand-indigo)]">
                  {member.name.charAt(0)}
                </div>
                <div className="mt-4 text-xl font-bold text-gray-900">{member.name}</div>
                <div className="mt-1 text-sm font-medium text-[var(--brand-indigo)]">{member.role}</div>
                <p className="mt-3 text-sm text-gray-600">{member.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[var(--brand-indigo)]">
        <div className="section-shell py-12 text-center text-white sm:py-16">
          <h3 className="text-2xl font-bold">Join the Reykjavik community</h3>
          <p className="mx-auto mt-3 max-w-lg text-sm text-white/80">
            Whether you want to attend, organize, or host — there is a place for you.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold transition hover:bg-white/90" style={{ color: "#3730A3" }}
            >
              Create account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Browse events
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export function PricingScreen() {
  return (
    <>
      {/* Pricing hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--brand-indigo)] via-[#4338ca] to-[#312e81]">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="section-shell relative z-10 py-16 text-center text-white sm:py-24">
          <span className="text-xs font-semibold uppercase tracking-widest text-[var(--brand-coral)]">
            Pricing
          </span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Simple, transparent pricing
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/80">
            Members browse free. Organizers and venues pay for real tools.
            {" "}{ticketCommissionRate}% commission on paid tickets keeps the platform aligned with your success.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold shadow-lg transition hover:bg-white/90" style={{ color: "#3730A3" }}
            >
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              Talk to us
            </Link>
          </div>
        </div>
      </section>

      {/* Member plans */}
      <section className="bg-white">
        <div className="section-shell py-12">
          <div className="mb-8 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-indigo-soft)] px-4 py-1.5 text-xs font-semibold text-[var(--brand-indigo)]">
              <UsersRound className="h-3.5 w-3.5" />
              For members
            </span>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Member plans</h2>
            <p className="mt-2 text-sm text-gray-600">Browse free. Upgrade for priority access and premium features.</p>
          </div>
          <div className="reveal-group grid gap-6 md:grid-cols-3">
            {userTiers.map((tier, i) => (
              <article
                key={tier.name}
                className={cn(
                  "rounded-xl border bg-white",
                  i === 1
                    ? "border-[var(--brand-indigo)] ring-2 ring-[var(--brand-indigo)]/10"
                    : "border-gray-200",
                )}
              >
                {i === 1 ? (
                  <div className="rounded-t-xl bg-[var(--brand-indigo)] py-1.5 text-center text-xs font-semibold text-white">
                    Most popular
                  </div>
                ) : null}
                <div className="border-b border-gray-100 p-6">
                  <div className="text-sm font-semibold text-gray-500">{tier.name}</div>
                  <div className="mt-2 text-3xl font-bold text-gray-900">{tier.price}</div>
                  <p className="mt-3 text-sm text-gray-600">{tier.description}</p>
                </div>
                <div className="p-6 space-y-3">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-sage)]" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="px-6 pb-6">
                  <Link
                    href="/signup"
                    className={cn(
                      "flex w-full items-center justify-center rounded-full py-3 text-sm font-semibold transition",
                      i === 1
                        ? "bg-[var(--brand-indigo)] text-white hover:opacity-90"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-50",
                    )}
                  >
                    {tier.price === "0 ISK" ? "Join free" : "Get started"}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Organizer plans */}
      <section className="border-t border-gray-200 bg-[var(--brand-sand)]">
        <div className="section-shell py-12">
          <div className="mb-8 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-coral-soft)] px-4 py-1.5 text-xs font-semibold text-[var(--brand-coral)]">
              <CalendarDays className="h-3.5 w-3.5" />
              For organizers
            </span>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Organizer plans</h2>
            <p className="mt-2 text-sm text-gray-600">
              Run events with real tools. Plus {ticketCommissionRate}% commission on paid ticket sales.
            </p>
          </div>
          <div className="reveal-group grid gap-6 md:grid-cols-3">
            {organizerTiers.map((tier, i) => (
              <article
                key={tier.name}
                className={cn(
                  "rounded-xl border bg-white",
                  i === 1
                    ? "border-[var(--brand-coral)] ring-2 ring-[var(--brand-coral)]/10"
                    : "border-gray-200",
                )}
              >
                {i === 1 ? (
                  <div className="rounded-t-xl bg-[var(--brand-coral)] py-1.5 text-center text-xs font-semibold text-white">
                    Recommended
                  </div>
                ) : null}
                <div className="border-b border-gray-100 p-6">
                  <div className="text-sm font-semibold text-gray-500">{tier.name}</div>
                  <div className="mt-2 text-3xl font-bold text-gray-900">{tier.price}</div>
                  <p className="mt-3 text-sm text-gray-600">{tier.description}</p>
                </div>
                <div className="p-6 space-y-3">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-sage)]" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="px-6 pb-6">
                  <Link
                    href="/signup"
                    className={cn(
                      "flex w-full items-center justify-center rounded-full py-3 text-sm font-semibold transition",
                      i === 1
                        ? "bg-[var(--brand-coral)] text-white hover:opacity-90"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-50",
                    )}
                  >
                    Start organizing
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Venue plans */}
      <section className="border-t border-gray-200 bg-white">
        <div className="section-shell py-12">
          <div className="mb-8 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(124,154,130,0.12)] px-4 py-1.5 text-xs font-semibold text-[var(--brand-sage)]">
              <Building2 className="h-3.5 w-3.5" />
              For venues
            </span>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Venue plans</h2>
            <p className="mt-2 text-sm text-gray-600">
              From basic listing to full partnership with booking tools and analytics.
            </p>
          </div>
          <div className="reveal-group grid gap-6 md:grid-cols-3">
            {venueTiers.map((tier, i) => (
              <article
                key={tier.name}
                className={cn(
                  "rounded-xl border bg-white",
                  i === 1
                    ? "border-[var(--brand-sage)] ring-2 ring-[var(--brand-sage)]/10"
                    : "border-gray-200",
                )}
              >
                {i === 1 ? (
                  <div className="rounded-t-xl bg-[var(--brand-sage)] py-1.5 text-center text-xs font-semibold text-white">
                    Best value
                  </div>
                ) : null}
                <div className="border-b border-gray-100 p-6">
                  <div className="text-sm font-semibold text-gray-500">{tier.name}</div>
                  <div className="mt-2 text-3xl font-bold text-gray-900">{tier.price}</div>
                  <p className="mt-3 text-sm text-gray-600">{tier.description}</p>
                </div>
                <div className="p-6 space-y-3">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-sage)]" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="px-6 pb-6">
                  <Link
                    href="/venue/onboarding"
                    className={cn(
                      "flex w-full items-center justify-center rounded-full py-3 text-sm font-semibold transition",
                      i === 1
                        ? "bg-[var(--brand-sage)] text-white hover:opacity-90"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-50",
                    )}
                  >
                    {tier.price === "0 ISK" ? "List free" : "Apply now"}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-gray-200 bg-[var(--brand-sand)]">
        <div className="section-shell py-12">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">Common questions</h2>
          <div className="mx-auto max-w-3xl space-y-4">
            {pricingFaq.map((item) => (
              <div key={item.question} className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="font-semibold text-gray-900">{item.question}</div>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.answer}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/faq"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--brand-indigo)]"
            >
              More questions? See full FAQ
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
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            {sections.map((section) => (
              <Section key={section.title} title={section.title}>
                <p className="text-sm text-gray-600">{section.copy}</p>
                <ul className="mt-3 space-y-2">
                  {section.points.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-sm text-gray-600">
                      <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-sage)]" />
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
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
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
    { title: t("channels.general.title"), detail: "support@meetupreykjavik.is", note: t("channels.general.note") },
    { title: t("channels.organizer.title"), detail: "organizers@meetupreykjavik.is", note: t("channels.organizer.note") },
    { title: t("channels.venue.title"), detail: "venues@meetupreykjavik.is", note: t("channels.venue.note") },
    { title: t("channels.trust.title"), detail: "trust@meetupreykjavik.is", note: t("channels.trust.note") },
  ];

  return (
    <>
      <PageHeader
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        description={t("hero.description")}
      />

      <section className="section-shell py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <Section title={t("channelsTitle")}>
              <div className="space-y-4">
                {channels.map((channel) => (
                  <div key={channel.title}>
                    <div className="font-medium text-gray-900">{channel.title}</div>
                    <div className="mt-1 text-sm font-medium text-[var(--brand-indigo)]">{channel.detail}</div>
                    <p className="mt-1 text-sm text-gray-600">{channel.note}</p>
                  </div>
                ))}
              </div>
            </Section>
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
      <IndexHero
        eyebrow="Categories"
        title="Browse by category"
        description="Find events, groups, and venues organized by what you are looking for."
        imageSrc="/place-images/reykjavik/hafnarborg-1be7b43b.jpg"
        actions={[
          { href: "/events", label: "Browse events", primary: true },
          { href: "/groups", label: "See groups" },
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
                  className={cn(
                    "inline-flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold",
                    categoryBadgeClass(item.category.tone),
                  )}
                >
                  {item.category.letter}
                </span>
              </div>
              <h2 className="mt-4 text-lg font-bold text-gray-900">{item.category.name}</h2>
              <p className="mt-1 text-sm text-gray-600">{item.category.count} meetups</p>
              <div className="mt-4 flex gap-4 text-sm text-gray-500">
                <span>{item.eventsCount} events</span>
                <span>{item.groupsCount} groups</span>
                <span>{item.venuesCount} venues</span>
              </div>
            </Link>
          ))}
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
        <PageHeader
          eyebrow="Category"
          title="Category not found"
          description="This category is not in the directory yet."
          actions={[{ href: categoriesHref(), label: "Browse categories", primary: true }]}
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
                <p className="mt-1 text-sm text-gray-600">{category.count} meetups</p>
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
      <PageHeader
        eyebrow="Category"
        title={bundle.category.name}
        description={`${bundle.category.count} meetups in this category`}
        actions={[
          { href: "/signup", label: "Join", primary: true },
          { href: categoriesHref(), label: "All categories" },
        ]}
      />

      <section className="section-shell py-8">
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{bundle.events.length}</div>
            <div className="text-sm text-gray-500">Events</div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{bundle.groups.length}</div>
            <div className="text-sm text-gray-500">Groups</div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{bundle.venues.length}</div>
            <div className="text-sm text-gray-500">Venues</div>
          </div>
        </div>

        {bundle.events.length > 0 ? (
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Events</h2>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {bundle.events.slice(0, 3).map((event) => (
                <EventCard key={event.slug} event={event} />
              ))}
            </div>
          </div>
        ) : null}

        {bundle.groups.length > 0 ? (
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Groups</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {bundle.groups.slice(0, 4).map((group) => (
                <GroupCard
                  key={group.slug}
                  group={group}
                  upcomingTitle={
                    publicEvents.find((event) => group.upcomingEventSlugs.includes(event.slug))?.title
                  }
                />
              ))}
            </div>
          </div>
        ) : null}

        {bundle.venues.length > 0 ? (
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Venues</h2>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {bundle.venues.slice(0, 4).map((venue) => (
                <VenueCard key={venue.slug} venue={venue} />
              ))}
            </div>
          </div>
        ) : null}

        {relatedCategories.length > 0 ? (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Related categories</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {relatedCategories.map((category) => (
                <Link
                  key={category.slug}
                  href={categoryHref(category.slug)}
                  className="rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50"
                >
                  <div className="font-medium text-gray-900">{category.name}</div>
                  <p className="mt-1 text-sm text-gray-600">{category.count} meetups</p>
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
  const faqSections = [
    {
      title: "Joining and profiles",
      items: [
        {
          question: "Do I need to pay to browse or RSVP?",
          answer: "No. Browsing and basic discovery are free. Paid features are only required for specific events or membership tiers.",
        },
        {
          question: "Why do member profiles matter?",
          answer: "Profiles help organizers and venues understand their audience, and help members get clearer expectations around event format and fit.",
        },
      ],
    },
    {
      title: "Events and groups",
      items: [
        {
          question: "Why are some events manual approval and others open RSVP?",
          answer: "Both are supported. Approval works well when hosts want to shape the room, while open RSVP works for simpler, lower-friction formats.",
        },
        {
          question: "How are venues involved?",
          answer: "Venue partners host events, offer member deals, and help shape the arrival experience. They are an active part of the platform.",
        },
      ],
    },
    {
      title: "Payments and billing",
      items: pricingFaq.slice(0, 2).map((item) => ({
        question: item.question,
        answer: item.answer,
      })),
    },
    {
      title: "Trust and support",
      items: [
        {
          question: "How does support work?",
          answer: "Use the contact page to reach the right team. We have separate channels for general help, organizer support, venue operations, and trust concerns.",
        },
        {
          question: "Can organizers message anyone directly?",
          answer: "No. Messaging respects member privacy settings. Organizers can only reach members through approved channels.",
        },
      ],
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="FAQ"
        title="Frequently asked questions"
        description="Quick answers about the platform, pricing, and how things work."
        actions={[
          { href: "/contact", label: "Contact us", primary: true },
          { href: "/pricing", label: "See pricing" },
        ]}
      />

      <section className="section-shell py-8">
        <div className="mx-auto max-w-3xl space-y-8">
          {faqSections.map((section) => (
            <div key={section.title}>
              <h2 className="mb-4 text-lg font-semibold text-gray-900">{section.title}</h2>
              <div className="space-y-4">
                {section.items.map((item) => (
                  <Section key={item.question}>
                    <div className="font-medium text-gray-900">{item.question}</div>
                    <p className="mt-2 text-sm text-gray-600">{item.answer}</p>
                  </Section>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export function ForOrganizersScreen() {
  return (
    <>
      <IndexHero
        eyebrow="For organizers"
        title="Tools for event organizers"
        description={`Run groups and events with real tools: recurring series, paid tickets from ${minimumTicketPriceIsk} ISK, attendee approvals, and venue matching.`}
        imageSrc="/place-images/reykjavik/ufa-40055fa7.jpg"
        actions={[
          { href: "/signup", label: "Start organizing", primary: true },
          { href: "/pricing", label: "See pricing" },
        ]}
      />

      {/* Features */}
      <section className="bg-white">
        <div className="section-shell py-12">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">Everything you need to run events</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: UsersRound,
                title: "Recurring groups",
                text: "Build a community identity with member management, discussion threads, and co-host support.",
              },
              {
                icon: Ticket,
                title: "Event tools",
                text: "Create events with ticketing, approval workflows, attendee management, and automated reminders.",
              },
              {
                icon: Building2,
                title: "Venue matching",
                text: "Find the right room for your format with capacity, amenity, and availability matching.",
              },
              {
                icon: TrendingUp,
                title: "Analytics",
                text: "Track attendance, revenue, and audience trends to improve your events over time.",
              },
              {
                icon: CalendarDays,
                title: "Recurring templates",
                text: "Set up event series once and publish editions with pre-filled details and consistent branding.",
              },
              {
                icon: Zap,
                title: "Approval controls",
                text: "Shape your room with manual approval, waitlists, and host-curated access.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand-coral-soft)]">
                  <item.icon className="h-5 w-5 text-[var(--brand-coral)]" />
                </div>
                <h3 className="mt-4 font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-gray-200 bg-[var(--brand-sand)]">
        <div className="section-shell py-12">
          <h2 className="mb-2 text-center text-2xl font-bold text-gray-900">Organizer plans</h2>
          <p className="mb-8 text-center text-sm text-gray-600">
            Plus {ticketCommissionRate}% commission on paid ticket sales.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {organizerTiers.map((tier, i) => (
              <article
                key={tier.name}
                className={cn(
                  "rounded-xl border bg-white",
                  i === 1 ? "border-[var(--brand-coral)] ring-2 ring-[var(--brand-coral)]/10" : "border-gray-200",
                )}
              >
                {i === 1 ? (
                  <div className="rounded-t-xl bg-[var(--brand-coral)] py-1.5 text-center text-xs font-semibold text-white">
                    Recommended
                  </div>
                ) : null}
                <div className="border-b border-gray-100 p-6">
                  <div className="text-sm font-semibold text-gray-500">{tier.name}</div>
                  <div className="mt-2 text-3xl font-bold text-gray-900">{tier.price}</div>
                  <p className="mt-3 text-sm text-gray-600">{tier.description}</p>
                </div>
                <div className="p-6 space-y-3">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-sage)]" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[var(--brand-indigo)]">
        <div className="section-shell py-12 text-center text-white sm:py-16">
          <h3 className="text-2xl font-bold">Ready to start organizing?</h3>
          <p className="mx-auto mt-3 max-w-lg text-sm text-white/80">
            Create your account, start a group, and publish your first event in minutes.
          </p>
          <Link
            href="/signup"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold transition hover:bg-white/90" style={{ color: "#3730A3" }}
          >
            Get started free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}

export function ForVenuesScreen() {
  return (
    <>
      <IndexHero
        eyebrow="For venues"
        title="Partner with MeetupReykjavik"
        description="Turn your venue into a community hub with booking tools, availability management, deals, and analytics."
        imageSrc="/place-images/reykjavik/dill-0aeca160.jpg"
        actions={[
          { href: "/venue/onboarding", label: "Apply as a partner", primary: true },
          { href: "/venues", label: "Browse venues" },
        ]}
      />

      {/* Features */}
      <section className="bg-white">
        <div className="section-shell py-12">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">Why venues partner with us</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: CheckCircle2,
                title: "Structured onboarding",
                text: "Guided intake covering business identity, capacity, hours, media, and billing setup.",
              },
              {
                icon: CalendarDays,
                title: "Booking management",
                text: "Manage incoming requests, counter offers, availability, and booking history in one place.",
              },
              {
                icon: TrendingUp,
                title: "Analytics & deals",
                text: "Create member deals, track event performance, and understand your organizer mix and audience.",
              },
              {
                icon: UsersRound,
                title: "Community exposure",
                text: "Get discovered by organizers and members actively looking for the right venue for their events.",
              },
              {
                icon: Star,
                title: "Reviews & ratings",
                text: "Build trust with authentic reviews from community members who attended events at your space.",
              },
              {
                icon: Sparkles,
                title: "Featured placement",
                text: "Premium partners get highlighted placement in search results and curated venue recommendations.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[rgba(124,154,130,0.12)]">
                  <item.icon className="h-5 w-5 text-[var(--brand-sage)]" />
                </div>
                <h3 className="mt-4 font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-gray-200 bg-[var(--brand-sand)]">
        <div className="section-shell py-12">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">Venue plans</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {venueTiers.map((tier, i) => (
              <article
                key={tier.name}
                className={cn(
                  "rounded-xl border bg-white",
                  i === 1 ? "border-[var(--brand-sage)] ring-2 ring-[var(--brand-sage)]/10" : "border-gray-200",
                )}
              >
                {i === 1 ? (
                  <div className="rounded-t-xl bg-[var(--brand-sage)] py-1.5 text-center text-xs font-semibold text-white">
                    Best value
                  </div>
                ) : null}
                <div className="border-b border-gray-100 p-6">
                  <div className="text-sm font-semibold text-gray-500">{tier.name}</div>
                  <div className="mt-2 text-3xl font-bold text-gray-900">{tier.price}</div>
                  <p className="mt-3 text-sm text-gray-600">{tier.description}</p>
                </div>
                <div className="p-6 space-y-3">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-sage)]" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900">
        <div className="section-shell py-12 text-center text-white sm:py-16">
          <h3 className="text-2xl font-bold">Ready to join the venue network?</h3>
          <p className="mx-auto mt-3 max-w-lg text-sm text-white/70">
            Apply today and start receiving booking requests from community organizers.
          </p>
          <Link
            href="/venue/onboarding"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--brand-coral)] px-8 py-3.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Apply as a partner
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
