import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Compass,
  MapPin,
  Search,
  Sparkles,
  Star,
  Users,
  Zap,
} from "lucide-react";

import {
  categories,
  events,
  groups,
  heroStats,
  steps,
  venues,
} from "@/lib/home-data";

/* ------------------------------------------------------------------ */
/*  Color maps                                                         */
/* ------------------------------------------------------------------ */

const TAG_COLORS: Record<string, string> = {
  Social: "bg-brand-coral-soft text-brand-coral-dark",
  Outdoors: "bg-[rgba(124,154,130,0.14)] text-brand-sage",
  Tech: "bg-brand-indigo-soft text-brand-indigo",
  Music: "bg-brand-sand text-brand-text",
  Food: "bg-brand-coral-soft text-brand-coral-dark",
  Language: "bg-brand-indigo-soft text-brand-indigo",
};

const toneMap = {
  coral: "bg-brand-coral-soft text-brand-coral-dark",
  sage: "bg-[rgba(124,154,130,0.12)] text-brand-sage",
  indigo: "bg-brand-indigo-soft text-brand-indigo",
  sand: "bg-brand-sand text-brand-text",
} as const;

const toneBorder = {
  coral: "border-brand-coral/20",
  sage: "border-brand-sage/20",
  indigo: "border-brand-indigo/20",
  sand: "border-brand-sand/40",
} as const;

const STEP_ICONS = [Search, Zap, Users] as const;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* ------------------------------------------------------------------ */
/*  Section heading                                                    */
/* ------------------------------------------------------------------ */

