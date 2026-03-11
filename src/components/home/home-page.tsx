import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Compass,
  MapPin,
  Sparkles,
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

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  Social: { bg: "#FDE8E4", text: "#B33D2C" },
  Outdoors: { bg: "#D4E4D7", text: "#2D5F3A" },
  Tech: { bg: "#C7D2FE", text: "#3730A3" },
  Arts: { bg: "#FEF3C7", text: "#92400E" },
  Expat: { bg: "#FCE7F3", text: "#9D174D" },
  Food: { bg: "#FFEDD5", text: "#9A3412" },
};

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
  const tc = TAG_COLORS[event.tag] ?? TAG_COLORS.Social;

  return (
    <article className="group min-w-[306px] max-w-[306px] flex-shrink-0 cursor-pointer overflow-hidden rounded-2xl border border-[var(--brand-border-light)] bg-white shadow-[0_1px_4px_rgba(42,38,56,0.04)] transition-all duration-300 hover:-translate-y-[5px] hover:shadow-[0_16px_40px_rgba(42,38,56,0.12)]">
      <div className="relative h-[175px] overflow-hidden">
        <Image
          src={event.photo}
          alt={event.title}
          fill
          className="object-cover"
          sizes="306px"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(30,27,46,0.3)]" />

        {/* Date badge */}
        <div className="absolute left-[14px] top-[14px] rounded-[10px] bg-white px-3 py-2 text-center shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--brand-coral)]">
            Mar
          </div>
          <div className="text-[22px] font-extrabold leading-none text-[var(--brand-text)]">
            {event.date}
          </div>
        </div>

        {/* Tag badge */}
        <div
          className="absolute right-[14px] top-[14px] rounded-[7px] px-3 py-1.5 text-[10px] font-bold"
          style={{ backgroundColor: tc.bg, color: tc.text }}
        >
          {event.tag}
        </div>

        {/* Deal badge */}
        {event.deal ? (
          <div className="absolute bottom-[14px] right-[14px] flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-[var(--brand-coral-dark)] backdrop-blur-sm">
            <Sparkles className="h-3 w-3" />
            {event.deal}
          </div>
        ) : null}
      </div>

      <div className="px-4 pb-4 pt-4">
        <h3 className="text-base font-bold text-[var(--brand-text)]">
          {event.title}
        </h3>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-[var(--brand-text-muted)]">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-[13px] w-[13px]" />
            {event.day} {event.time}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-[13px] w-[13px]" />
            {event.venue}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-[var(--brand-border-light)] pt-3">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-6 w-6 rounded-full border-2 border-white bg-gradient-to-br from-[var(--brand-indigo)] to-[var(--brand-coral)]"
                />
              ))}
            </div>
            <span className="text-[13px] font-semibold text-[var(--brand-text)]">
              {event.attendees}
            </span>
            <span className="text-[13px] text-[var(--brand-text-muted)]">
              {t("going")}
            </span>
          </div>
          <Link
            href="/signup"
            className="rounded-lg bg-[var(--brand-coral)] px-5 py-2 text-[13px] font-bold tracking-[0.3px] text-white transition-shadow hover:shadow-[0_4px_12px_rgba(232,97,77,0.25)]"
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
    <article className="overflow-hidden rounded-2xl border border-[var(--brand-border-light)] bg-white shadow-[0_1px_4px_rgba(42,38,56,0.04)] transition-all duration-300 hover:-translate-y-[5px] hover:shadow-[0_16px_40px_rgba(42,38,56,0.12)]">
      <div
        className="relative h-36 w-full bg-cover bg-center"
        style={{ backgroundImage: group.art }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(30,27,46,0.45)]" />
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
    <article className="min-w-[286px] max-w-[286px] flex-shrink-0 overflow-hidden rounded-2xl border border-[var(--brand-border-light)] bg-white shadow-[0_1px_4px_rgba(42,38,56,0.04)] transition-all duration-300 hover:-translate-y-[5px] hover:shadow-[0_16px_40px_rgba(42,38,56,0.12)]">
      <div
        className="relative h-44 bg-cover bg-center"
        style={{ backgroundImage: venue.art }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(30,27,46,0.58)]" />
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
          <div className="rounded-xl bg-[rgba(232,97,77,0.08)] px-4 py-3 text-sm font-semibold text-[var(--brand-coral-dark)]">
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

export function HomePage() {
  const tHero = useTranslations("home.hero");
  const tSections = useTranslations("home.sections");
  const tCta = useTranslations("cta");
  const tStats = useTranslations("home.stats");
  const tSteps = useTranslations("home.steps");

  const localizedHeroStats = [
    { value: "2,847", label: tStats("members") },
    { value: "156", label: tStats("groups") },
    { value: "89", label: tStats("thisWeek") },
    { value: "34", label: tStats("venuePartners") },
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

  return (
    <div className="site-shell">
      {/* === HERO === */}
      <section className="relative overflow-hidden bg-[linear-gradient(160deg,#1e1b2e_0%,#262243_32%,#2d2654_57%,#3a2c5f_100%)] px-4 pb-20 pt-16 text-white">
        <div className="absolute left-[4%] top-[18%] h-60 w-60 rounded-full bg-[rgba(79,70,229,0.25)] blur-[80px]" />
        <div className="absolute right-[10%] top-[-6%] h-80 w-80 rounded-full bg-[rgba(232,97,77,0.15)] blur-[80px]" />

        <div className="section-shell relative z-10 py-12 text-center">
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/72">
            {tHero("badge")}
          </span>

          <h1 className="font-editorial mx-auto mt-6 max-w-4xl text-5xl leading-[0.96] tracking-[-0.06em] sm:text-6xl lg:text-[5.2rem]">
            {tHero("titleLead")}
            <br />
            <span className="text-[var(--brand-coral)] italic">{tHero("titleAccent")}</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/68 sm:text-xl">
            {tHero("subtitleTop")}
            <br className="hidden sm:block" />
            {tHero("subtitleBottom")}
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
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

          <div className="mx-auto mt-14 grid max-w-3xl gap-5 sm:grid-cols-4">
            {localizedHeroStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-white/6 px-5 py-5 text-center"
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
      </section>

      {/* === EVENTS === */}
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

      {/* === CATEGORIES === */}
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
                  className="inline-flex items-center gap-3 rounded-full border border-[var(--brand-border-light)] bg-white px-4 py-3 text-left text-sm font-medium text-[var(--brand-text)] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
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

      {/* === HOW IT WORKS === */}
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
              className="rounded-2xl border border-[var(--brand-border-light)] bg-white p-7 shadow-sm"
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

      {/* === GROUPS === */}
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

      {/* === VENUES === */}
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

      {/* === CTA === */}
      <section className="px-4 py-20">
        <div className="section-shell relative overflow-hidden rounded-[2.5rem] bg-[linear-gradient(135deg,rgba(55,48,163,1),rgba(79,70,229,0.94)_48%,rgba(232,97,77,0.9))] px-8 py-14 text-center text-white sm:px-12">
          <div className="absolute left-[-3rem] top-[-3rem] h-44 w-44 rounded-full bg-white/12 blur-[60px]" />
          <div className="absolute bottom-[-4rem] right-[-2rem] h-60 w-60 rounded-full bg-[rgba(232,97,77,0.28)] blur-[60px]" />
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
    </div>
  );
}
