import Link from "next/link";
import type { Route } from "next";
import { Compass, Instagram, Facebook, Twitter } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function SiteFooter() {
  const tNav = await getTranslations("nav");
  const tFooter = await getTranslations("footer");
  const tCta = await getTranslations("cta");
  const footerColumns = [
    {
      title: tFooter("explore"),
      links: [
        { href: "/events" as Route, label: tNav("events") },
        { href: "/groups" as Route, label: tNav("groups") },
        { href: "/venues" as Route, label: tNav("venues") },
        { href: "/categories" as Route, label: tNav("categories") },
        { href: "/blog" as Route, label: tNav("blog") },
      ],
    },
    {
      title: tFooter("company"),
      links: [
        { href: "/about" as Route, label: tNav("about") },
        { href: "/pricing" as Route, label: tNav("pricing") },
        { href: "/for-organizers" as Route, label: tNav("forOrganizers") },
        { href: "/for-venues" as Route, label: tNav("forVenues") },
        { href: "/faq" as Route, label: tNav("faq") },
      ],
    },
    {
      title: tFooter("legal"),
      links: [
        { href: "/privacy" as Route, label: tNav("privacy") },
        { href: "/terms" as Route, label: tFooter("terms") },
        { href: "/contact" as Route, label: tNav("contact") },
      ],
    },
  ] as const;

  return (
    <footer className="relative overflow-hidden bg-brand-basalt px-4 py-14 text-white">
      <div className="section-shell relative z-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_repeat(3,1fr)]">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-indigo text-white">
              <Compass className="h-5 w-5" />
            </span>
            <div>
              <div className="text-sm font-bold uppercase tracking-[0.18em] text-white/60">
                Meetup
              </div>
              <div className="font-editorial text-2xl text-white">
                Reykjavik
              </div>
            </div>
          </div>
          <p className="max-w-sm text-sm leading-7 text-white/70">
            {tFooter("description")}
          </p>

          {/* Newsletter signup */}
          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">
              {tFooter("newsletter")}
            </p>
            <form className="mt-2 flex gap-2">
              <input
                type="email"
                placeholder={tFooter("newsletterPlaceholder")}
                className="min-w-0 flex-1 rounded-full border border-white/15 bg-white/8 px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-white/30 focus:bg-white/12"
              />
              <button
                type="button"
                className="shrink-0 rounded-full bg-brand-coral px-5 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(232,97,77,0.3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-coral"
              >
                {tFooter("newsletterButton")}
              </button>
            </form>
          </div>

          <Link
            href="/signup"
            className="mt-6 inline-flex min-h-11 items-center rounded-full bg-brand-coral px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(232,97,77,0.3)]"
          >
            {tCta("signup")}
          </Link>
        </div>

        {footerColumns.map((column) => (
          <div key={column.title}>
            <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-white/50">
              {column.title}
            </h2>
            <div className="space-y-3">
              {column.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block text-sm text-white/75 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* Social links & copyright */}
      <div className="section-shell mt-10 flex flex-col items-center gap-4 border-t border-white/10 pt-6 sm:flex-row sm:justify-between">
        <p className="text-sm text-white/60">
          &copy; {new Date().getFullYear()} MeetupReykjavik. {tFooter("copyright")}
        </p>
        <div className="flex items-center gap-2">
          <span className="mr-2 text-xs font-bold uppercase tracking-[0.18em] text-white/50">
            {tFooter("followUs")}
          </span>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.08] text-white/70 transition hover:bg-white/[0.15] hover:text-white/90"
          >
            <Instagram className="h-4 w-4" />
          </a>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.08] text-white/70 transition hover:bg-white/[0.15] hover:text-white/90"
          >
            <Facebook className="h-4 w-4" />
          </a>
          <a
            href="https://x.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X (Twitter)"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.08] text-white/70 transition hover:bg-white/[0.15] hover:text-white/90"
          >
            <Twitter className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
