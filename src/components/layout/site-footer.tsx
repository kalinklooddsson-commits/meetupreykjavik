import Link from "next/link";
import type { Route } from "next";
import { getTranslations } from "next-intl/server";
import { NewsletterForm } from "@/components/public/newsletter-form";

export async function SiteFooter() {
  const tNav = await getTranslations("nav");
  const tFooter = await getTranslations("footer");
  const tCta = await getTranslations("cta");
  const tHeader = await getTranslations("header");
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
          <div className="mb-4 flex items-baseline gap-1.5">
            <span className="text-base font-bold tracking-[-0.02em] text-white">
              {tHeader("brandTop")}
            </span>
            <span className="font-editorial text-lg tracking-[-0.035em] text-white">
              {tHeader("brandBottom")}
            </span>
          </div>
          <p className="max-w-sm text-sm leading-7 text-white/70">
            {tFooter("description")}
          </p>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
              {tFooter("newsletter")}
            </p>
            <NewsletterForm
              placeholder={tFooter("newsletterPlaceholder")}
              buttonLabel={tFooter("newsletterButton")}
              successMessage={tFooter("newsletterSuccess")}
            />
          </div>

          <Link
            href="/signup"
            className="mt-6 inline-flex min-h-11 items-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-brand-text transition hover:bg-brand-sand-light"
          >
            {tCta("signup")}
          </Link>
        </div>

        {footerColumns.map((column) => (
          <div key={column.title}>
            <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-white/70">
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
        <p className="text-sm text-white/70">
          &copy; {new Date().getFullYear()} MeetupReykjavik. {tFooter("copyright")}
        </p>
      </div>
    </footer>
  );
}
