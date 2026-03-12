import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  MapPin,
  Sparkles,
  Star,
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

const TAG_COLORS: Record<string, string> = {
  Social: "bg-brand-coral-soft text-brand-coral-dark",
  Outdoors: "bg-[rgba(124,154,130,0.14)] text-brand-sage",
  Tech: "bg-brand-indigo-soft text-brand-indigo",
  Music: "bg-brand-sand text-brand-text",
  Food: "bg-brand-coral-soft text-brand-coral-dark",
};

const toneMap = {
  coral: "bg-brand-coral-soft text-brand-coral-dark",
  sage: "bg-[rgba(124,154,130,0.12)] text-brand-sage",
  indigo: "bg-brand-indigo-soft text-brand-indigo",
  sand: "bg-brand-sand text-brand-text",
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
  actionHref,
  actionLabel,
}: {
  eyebrow: string;
  title: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-indigo">
          {eyebrow}
        </span>
        <h2 className="font-editorial mt-2 text-3xl leading-tight tracking-[-0.04em] text-brand-text sm:text-4xl">
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

function EventCard({ event }: { event: (typeof events)[number] }) {
  const t = useTranslations("home.cards");
  const tCta = useTranslations("cta");

  return (
    <Link
      href={`/events/${event.slug}` as import("next").Route}
      className="group block min-w-[280px] max-w-[306px] flex-shrink-0 overflow-hidden rounded-2xl border border-brand-border-light bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative h-[175px] overflow-hidden">
        <Image
          src={event.photo}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="306px"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(30,27,46,0.5)]" />

        <div className="absolute left-4 top-4 rounded-xl bg-white px-3 py-1.5 text-center shadow-md">
          <div className="text-[10px] font-bold uppercase tracking-wider text-brand-coral">
            Mar
          </div>
          <div className="text-xl font-black leading-tight tracking-tight">{event.date}</div>
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
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-brand-text-muted">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {event.day} · {event.time}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {event.venue}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-sm text-brand-text-muted">
            <Users className="h-3.5 w-3.5" />
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

function GroupCard({ group }: { group: (typeof groups)[number] }) {
  const t = useTranslations("cta");

  return (
    <Link
      href={`/groups/${group.slug}` as import("next").Route}
      className="group block overflow-hidden rounded-2xl border border-brand-border-light bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative h-36 overflow-hidden">
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
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-brand-text-muted">
          {group.description}
        </p>
        <div className="mt-3 flex items-center justify-between border-t border-brand-border-light pt-3">
          <span className="text-sm font-semibold text-brand-text">
            {group.members} members
          </span>
          <span className="text-sm font-bold text-brand-indigo">
            {t("viewGroup")}
          </span>
        </div>
      </div>
    </Link>
  );
}

function VenueCard({ venue }: { venue: (typeof venues)[number] }) {
  const tHome = useTranslations("home.cards");
  const tCta = useTranslations("cta");

  return (
    <Link
      href={`/venues/${venue.slug}` as import("next").Route}
      className="group block min-w-[260px] max-w-[280px] flex-shrink-0 overflow-hidden rounded-2xl border border-brand-border-light bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative h-40 overflow-hidden">
        <Image
          src={venue.photo}
          alt={venue.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="280px"
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
          <span className="text-sm text-brand-text-muted">
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

  return (
    <div className="site-shell">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[linear-gradient(160deg,#1e1b2e_0%,#262243_32%,#2d2654_57%,#3a2c5f_100%)] px-4 pb-16 pt-14 text-white">
        <div className="section-shell relative z-10 py-10 text-center">
          <span className="inline-flex rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
            {tHero("badge")}
          </span>

          <h1 className="font-editorial mx-auto mt-6 max-w-3xl text-3xl leading-[0.96] tracking-[-0.05em] sm:text-4xl md:text-5xl lg:text-6xl">
            {tHero("titleLead")}
            <br />
            <span className="text-brand-coral italic">{tHero("titleAccent")}</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">
            {tHero("subtitleTop")} {tHero("subtitleBottom")}
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/events"
              className="rounded-full bg-brand-coral px-7 py-3.5 text-sm font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5"
            >
              {tCta("exploreEvents")}
            </Link>
            <Link
              href="/groups"
              className="rounded-full border border-white/18 bg-white/6 px-7 py-3.5 text-sm font-semibold text-white/90 transition-colors hover:bg-white/12"
            >
              {tCta("startGroup")}
            </Link>
          </div>

          <div className="mx-auto mt-12 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
            {localizedHeroStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-black tracking-tight text-white">
                  {stat.value}
                </div>
                <div className="mt-1 text-xs font-medium uppercase tracking-wider text-white/50">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Events */}
      <section className="section-shell py-16">
        <SectionHeading
          eyebrow={tSections("thisWeekEyebrow")}
          title={tSections("thisWeekTitle")}
          actionHref="/events"
          actionLabel={tCta("seeAllEvents")}
        />
        <div className="flex gap-5 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="border-y border-brand-border-light bg-white px-4 py-16">
        <div className="section-shell text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-indigo">
            {tSections("categoriesEyebrow")}
          </span>
          <h2 className="font-editorial mt-2 text-3xl tracking-[-0.04em] text-brand-text sm:text-4xl">
            {tSections("categoriesTitle")}
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-2.5">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/categories/${slugify(category.name)}` as import("next").Route}
                className="inline-flex items-center gap-2.5 rounded-full border border-brand-border-light bg-white px-4 py-2.5 text-sm font-medium text-brand-text shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black ${toneMap[category.tone]}`}
                >
                  {category.letter}
                </span>
                {category.name}
                <span className="text-xs text-brand-text-light">
                  {category.count}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section-shell py-16">
        <SectionHeading
          eyebrow={tSections("howEyebrow")}
          title={tSections("howTitle")}
        />
        <div className="grid gap-5 lg:grid-cols-3">
          {localizedSteps.map((step) => (
            <article
              key={step.number}
              className="rounded-2xl border border-brand-border-light bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-editorial text-4xl tracking-tight text-brand-indigo-soft">
                  {step.number}
                </span>
                <CheckCircle2 className="h-5 w-5 text-brand-indigo" />
              </div>
              <h3 className="mt-5 text-xl font-bold tracking-tight text-brand-text">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-text-muted">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Groups */}
      <section className="border-t border-brand-border-light bg-white px-4 py-16">
        <div className="section-shell">
          <SectionHeading
            eyebrow={tSections("groupsEyebrow")}
            title={tSections("groupsTitle")}
            actionHref="/groups"
            actionLabel={tCta("seeAllGroups")}
          />
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {groups.map((group) => (
              <GroupCard key={group.name} group={group} />
            ))}
          </div>
        </div>
      </section>

      {/* Venues */}
      <section className="section-shell py-16">
        <SectionHeading
          eyebrow={tSections("venuesEyebrow")}
          title={tSections("venuesTitle")}
          actionHref="/venues"
          actionLabel={tCta("becomePartner")}
        />
        <div className="flex gap-5 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {venues.map((venue) => (
            <VenueCard key={venue.name} venue={venue} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-16">
        <div className="section-shell overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#3730A3,#4F46E5_48%,#E8614D)] px-5 py-10 text-center text-white sm:px-8 md:px-12 sm:py-14">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">
            {tSections("joinEyebrow")}
          </span>
          <h2 className="font-editorial mx-auto mt-3 max-w-2xl text-3xl leading-tight tracking-[-0.04em] sm:text-4xl">
            {tSections("joinTitle")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/70">
            {tSections("joinDescription")}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="rounded-full bg-white px-7 py-3.5 text-sm font-bold shadow-lg transition-transform hover:-translate-y-0.5 text-brand-indigo"
            >
              {tCta("signupFreeLong")}
            </Link>
            <Link
              href="/for-venues"
              className="rounded-full border border-white/18 bg-white/8 px-7 py-3.5 text-sm font-semibold text-white/90"
            >
              {tCta("partnerVenue")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
