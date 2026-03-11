"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Camera,
  Check,
  Globe2,
  HandCoins,
  Sparkles,
  Store,
  UserRound,
  UsersRound,
} from "lucide-react";
import { startTransition, useState } from "react";

import { categories } from "@/lib/home-data";
import { portalPathForRole } from "@/lib/auth/mock-auth-config";
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes-warning";
import { writeSessionDraft } from "@/lib/storage/session-drafts";
import type { AccountType, Locale } from "@/types/domain";

type OnboardingFlowProps = {
  displayName: string;
  accountType: AccountType;
  defaultLocale: Locale;
};

const storageKey = "meetupreykjavik-onboarding";

const roleMeta: Record<
  AccountType,
  {
    title: string;
    description: string;
    destination: string;
    highlights: string[];
    Icon: typeof UsersRound;
  }
> = {
  user: {
    title: "Member lane",
    description:
      "You are setting up discovery preferences for events, groups, and venue-backed rooms across Reykjavik.",
    destination: "/dashboard",
    highlights: ["Saved events", "Group joins", "Venue trust"],
    Icon: UsersRound,
  },
  organizer: {
    title: "Organizer lane",
    description:
      "You are setting up the operator side for recurring groups, approvals, and paid formats that start from 500 ISK.",
    destination: "/organizer",
    highlights: ["Groups", "Paid events", "Audience ops"],
    Icon: HandCoins,
  },
  venue: {
    title: "Venue partner lane",
    description:
      "You are moving into venue onboarding, bookings, deals, and availability workflows once the setup is complete.",
    destination: "/venue/dashboard",
    highlights: ["Bookings", "Deals", "Availability"],
    Icon: Store,
  },
  admin: {
    title: "Admin lane",
    description:
      "You are stepping into the control layer for curation, moderation, communications, and revenue oversight.",
    destination: "/admin",
    highlights: ["Controls", "Moderation", "Revenue"],
    Icon: Sparkles,
  },
};

