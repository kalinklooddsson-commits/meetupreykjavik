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
    chip: "Member",
    posture: "Discovery",
    texture: "portal-shell-member",
    icon: Compass,
  },
  organizer: {
    chip: "Organizer",
    posture: "Events",
    texture: "portal-shell-organizer",
    icon: CalendarRange,
  },
  venue: {
    chip: "Venue",
    posture: "Bookings",
    texture: "portal-shell-venue",
    icon: Store,
  },
  admin: {
    chip: "Admin",
    posture: "Platform",
    texture: "portal-shell-admin",
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
          "portal-stage section-shell grid gap-5 py-6",
          collapsed ? "lg:grid-cols-[64px_1fr]" : "lg:grid-cols-[240px_1fr]",
        )}
      >
        <aside
          className={cn(
            "portal-aside h-fit rounded-xl border border-[var(--brand-border-light)] bg-white p-3 lg:sticky lg:top-4",
          )}
        >
          <div className="flex items-center justify-between gap-2 border-b border-[var(--brand-border-light)] pb-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(55,48,163,0.08)] text-[var(--brand-indigo)]">
                <RoleIcon className="h-4 w-4" />
              </span>
              <div className={cn(collapsed && "lg:hidden")}>
                <div className="text-sm font-semibold text-[var(--brand-text)]">
                  {title}
                </div>
                <div className="text-xs text-[var(--brand-text-muted)]">
                  {currentRoleMeta.chip}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCollapsed((value) => !value)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--brand-text-muted)] transition hover:bg-[var(--brand-sand)] hover:text-[var(--brand-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-indigo)]"
              aria-expanded={!collapsed}
              aria-label={collapsed ? "Expand dashboard navigation" : "Collapse dashboard navigation"}
            >
              {collapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </button>
          </div>

          <nav className="mt-2 space-y-0.5">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn("portal-nav-link", collapsed && "lg:justify-center lg:px-2")}
                data-active={link.active ? "true" : "false"}
                title={link.label}
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span className={cn(collapsed && "lg:hidden")}>{link.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        <main className="space-y-4">
          <div className="portal-mobile-jumps lg:hidden">
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
              "portal-stage-header rounded-xl p-5 sm:p-6",
            )}
          >
            {breadcrumbs?.length ? (
              <nav
                aria-label="Breadcrumb"
                className="portal-breadcrumbs mb-3 flex flex-wrap items-center gap-1.5"
              >
                {breadcrumbs.map((item, index) => (
                  <span key={`${item}-${index}`} className="portal-breadcrumb-item">
                    {item}
                  </span>
                ))}
              </nav>
            ) : null}

            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-[var(--brand-indigo)]">
                  {eyebrow}
                </div>
                <h1 className="mt-1 text-xl font-semibold text-[var(--brand-text)] sm:text-2xl">
                  {title}
                </h1>
                <p className="mt-1 max-w-3xl text-sm leading-relaxed text-[var(--brand-text-muted)]">
                  {description}
                </p>
              </div>

              {primaryAction ? (
                <Link
                  href={primaryAction.href}
                  className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-indigo)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--brand-indigo-dark)]"
                >
                  <span>{primaryAction.label}</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              ) : null}
            </div>

            {signalCards.length ? (
              <div className="mt-4 grid gap-3 lg:grid-cols-3">
                {signalCards.map((signal) => (
                  <article
                    key={signal.label}
                    className="rounded-lg border border-[var(--brand-border-light)] bg-white p-3"
                  >
                    <div className="text-xs font-medium uppercase tracking-wider text-[var(--brand-text-light)]">
                      {signal.label}
                    </div>
                    <div className="tabular-nums mt-1 text-xl font-semibold text-[var(--brand-text)]">
                      {signal.value}
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--brand-text-muted)]">
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
