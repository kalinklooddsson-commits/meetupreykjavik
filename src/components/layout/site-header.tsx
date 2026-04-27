import Link from "next/link";
import type { Route } from "next";
import { getTranslations } from "next-intl/server";

import { getCurrentSession } from "@/lib/auth/guards";
import {
  SiteHeaderClient,
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
    <header className="site-header sticky top-0 z-50 border-b border-brand-border-light/60 bg-[rgba(250,248,244,0.86)] backdrop-blur-xl supports-[backdrop-filter]:bg-[rgba(250,248,244,0.78)]">
      <div className="section-shell flex min-h-[4rem] items-center justify-between gap-6 py-3">
        {/* Brand wordmark — single line, no ornament */}
        <Link
          href="/"
          className="flex items-baseline gap-1.5 no-underline"
          aria-label={`${tHeader("brandTop")} ${tHeader("brandBottom")}`}
        >
          <span className="text-[0.95rem] font-bold tracking-[-0.02em] text-brand-text">
            {tHeader("brandTop")}
          </span>
          <span className="font-editorial text-[1.05rem] tracking-[-0.035em] text-brand-text">
            {tHeader("brandBottom")}
          </span>
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
            browseEvents: tHeader("browseEvents"),
            browseGroups: tHeader("browseGroups"),
            browseVenues: tHeader("browseVenues"),
            popularCategories: tHeader("popularCategories"),
            catMusic: tHeader("catMusic"),
            catTech: tHeader("catTech"),
            catArt: tHeader("catArt"),
            catOutdoors: tHeader("catOutdoors"),
            catFood: tHeader("catFood"),
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
    </header>
  );
}
