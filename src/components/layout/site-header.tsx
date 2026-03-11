import Link from "next/link";
import type { Route } from "next";
import { Compass } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { getCurrentSession } from "@/lib/auth/guards";
import {
  SiteHeaderClient,
  SiteHeaderMobileNav,
} from "@/components/layout/site-header-client";

export async function SiteHeader() {
  const session = await getCurrentSession();
  const tNav = await getTranslations("nav");
  const tCta = await getTranslations("cta");
  const tHeader = await getTranslations("header");
  const primaryNavigation = [
    { href: "/events", label: tNav("events") },
    { href: "/groups", label: tNav("groups") },
    { href: "/venues", label: tNav("venues") },
    { href: "/pricing", label: tNav("pricing") },
    { href: "/faq", label: tNav("faq") },
  ] as const satisfies readonly { href: Route; label: string }[];

  return (
    <header className="grain-overlay sticky top-0 z-50 border-b border-[rgba(221,215,203,0.82)] bg-[rgba(250,248,244,0.84)] shadow-[0_10px_28px_rgba(42,38,56,0.06)] backdrop-blur-2xl">
      <div className="section-shell flex min-h-[4.75rem] items-center justify-between gap-6 py-3">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand-indigo)] text-white shadow-[0_10px_30px_rgba(55,48,163,0.22)]">
            <Compass className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <div className="text-base font-extrabold tracking-[-0.02em] text-[var(--brand-text)]">
              {tHeader("brandTop")}
            </div>
            <div className="font-editorial text-lg tracking-[-0.03em] text-[var(--brand-indigo)]">
              {tHeader("brandBottom")}
            </div>
          </div>
        </Link>

        <SiteHeaderClient
          navigation={primaryNavigation}
          session={session ? { accountType: session.accountType } : null}
          labels={{
            admin: tCta("admin"),
            venuePortal: tCta("venuePortal"),
            organizerHub: tCta("organizerHub"),
            dashboard: tCta("dashboard"),
            signin: tCta("signin"),
            signup: tCta("signup"),
            portal: tCta("portal"),
            join: tCta("join"),
          }}
        />
      </div>
      <SiteHeaderMobileNav navigation={primaryNavigation} />
    </header>
  );
}
