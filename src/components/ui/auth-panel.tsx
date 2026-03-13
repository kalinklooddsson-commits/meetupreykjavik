"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  Compass,
  ShieldCheck,
  Store,
  UsersRound,
} from "lucide-react";
import type { Route } from "next";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";

import {
  demoAuthAccounts,
} from "@/lib/auth/mock-auth-config";
import { refreshUser } from "@/hooks/use-user";
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
  "mt-1.5 w-full rounded-xl border border-brand-border bg-white px-4 py-3 text-sm text-brand-text outline-none transition-colors focus-visible:border-brand-indigo focus-visible:ring-2 focus-visible:ring-[rgba(79,70,229,0.1)]";

const roleIcons: Record<string, typeof UsersRound> = {
  member: UsersRound,
  organizer: CalendarDays,
  venuePartner: Store,
  admin: ShieldCheck,
};

const roleValues: Array<{ key: string; value: AccountType }> = [
  { key: "member", value: "user" },
  { key: "organizer", value: "organizer" },
  { key: "venuePartner", value: "venue" },
  // Admin role is not selectable from signup — only assignable by an existing admin
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
  const tFields = useTranslations("auth.fields");
  const tRoles = useTranslations("auth.roles");
  const tAuth = useTranslations("auth");
  const tErrors = useTranslations("auth.errors");
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
  const urlResetToken = searchParams.get("token_hash") ?? searchParams.get("token") ?? "";
  const resolvedResetToken = form.token || urlResetToken;
  const activeRoleValue = form.requestedAccountType;

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
          tErrors("generic"),
      );
      return;
    }

    setError("");
    setSuccess(payload.data?.message ?? tErrors("success"));

    if (payload.data?.redirectTo) {
      refreshUser();
      router.push(payload.data.redirectTo as Route);
      router.refresh();
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="text-center">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-brand-text">
          <Compass className="h-5 w-5 text-brand-indigo" />
          <span className="text-sm font-bold">MeetupReykjavik</span>
        </Link>
        <div className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-brand-indigo">
          {eyebrow}
        </div>
        <h1 className="font-editorial mt-2 text-3xl tracking-tight text-brand-text">
          {title}
        </h1>
        <p className="mt-2 text-sm text-brand-text-muted">{description}</p>
      </div>

      <form
        className="mt-8 space-y-4"
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
            <label className="block text-sm font-medium text-brand-text">
              {tFields("displayName")}
              <input
                name="displayName"
                value={form.displayName}
                onChange={(e) => updateField("displayName", e.target.value)}
                placeholder={tFields("displayNamePlaceholder")}
                autoComplete="name"
                className={inputClassName}
              />
            </label>

            <div>
              <div className="text-sm font-medium text-brand-text">{tFields("accountType")}</div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {roleValues.map((role) => {
                  const selected = role.value === activeRoleValue;
                  const Icon = roleIcons[role.key];
                  return (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => updateField("requestedAccountType", role.value)}
                      className={`flex items-center gap-2.5 rounded-xl border px-3 py-3 text-left text-sm transition ${
                        selected
                          ? "border-brand-indigo bg-[rgba(79,70,229,0.06)] font-semibold text-brand-indigo"
                          : "border-brand-border bg-white text-brand-text-muted hover:border-brand-indigo"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {tRoles(role.key)}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        ) : null}

        {isReset ? null : (
          <label className="block text-sm font-medium text-brand-text">
            {tFields("email")}
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              className={inputClassName}
            />
          </label>
        )}

        {isForgot ? null : (
          <label className="block text-sm font-medium text-brand-text">
            {tFields("password")}
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              placeholder={tFields("passwordPlaceholder")}
              autoComplete={isReset || isSignup ? "new-password" : "current-password"}
              className={inputClassName}
            />
          </label>
        )}

        {isReset ? (
          <>
            <label className="block text-sm font-medium text-brand-text">
              {tFields("resetToken")}
              <input
                name="token"
                value={resolvedResetToken}
                onChange={(e) => updateField("token", e.target.value)}
                placeholder={tFields("resetTokenPlaceholder")}
                autoComplete="one-time-code"
                className={inputClassName}
              />
            </label>
            <label className="block text-sm font-medium text-brand-text">
              {tFields("confirmPassword")}
              <input
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => updateField("confirmPassword", e.target.value)}
                placeholder={tFields("confirmPasswordPlaceholder")}
                autoComplete="new-password"
                className={inputClassName}
              />
            </label>
          </>
        ) : null}

        {isSignup ? (
          <label className="block text-sm font-medium text-brand-text">
            {tFields("language")}
            <select
              name="locale"
              value={form.locale}
              onChange={(e) => updateField("locale", e.target.value)}
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
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        ) : null}

        {success ? (
          <div
            role="status"
            className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
          >
            {success}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-coral px-5 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {primaryLabel}
          <ArrowRight className="h-4 w-4" />
        </button>

        {mode === "login" ? (
          <Link
            href={"/forgot-password" as Route}
            className="block text-center text-sm text-brand-text-muted hover:text-brand-indigo"
          >
            {tAuth("login.forgotPassword")}
          </Link>
        ) : null}

        <Link
          href={secondaryHref as Route}
          className="block text-center text-sm font-semibold text-brand-indigo"
        >
          {secondaryLabel}
        </Link>
      </form>

      {mode === "login" ? (
        <div className="mt-8 border-t border-brand-border-light pt-6">
          <div className="text-xs font-bold uppercase tracking-wider text-brand-text-light">
            {tAuth("demoAccounts")}
          </div>
          <div className="mt-3 space-y-2">
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
                  // Auto-submit after filling demo credentials
                  startTransition(async () => {
                    const response = await fetch("/api/auth/login", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        email: account.email,
                        password: account.passwordHint,
                      }),
                    });
                    const payload = (await response.json()) as {
                      ok?: boolean;
                      data?: { redirectTo?: string };
                      note?: string;
                      details?: { formErrors?: string[] };
                    };
                    if (!response.ok || !payload.ok) {
                      setError(
                        payload.details?.formErrors?.[0] ??
                          payload.note ??
                          tErrors("generic"),
                      );
                      return;
                    }
                    setError("");
                    refreshUser();
                    if (payload.data?.redirectTo) {
                      router.push(payload.data.redirectTo as Route);
                      router.refresh();
                    }
                  });
                }}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-brand-border-light bg-white px-4 py-3 text-left transition hover:border-brand-indigo"
              >
                <div>
                  <div className="text-sm font-semibold text-brand-text">
                    {account.displayName}
                  </div>
                  <div className="mt-0.5 text-xs text-brand-text-muted">
                    {account.email}
                  </div>
                </div>
                <span className="rounded-full bg-[rgba(79,70,229,0.08)] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-indigo">
                  {account.accountType}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
