"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Menu, Search, X } from "lucide-react";

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
  secondaryNavigation: readonly NavigationItem[];
  session: { accountType: AccountType } | null;
  moreLabel: string;
  menuLabel: string;
  closeLabel: string;
  searchLabel: string;
  searchPlaceholder: string;
  searchOverlayLabels?: {
    recentSearches: string;
    noRecentSearches: string;
    browse: string;
    popularCategories: string;
  };
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

/* -------------------------------------------------------------------------- */
/*  Desktop "More" dropdown                                                   */
/* -------------------------------------------------------------------------- */

function MoreDropdown({
  items,
  label,
}: {
  items: readonly NavigationItem[];
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const activePath = pathname ?? "/";

  const close = useCallback(() => setOpen(false), []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        close();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, close]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, close]);

  const hasActive = items.some((i) => isActivePath(activePath, i.href));

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[0.8125rem] font-semibold tracking-[-0.01em] transition-all duration-200",
          hasActive
            ? "bg-brand-indigo text-white shadow-sm"
            : "text-gray-800 hover:bg-gray-100 hover:text-gray-900",
        )}
      >
        {label}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {/* Dropdown panel */}
      <div
        className={cn(
          "absolute right-0 top-full z-50 mt-2.5 min-w-[220px] origin-top-right rounded-xl border border-gray-200 bg-white py-1.5 shadow-xl ring-1 ring-black/[0.03] transition-all duration-200",
          open
            ? "scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0",
        )}
        role="menu"
      >
        {items.map((item) => {
          const active = isActivePath(activePath, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              onClick={close}
              className={cn(
                "block px-4 py-2.5 text-[0.8125rem] font-medium transition-colors",
                active
                  ? "bg-brand-indigo/8 text-brand-indigo"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Mobile drawer                                                             */
/* -------------------------------------------------------------------------- */

function MobileDrawer({
  open,
  onClose,
  navigation,
  secondaryNavigation,
  session,
  labels,
  closeLabel,
}: {
  open: boolean;
  onClose: () => void;
  navigation: readonly NavigationItem[];
  secondaryNavigation: readonly NavigationItem[];
  session: SiteHeaderClientProps["session"];
  labels: SiteHeaderClientProps["labels"];
  closeLabel: string;
}) {
  const pathname = usePathname();
  const activePath = pathname ?? "/";
  const portalHref = session
    ? (portalPathForRole(session.accountType) as Route)
    : null;

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-300",
          open
            ? "opacity-100"
            : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          "fixed inset-y-0 right-0 z-[70] flex w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Close button */}
        <div className="flex items-center justify-end px-5 pt-4">
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition hover:bg-gray-200 hover:text-gray-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <nav className="flex-1 overflow-y-auto px-5 pb-8">
          {/* Primary links */}
          <ul className="space-y-0.5 pt-2">
            {navigation.map((item) => {
              const active = isActivePath(activePath, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block rounded-xl px-4 py-3 text-[0.9375rem] font-semibold transition",
                      active
                        ? "bg-brand-indigo text-white"
                        : "text-gray-800 hover:bg-gray-50",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Divider */}
          <div className="my-4 border-t border-gray-100" />

          {/* Secondary links */}
          <ul className="space-y-0.5">
            {secondaryNavigation.map((item) => {
              const active = isActivePath(activePath, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block rounded-xl px-4 py-3 text-[0.9375rem] font-medium transition",
                      active
                        ? "bg-brand-indigo text-white"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Divider */}
          <div className="my-4 border-t border-gray-100" />

          {/* Auth section */}
          <div className="space-y-2.5">
            {session && portalHref ? (
              <>
                <Link
                  href={portalHref}
                  onClick={onClose}
                  className="block w-full rounded-full bg-brand-indigo px-5 py-3 text-center text-sm font-bold text-white transition hover:opacity-90"
                >
                  {portalLabel(session.accountType, labels)}
                </Link>
                <SignOutButton className="w-full min-h-10 border-transparent bg-transparent px-3 py-2 text-sm shadow-none hover:border-transparent hover:bg-gray-50" />
              </>
            ) : (
              <>
                <Link
                  href="/signup"
                  onClick={onClose}
                  className="block w-full rounded-full bg-brand-coral px-5 py-3 text-center text-sm font-bold text-white shadow-md transition hover:opacity-90"
                >
                  {labels.signup}
                </Link>
                <Link
                  href="/login"
                  onClick={onClose}
                  className="block w-full rounded-full border-2 border-gray-200 px-5 py-3 text-center text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                >
                  {labels.signin}
                </Link>
              </>
            )}
          </div>

          {/* Locale switcher */}
          <div className="mt-6">
            <LocaleSwitcher />
          </div>
        </nav>
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Search overlay                                                            */
/* -------------------------------------------------------------------------- */

function SearchOverlay({
  open,
  onClose,
  placeholder,
  overlayLabels,
}: {
  open: boolean;
  placeholder: string;
  onClose: () => void;
  overlayLabels?: {
    recentSearches: string;
    noRecentSearches: string;
    browse: string;
    popularCategories: string;
  };
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Cmd+K / Ctrl+K global shortcut
  useEffect(() => {
    function handleGlobalKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (!open) {
          // Parent will handle opening, but we prevent default
        }
      }
    }
    document.addEventListener("keydown", handleGlobalKey);
    return () => document.removeEventListener("keydown", handleGlobalKey);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 backdrop-blur-sm pt-20 sm:pt-32"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="mx-4 w-full max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl ring-1 ring-black/[0.03]">
        {/* Top accent border */}
        <div className="h-0.5 bg-gradient-to-r from-brand-indigo via-brand-coral to-brand-indigo" />

        <div className="p-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const q = inputRef.current?.value.trim();
              if (q) {
                router.push(`/events?q=${encodeURIComponent(q)}` as Route);
                onClose();
              }
            }}
          >
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 shrink-0 text-gray-400" />
              <input
                ref={inputRef}
                type="search"
                placeholder={placeholder}
                className="flex-1 bg-transparent text-base text-gray-900 outline-none placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-md border border-gray-200 px-2 py-1 text-[0.6875rem] font-medium text-gray-500 transition hover:bg-gray-50"
              >
                Esc
              </button>
            </div>
          </form>

          {/* Recent searches placeholder */}
          <div className="mt-5 border-t border-gray-100 pt-4">
            <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-gray-400">
              {overlayLabels?.recentSearches ?? "Recent searches"}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              {overlayLabels?.noRecentSearches ?? "No recent searches"}
            </p>
          </div>

          {/* Quick links */}
          <div className="mt-4 border-t border-gray-100 pt-4">
            <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-gray-400">
              {overlayLabels?.browse ?? "Browse"}
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {[
                { label: "Events", href: "/events" },
                { label: "Groups", href: "/groups" },
                { label: "Venues", href: "/venues" },
              ].map((link) => (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => {
                    router.push(link.href as Route);
                    onClose();
                  }}
                  className="rounded-full border border-gray-200 bg-gray-50 px-3.5 py-1.5 text-sm font-semibold text-gray-700 transition hover:border-brand-indigo hover:bg-brand-indigo/5 hover:text-brand-indigo"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          {/* Popular categories */}
          <div className="mt-4 border-t border-gray-100 pt-4">
            <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-gray-400">
              {overlayLabels?.popularCategories ?? "Popular categories"}
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {["Music", "Tech", "Art", "Outdoors", "Food"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    router.push(`/events?category=${encodeURIComponent(tag.toLowerCase())}` as Route);
                    onClose();
                  }}
                  className="rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition hover:border-brand-indigo hover:bg-brand-indigo/5 hover:text-brand-indigo"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main client header                                                        */
/* -------------------------------------------------------------------------- */

export function SiteHeaderClient({
  navigation,
  secondaryNavigation,
  session,
  moreLabel,
  menuLabel,
  closeLabel,
  searchLabel,
  searchPlaceholder,
  searchOverlayLabels,
  labels,
}: SiteHeaderClientProps) {
  const pathname = usePathname();
  const activePath = pathname ?? "/";
  const portalHref = session
    ? (portalPathForRole(session.accountType) as Route)
    : null;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const [searchOpen, setSearchOpen] = useState(false);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // Cmd+K / Ctrl+K to open search
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <>
      {/* ──────────────── Desktop ──────────────── */}
      <div className="hidden flex-1 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center lg:gap-6">
        <div aria-hidden="true" />

        <nav className="flex items-center gap-0.5 justify-self-center">
          {navigation.map((item) => {
            const active = isActivePath(activePath, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative inline-flex items-center rounded-lg px-4 py-2 text-[0.8125rem] font-semibold tracking-[-0.01em] transition-all duration-200",
                  active
                    ? "bg-brand-indigo text-white shadow-sm [text-shadow:0_1px_2px_rgba(0,0,0,0.2)]"
                    : "text-gray-800 hover:bg-gray-100 hover:text-gray-900",
                )}
              >
                {item.label}
                {!active && (
                  <span className="absolute bottom-1 left-4 right-4 h-[1.5px] origin-left scale-x-0 rounded-full bg-brand-indigo transition-transform duration-200 group-hover:scale-x-100" />
                )}
              </Link>
            );
          })}

          <MoreDropdown items={secondaryNavigation} label={moreLabel} />
        </nav>

        <div className="flex items-center gap-2.5 justify-self-end">
          {/* Search */}
          <button
            type="button"
            aria-label={searchLabel}
            onClick={() => setSearchOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-1.5 text-sm text-gray-500 transition hover:border-gray-300 hover:bg-gray-100"
          >
            <Search className="h-3.5 w-3.5" />
            <kbd className="hidden text-[0.625rem] font-medium text-gray-400 xl:inline-block">
              ⌘K
            </kbd>
          </button>

          {/* Divider */}
          <div className="mx-1 h-5 w-px bg-gray-200" />

          {/* Locale */}
          <LocaleSwitcher compact />

          {/* Auth */}
          {session && portalHref ? (
            <>
              <SignOutButton className="min-h-9 border-transparent bg-transparent px-3 py-2 text-sm font-medium text-gray-600 shadow-none hover:border-transparent hover:bg-gray-100 hover:text-gray-900" />
              <Link
                href={portalHref}
                className="inline-flex items-center justify-center rounded-full bg-brand-indigo px-5 py-2.5 text-[0.8125rem] font-bold text-white shadow-sm transition hover:shadow-md hover:brightness-110"
              >
                {portalLabel(session.accountType, labels)}
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-[0.8125rem] font-semibold text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                {labels.signin}
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-full bg-brand-coral px-5 py-2.5 text-[0.8125rem] font-bold text-white shadow-sm transition hover:shadow-md hover:brightness-110"
              >
                {labels.signup}
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ──────────────── Mobile hamburger button ──────────────── */}
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        aria-label={menuLabel}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700 transition hover:bg-gray-200 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile drawer */}
      <MobileDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        navigation={navigation}
        secondaryNavigation={secondaryNavigation}
        session={session}
        labels={labels}
        closeLabel={closeLabel}
      />

      {/* Search overlay */}
      <SearchOverlay
        open={searchOpen}
        onClose={closeSearch}
        placeholder={searchPlaceholder}
        overlayLabels={searchOverlayLabels}
      />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Mobile sub-header pills                                                   */
/* -------------------------------------------------------------------------- */

export function SiteHeaderMobileNav({
  navigation,
  secondaryNavigation,
}: {
  navigation: readonly NavigationItem[];
  secondaryNavigation: readonly NavigationItem[];
}) {
  const pathname = usePathname();
  const activePath = pathname ?? "/";
  const allItems = [...navigation, ...secondaryNavigation];

  return (
    <div className="section-shell pb-2 lg:hidden">
      <div className="relative">
        {/* Left fade */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-8 bg-gradient-to-r from-[var(--brand-sand-light)] to-transparent" />
        {/* Right fade */}
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-[var(--brand-sand-light)] to-transparent" />
        <nav className="flex gap-2 overflow-x-auto scrollbar-hide px-2">
          {allItems.map((item) => {
            const active = isActivePath(activePath, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-1.5 text-[0.8125rem] font-semibold transition",
                  active
                    ? "bg-brand-indigo text-white shadow-sm"
                    : "bg-white text-gray-600 shadow-sm ring-1 ring-gray-200 hover:ring-brand-indigo/30 hover:text-gray-900",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