function SectionHeading({
  eyebrow,
  title,
  actionHref,
  actionLabel,
  center,
}: {
  eyebrow: string;
  title: string;
  actionHref?: string;
  actionLabel?: string;
  center?: boolean;
}) {
  return (
    <div
      className={`mb-10 flex flex-col gap-4 ${center ? "items-center text-center" : "sm:flex-row sm:items-end sm:justify-between"}`}
    >
      <div>
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-indigo">
          {eyebrow}
        </span>
        <h2 className="font-editorial mt-2 text-3xl leading-tight tracking-[-0.04em] text-brand-text sm:text-4xl lg:text-[2.75rem]">
          {title}
        </h2>
      </div>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref as import("next").Route}
          className="inline-flex items-center gap-2 text-sm font-bold text-brand-indigo transition-colors hover:text-brand-indigo-light"
        >
          {actionLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Event card (inline)                                                */
/* ------------------------------------------------------------------ */

function EventCard({ event }: { event: (typeof events)[number] }) {
  const t = useTranslations("home.cards");
  const tCta = useTranslations("cta");

  return (
    <Link
      href={`/events/${event.slug}` as import("next").Route}
      className="group block overflow-hidden rounded-2xl border border-brand-border-light bg-white shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-premium"
    >
      <div className="relative h-[180px] overflow-hidden">
        <Image
          src={event.photo}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(30,27,46,0.5)]" />

        <div className="absolute left-4 top-4 rounded-xl bg-white px-3 py-1.5 text-center shadow-md">
          <div className="text-[10px] font-bold uppercase tracking-wider text-brand-coral">
            {event.day.split(" ").pop()}
          </div>
          <div className="text-xl font-black leading-tight tracking-tight text-brand-text">
            {event.date}
          </div>
        </div>

        <span
          className={`absolute right-4 top-4 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${TAG_COLORS[event.tag] ?? TAG_COLORS.Social}`}
        >
          {event.tag}
        </span>

        {event.deal ? (
          <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-brand-coral-dark backdrop-blur-sm">
            <Sparkles className="h-3 w-3" />
            {event.deal}
          </span>
        ) : null}
      </div>

      <div className="px-5 py-4">
        <h3 className="text-base font-bold tracking-tight text-brand-text group-hover:text-brand-indigo">
          {event.title}
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
            {event.day} · {event.time}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-gray-400" />
            {event.venue}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
            <Users className="h-3.5 w-3.5 text-gray-400" />
            {event.attendees} {t("going")}
          </span>
          <span className="rounded-full bg-brand-coral px-4 py-2 text-xs font-bold text-white shadow-sm">
            {tCta("rsvp")}
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Group card (inline)                                                */
/* ------------------------------------------------------------------ */

function GroupCard({ group }: { group: (typeof groups)[number] }) {
  const tCta = useTranslations("cta");
  const tCards = useTranslations("home.cards");

  return (
    <Link
      href={`/groups/${group.slug}` as import("next").Route}
      className="group block overflow-hidden rounded-2xl border border-brand-border-light bg-white shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-premium"
    >
      <div className="relative h-44 overflow-hidden">
        <Image
          src={group.photo}
          alt={group.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(30,27,46,0.45)]" />
      </div>
      <div className="px-5 py-4">
        <span className="inline-flex rounded-full bg-[rgba(79,70,229,0.08)] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-indigo">
          {group.category}
        </span>
        <h3 className="mt-2 text-base font-bold tracking-tight text-brand-text group-hover:text-brand-indigo">
          {group.name}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-gray-600">
          {group.description}
        </p>
        <div className="mt-3 flex items-center justify-between border-t border-brand-border-light pt-3">
          <span className="text-sm font-semibold text-brand-text">
            {group.members} {tCards("members")}
          </span>
          <span className="text-sm font-bold text-brand-indigo">
            {tCta("viewGroup")}
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Venue card (inline)                                                */
/* ------------------------------------------------------------------ */

function VenueCard({ venue }: { venue: (typeof venues)[number] }) {
  const tHome = useTranslations("home.cards");
  const tCta = useTranslations("cta");

  return (
    <Link
      href={`/venues/${venue.slug}` as import("next").Route}
      className="group block overflow-hidden rounded-2xl border border-brand-border-light bg-white shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-premium"
    >
      <div className="relative h-44 overflow-hidden">
        <Image
          src={venue.photo}
          alt={venue.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(30,27,46,0.55)]" />
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <div className="text-base font-bold tracking-tight">{venue.name}</div>
          <div className="mt-0.5 text-sm text-white/80">
            {venue.type} · {venue.area}
          </div>
        </div>
      </div>
      <div className="px-5 py-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {venue.events} {tHome("hostedEvents")}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-coral-soft px-2.5 py-1 text-sm font-bold text-brand-coral-dark">
            <Star className="h-3 w-3 fill-current" />
            {venue.rating.toFixed(1)}
          </span>
        </div>
        {venue.deal ? (
          <div className="mt-3 rounded-xl bg-[rgba(232,97,77,0.06)] px-3 py-2 text-sm font-medium text-brand-coral-dark">
            {tHome("memberDeal")}: {venue.deal}
          </div>
        ) : null}
        <div className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-brand-indigo">
          {tCta("exploreVenue")}
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </Link>
  );
}

/* ================================================================== */
/*  HOME PAGE                                                          */
/* ================================================================== */

export function HomePage() {
  const tHero = useTranslations("home.hero");
  const tSections = useTranslations("home.sections");
  const tCta = useTranslations("cta");
  const tStats = useTranslations("home.stats");
  const tSteps = useTranslations("home.steps");
  const tSocial = useTranslations("home.social");

  const localizedHeroStats = [
    { value: heroStats[0]?.value ?? "2,847", label: tStats("members") },
    { value: heroStats[1]?.value ?? "156", label: tStats("groups") },
    { value: heroStats[2]?.value ?? "89", label: tStats("thisWeek") },
    { value: heroStats[3]?.value ?? "34", label: tStats("venuePartners") },
  ];

  const localizedSteps = [
    {
      number: steps[0]?.number ?? "01",
      title: tSteps("discoverTitle"),
      description: tSteps("discoverDescription"),
    },
    {
      number: steps[1]?.number ?? "02",
      title: tSteps("joinTitle"),
      description: tSteps("joinDescription"),
    },
    {
      number: steps[2]?.number ?? "03",
      title: tSteps("connectTitle"),
      description: tSteps("connectDescription"),
    },
  ];

  /* Placeholder avatar colors for social proof strip */
  const avatarColors = [
    "bg-brand-coral",
    "bg-brand-indigo",
    "bg-brand-sage",
    "bg-[#E8A87C]",
    "bg-[#7C9A82]",
    "bg-[#6366F1]",
    "bg-brand-coral-dark",
    "bg-[#9F7AEA]",
  ];

  return (
    <div className="site-shell">
      {/* ============================================================ */}
      {/*  HERO — cinematic, full-viewport                             */}
      {/* ============================================================ */}
      <section className="relative min-h-[85vh] overflow-hidden bg-[linear-gradient(160deg,#1e1b2e_0%,#262243_28%,#2d2654_52%,#3a2c5f_100%)] text-white">
        {/* Background image with overlay */}
        <div className="absolute inset-0">
          <Image
            src="/place-images/reykjavik/hallgrimskirkja-60f147a6.jpg"
            alt=""
            fill
            className="object-cover opacity-20"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(30,27,46,0.5)] via-[rgba(30,27,46,0.3)] to-[rgba(30,27,46,0.85)]" />
        </div>

        {/* Content */}
        <div className="section-shell relative z-10 flex min-h-[85vh] flex-col items-center justify-center px-4 py-24 text-center">
          <span className="inline-flex rounded-full border border-white/30 bg-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/90 backdrop-blur-sm">
            {tHero("badge")}
          </span>

          <h1 className="font-editorial mx-auto mt-8 max-w-4xl text-5xl leading-[0.94] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
            {tHero("titleLead")}
            <br />
            <span className="text-brand-coral italic">
              {tHero("titleAccent")}
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/80 sm:text-xl">
            {tHero("subtitleTop")}
            <br className="hidden sm:block" /> {tHero("subtitleBottom")}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/events"
              className="rounded-full bg-brand-coral px-8 py-4 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              {tCta("exploreEvents")}
            </Link>
            <Link
              href="/groups"
              className="rounded-full border border-white/35 bg-white/12 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              {tCta("startGroup")}
            </Link>
          </div>

          {/* Hero search */}
          <form
            action="/events"
            className="mt-8 flex w-full max-w-lg items-center rounded-full bg-white/15 px-5 py-3 backdrop-blur-sm border border-white/25 transition-colors focus-within:bg-white/25"
          >
            <Search className="h-5 w-5 shrink-0 text-white/70" />
            <input
              type="search"
              name="q"
              placeholder={tHero("searchPlaceholder")}
              className="ml-3 flex-1 bg-transparent text-sm text-white placeholder:text-white/60 outline-none"
            />
            <button type="submit" className="ml-2 rounded-full bg-white/20 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-white/30">
              {tCta("explore")}
            </button>
          </form>

          {/* Spacer before floating stats */}
          <div className="flex-1" />

          {/* Stats — glass-panel cards floating at hero bottom */}
          <div className="mt-16 grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {localizedHeroStats.map((stat) => (
              <div
                key={stat.label}
                className="glass-panel rounded-2xl px-5 py-4 text-center"
              >
                <div className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-[11px] font-medium uppercase tracking-wider text-white/75">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  THIS WEEK IN REYKJAVIK — responsive event grid              */}
      {/* ============================================================ */}
      <section className="reveal section-shell py-20">
        <SectionHeading
          eyebrow={tSections("thisWeekEyebrow")}
          title={tSections("thisWeekTitle")}
          actionHref="/events"
          actionLabel={tCta("seeAllEvents")}
        />
        <div className="reveal-group grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-sm font-bold text-brand-indigo transition-colors hover:text-brand-indigo-light"
          >
            {tCta("seeAllEvents")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SOCIAL PROOF STRIP                                          */}
      {/* ============================================================ */}
      <section className="border-y border-brand-border-light bg-gradient-to-r from-white via-brand-sand/30 to-white py-12">
        <div className="section-shell flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-center sm:gap-8">
          {/* Overlapping avatar circles */}
          <div className="flex -space-x-3">
            {["S","K","E","H","M","J","Þ","A"].map((initial, i) => (
              <div
                key={i}
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white shadow-sm ${avatarColors[i]}`}
              >
                {initial}
              </div>
            ))}
          </div>
          <p className="text-base font-semibold tracking-tight text-brand-text sm:text-lg">
            {tSocial("headline")}
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  CATEGORIES — visual card grid                               */}
      {/* ============================================================ */}
      <section className="reveal bg-white px-4 py-20">
        <div className="section-shell">
          <SectionHeading
            eyebrow={tSections("categoriesEyebrow")}
            title={tSections("categoriesTitle")}
            center
          />
          <div className="reveal-group grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={
                  `/categories/${slugify(category.name)}` as import("next").Route
                }
                className={`group relative overflow-hidden rounded-2xl border ${toneBorder[category.tone]} bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-card`}
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black ${toneMap[category.tone]}`}
                >
                  {category.letter}
                </span>
                <h3 className="mt-3 text-sm font-bold tracking-tight text-brand-text">
                  {category.name}
                </h3>
                <p className="mt-1 text-xs font-medium text-gray-600">
                  {category.count} {tSocial("meetups")}
                </p>
                <ArrowRight className="mt-3 h-3.5 w-3.5 text-brand-text-light transition-colors group-hover:text-brand-indigo" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  HOW IT WORKS — decorative step numbers                      */}
      {/* ============================================================ */}
      <section className="reveal section-shell py-20">
        <SectionHeading
          eyebrow={tSections("howEyebrow")}
          title={tSections("howTitle")}
          center
        />
        <div className="reveal-group grid gap-6 lg:grid-cols-3">
          {localizedSteps.map((step, i) => {
            const Icon = STEP_ICONS[i] ?? Compass;
            return (
              <article
                key={step.number}
                className="paper-panel-premium relative overflow-hidden rounded-2xl p-8"
              >
                {/* Decorative large number */}
                <span className="font-editorial pointer-events-none absolute -right-3 -top-4 select-none text-[7rem] font-black leading-none tracking-tighter text-brand-indigo/[0.05]">
                  {step.number}
                </span>

                <div className="relative z-10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-indigo-soft">
                    <Icon className="h-5 w-5 text-brand-indigo" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold tracking-tight text-brand-text">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">
                    {step.description}
                  </p>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-indigo/20 via-brand-coral/20 to-transparent" />
              </article>
            );
          })}
        </div>
      </section>

      {/* ============================================================ */}
      {/*  GROUPS — 4-up grid                                          */}
      {/* ============================================================ */}
      <section className="reveal border-t border-brand-border-light bg-white px-4 py-20">
        <div className="section-shell">
          <SectionHeading
            eyebrow={tSections("groupsEyebrow")}
            title={tSections("groupsTitle")}
            actionHref="/groups"
            actionLabel={tCta("seeAllGroups")}
          />
          <div className="reveal-group grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {groups.map((group) => (
              <GroupCard key={group.name} group={group} />
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  VENUES — responsive grid                                    */}
      {/* ============================================================ */}
      <section className="reveal section-shell py-20">
        <SectionHeading
          eyebrow={tSections("venuesEyebrow")}
          title={tSections("venuesTitle")}
          actionHref="/venues"
          actionLabel={tCta("becomePartner")}
        />
        <div className="reveal-group grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {venues.map((venue) => (
            <VenueCard key={venue.name} venue={venue} />
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/*  BOTTOM CTA — full-width gradient                            */}
      {/* ============================================================ */}
      <section className="px-4 pb-20">
        <div className="section-shell overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#3730A3_0%,#4F46E5_40%,#E8614D_100%)] px-6 py-16 text-center text-white sm:px-12 sm:py-20">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/85">
            {tSections("joinEyebrow")}
          </span>
          <h2 className="font-editorial mx-auto mt-4 max-w-2xl text-3xl leading-tight tracking-[-0.04em] sm:text-4xl lg:text-5xl">
            {tSections("joinTitle")}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
            {tSections("joinDescription")}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="rounded-full bg-white px-8 py-4 text-sm font-bold shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
              style={{ color: "var(--color-brand-indigo-light)" }}
            >
              {tCta("signupFreeLong")}
            </Link>
            <Link
              href="/for-venues"
              className="rounded-full border border-white/35 bg-white/15 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/25"
            >
              {tCta("partnerVenue")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
