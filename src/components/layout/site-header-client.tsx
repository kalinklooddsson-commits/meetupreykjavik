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
          "inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition",
          hasActive
            ? "bg-brand-indigo text-white"
            : "text-brand-text-muted hover:bg-brand-indigo/6 hover:text-brand-text",
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
          "absolute right-0 top-full z-50 mt-2 min-w-[200px] origin-top-right rounded-xl border border-brand-border bg-white py-2 shadow-lg transition-all duration-200",
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
                "block px-4 py-2 text-sm font-medium transition",
                active
                  ? "bg-brand-indigo/8 text-brand-indigo"
                  : "text-brand-text hover:bg-brand-indigo/4 hover:text-brand-indigo",
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
          "fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300",
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
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-brand-text-muted transition hover:bg-brand-indigo/6 hover:text-brand-text"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <nav className="flex-1 overflow-y-auto px-5 pb-8">
          {/* Primary links */}
          <ul className="space-y-1 pt-2">
            {navigation.map((item) => {
              const active = isActivePath(activePath, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block rounded-lg px-3 py-2.5 text-base font-medium transition",
                      active
                        ? "bg-brand-indigo text-white"
                        : "text-brand-text hover:bg-brand-indigo/6",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Divider */}
          <div className="my-4 border-t border-brand-border" />

          {/* Secondary links */}
          <ul className="space-y-1">
            {secondaryNavigation.map((item) => {
              const active = isActivePath(activePath, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block rounded-lg px-3 py-2.5 text-base font-medium transition",
                      active
                        ? "bg-brand-indigo text-white"
                        : "text-brand-text-muted hover:bg-brand-indigo/6 hover:text-brand-text",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Divider */}
          <div className="my-4 border-t border-brand-border" />

          {/* Auth section */}
          <div className="space-y-2">
            {session && portalHref ? (
              <>
                <Link
                  href={portalHref}
                  onClick={onClose}
                  className="block w-full rounded-full bg-brand-indigo px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:opacity-90"
                >
                  {portalLabel(session.accountType, labels)}
                </Link>
                <SignOutButton className="w-full min-h-9 border-transparent bg-transparent px-3 py-2 text-sm shadow-none hover:border-transparent hover:bg-brand-indigo/8" />
              </>
            ) : (
              <>
                <Link
                  href="/signup"
                  onClick={onClose}
                  className="block w-full rounded-full bg-brand-coral px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:opacity-90"
                >
                  {labels.signup}
                </Link>
                <Link
                  href="/login"
                  onClick={onClose}
                  className="block w-full rounded-full border border-brand-border px-4 py-2.5 text-center text-sm font-medium text-brand-text transition hover:bg-brand-indigo/6"
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
}: {
  open: boolean;
  placeholder: string;
  onClose: () => void;
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
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 pt-20 sm:pt-32">
      <div className="mx-4 w-full max-w-lg rounded-2xl border border-brand-border bg-white p-4 shadow-2xl">
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
              className="shrink-0 rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-500"
            >
              Esc
            </button>
          </div>
        </form>
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
      <div className="hidden flex-1 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center lg:gap-5">
        <div aria-hidden="true" />

        <nav className="flex items-center gap-1 justify-self-center">
          {navigation.map((item) => {
            const active = isActivePath(activePath, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium transition",
                  active
                    ? "bg-brand-indigo text-white"
                    : "text-brand-text-muted hover:bg-brand-indigo/6 hover:text-brand-text",
                )}
              >
                {item.label}
              </Link>
            );
          })}

          <MoreDropdown items={secondaryNavigation} label={moreLabel} />
        </nav>

        <div className="flex items-center gap-3 justify-self-end">
          <button
            type="button"
            aria-label={searchLabel}
            onClick={() => setSearchOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-brand-text-muted transition hover:bg-brand-indigo/6 hover:text-brand-text"
          >
            <Search className="h-4 w-4" />
            <kbd className="hidden rounded border border-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 xl:inline-block">
              ⌘K
            </kbd>
          </button>
          <LocaleSwitcher compact />
          {session && portalHref ? (
            <>
              <SignOutButton className="min-h-9 border-transparent bg-transparent px-3 py-2 text-sm shadow-none hover:border-transparent hover:bg-brand-indigo/8" />
              <Link
                href={portalHref}
                className="inline-flex items-center justify-center rounded-full bg-brand-indigo px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                {portalLabel(session.accountType, labels)}
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-brand-text transition-colors hover:text-brand-indigo"
              >
                {labels.signin}
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-full bg-brand-coral px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
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
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-brand-text transition hover:bg-brand-indigo/6 lg:hidden"
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
      <nav className="flex gap-2 overflow-x-auto">
        {allItems.map((item) => {
          const active = isActivePath(activePath, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "shrink-0 rounded-lg border px-3 py-1.5 text-sm font-medium transition",
                active
                  ? "border-brand-indigo bg-brand-indigo text-white"
                  : "border-brand-border bg-white text-brand-text-muted",
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
