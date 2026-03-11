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
  const navigation = [
    { href: "/events", label: tNav("events") },
    { href: "/groups", label: tNav("groups") },
    { href: "/venues", label: tNav("venues") },
    { href: "/pricing", label: tNav("pricing") },
  ] as const satisfies readonly { href: Route; label: string }[];

  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(221,215,203,0.7)] bg-[rgba(250,248,244,0.92)] backdrop-blur-xl">
      <div className="section-shell flex min-h-16 items-center justify-between gap-6 py-2">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand-indigo)] text-white">
            <Compass className="h-4 w-4" />
          </span>
          <div className="leading-tight">
            <div className="text-sm font-extrabold tracking-[-0.02em] text-[var(--brand-text)]">
              {tHeader("brandTop")}
            </div>
            <div className="font-editorial text-sm tracking-[-0.02em] text-[var(--brand-indigo)]">
              {tHeader("brandBottom")}
            </div>
          </div>
        </Link>

        <SiteHeaderClient
          navigation={navigation}
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
      <SiteHeaderMobileNav navigation={navigation} />
    </header>
  );
}
