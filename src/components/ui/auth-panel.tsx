"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  Globe2,
  HandCoins,
  KeyRound,
  Mail,
  ShieldCheck,
  Store,
  UserRoundPlus,
  UsersRound,
} from "lucide-react";
import type { Route } from "next";
import { useState, useTransition } from "react";

import {
  demoAuthAccounts,
  MOCK_PASSWORD_HINT,
  portalPathForRole,
} from "@/lib/auth/mock-auth-config";
import type { AccountType } from "@/types/domain";

type AuthMode = "login" | "signup" | "forgot-password" | "reset-password";

type AuthPanelProps = {
  mode: AuthMode;
  eyebrow: string;
  title: string;
  description: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
};

const inputClassName =
  "luxe-field mt-2 w-full rounded-2xl px-4 py-3 text-[var(--brand-text)] outline-none transition-colors focus-visible:border-[var(--brand-coral)] focus-visible:ring-4 focus-visible:ring-[rgba(232,97,77,0.1)]";

const roleOptions: Array<{
  value: AccountType;
  label: string;
  title: string;
  description: string;
  highlights: string[];
  Icon: typeof UsersRound;
}> = [
  {
    value: "user",
    label: "Client / Member",
    title: "Discover better rooms and better people",
    description:
      "Use the member lane for cleaner event discovery, paid and free seats, group context, and stronger venue signals before you commit.",
    highlights: ["Events", "Groups", "Venue trust"],
    Icon: UsersRound,
  },
  {
    value: "organizer",
    label: "Organizer",
    title: "Run recurring formats with paid-event control",
    description:
      "Use the organizer lane for recurring groups, public paid events from 500 ISK and up, approvals, and venue-fit operations.",
    highlights: ["Paid events", "Audience ops", "Venue fit"],
    Icon: CalendarDays,
  },
  {
    value: "venue",
    label: "Venue partner",
    title: "Operate bookings, deals, and room inventory",
    description:
      "Use the venue lane for onboarding, availability, deal management, incoming requests, and premium storefront positioning.",
    highlights: ["Bookings", "Deals", "Availability"],
    Icon: Store,
  },
  {
    value: "admin",
    label: "Admin",
    title: "Control the whole marketplace",
    description:
      "Use the admin lane for curation, moderation, communications, revenue controls, and deeper operational oversight.",
    highlights: ["Curation", "Revenue", "Policy"],
    Icon: ShieldCheck,
  },
];

const modeHighlights: Record<
  AuthMode,
  Array<{ title: string; text: string; Icon: typeof UsersRound }>
> = {
  login: [
    {
      title: "Role redirect is already wired",
      text: "Email auth routes into member, organizer, venue, and admin portals so the product lands in the correct working surface immediately.",
      Icon: ShieldCheck,
    },
    {
      title: "This is a real marketplace funnel",
      text: "The entry flow now reflects an actual business with members, paid organizers, and venue partners instead of a generic sign-in form.",
      Icon: HandCoins,
    },
    {
      title: "The city context stays visible",
      text: "Language, role, and commercial framing all stay connected to the premium public frontend instead of dropping into a default auth screen.",
      Icon: Globe2,
    },
  ],
  signup: [
    {
      title: "Choose the correct lane first",
      text: "Signup should make it obvious whether someone is joining as a member, host, venue partner, or admin operator.",
      Icon: UsersRound,
    },
    {
      title: "Monetization starts at signup",
      text: "Paid organizer and venue tiers make more sense when the account choice already reflects a serious product model.",
      Icon: HandCoins,
    },
    {
      title: "Onboarding continues the conversion",
      text: "Language, interests, and profile warmth follow immediately after account creation so the funnel feels intentional.",
      Icon: UserRoundPlus,
    },
  ],
  "forgot-password": [
    {
      title: "Recovery is part of trust",
      text: "A premium marketplace cannot feel disposable when someone loses access to a paid organizer or venue account.",
      Icon: ShieldCheck,
    },
    {
      title: "The route already exists",
      text: "This recovery surface is already in place so live email delivery can slot in without redesigning the frontend.",
      Icon: Mail,
    },
    {
      title: "Operator continuity matters",
      text: "Admin, organizer, and venue users all need to see that account access is handled like infrastructure, not an afterthought.",
      Icon: KeyRound,
    },
  ],
  "reset-password": [
    {
      title: "The reset surface is complete",
      text: "The token and password state already exist so the real recovery provider can slot in later without visual churn.",
      Icon: KeyRound,
    },
    {
      title: "Return to the right portal fast",
      text: "Once reset is done, the flow can send people back into their correct member, organizer, venue, or admin lane.",
      Icon: ArrowRight,
    },
    {
      title: "Clean recovery supports trust",
      text: "Good products do not let the account edge cases break the premium feeling of the rest of the experience.",
      Icon: ShieldCheck,
    },
  ],
};

