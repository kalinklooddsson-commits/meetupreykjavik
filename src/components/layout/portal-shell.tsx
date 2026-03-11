"use client";

import Link from "next/link";
import { useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowUpRight,
  CalendarRange,
  Compass,
  PanelLeftClose,
  PanelLeftOpen,
  Store,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Route } from "next";
import { cn } from "@/lib/utils";

type PortalLink = {
  href: Route;
  label: string;
  active?: boolean;
};

type PortalSignal = {
  label: string;
  value: string;
  detail: string;
};

type PortalShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  links: PortalLink[];
  children: ReactNode;
  breadcrumbs?: string[];
  primaryAction?: {
    href: Route;
    label: string;
  };
  signalCards?: PortalSignal[];
  variant?: "default" | "admin";
  roleMode?: "member" | "organizer" | "venue" | "admin";
};

const roleMeta = {
  member: {
    texture: "portal-shell-member",
    glyph: "Client mode",
    icon: Compass,
  },
  organizer: {
    texture: "portal-shell-organizer",
    glyph: "Organizer mode",
    icon: CalendarRange,
  },
  venue: {
    texture: "portal-shell-venue",
    glyph: "Venue mode",
    icon: Store,
  },
  admin: {
    texture: "portal-shell-admin",
    glyph: "Admin mode",
    icon: UsersRound,
  },
} as const;

export function PortalShell({
  eyebrow,
  title,
  description,
  links,
  children,
  breadcrumbs,
  primaryAction,
  signalCards = [],
  variant = "default",
  roleMode = variant === "admin" ? "admin" : "member",
}: PortalShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const isAdmin = variant === "admin";
  const currentRoleMeta = roleMeta[roleMode];
  const RoleIcon: LucideIcon = currentRoleMeta.icon;

  return (
    <div className={cn("portal-shell", currentRoleMeta.texture)}>
      <div
        className={cn(
          "portal-stage section-shell grid gap-6 py-8",
          collapsed ? "lg:grid-cols-[104px_1fr]" : "lg:grid-cols-[280px_1fr]",
        )}
      >
        <aside
          className={cn(
            "portal-aside paper-panel h-fit rounded-[2rem] p-4 lg:sticky lg:top-6 lg:p-5",
            isAdmin && "portal-aside-admin",
          )}
        >
          <div
            className={cn(
              "flex items-start justify-between gap-3 rounded-[1.5rem] p-5 text-white",
              isAdmin
                ? "bg-[linear-gradient(145deg,rgba(30,27,46,1),rgba(46,40,144,0.94),rgba(79,70,229,0.88),rgba(232,97,77,0.72))]"
                : "bg-[linear-gradient(135deg,rgba(55,48,163,1),rgba(79,70,229,0.94),rgba(232,97,77,0.84))]",
            )}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/14">
                <RoleIcon className="h-5 w-5" />
              </span>
              <div className={cn(collapsed && "lg:hidden")}>
                <div className="text-xs font-bold uppercase tracking-[0.22em] text-white/55">
                  {eyebrow}
                </div>
                <div className="font-editorial text-2xl tracking-[-0.04em]">
                  {title}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCollapsed((value) => !value)}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-2xl bg-white/12 text-white transition hover:bg-white/18 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              aria-expanded={!collapsed}
              aria-label={collapsed ? "Expand dashboard navigation" : "Collapse dashboard navigation"}
            >
              {collapsed ? (
                <PanelLeftOpen className="h-5 w-5" />
              ) : (
                <PanelLeftClose className="h-5 w-5" />
              )}
            </button>
          </div>

          <nav className="mt-4 space-y-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn("portal-nav-link", collapsed && "lg:justify-center lg:px-3")}
                data-active={link.active ? "true" : "false"}
                title={link.label}
              >
                <ArrowUpRight className="h-4 w-4" />
                <span className={cn(collapsed && "lg:hidden")}>{link.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        <main className="space-y-6">
          <div className="portal-mobile-jumps lg:hidden">
            <div className="portal-mobile-jumps-header">
              <span className="portal-mobile-jumps-label">{currentRoleMeta.glyph}</span>
              <span className="portal-mobile-jumps-label">{links.length} routes</span>
            </div>
            <div className="portal-mobile-jumps-row">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="portal-mobile-jump"
                  data-active={link.active ? "true" : "false"}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <section
            className={cn(
              "portal-stage-header rounded-[2rem] p-6 sm:p-7",
              isAdmin && "portal-stage-header-admin",
            )}
          >
            {breadcrumbs?.length ? (
              <nav
                aria-label="Breadcrumb"
                className="portal-breadcrumbs mb-5 flex flex-wrap items-center gap-2"
              >
                {breadcrumbs.map((item, index) => (
                  <span key={`${item}-${index}`} className="portal-breadcrumb-item">
                    {item}
                  </span>
                ))}
              </nav>
            ) : null}

            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="eyebrow bg-[rgba(79,70,229,0.08)] px-4 py-2 text-[var(--brand-indigo)]">
                  {eyebrow}
                </div>
                <h1 className="font-editorial mt-4 text-4xl tracking-[-0.05em] text-[var(--brand-text)] sm:text-[2.9rem]">
                  {title}
                </h1>
                {description ? (
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--brand-text-muted)]">
                    {description}
                  </p>
                ) : null}
              </div>

              {primaryAction ? (
                <Link
                  href={primaryAction.href}
                  className={cn(
                    "inline-flex items-center gap-3 rounded-[1.35rem] border px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5",
                    isAdmin
                      ? "border-[rgba(30,27,46,0.14)] bg-[linear-gradient(140deg,rgba(30,27,46,0.96),rgba(55,48,163,0.92),rgba(232,97,77,0.78))] text-white shadow-[0_22px_44px_rgba(42,38,56,0.18)]"
                      : "border-[rgba(79,70,229,0.12)] bg-white text-[var(--brand-text)]",
                  )}
                >
                  <span>{primaryAction.label}</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              ) : null}
            </div>

            {signalCards.length ? (
              <div className="mt-6 grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
                {signalCards.map((signal) => (
                  <article
                    key={signal.label}
                    className={cn(
                      "rounded-[1.25rem] border px-4 py-3",
                      isAdmin
                        ? "border-[rgba(30,27,46,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(245,240,232,0.82))]"
                        : "border-[rgba(153,148,168,0.12)] bg-white/84",
                    )}
                  >
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-text-light)]">
                      {signal.label}
                    </div>
                    <div className="font-editorial tabular-data mt-1 text-2xl tracking-[-0.05em] text-[var(--brand-text)]">
                      {signal.value}
                    </div>
                    <p className="mt-1 text-xs text-[var(--brand-text-muted)]">
                      {signal.detail}
                    </p>
                  </article>
                ))}
              </div>
            ) : null}
          </section>

          {children}
        </main>
      </div>
    </div>
  );
}