export function OnboardingFlow({
  displayName,
  accountType,
  defaultLocale,
}: OnboardingFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [photoUrl, setPhotoUrl] = useState("");
  const [message, setMessage] = useState("");
  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    JSON.stringify({
      locale: defaultLocale,
      selectedInterests: [],
      photoUrl: "",
    }),
  );
  const isDirty =
    JSON.stringify({
      locale,
      selectedInterests,
      photoUrl,
    }) !== savedSnapshot;

  useUnsavedChangesWarning(isDirty);

  const canContinue =
    step === 0
      ? Boolean(locale)
      : step === 1
        ? selectedInterests.length >= 3
        : true;

  function toggleInterest(name: string) {
    setSelectedInterests((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name],
    );
  }

  function goNext() {
    if (!canContinue) {
      setMessage(
        step === 1
          ? "Select at least 3 interests so recommendations and groups can be shaped properly."
          : "Complete this step before continuing.",
      );
      return;
    }

    setMessage("");

    if (step < 2) {
      setStep((current) => current + 1);
      return;
    }

    startTransition(() => {
      writeSessionDraft(
        storageKey,
        {
          completedAt: new Date().toISOString(),
          locale,
          selectedInterests,
          photoUrl,
          accountType,
        },
      );
      setSavedSnapshot(
        JSON.stringify({
          locale,
          selectedInterests,
          photoUrl,
        }),
      );
      router.push(portalPathForRole(accountType));
      router.refresh();
    });
  }

  const steps = [
    {
      label: "Language",
      title: "Pick your language first",
      description:
        "The product is bilingual from the start. This preference will later shape the UI, emails, and category copy.",
      icon: Globe2,
    },
    {
      label: "Interests",
      title: "Choose the communities you want more of",
      description:
        "This is the signal layer for recommendations, groups, and cleaner event discovery.",
      icon: Sparkles,
    },
    {
      label: "Photo",
      title: "Add a photo if you want a warmer first hello",
      description:
        "Photos are optional, but they help with trust, approvals, and better host introductions.",
      icon: Camera,
    },
  ] as const;

  const activeStep = steps[step];
  const currentRole = roleMeta[accountType];
  const progressPercent = ((step + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,var(--brand-sand-light),var(--brand-sand))] px-4 py-10">
      <div className="section-shell">
        <div className="paper-panel-premium editorial-shell overflow-hidden rounded-[2.2rem] border border-[rgba(255,255,255,0.74)]">
          <div className="grid gap-0 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="grain-overlay bg-[linear-gradient(160deg,#1e1b2e_0%,#262243_40%,#3a2c5f_100%)] px-8 py-10 text-white lg:px-10 lg:py-12">
              <span className="eyebrow bg-white/10 px-4 py-2 text-white/72">
                Onboarding
              </span>
              <h1 className="font-editorial mt-6 text-4xl leading-tight tracking-[-0.05em]">
                Start strong, {displayName.split(" ")[0]}.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-7 text-white/72">
                This route closes the auth surface the spec calls for: language, interests,
                and optional profile warmth before dropping into the product.
              </p>

              <div className="mt-8 rounded-[1.3rem] border border-white/10 bg-white/7 p-5">
                <div className="text-xs font-bold uppercase tracking-[0.22em] text-white/52">
                  Destination after onboarding
                </div>
                <div className="mt-3 flex items-start gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-white/10 text-white">
                    <currentRole.Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="font-semibold text-white">{currentRole.title}</div>
                    <p className="mt-2 text-sm leading-7 text-white/68">
                      {currentRole.description}
                    </p>
                    <div className="mt-3 text-sm font-semibold text-white/86">
                      Landing route: {currentRole.destination}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {currentRole.highlights.map((highlight) => (
                        <span
                          key={highlight}
                          className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white/72"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 space-y-3">
                {steps.map((item, index) => (
                  <div
                    key={item.label}
                    className="flex items-start gap-3 rounded-[1.2rem] border border-white/10 bg-white/6 px-4 py-4"
                  >
                    <span
                      className={`mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl ${
                        index <= step ? "bg-[var(--brand-coral)] text-white" : "bg-white/10 text-white/70"
                      }`}
                    >
                      {index < step ? <Check className="h-4 w-4" /> : <item.icon className="h-4 w-4" />}
                    </span>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/52">
                        Step {index + 1}
                      </div>
                      <div className="mt-1 font-semibold text-white">{item.title}</div>
                      <p className="mt-2 text-sm leading-7 text-white/68">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white px-8 py-10 lg:px-10 lg:py-12">
              <div className="flex items-center gap-3">
                <span className="editorial-icon-chip">
                  <activeStep.icon className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-text-light)]">
                    {activeStep.label}
                  </div>
                  <h2 className="font-editorial mt-1 text-4xl tracking-[-0.05em] text-[var(--brand-text)]">
                    {activeStep.title}
                  </h2>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between gap-4 text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-text-light)]">
                  <span>
                    Step {step + 1} of {steps.length}
                  </span>
                  <span>{Math.round(progressPercent)}% complete</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-[rgba(153,148,168,0.16)]">
                  <div
                    className="h-2 rounded-full bg-[linear-gradient(90deg,var(--brand-indigo),var(--brand-coral))]"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--brand-text-muted)]">
                {activeStep.description}
              </p>

              {step === 0 ? (
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {[
                    {
                      key: "en" as const,
                      title: "English",
                      body: "Primary UI and email language.",
                    },
                    {
                      key: "is" as const,
                      title: "Icelandic",
                      body: "Use Icelandic copy where available across the app.",
                    },
                  ].map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setLocale(option.key)}
                      className={`rounded-[1.5rem] border px-5 py-5 text-left transition ${
                        locale === option.key
                          ? "border-[rgba(79,70,229,0.26)] bg-[rgba(79,70,229,0.08)] shadow-[0_16px_34px_rgba(42,38,56,0.08)]"
                          : "border-[rgba(153,148,168,0.14)] bg-white"
                      }`}
                    >
                      <div className="font-semibold text-[var(--brand-text)]">{option.title}</div>
                      <p className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">
                        {option.body}
                      </p>
                    </button>
                  ))}
                </div>
              ) : null}

              {step === 1 ? (
                <div className="mt-8">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-[var(--brand-text)]">
                      Pick at least 3 interests
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(79,70,229,0.08)] px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand-indigo)]">
                      {selectedInterests.length} selected
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {categories.map((category) => {
                      const active = selectedInterests.includes(category.name);

                      return (
                        <button
                          key={category.name}
                          type="button"
                          onClick={() => toggleInterest(category.name)}
                          className={`inline-flex items-center gap-3 rounded-full border px-4 py-3 text-sm font-medium transition ${
                            active
                              ? "border-[rgba(79,70,229,0.22)] bg-[rgba(79,70,229,0.08)] text-[var(--brand-indigo)]"
                              : "border-[rgba(153,148,168,0.16)] bg-white text-[var(--brand-text)]"
                          }`}
                        >
                          <span className="font-black">{category.letter}</span>
                          {category.name}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-5 rounded-[1.2rem] border border-[rgba(79,70,229,0.12)] bg-[rgba(245,240,232,0.7)] px-4 py-4">
                    <div className="flex items-start gap-3">
                      <span className="editorial-icon-chip">
                        <ArrowRight className="h-4 w-4" />
                      </span>
                      <p className="text-sm leading-7 text-[var(--brand-text-muted)]">
                        These interests will later shape recommendations, category landing order,
                        group suggestions, and organizer invites once the live backend is wired.
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {step === 2 ? (
                <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                  <div className="editorial-list-card flex min-h-[16rem] items-center justify-center p-6">
                    {photoUrl ? (
                      <div
                        className="h-56 w-full rounded-[1.6rem] bg-cover bg-center"
                        style={{ backgroundImage: `url(${photoUrl})` }}
                        aria-label="Profile preview"
                      />
                    ) : (
                      <div className="text-center">
                        <span className="mx-auto flex h-18 w-18 items-center justify-center rounded-[1.8rem] bg-[linear-gradient(135deg,rgba(79,70,229,0.92),rgba(232,97,77,0.82))] text-white">
                          <UserRound className="h-8 w-8" />
                        </span>
                        <div className="mt-4 font-semibold text-[var(--brand-text)]">
                          Optional profile photo
                        </div>
                        <p className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">
                          Leave it empty for now and finish onboarding anyway.
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[var(--brand-text)]">
                      Photo URL
                      <input
                        id="onboarding-photo-url"
                        name="photoUrl"
                        type="url"
                        value={photoUrl}
                        onChange={(event) => setPhotoUrl(event.target.value)}
                        placeholder="https://example.com/profile-photo.jpg"
                        autoComplete="url"
                        autoCapitalize="none"
                        inputMode="url"
                        spellCheck={false}
                        className="field-luxe mt-2 px-4 py-3 text-sm outline-none"
                      />
                    </label>
                    <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">
                      This is a temporary mock input so the full onboarding step exists before
                      Supabase storage is connected for uploads.
                    </p>
                  </div>
                </div>
              ) : null}

              {message ? (
                <div
                  role="status"
                  aria-live="polite"
                  className="mt-6 rounded-[1.2rem] border border-[rgba(232,97,77,0.16)] bg-[rgba(232,97,77,0.08)] px-4 py-3 text-sm text-[var(--brand-coral-dark)]"
                >
                  {message}
                </div>
              ) : null}

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                <Link
                  href="/signup"
                  className="text-sm font-semibold text-[var(--brand-text-muted)]"
                >
                  Back to signup
                </Link>
                <div className="flex items-center gap-3">
                  {step > 0 ? (
                    <button
                      type="button"
                      onClick={() => setStep((current) => current - 1)}
                      className="rounded-full border border-[var(--brand-border)] px-5 py-3 text-sm font-semibold text-[var(--brand-text)]"
                    >
                      Back
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={goNext}
                    className="rounded-full bg-[var(--brand-coral)] px-6 py-3 text-sm font-bold text-white shadow-[0_18px_38px_rgba(232,97,77,0.24)] transition hover:-translate-y-0.5"
                  >
                    {step === 2 ? "Finish onboarding" : "Continue"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