const recoveryHighlights = ["Support continuity", "Route complete", "Vendor-ready later"];

export function AuthPanel({
  mode,
  eyebrow,
  title,
  description,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: AuthPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    displayName: "",
    email: "",
    password: MOCK_PASSWORD_HINT,
    confirmPassword: MOCK_PASSWORD_HINT,
    token: "",
    locale: "en",
    requestedAccountType: "user",
  });

  const isSignup = mode === "signup";
  const isForgot = mode === "forgot-password";
  const isReset = mode === "reset-password";
  const urlResetToken = searchParams.get("token_hash") ?? searchParams.get("token") ?? "";
  const resolvedResetToken = form.token || urlResetToken;
  const activeRole =
    roleOptions.find((option) => option.value === form.requestedAccountType) ?? roleOptions[0];
  const nextRoute = portalPathForRole(activeRole.value);
  const flowSteps =
    mode === "signup"
      ? ["Account", "Role", "Onboarding", "Dashboard"]
      : mode === "login"
        ? ["Email", "Password", "Role redirect"]
        : mode === "forgot-password"
        ? ["Email", "Recovery email", "Reset route"]
        : ["Token", "New password", "Portal return"];

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submitForm() {
    const endpoint =
      mode === "signup"
        ? "/api/auth/signup"
        : mode === "forgot-password"
          ? "/api/auth/forgot-password"
          : mode === "reset-password"
            ? "/api/auth/reset-password"
          : "/api/auth/login";

    const body = isSignup
      ? {
          displayName: form.displayName,
          email: form.email,
          password: form.password,
          locale: form.locale,
          requestedAccountType: form.requestedAccountType,
          interests: [],
          avatarUrl: "",
        }
      : isForgot
        ? { email: form.email }
        : isReset
          ? {
              token: resolvedResetToken,
              password: form.password,
              confirmPassword: form.confirmPassword,
            }
          : { email: form.email, password: form.password };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const payload = (await response.json()) as {
      ok?: boolean;
      data?: { redirectTo?: string; message?: string };
      details?: {
        formErrors?: string[];
        fieldErrors?: Record<string, string[]>;
      };
      note?: string;
    };

    if (!response.ok || !payload.ok) {
      setSuccess("");
      setError(
        payload.details?.formErrors?.[0] ??
          payload.note ??
          "Something went wrong while processing the request.",
      );
      return;
    }

    setError("");
    setSuccess(payload.data?.message ?? "Success.");

    if (payload.data?.redirectTo) {
      router.push(payload.data.redirectTo as Route);
      router.refresh();
    }
  }

  return (
    <div className="paper-panel overflow-hidden rounded-[2rem]">
      <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="bg-[linear-gradient(160deg,#1e1b2e_0%,#262243_42%,#3a2c5f_100%)] px-8 py-10 text-white lg:px-10 lg:py-12">
          <span className="eyebrow bg-white/10 px-4 py-2 text-white/74">{eyebrow}</span>
          <h1 className="font-editorial mt-6 text-4xl leading-tight tracking-[-0.05em]">
            {title}
          </h1>
          <p className="mt-4 max-w-md text-sm leading-7 text-white/74">{description}</p>

          <div className="mt-8 flex flex-wrap gap-2">
            {flowSteps.map((item, index) => (
              <span
                key={item}
                className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white/72"
              >
                {index + 1}. {item}
              </span>
            ))}
          </div>

          <div className="mt-10 space-y-3">
            {modeHighlights[mode].map((item) => (
              <div
                key={item.title}
                className="rounded-[1.2rem] border border-white/10 bg-white/6 px-4 py-4"
              >
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white">
                    <item.Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="font-semibold text-white">{item.title}</div>
                    <p className="mt-2 text-sm leading-7 text-white/68">{item.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {mode === "login" ? (
            <div className="mt-10">
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-white/52">
                Demo accounts
              </div>
              <div className="mt-4 space-y-3">
                {demoAuthAccounts.map((account) => (
                  <button
                    key={account.email}
                    type="button"
                    onClick={() => {
                      setForm((current) => ({
                        ...current,
                        displayName: account.displayName,
                        email: account.email,
                        password: account.passwordHint,
                        requestedAccountType: account.accountType,
                      }));
                    }}
                    className="block w-full rounded-[1.2rem] border border-white/10 bg-white/6 px-4 py-3 text-left transition hover:bg-white/10"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold text-white">{account.displayName}</div>
                      <span className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white/72">
                        {account.accountType}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-white/60">
                      {account.email} · password: {account.passwordHint}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="bg-white px-8 py-10 lg:px-10 lg:py-12">
          <div className="rounded-[1.35rem] border border-[rgba(79,70,229,0.1)] bg-[rgba(245,240,232,0.68)] px-4 py-4">
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-text-light)]">
              {isSignup ? "Selected lane" : mode === "login" ? "Current redirect lane" : "Flow state"}
            </div>
            <div className="mt-2 flex items-start gap-3">
              <span className="editorial-icon-chip">
                {isForgot || isReset ? (
                  <KeyRound className="h-4 w-4" />
                ) : (
                  <activeRole.Icon className="h-4 w-4" />
                )}
              </span>
              <div>
                <div className="font-semibold text-[var(--brand-text)]">
                  {isForgot || isReset ? "Account recovery" : activeRole.title}
                </div>
                <p className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">
                  {isForgot
                    ? "Send a recovery email first, then complete the reset route without changing the overall auth design."
                    : isReset
                      ? "Set a new password now, then return to the correct role-based portal without rebuilding the flow later."
                      : activeRole.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(isForgot || isReset ? recoveryHighlights : activeRole.highlights).map(
                    (highlight) => (
                      <span
                        key={highlight}
                        className="rounded-full bg-[rgba(79,70,229,0.08)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--brand-indigo)]"
                      >
                        {highlight}
                      </span>
                    ),
                  )}
                </div>
                {isForgot || isReset ? null : (
                  <div className="mt-3 text-sm font-semibold text-[var(--brand-indigo)]">
                    Destination after auth: {nextRoute}
                  </div>
                )}
              </div>
            </div>
          </div>

          <form
            className="mt-6 space-y-5"
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              startTransition(() => {
                void submitForm();
              });
            }}
          >
            {isSignup ? (
              <>
                <label className="block text-sm font-semibold text-[var(--brand-text)]">
                  Display name
                  <input
                    id="auth-display-name"
                    name="displayName"
                    value={form.displayName}
                    onChange={(event) => updateField("displayName", event.target.value)}
                    placeholder="Your public name"
                    autoComplete="name"
                    className={inputClassName}
                  />
                </label>

                <div>
                  <div className="text-sm font-semibold text-[var(--brand-text)]">
                    Choose your account lane
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {roleOptions.map((option) => {
                      const selected = option.value === activeRole.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => updateField("requestedAccountType", option.value)}
                          className={`rounded-[1.35rem] border px-4 py-4 text-left transition ${
                            selected
                              ? "border-[rgba(79,70,229,0.24)] bg-[rgba(79,70,229,0.08)] shadow-[0_16px_30px_rgba(42,38,56,0.08)]"
                              : "border-[rgba(153,148,168,0.14)] bg-white hover:border-[rgba(79,70,229,0.18)]"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="editorial-icon-chip">
                              <option.Icon className="h-4 w-4" />
                            </span>
                            <div>
                              <div className="font-semibold text-[var(--brand-text)]">
                                {option.label}
                              </div>
                              <p className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">
                                {option.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : null}

            {isReset ? null : (
              <label className="block text-sm font-semibold text-[var(--brand-text)]">
                Email
                <input
                  id="auth-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  aria-invalid={Boolean(error)}
                  className={inputClassName}
                />
              </label>
            )}

            {isForgot ? null : (
              <label className="block text-sm font-semibold text-[var(--brand-text)]">
                Password
                <input
                  id="auth-password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={(event) => updateField("password", event.target.value)}
                  placeholder="Minimum 8 characters"
                  autoComplete={isReset ? "new-password" : isSignup ? "new-password" : "current-password"}
                  className={inputClassName}
                />
              </label>
            )}

            {isReset ? (
              <>
                <label className="block text-sm font-semibold text-[var(--brand-text)]">
                  Reset token
                  <input
                    id="auth-reset-token"
                    name="token"
                    value={resolvedResetToken}
                    onChange={(event) => updateField("token", event.target.value)}
                    placeholder="Token from recovery email"
                    autoComplete="one-time-code"
                    autoCapitalize="none"
                    spellCheck={false}
                    className={inputClassName}
                  />
                </label>

                <label className="block text-sm font-semibold text-[var(--brand-text)]">
                  Confirm password
                  <input
                    id="auth-confirm-password"
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={(event) => updateField("confirmPassword", event.target.value)}
                    placeholder="Repeat your new password"
                    autoComplete="new-password"
                    className={inputClassName}
                  />
                </label>
              </>
            ) : null}

            {isSignup ? (
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-[var(--brand-text)]">
                  Locale
                  <select
                    id="auth-locale"
                    name="locale"
                    value={form.locale}
                    onChange={(event) => updateField("locale", event.target.value)}
                    className={inputClassName}
                  >
                    <option value="en">English</option>
                    <option value="is">Icelandic</option>
                  </select>
                </label>

                <div className="rounded-[1.35rem] border border-[rgba(232,97,77,0.14)] bg-[rgba(232,97,77,0.06)] px-4 py-4">
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-coral-dark)]">
                    What happens next
                  </div>
                  <p className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">
                    You will continue into onboarding, set language and interests, and then land in{" "}
                    <span className="font-semibold text-[var(--brand-text)]">{nextRoute}</span>.
                  </p>
                </div>
              </div>
            ) : null}

            {error ? (
              <div
                role="alert"
                className="rounded-[1.2rem] border border-[rgba(232,97,77,0.16)] bg-[rgba(232,97,77,0.08)] px-4 py-3 text-sm text-[var(--brand-coral-dark)]"
              >
                {error}
              </div>
            ) : null}

            {success ? (
              <div
                role="status"
                aria-live="polite"
                className="rounded-[1.2rem] border border-[rgba(124,154,130,0.22)] bg-[rgba(124,154,130,0.12)] px-4 py-3 text-sm text-[var(--brand-sage-dark)]"
              >
                {success}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isPending}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--brand-coral)] px-5 py-3 text-sm font-bold text-white shadow-[0_16px_42px_rgba(232,97,77,0.24)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {primaryLabel}
              <ArrowRight className="h-4 w-4" />
            </button>

            {mode === "login" ? (
              <Link
                href={"/forgot-password" as Route}
                className="block text-center text-sm font-semibold text-[var(--brand-text-muted)]"
              >
                Forgot password?
              </Link>
            ) : null}

            {mode !== "forgot-password" && mode !== "reset-password" ? (
              <div className="grid gap-3 sm:grid-cols-3">
                {["Google", "Facebook", "Apple"].map((provider) => (
                  <button
                    key={provider}
                    type="button"
                    disabled
                    className="rounded-full border border-[var(--brand-border)] px-4 py-3 text-sm font-semibold text-[var(--brand-text)] opacity-60"
                  >
                    {provider} soon
                  </button>
                ))}
              </div>
            ) : null}

            <Link
              href={secondaryHref as Route}
              className="block text-center text-sm font-bold text-[var(--brand-indigo)]"
            >
              {secondaryLabel}
            </Link>
          </form>

          <div className="mt-8 rounded-[1.3rem] border border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.82)] px-4 py-4 text-sm leading-7 text-[var(--brand-text-muted)]">
            <div className="flex items-center gap-2 font-semibold text-[var(--brand-text)]">
              <Mail className="h-4 w-4 text-[var(--brand-indigo)]" />
              Current auth mode
            </div>
            <p className="mt-2">
              {mode === "signup"
                ? "Signup stores the selected role, creates the account, and continues into onboarding so the correct portal opens afterward."
                : mode === "forgot-password"
                  ? "Recovery sends a reset email when live auth is enabled and keeps the same route shape during local fallback."
                  : mode === "reset-password"
                    ? "Reset accepts the recovery token from the email link and returns the user to login once the password is updated."
                    : "Login accepts the seeded demo accounts shown on the left and redirects by role into the appropriate dashboard."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
