"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { portalPathForRole } from "@/lib/auth/mock-auth-config";
import { cn } from "@/lib/utils";
import type { AccountType } from "@/types/domain";

type NavigationItem = {
  href: Route;
  label: string;
};

type SiteHeaderClientProps = {
  navigation: readonly NavigationItem[];
  session: { accountType: AccountType } | null;
  labels: {
    admin: string;
    venuePortal: string;
    organizerHub: string;
    dashboard: string;
    signin: string;
    signup: string;
    portal: string;
    join: string;
  };
};

function isActivePath(pathname: string, href: Route) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function portalLabel(
  accountType: AccountType,
  labels: SiteHeaderClientProps["labels"],
) {
  switch (accountType) {
    case "admin":
      return labels.admin;
    case "venue":
      return labels.venuePortal;
    case "organizer":
      return labels.organizerHub;
    case "user":
    default:
      return labels.dashboard;
  }
}

export function SiteHeaderClient({
  navigation,
  session,
  labels,
}: SiteHeaderClientProps) {
  const pathname = usePathname();
  const activePath = pathname ?? "/";
  const portalHref = session ? (portalPathForRole(session.accountType) as Route) : null;

  return (
    <>
      <div className="hidden flex-1 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center lg:gap-5">
        <div aria-hidden="true" />

        <nav className="site-header-nav-frame justify-self-center">
          {navigation.map((item) => {
            const active = isActivePath(activePath, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "site-header-nav-link inline-flex min-h-11 items-center rounded-full px-4 py-2.5 text-sm font-semibold transition",
                  active
                    ? "site-header-nav-link-active bg-[var(--brand-indigo)] text-white"
                    : "text-[var(--brand-text-muted)] hover:bg-white hover:text-[var(--brand-indigo)]",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="site-header-actions justify-self-end">
          <div className="site-header-utility-frame">
            <LocaleSwitcher compact />
            <span className="site-header-utility-separator" aria-hidden="true" />
            {session && portalHref ? (
              <SignOutButton className="site-header-utility-link min-h-9 border-transparent bg-transparent px-3 py-2 text-sm shadow-none hover:border-transparent hover:bg-[rgba(79,70,229,0.08)]" />
            ) : (
              <Link
                href="/login"
                className="site-header-utility-link text-sm font-semibold text-[var(--brand-text)] transition-colors hover:text-[var(--brand-indigo)]"
              >
                {labels.signin}
              </Link>
            )}
          </div>

          {session && portalHref ? (
            <Link
              href={portalHref}
              className="site-header-cta inline-flex items-center justify-center rounded-full bg-[var(--brand-indigo)] px-5 py-3 text-sm font-bold text-white shadow-[0_16px_40px_rgba(79,70,229,0.18)] transition-transform hover:-translate-y-0.5"
            >
              {portalLabel(session.accountType, labels)}
            </Link>
          ) : (
            <Link
              href="/signup"
              className="site-header-cta inline-flex items-center justify-center rounded-full bg-[var(--brand-coral)] px-5 py-3 text-sm font-bold text-white shadow-[0_16px_40px_rgba(232,97,77,0.22)] transition-transform hover:-translate-y-0.5"
            >
              {labels.signup}
            </Link>
          )}
        </div>
      </div>

      {session && portalHref ? (
        <Link
          href={portalHref}
          className="inline-flex items-center justify-center rounded-full bg-[var(--brand-indigo)] px-4 py-2.5 text-sm font-bold text-white lg:hidden"
        >
          {labels.portal}
        </Link>
      ) : (
        <Link
          href="/signup"
          className="site-header-cta inline-flex items-center justify-center rounded-full bg-[var(--brand-coral)] px-4 py-2.5 text-sm font-bold text-white lg:hidden"
        >
          {labels.join}
        </Link>
      )}
    </>
  );
}

export function SiteHeaderMobileNav({
  navigation,
}: {
  navigation: readonly NavigationItem[];
}) {
  const pathname = usePathname();
  const activePath = pathname ?? "/";

  return (
    <div className="section-shell pb-3 lg:hidden">
      <nav className="site-mobile-nav-shell flex gap-3 overflow-x-auto pb-1">
        {navigation.map((item) => {
          const active = isActivePath(activePath, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "site-mobile-nav-link min-h-11 rounded-full border px-4 py-2 text-sm font-medium shadow-[0_10px_24px_rgba(42,38,56,0.05)] transition",
                active
                  ? "border-[var(--brand-indigo)] bg-[var(--brand-indigo)] text-white"
                  : "border-[var(--brand-border)] bg-white/74 text-[var(--brand-text-muted)]",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
