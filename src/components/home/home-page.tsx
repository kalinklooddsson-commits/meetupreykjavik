import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Compass,
  HandCoins,
  MapPin,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Store,
  Ticket,
  Users,
} from "lucide-react";

import {
  categories,
  events,
  groups,
  heroStats,
  steps,
  venues,
} from "@/lib/home-data";
import { minimumTicketPriceIsk } from "@/lib/public-data";

const toneMap = {
  coral: {
    badge: "bg-[var(--brand-coral-soft)] text-[var(--brand-coral-dark)]",
  },
  sage: {
    badge: "bg-[rgba(124,154,130,0.12)] text-[var(--brand-sage)]",
  },
  indigo: {
    badge: "bg-[var(--brand-indigo-soft)] text-[var(--brand-indigo)]",
  },
  sand: {
    badge: "bg-[var(--brand-sand)] text-[var(--brand-text)]",
  },
} as const;

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function SectionHeading({
  eyebrow,
  title,
  description,
  actionHref,
  actionLabel,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <span className="eyebrow bg-[rgba(79,70,229,0.08)] px-4 py-2 text-[var(--brand-indigo)]">
          {eyebrow}
        </span>
        <h2 className="font-editorial mt-4 text-4xl leading-none tracking-[-0.04em] text-[var(--brand-text)] sm:text-[2.65rem]">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 max-w-2xl text-base leading-8 text-[var(--brand-text-muted)]">
            {description}
          </p>
        ) : null}
      </div>

      {actionHref && actionLabel ? (
        <Link
          href={actionHref as import("next").Route}
          className="inline-flex items-center gap-2 text-sm font-bold text-[var(--brand-indigo)] transition-colors hover:text-[var(--brand-indigo-light)]"
        >
          {actionLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}

function EventCard({ event }: { event: (typeof events)[number] }) {
  const t = useTranslations("home.cards");
  const tCta = useTranslations("cta");

  return (
    <article className="paper-panel-premium group min-w-[308px] max-w-[308px] flex-shrink-0 overflow-hidden rounded-[1.35rem] transition-transform duration-300 hover:-translate-y-1">
      <div
        className="grain-overlay relative flex h-52 flex-col justify-between px-5 py-5 text-white"
        style={{ backgroundImage: event.art }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(30,27,46,0.04),rgba(30,27,46,0.58))]" />
        <div className="flex items-start justify-between gap-4">
          <div className="rounded-2xl bg-white px-3 py-2 text-center text-[var(--brand-text)] shadow-[0_10px_24px_rgba(42,38,56,0.16)]">
            <div className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-[var(--brand-coral)]">
              Mar
            </div>
            <div className="text-2xl font-black tracking-[-0.05em]">
              {event.date}
            </div>
          </div>
          <span className="rounded-full bg-white/12 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-white/88">
            {event.tag}
          </span>
        </div>
        {event.deal ? (
          <span className="relative z-10 inline-flex w-fit items-center gap-2 rounded-full bg-white/14 px-3 py-1.5 text-xs font-semibold text-white/88">
            <Sparkles className="h-3.5 w-3.5" />
            {event.deal}
          </span>
        ) : (
          <span />
        )}
      </div>
      <div className="space-y-4 px-5 py-5">
        <div>
          <h3 className="text-lg font-bold tracking-[-0.02em] text-[var(--brand-text)]">
            {event.title}
          </h3>
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[var(--brand-text-muted)]">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              {event.day} at {event.time}
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {event.venue}
            </span>
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-3 text-sm text-[var(--brand-text-muted)]">
            <div className="flex -space-x-2">
              {[0, 1, 2].map((index) => (
                <span
                  key={index}
                  className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[linear-gradient(135deg,rgba(79,70,229,0.72),rgba(232,97,77,0.88))] text-[10px] font-bold text-white shadow-[0_6px_16px_rgba(42,38,56,0.12)]"
                >
                  {String.fromCharCode(65 + index)}
                </span>
              ))}
            </div>
            <span className="inline-flex items-center gap-2">
              <Users className="h-4 w-4" />
              {event.attendees} {t("going")}
            </span>
          </div>
          <Link
            href="/signup"
            className="rounded-full bg-[var(--brand-coral)] px-4 py-2.5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(232,97,77,0.24)] transition-transform hover:-translate-y-0.5"
          >
            {tCta("rsvp")}
          </Link>
        </div>
      </div>
    </article>
  );
}

function GroupCard({ group }: { group: (typeof groups)[number] }) {
  const t = useTranslations("cta");

  return (
    <article className="paper-panel-premium overflow-hidden rounded-[1.45rem]">
      <div
        className="relative h-36 w-full bg-cover bg-center"
        style={{ backgroundImage: group.art }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(30,27,46,0.04),rgba(30,27,46,0.45))]" />
      </div>
      <div className="space-y-4 px-5 py-5">
        <div>
          <div className="inline-flex rounded-full bg-[rgba(79,70,229,0.08)] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-indigo)]">
            {group.category}
          </div>
          <h3 className="mt-3 text-lg font-bold tracking-[-0.02em] text-[var(--brand-text)]">
            {group.name}
          </h3>
        </div>
        <p className="text-sm leading-7 text-[var(--brand-text-muted)]">
          {group.description}
        </p>
        <div className="flex items-center justify-between border-t border-[var(--brand-border-light)] pt-4">
          <span className="text-sm font-semibold text-[var(--brand-text)]">
            {group.members} members
          </span>
          <Link
            href="/groups"
            className="text-sm font-bold text-[var(--brand-indigo)]"
          >
            {t("viewGroup")}
          </Link>
        </div>
      </div>
    </article>
  );
}

