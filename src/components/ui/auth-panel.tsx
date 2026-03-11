"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  KeyRound,
  ShieldCheck,
  Store,
  UsersRound,
} from "lucide-react";
import type { Route } from "next";
import { useState, useTransition } from "react";

import {
  demoAuthAccounts,
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
  description: string;
  Icon: typeof UsersRound;
}> = [
  {
    value: "user",
    label: "Member",
    description: "Browse events, join groups, and discover venues.",
    Icon: UsersRound,
  },
  {
    value: "organizer",
    label: "Organizer",
    description: "Create and manage events, build your audience.",
    Icon: CalendarDays,
  },
  {
    value: "venue",
    label: "Venue partner",
    description: "List your space, manage bookings and availability.",
    Icon: Store,
  },
  {
    value: "admin",
    label: "Admin",
    description: "Manage the platform, users, and content.",
    Icon: ShieldCheck,
  },
];

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
    password: "",
    confirmPassword: "",
    token: "",
    locale: "en",
    requestedAccountType: "user",
  });

  const isSignup = mode === "signup";
  const isForgot = mode === "forgot-password";
  const isReset = mode === "reset-password";
  const urlResetToken =
    searchParams.get("token_hash") ?? searchParams.get("token") ?? "";
  const resolvedResetToken = form.token || urlResetToken;
  const activeRole =
    roleOptions.find((option) => option.value === form.requestedAccountType) ??
    roleOptions[0];

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
      headers: { "Content-Type": "application/json" },
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
          "Something went wrong. Please try again.",
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
      <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Left branding panel */}
        <div className="bg-[linear-gradient(160deg,#1e1b2e_0%,#262243_42%,#3a2c5f_100%)] px-8 py-10 text-white lg:px-10 lg:py-12">
          <span className="eyebrow bg-white/10 px-4 py-2 text-white/74">
            {eyebrow}
          </span>
          <h1 className="font-editorial mt-6 text-4xl leading-tight tracking-[-0.05em]">
            {title}
          </h1>
          <p className="mt-4 max-w-md text-sm leading-7 text-white/74">
            {description}
          </p>

          {mode === "login" ? (
            <div className="mt-10">
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-white/52">
                Quick access
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
                      <div className="font-semibold text-white">
                        {account.displayName}
                      </div>
                      <span className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white/72">
                        {account.accountType}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-white/60">
                      {account.email}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {isSignup ? (
            <div className="mt-10 space-y-4">
              <div className="rounded-[1.2rem] border border-white/10 bg-white/6 px-4 py-4">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                    <UsersRound className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="font-semibold">Pick your role</div>
                    <p className="mt-1 text-sm leading-6 text-white/68">
                      Your account type determines what you can do on the
                      platform. You can change this later.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {isForgot || isReset ? (
            <div className="mt-10 space-y-4">
              <div className="rounded-[1.2rem] border border-white/10 bg-white/6 px-4 py-4">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                    <KeyRound className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="font-semibold">
                      {isForgot ? "Secure recovery" : "Almost there"}
                    </div>
                    <p className="mt-1 text-sm leading-6 text-white/68">
                      {isForgot
                        ? "Enter your email and we'll send you a link to reset your password."
                        : "Enter the code from your email and choose a new password."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Right form panel */}
        <div className="bg-white px-8 py-10 lg:px-10 lg:py-12">
          <form
            className="space-y-5"
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
                    onChange={(event) =>
                      updateField("displayName", event.target.value)
                    }
                    placeholder="Your public name"
                    autoComplete="name"
                    className={inputClassName}
                  />
                </label>

                <div>
                  <div className="text-sm font-semibold text-[var(--brand-text)]">
                    Account type
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {roleOptions.map((option) => {
                      const selected = option.value === activeRole.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            updateField("requestedAccountType", option.value)
                          }
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
                              <p className="mt-1 text-sm leading-6 text-[var(--brand-text-muted)]">
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
                  onChange={(event) =>
                    updateField("password", event.target.value)
                  }
                  placeholder={
                    isReset || isSignup
                      ? "Minimum 8 characters"
                      : "Your password"
                  }
                  autoComplete={
                    isReset || isSignup ? "new-password" : "current-password"
                  }
                  className={inputClassName}
                />
              </label>
            )}

            {isReset ? (
              <>
                <label className="block text-sm font-semibold text-[var(--brand-text)]">
                  Reset code
                  <input
                    id="auth-reset-token"
                    name="token"
                    value={resolvedResetToken}
                    onChange={(event) =>
                      updateField("token", event.target.value)
                    }
                    placeholder="Code from your email"
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
                    onChange={(event) =>
                      updateField("confirmPassword", event.target.value)
                    }
                    placeholder="Repeat your new password"
                    autoComplete="new-password"
                    className={inputClassName}
                  />
                </label>
              </>
            ) : null}

            {isSignup ? (
              <label className="block text-sm font-semibold text-[var(--brand-text)]">
                Language
                <select
                  id="auth-locale"
                  name="locale"
                  value={form.locale}
                  onChange={(event) =>
                    updateField("locale", event.target.value)
                  }
                  className={inputClassName}
                >
                  <option value="en">English</option>
                  <option value="is">Icelandic</option>
                </select>
              </label>
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
              {isPending ? "Processing..." : primaryLabel}
              {isPending ? null : <ArrowRight className="h-4 w-4" />}
            </button>

            {mode === "login" ? (
              <Link
                href={"/forgot-password" as Route}
                className="block text-center text-sm font-semibold text-[var(--brand-text-muted)]"
              >
                Forgot password?
              </Link>
            ) : null}

            <Link
              href={secondaryHref as Route}
              className="block text-center text-sm font-bold text-[var(--brand-indigo)]"
            >
              {secondaryLabel}
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
