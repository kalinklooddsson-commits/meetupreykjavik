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
  if (href === "/") return pathname === "/";
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
/*  Desktop primary nav link — minimal text link with subtle underline        */
/* -------------------------------------------------------------------------- */

function NavLink({
  href,
  label,
  active,
}: {
  href: Route;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative inline-flex items-center px-3 py-2 text-sm transition-colors duration-150",
        active
          ? "font-semibold text-brand-text"
          : "font-medium text-brand-text-muted hover:text-brand-text",
      )}
    >
      {label}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-3 -bottom-[1px] h-px bg-brand-text transition-opacity",
          active ? "opacity-100" : "opacity-0",
        )}
      />
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/*  Desktop "More" dropdown — flat list, no decoration                        */
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

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, close]);

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
          "inline-flex items-center gap-1 px-3 py-2 text-sm transition-colors duration-150",
          hasActive || open
            ? "font-semibold text-brand-text"
            : "font-medium text-brand-text-muted hover:text-brand-text",
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

      <div
        className={cn(
          "absolute right-0 top-full z-50 mt-2 min-w-[220px] overflow-hidden rounded-xl border border-brand-border-light bg-white py-1.5 shadow-[0_12px_40px_-12px_rgba(30,27,46,0.18)] transition-all duration-150",
          open
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-1 opacity-0",
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
                "block px-4 py-2 text-sm transition-colors",
                active
                  ? "font-semibold text-brand-text"
                  : "font-medium text-brand-text-muted hover:bg-brand-sand-light hover:text-brand-text",
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

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <>
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-brand-basalt/40 backdrop-blur-sm transition-opacity duration-200",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          "fixed inset-y-0 right-0 z-[70] flex w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-brand-border-light px-5 py-4">
          <span className="text-sm font-semibold text-brand-text">Menu</span>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-brand-text-muted transition hover:bg-brand-sand-light hover:text-brand-text"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-8 pt-3">
          <ul>
            {navigation.map((item) => {
              const active = isActivePath(activePath, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block rounded-lg px-3 py-3 text-base transition",
                      active
                        ? "bg-brand-sand-light font-semibold text-brand-text"
                        : "font-medium text-brand-text-muted hover:bg-brand-sand-light hover:text-brand-text",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="my-4 border-t border-brand-border-light" />

          <ul>
            {secondaryNavigation.map((item) => {
              const active = isActivePath(activePath, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block rounded-lg px-3 py-2.5 text-[0.9375rem] transition",
                      active
                        ? "font-semibold text-brand-text"
                        : "text-brand-text-muted hover:bg-brand-sand-light hover:text-brand-text",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="my-5 border-t border-brand-border-light" />

          <div className="space-y-2 px-1">
            {session && portalHref ? (
              <>
                <Link
                  href={portalHref}
                  onClick={onClose}
                  className="block w-full rounded-full bg-brand-text px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-brand-basalt"
                >
                  {portalLabel(session.accountType, labels)}
                </Link>
                <SignOutButton className="w-full min-h-11 border-transparent bg-transparent px-3 py-2 text-sm shadow-none hover:border-transparent hover:bg-brand-sand-light" />
              </>
            ) : (
              <>
                <Link
                  href="/signup"
                  onClick={onClose}
                  className="block w-full rounded-full bg-brand-text px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-brand-basalt"
                >
                  {labels.signup}
                </Link>
                <Link
                  href="/login"
                  onClick={onClose}
                  className="block w-full rounded-full border border-brand-border px-5 py-3 text-center text-sm font-medium text-brand-text transition hover:bg-brand-sand-light"
                >
                  {labels.signin}
                </Link>
              </>
            )}
          </div>

          <div className="mt-6 px-1">
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
  overlayLabels?: SiteHeaderClientProps["searchOverlayLabels"];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

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
      className="fixed inset-0 z-[60] flex items-start justify-center bg-brand-basalt/40 backdrop-blur-sm pt-20 sm:pt-32"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="mx-4 w-full max-w-lg overflow-hidden rounded-2xl border border-brand-border-light bg-white shadow-[0_24px_60px_-12px_rgba(30,27,46,0.25)]">
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
              <Search className="h-5 w-5 shrink-0 text-brand-text-light" />
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
                className="flex-1 bg-transparent text-base text-brand-text outline-none placeholder:text-brand-text-light"
              />
              {loading && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-border-light border-t-brand-text" />
              )}
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-md border border-brand-border-light px-2 py-1 text-[0.6875rem] font-medium text-brand-text-muted transition hover:bg-brand-sand-light"
              >
                Esc
              </button>
            </div>
          </form>

          {!showDefaultContent && hasResults && (
            <div className="mt-4 max-h-80 overflow-y-auto">
              {(["Events", "Groups", "Venues"] as const).map((section) => {
                const items = flatResults.filter((r) => r.section === section);
                if (items.length === 0) return null;
                return (
                  <div key={section} className="mb-3">
                    <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-brand-text-light mb-1.5">
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
                              ? "bg-brand-sand-light font-semibold text-brand-text"
                              : "text-brand-text-muted hover:bg-brand-sand-light hover:text-brand-text"
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

          {!showDefaultContent && !hasResults && !loading && (
            <div className="mt-4 border-t border-brand-border-light pt-4">
              <p className="text-sm text-brand-text-muted">No results found for &ldquo;{query.trim()}&rdquo;</p>
            </div>
          )}

          {showDefaultContent && (
            <>
              <div className="mt-4 border-t border-brand-border-light pt-4">
                <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-brand-text-light">
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
                      className="rounded-full border border-brand-border-light px-3.5 py-1.5 text-sm font-medium text-brand-text transition hover:bg-brand-sand-light"
                    >
                      {link.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 border-t border-brand-border-light pt-4">
                <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-brand-text-light">
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
                      className="rounded-full border border-brand-border-light px-3 py-1.5 text-sm text-brand-text-muted transition hover:bg-brand-sand-light hover:text-brand-text"
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

  useEffect(() => {
    setDrawerOpen(false);
    setSearchOpen(false);
  }, [pathname]);

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
      {/* Desktop */}
      <div className="hidden flex-1 lg:flex lg:items-center lg:justify-between lg:gap-6">
        <nav className="flex items-center gap-1">
          {navigation.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              active={isActivePath(activePath, item.href)}
            />
          ))}
          <MoreDropdown items={secondaryNavigation} label={moreLabel} />
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={searchLabel}
            aria-keyshortcuts="Meta+K"
            onClick={() => setSearchOpen(true)}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-brand-border-light bg-white/60 px-3 text-sm text-brand-text-muted transition hover:border-brand-border hover:bg-white"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden xl:inline">Search</span>
            <kbd className="hidden rounded border border-brand-border-light bg-brand-sand-light px-1.5 py-px text-[0.625rem] font-medium text-brand-text-light xl:inline-block">
              ⌘K
            </kbd>
          </button>

          <LocaleSwitcher compact />

          <div className="mx-1 h-5 w-px bg-brand-border-light" />

          {session && portalHref ? (
            <>
              <SignOutButton className="min-h-9 border-transparent bg-transparent px-3 py-2 text-sm font-medium text-brand-text-muted shadow-none hover:border-transparent hover:bg-brand-sand-light hover:text-brand-text" />
              <Link
                href={portalHref}
                className="inline-flex items-center justify-center rounded-full bg-brand-text px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-basalt"
              >
                {portalLabel(session.accountType, labels)}
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-3 py-2 text-sm font-medium text-brand-text-muted transition-colors hover:bg-brand-sand-light hover:text-brand-text"
              >
                {labels.signin}
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-full bg-brand-text px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-basalt"
              >
                {labels.signup}
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile */}
      <div className="flex items-center gap-1.5 lg:hidden">
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          aria-label={searchLabel}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-brand-text transition hover:bg-brand-sand-light"
        >
          <Search className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label={menuLabel}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-brand-text transition hover:bg-brand-sand-light"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <MobileDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        navigation={navigation}
        secondaryNavigation={secondaryNavigation}
        session={session}
        labels={labels}
        closeLabel={closeLabel}
      />

      <SearchOverlay
        open={searchOpen}
        onClose={closeSearch}
        placeholder={searchPlaceholder}
        overlayLabels={searchOverlayLabels}
      />
    </>
  );
}
