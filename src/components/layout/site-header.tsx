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
    { href: "/blog", label: tNav("blog") },
  ] as const satisfies readonly { href: Route; label: string }[];

  const secondaryNavigation = [
    { href: "/about", label: tNav("about") },
    { href: "/pricing", label: tNav("pricing") },
    { href: "/categories", label: tNav("categories") },
    { href: "/for-organizers", label: tNav("forOrganizers") },
    { href: "/for-venues", label: tNav("forVenues") },
    { href: "/faq", label: tNav("faq") },
    { href: "/contact", label: tNav("contact") },
  ] as const satisfies readonly { href: Route; label: string }[];

  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(221,215,203,0.7)] bg-[rgba(250,248,244,0.92)] backdrop-blur-xl">
      <div className="section-shell flex min-h-16 items-center justify-between gap-6 py-2">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-indigo text-white">
            <Compass className="h-4 w-4" />
          </span>
          <div className="leading-tight">
            <div className="text-sm font-extrabold tracking-[-0.02em] text-brand-text">
              {tHeader("brandTop")}
            </div>
            <div className="font-editorial text-sm tracking-[-0.02em] text-brand-indigo">
              {tHeader("brandBottom")}
            </div>
          </div>
        </Link>

        <SiteHeaderClient
          navigation={navigation}
          secondaryNavigation={secondaryNavigation}
          session={session ? { accountType: session.accountType } : null}
          moreLabel={tNav("more")}
          menuLabel={tNav("menu")}
          closeLabel={tNav("close")}
          searchLabel={tHeader("search")}
          searchPlaceholder={tHeader("searchPlaceholder")}
          searchOverlayLabels={{
            recentSearches: tHeader("recentSearches"),
            noRecentSearches: tHeader("noRecentSearches"),
            browse: tHeader("browse"),
            popularCategories: tHeader("popularCategories"),
          }}
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
      <SiteHeaderMobileNav
        navigation={navigation}
        secondaryNavigation={secondaryNavigation}
      />
    </header>
  );
}
