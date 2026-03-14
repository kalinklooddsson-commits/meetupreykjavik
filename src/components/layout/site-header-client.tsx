"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
    browseEvents: string;
    browseGroups: string;
    browseVenues: string;
    popularCategories: string;
    catMusic: string;
    catTech: string;
    catArt: string;
    catOutdoors: string;
    catFood: string;
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
            ? "bg-brand-indigo !text-white shadow-sm"
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

  // Portal to document.body to escape the <header>'s backdrop-blur
  // containing block, which clips fixed children on iOS Safari.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
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
                        ? "bg-brand-indigo !text-white"
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
                        ? "bg-brand-indigo !text-white"
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
    </>,
    document.body,
  );
}

/* -------------------------------------------------------------------------- */
/*  Search overlay                                                            */
/* -------------------------------------------------------------------------- */

type SearchResult = {
  events: { slug: string; title: string; starts_at?: string }[];
  groups: { slug: string; name: string }[];
  venues: { slug: string; name: string; type?: string }[];
};

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
    browseEvents: string;
    browseGroups: string;
    browseVenues: string;
    popularCategories: string;
    catMusic: string;
    catTech: string;
    catArt: string;
    catOutdoors: string;
    catFood: string;
  };
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Build flat list of navigable results for arrow-key navigation
  const flatResults: { label: string; href: string; section: string }[] = [];
  if (results) {
    for (const e of results.events) flatResults.push({ label: e.title, href: `/events/${e.slug}`, section: "Events" });
    for (const g of results.groups) flatResults.push({ label: g.name, href: `/groups/${g.slug}`, section: "Groups" });
    for (const v of results.venues) flatResults.push({ label: v.name, href: `/venues/${v.slug}`, section: "Venues" });
  }

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      setQuery("");
      setResults(null);
      setSelectedIdx(0);
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
      }
    }
    document.addEventListener("keydown", handleGlobalKey);
    return () => document.removeEventListener("keydown", handleGlobalKey);
  }, []);

  // Debounced live search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (q.length < 2) { setResults(null); return; }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const json = await res.json();
          setResults(json.data ?? json);
          setSelectedIdx(0);
        }
      } catch { /* ignore */ }
      setLoading(false);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  function navigateTo(href: string) {
    router.push(href as Route);
    onClose();
  }

  if (!open) return null;

  const hasResults = flatResults.length > 0;
  const showDefaultContent = !query.trim() || query.trim().length < 2;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 backdrop-blur-sm pt-20 sm:pt-32"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="mx-4 w-full max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl ring-1 ring-black/[0.03]">
        <div className="h-0.5 bg-gradient-to-r from-brand-indigo via-brand-coral to-brand-indigo" />

        <div className="p-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (hasResults && flatResults[selectedIdx]) {
                navigateTo(flatResults[selectedIdx].href);
              } else if (query.trim()) {
                navigateTo(`/events?q=${encodeURIComponent(query.trim())}`);
              }
            }}
          >
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 shrink-0 text-gray-400" />
              <input
                ref={inputRef}
                type="search"
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setSelectedIdx((i) => Math.min(i + 1, flatResults.length - 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setSelectedIdx((i) => Math.max(i - 1, 0));
                  }
                }}
                className="flex-1 bg-transparent text-base text-gray-900 outline-none placeholder:text-gray-400"
              />
              {loading && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-brand-indigo" />
              )}
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-md border border-gray-200 px-2 py-1 text-[0.6875rem] font-medium text-gray-500 transition hover:bg-gray-50"
              >
                Esc
              </button>
            </div>
          </form>

          {/* Live search results */}
          {!showDefaultContent && hasResults && (
            <div className="mt-4 max-h-80 overflow-y-auto">
              {(["Events", "Groups", "Venues"] as const).map((section) => {
                const items = flatResults.filter((r) => r.section === section);
                if (items.length === 0) return null;
                return (
                  <div key={section} className="mb-3">
                    <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                      {section}
                    </p>
                    {items.map((item) => {
                      const idx = flatResults.indexOf(item);
                      return (
                        <button
                          key={item.href}
                          type="button"
                          onClick={() => navigateTo(item.href)}
                          className={`w-full text-left rounded-lg px-3 py-2 text-sm transition ${
                            idx === selectedIdx
                              ? "bg-brand-indigo/10 text-brand-indigo font-semibold"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}

          {/* No results */}
          {!showDefaultContent && !hasResults && !loading && (
            <div className="mt-4 border-t border-gray-100 pt-4">
              <p className="text-sm text-gray-500">No results found for &ldquo;{query.trim()}&rdquo;</p>
            </div>
          )}

          {/* Default browse content when no query */}
          {showDefaultContent && (
            <>
              <div className="mt-4 border-t border-gray-100 pt-4">
                <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-gray-400">
                  {overlayLabels?.browse ?? "Browse"}
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {[
                    { label: overlayLabels?.browseEvents ?? "Events", href: "/events" },
                    { label: overlayLabels?.browseGroups ?? "Groups", href: "/groups" },
                    { label: overlayLabels?.browseVenues ?? "Venues", href: "/venues" },
                  ].map((link) => (
                    <button
                      key={link.href}
                      type="button"
                      onClick={() => navigateTo(link.href)}
                      className="rounded-full border border-gray-200 bg-gray-50 px-3.5 py-1.5 text-sm font-semibold text-gray-700 transition hover:border-brand-indigo hover:bg-brand-indigo/5 hover:text-brand-indigo"
                    >
                      {link.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 border-t border-gray-100 pt-4">
                <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-gray-400">
                  {overlayLabels?.popularCategories ?? "Popular categories"}
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {[
                    { label: overlayLabels?.catMusic ?? "Music", slug: "music" },
                    { label: overlayLabels?.catTech ?? "Tech", slug: "tech" },
                    { label: overlayLabels?.catArt ?? "Art", slug: "art" },
                    { label: overlayLabels?.catOutdoors ?? "Outdoors", slug: "outdoors" },
                    { label: overlayLabels?.catFood ?? "Food", slug: "food" },
                  ].map((tag) => (
                    <button
                      key={tag.slug}
                      type="button"
                      onClick={() => navigateTo(`/events?category=${encodeURIComponent(tag.slug)}`)}
                      className="rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition hover:border-brand-indigo hover:bg-brand-indigo/5 hover:text-brand-indigo"
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
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
                    ? "bg-brand-indigo !text-white shadow-sm [text-shadow:0_1px_2px_rgba(0,0,0,0.2)]"
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
            aria-keyshortcuts="Meta+K"
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

      {/* ──────────────── Mobile search + hamburger buttons ──────────────── */}
      <div className="flex items-center gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          aria-label="Search"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700 transition hover:bg-gray-200"
        >
          <Search className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label={menuLabel}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700 transition hover:bg-gray-200"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

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