function VenueCard({ venue }: { venue: (typeof venues)[number] }) {
  const tHome = useTranslations("home.cards");
  const tCta = useTranslations("cta");

  return (
    <article className="paper-panel-premium min-w-[286px] max-w-[286px] flex-shrink-0 overflow-hidden rounded-[1.45rem]">
      <div
        className="grain-overlay relative h-44 bg-cover bg-center"
        style={{ backgroundImage: venue.art }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(30,27,46,0.04),rgba(30,27,46,0.58))]" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <div className="text-lg font-bold tracking-[-0.02em]">{venue.name}</div>
          <div className="mt-1 text-sm text-white/78">
            {venue.type} - {venue.area}
          </div>
        </div>
      </div>
      <div className="space-y-4 px-5 py-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--brand-text-muted)]">
            {venue.events} {tHome("hostedEvents")}
          </span>
          <span className="rounded-full bg-[var(--brand-coral-soft)] px-3 py-1 text-sm font-bold text-[var(--brand-coral-dark)]">
            {venue.rating.toFixed(1)}
          </span>
        </div>
        {venue.deal ? (
          <div className="rounded-2xl bg-[rgba(232,97,77,0.08)] px-4 py-3 text-sm font-semibold text-[var(--brand-coral-dark)]">
            {tHome("memberDeal")}: {venue.deal}
          </div>
        ) : null}
        <Link
          href="/venues"
          className="inline-flex items-center gap-2 text-sm font-bold text-[var(--brand-indigo)]"
        >
          {tCta("exploreVenue")}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

function SignalCard({
  icon: Icon,
  title,
  description,
  tone,
}: {
  icon: typeof Compass;
  title: string;
  description: string;
  tone: "indigo" | "coral" | "sage";
}) {
  const toneClass =
    tone === "coral"
      ? "bg-[var(--brand-coral-soft)] text-[var(--brand-coral-dark)]"
      : tone === "sage"
        ? "bg-[rgba(124,154,130,0.12)] text-[var(--brand-sage)]"
        : "bg-[var(--brand-indigo-soft)] text-[var(--brand-indigo)]";

  return (
    <article className="market-signal-card p-5">
      <div className="flex items-start gap-4">
        <span className="editorial-icon-chip">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <div className="text-base font-bold tracking-[-0.02em] text-[var(--brand-text)]">
            {title}
          </div>
          <p className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">
            {description}
          </p>
          <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${toneClass}`}>
            {tone === "indigo" ? "Trust" : tone === "coral" ? "Revenue" : "Quality"}
          </span>
        </div>
      </div>
    </article>
  );
}

function OperatorLaneCard({
  icon: Icon,
  title,
  description,
  highlights,
}: {
  icon: typeof Compass;
  title: string;
  description: string;
  highlights: string[];
}) {
  return (
    <article className="paper-panel-premium rounded-[1.75rem] p-6">
      <span className="editorial-icon-chip">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-5 text-2xl font-bold tracking-[-0.03em] text-[var(--brand-text)]">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">
        {description}
      </p>
      <div className="mt-5 space-y-3">
        {highlights.map((highlight) => (
          <div
            key={highlight}
            className="editorial-list-card px-4 py-3 text-sm leading-7 text-[var(--brand-text-muted)]"
          >
            {highlight}
          </div>
        ))}
      </div>
    </article>
  );
}

export function HomePage() {
  const tHero = useTranslations("home.hero");
  const tSections = useTranslations("home.sections");
  const tCta = useTranslations("cta");
  const tStats = useTranslations("home.stats");
  const tSteps = useTranslations("home.steps");

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
  const heroSearchChips = [
    tHero("chipSafety"),
    tHero("chipVenue"),
    `${minimumTicketPriceIsk} ISK+`,
    tHero("chipPremium"),
    tHero("chipSocial"),
    tHero("chipWorkshops"),
  ];
  const signalCards = [
    {
      icon: ShieldCheck,
      title: tSections("signalTrustTitle"),
      description: tSections("signalTrustDescription"),
      tone: "indigo" as const,
    },
    {
      icon: Ticket,
      title: tSections("signalRevenueTitle"),
      description: tSections("signalRevenueDescription"),
      tone: "coral" as const,
    },
    {
      icon: Store,
      title: tSections("signalVenueTitle"),
      description: tSections("signalVenueDescription"),
      tone: "sage" as const,
    },
  ];
  const operatorLanes = [
    {
      icon: Users,
      title: tSections("memberLaneTitle"),
      description: tSections("memberLaneDescription"),
      highlights: [
        tSections("memberLanePointOne"),
        tSections("memberLanePointTwo"),
        tSections("memberLanePointThree"),
      ],
    },
    {
      icon: Sparkles,
      title: tSections("organizerLaneTitle"),
      description: tSections("organizerLaneDescription"),
      highlights: [
        tSections("organizerLanePointOne"),
        tSections("organizerLanePointTwo"),
        tSections("organizerLanePointThree"),
      ],
    },
    {
      icon: Store,
      title: tSections("venueLaneTitle"),
      description: tSections("venueLaneDescription"),
      highlights: [
        tSections("venueLanePointOne"),
        tSections("venueLanePointTwo"),
        tSections("venueLanePointThree"),
      ],
    },
  ];

  return (
    <div className="site-shell">
      <section className="grain-overlay relative overflow-hidden bg-[linear-gradient(160deg,#1e1b2e_0%,#262243_32%,#2d2654_57%,#3a2c5f_100%)] px-4 pb-18 pt-16 text-white">
        <div className="ambient-orb drift-slow left-[4%] top-[18%] h-60 w-60 bg-[rgba(79,70,229,0.36)]" />
        <div className="ambient-orb float-slow right-[10%] top-[-6%] h-80 w-80 bg-[rgba(232,97,77,0.2)]" />
        <div className="ambient-orb float-slow bottom-[-4rem] left-[18%] h-72 w-72 bg-[rgba(255,255,255,0.08)]" />

        <div className="section-shell relative z-10 py-12">
          <div className="grid gap-10 xl:grid-cols-[1.04fr_0.96fr] xl:items-end">
            <div className="text-center xl:text-left">
              <span className="glass-panel rise-in inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/72">
                {tHero("badge")}
              </span>

              <h1 className="font-editorial rise-in rise-delay-1 mx-auto mt-6 max-w-4xl text-5xl leading-[0.96] tracking-[-0.06em] sm:text-6xl lg:text-[5.2rem] xl:mx-0">
                {tHero("titleLead")}
                <br />
                <span className="text-[var(--brand-coral)] italic">{tHero("titleAccent")}</span>
              </h1>

              <p className="rise-in rise-delay-2 mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/68 sm:text-xl xl:mx-0">
                {tHero("subtitleTop")}
                <br className="hidden sm:block" />
                {tHero("subtitleBottom")}
              </p>

              <div className="rise-in rise-delay-3 mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row xl:justify-start">
                <Link
                  href="/events"
                  className="rounded-full bg-[var(--brand-coral)] px-7 py-4 text-sm font-bold text-white shadow-[0_18px_44px_rgba(232,97,77,0.26)] transition-transform hover:-translate-y-0.5"
                >
                  {tCta("exploreEvents")}
                </Link>
                <Link
                  href="/groups"
                  className="rounded-full border border-white/20 bg-white/6 px-7 py-4 text-sm font-semibold text-white/92 transition-colors hover:bg-white/10"
                >
                  {tCta("startGroup")}
                </Link>
                <Link
                  href="/pricing"
                  className="rounded-full border border-white/16 bg-white/4 px-6 py-4 text-sm font-semibold text-white/78 transition-colors hover:bg-white/10"
                >
                  {tSections("businessCta")}
                </Link>
              </div>

              <div className="rise-in rise-delay-3 mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {localizedHeroStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-[1.4rem] border border-white/10 bg-white/6 px-5 py-5 text-left"
                  >
                    <div className="text-3xl font-black tracking-[-0.05em] text-white">
                      {stat.value}
                    </div>
                    <div className="mt-2 text-sm font-medium text-white/52">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rise-in rise-delay-2 market-command-panel p-5 text-left text-[var(--brand-text)] sm:p-6">
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-text-light)]">
                {tHero("commandEyebrow")}
              </div>
              <h2 className="font-editorial mt-4 text-4xl tracking-[-0.05em] text-[var(--brand-text)]">
                {tHero("commandTitle")}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">
                {tHero("commandDescription")}
              </p>

              <form className="mt-5">
                <div className="market-command-input flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
                  <div className="flex items-center gap-3 text-[var(--brand-text-muted)]">
                    <ScanSearch className="h-5 w-5 text-[var(--brand-indigo)]" />
                  </div>
                  <input
                    type="search"
                    placeholder={tHero("searchPlaceholder")}
                    className="w-full bg-transparent px-1 py-2 text-base text-[var(--brand-text)] placeholder:text-[var(--brand-text-light)] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-[var(--brand-indigo)] px-5 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
                  >
                    {tCta("explore")}
                  </button>
                </div>
              </form>

              <div className="mt-4 flex flex-wrap gap-2">
                {heroSearchChips.map((chip, index) => (
                  <span
                    key={chip}
                    className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] ${
                      index % 3 === 0
                        ? "bg-[var(--brand-indigo-soft)] text-[var(--brand-indigo)]"
                        : index % 3 === 1
                          ? "bg-[var(--brand-coral-soft)] text-[var(--brand-coral-dark)]"
                          : "bg-[rgba(124,154,130,0.14)] text-[var(--brand-sage)]"
                    }`}
                  >
                    {chip}
                  </span>
                ))}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="market-metric-tile p-4">
                  <div className="flex items-center gap-3">
                    <span className="editorial-icon-chip h-10 w-10 rounded-[0.95rem]">
                      <ShieldCheck className="h-4 w-4" />
                    </span>
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-text-light)]">
                      {tHero("noteOneLabel")}
                    </div>
                  </div>
                  <div className="mt-3 text-sm leading-7 text-[var(--brand-text)]">
                    {tHero("noteOneValue")}
                  </div>
                </div>
                <div className="market-metric-tile p-4">
                  <div className="flex items-center gap-3">
                    <span className="editorial-icon-chip h-10 w-10 rounded-[0.95rem]">
                      <HandCoins className="h-4 w-4" />
                    </span>
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-text-light)]">
                      {tHero("noteTwoLabel")}
                    </div>
                  </div>
                  <div className="mt-3 text-sm leading-7 text-[var(--brand-text)]">
                    {tHero("noteTwoValue")}
                  </div>
                </div>
                <div className="market-metric-tile p-4">
                  <div className="flex items-center gap-3">
                    <span className="editorial-icon-chip h-10 w-10 rounded-[0.95rem]">
                      <Store className="h-4 w-4" />
                    </span>
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-text-light)]">
                      {tHero("noteThreeLabel")}
                    </div>
                  </div>
                  <div className="mt-3 text-sm leading-7 text-[var(--brand-text)]">
                    {tHero("noteThreeValue")}
                  </div>
                </div>
                <div className="market-metric-tile p-4">
                  <div className="flex items-center gap-3">
                    <span className="editorial-icon-chip h-10 w-10 rounded-[0.95rem]">
                      <CalendarDays className="h-4 w-4" />
                    </span>
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-text-light)]">
                      {tHero("noteFourLabel")}
                    </div>
                  </div>
                  <div className="mt-3 text-sm leading-7 text-[var(--brand-text)]">
                    {tHero("noteFourValue")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell -mt-6 relative z-20 pb-4 sm:-mt-8">
        <div className="grid gap-4 md:grid-cols-3">
          {signalCards.map((card) => (
            <SignalCard
              key={card.title}
              icon={card.icon}
              title={card.title}
              description={card.description}
              tone={card.tone}
            />
          ))}
        </div>
      </section>

      <section className="section-shell px-0 py-18">
        <SectionHeading
          eyebrow={tSections("thisWeekEyebrow")}
          title={tSections("thisWeekTitle")}
          description={tSections("thisWeekDescription")}
          actionHref="/events"
          actionLabel={tCta("seeAllEvents")}
        />
        <div className="scroll-strip">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      <section className="border-y border-[var(--brand-border-light)] bg-white px-4 py-18">
        <div className="section-shell text-center">
          <span className="eyebrow bg-[rgba(79,70,229,0.08)] px-4 py-2 text-[var(--brand-indigo)]">
            {tSections("categoriesEyebrow")}
          </span>
          <h2 className="font-editorial mt-4 text-4xl leading-none tracking-[-0.04em] text-[var(--brand-text)] sm:text-[2.65rem]">
            {tSections("categoriesTitle")}
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {categories.map((category) => {
              const tone = toneMap[category.tone];

              return (
                <Link
                  key={category.name}
                  href={`/categories/${slugify(category.name)}` as import("next").Route}
                  className="paper-panel inline-flex items-center gap-3 rounded-full px-4 py-3 text-left text-sm font-medium text-[var(--brand-text)] transition-transform hover:-translate-y-0.5"
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-black ${tone.badge}`}
                  >
                    {category.letter}
                  </span>
                  <span>{category.name}</span>
                  <span className="text-xs font-bold text-[var(--brand-text-light)]">
                    {category.count}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-shell px-0 py-18">
        <SectionHeading
          eyebrow={tSections("businessEyebrow")}
          title={tSections("businessTitle")}
          description={tSections("businessDescription")}
          actionHref="/pricing"
          actionLabel={tSections("businessCta")}
        />
        <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
          <div className="grid gap-6 md:grid-cols-3">
            {operatorLanes.map((lane) => (
              <OperatorLaneCard
                key={lane.title}
                icon={lane.icon}
                title={lane.title}
                description={lane.description}
                highlights={lane.highlights}
              />
            ))}
          </div>
          <div className="paper-panel-premium rounded-[1.9rem] p-7">
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-text-light)]">
              {tSections("flywheelEyebrow")}
            </div>
            <h3 className="font-editorial mt-4 text-4xl tracking-[-0.05em] text-[var(--brand-text)]">
              {tSections("flywheelTitle")}
            </h3>
            <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">
              {tSections("flywheelDescription")}
            </p>
            <div className="mt-6 space-y-4">
              {[
                {
                  title: tSections("flywheelPointOneTitle"),
                  body: tSections("flywheelPointOneDescription"),
                },
                {
                  title: tSections("flywheelPointTwoTitle"),
                  body: tSections("flywheelPointTwoDescription"),
                },
                {
                  title: tSections("flywheelPointThreeTitle"),
                  body: tSections("flywheelPointThreeDescription"),
                },
              ].map((item) => (
                <div key={item.title} className="editorial-list-card p-4">
                  <div className="font-semibold text-[var(--brand-text)]">{item.title}</div>
                  <p className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/pricing"
                className="rounded-full bg-[var(--brand-indigo)] px-5 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
              >
                {tSections("businessCta")}
              </Link>
              <Link
                href="/for-organizers"
                className="rounded-full border border-[var(--brand-border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--brand-indigo)]"
              >
                {tSections("organizerLaneTitle")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell px-0 py-18">
        <SectionHeading
          eyebrow={tSections("howEyebrow")}
          title={tSections("howTitle")}
          description={tSections("howDescription")}
        />
        <div className="grid gap-6 lg:grid-cols-3">
          {localizedSteps.map((step) => (
            <article
              key={step.number}
              className="paper-panel rounded-[1.7rem] p-7"
            >
              <div className="flex items-center justify-between">
                <span className="font-editorial text-5xl tracking-[-0.08em] text-[var(--brand-indigo-soft)]">
                  {step.number}
                </span>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(79,70,229,0.1)] text-[var(--brand-indigo)]">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
              </div>
              <h3 className="mt-8 text-2xl font-bold tracking-[-0.03em] text-[var(--brand-text)]">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-[var(--brand-border-light)] bg-white px-4 py-18">
        <div className="section-shell">
          <SectionHeading
            eyebrow={tSections("groupsEyebrow")}
            title={tSections("groupsTitle")}
            description={tSections("groupsDescription")}
            actionHref="/groups"
            actionLabel={tCta("seeAllGroups")}
          />
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
            {groups.map((group) => (
              <GroupCard key={group.name} group={group} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell px-0 py-18">
        <SectionHeading
          eyebrow={tSections("venuesEyebrow")}
          title={tSections("venuesTitle")}
          description={tSections("venuesDescription")}
          actionHref="/for-venues"
          actionLabel={tCta("becomePartner")}
        />
        <div className="scroll-strip">
          {venues.map((venue) => (
            <VenueCard key={venue.name} venue={venue} />
          ))}
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="section-shell grain-overlay relative overflow-hidden rounded-[2.5rem] bg-[linear-gradient(135deg,rgba(55,48,163,1),rgba(79,70,229,0.94)_48%,rgba(232,97,77,0.9))] px-8 py-14 text-center text-white sm:px-12">
          <div className="ambient-orb drift-slow left-[-3rem] top-[-3rem] h-44 w-44 bg-white/12" />
          <div className="ambient-orb float-slow bottom-[-4rem] right-[-2rem] h-60 w-60 bg-[rgba(232,97,77,0.28)]" />
          <div className="relative z-10">
            <span className="eyebrow bg-white/10 px-4 py-2 text-white/72">
              {tSections("joinEyebrow")}
            </span>
            <h2 className="font-editorial mx-auto mt-5 max-w-3xl text-4xl leading-tight tracking-[-0.05em] sm:text-5xl">
              {tSections("joinTitle")}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-white/74 sm:text-lg">
              {tSections("joinDescription")}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="rounded-full bg-[var(--brand-coral)] px-7 py-4 text-sm font-bold text-white shadow-[0_20px_48px_rgba(232,97,77,0.24)] transition-transform hover:-translate-y-0.5"
              >
                {tCta("signupFreeLong")}
              </Link>
              <Link
                href="/for-venues"
                className="rounded-full border border-white/18 bg-white/8 px-7 py-4 text-sm font-semibold text-white/94"
              >
                {tCta("partnerVenue")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-6">
        <div className="section-shell grid gap-6 rounded-[2rem] border border-[var(--brand-border-light)] bg-[var(--brand-sand-light)] px-6 py-8 lg:grid-cols-3">
          <div>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(79,70,229,0.1)] text-[var(--brand-indigo)]">
              <Compass className="h-5 w-5" />
            </div>
            <h3 className="font-editorial text-2xl tracking-[-0.04em] text-[var(--brand-text)]">
              {tSections("closingTitle")}
            </h3>
          </div>
          <div className="rounded-[1.5rem] bg-white px-5 py-5">
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-text-light)]">
              {tSections("memberFirst")}
            </div>
            <div className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">
              {tSections("memberFirstDescription")}
            </div>
          </div>
          <div className="rounded-[1.5rem] bg-white px-5 py-5">
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-text-light)]">
              {tSections("venueAware")}
            </div>
            <div className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">
              {tSections("venueAwareDescription")}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
