import Link from "next/link";
import type { Route } from "next";
import { Compass } from "lucide-react";
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
        { href: "/categories" as Route, label: tFooter("categories") },
      ],
    },
    {
      title: tFooter("company"),
      links: [
        { href: "/about" as Route, label: tNav("about") },
        { href: "/pricing" as Route, label: tNav("pricing") },
        { href: "/blog" as Route, label: tNav("blog") },
        { href: "/faq" as Route, label: "FAQ" },
        { href: "/for-venues" as Route, label: tFooter("forVenues") },
      ],
    },
    {
      title: tFooter("legal"),
      links: [
        { href: "/privacy" as Route, label: tNav("privacy") },
        { href: "/terms" as Route, label: tFooter("terms") },
        { href: "/contact" as Route, label: tFooter("contact") },
      ],
    },
  ] as const;

  return (
    <footer className="grain-overlay relative overflow-hidden bg-[linear-gradient(160deg,var(--brand-basalt)_0%,rgba(45,41,69,1)_42%,rgba(55,48,163,0.92)_100%)] px-4 py-14 text-white">
      <div className="ambient-orb left-[-4rem] top-[-4rem] h-44 w-44 bg-[rgba(232,97,77,0.18)]" />
      <div className="ambient-orb bottom-[-5rem] right-[-4rem] h-64 w-64 bg-[rgba(245,240,232,0.08)]" />
      <div className="section-shell relative z-10 grid gap-10 lg:grid-cols-[1.6fr_repeat(3,1fr)]">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand-indigo)] text-white">
              <Compass className="h-5 w-5" />
            </span>
            <div>
              <div className="text-sm font-bold uppercase tracking-[0.18em] text-white/45">
                Meetup
              </div>
              <div className="font-editorial text-2xl text-white">
                Reykjavik
              </div>
            </div>
          </div>
          <p className="max-w-sm text-sm leading-7 text-white/66">
            {tFooter("description")}
          </p>
          <Link
            href="/signup"
            className="mt-6 inline-flex min-h-11 items-center rounded-full bg-[var(--brand-coral)] px-5 py-3 text-sm font-bold text-white shadow-[0_18px_38px_rgba(232,97,77,0.22)] transition hover:-translate-y-0.5"
          >
            {tCta("signup")}
          </Link>

          <div className="site-footer-signals mt-6 grid gap-3 sm:grid-cols-2">
            <div className="site-footer-signal-card">
              <div className="site-footer-signal-label">Business model</div>
              <div className="site-footer-signal-value">Paid events, organizer SaaS, venue SaaS</div>
            </div>
            <div className="site-footer-signal-card">
              <div className="site-footer-signal-label">City posture</div>
              <div className="site-footer-signal-value">Built for Reykjavik rooms, hosts, and repeat attendance</div>
            </div>
          </div>
        </div>

        {footerColumns.map((column) => (
          <div key={column.title}>
            <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-white/35">
              {column.title}
            </h2>
            <div className="space-y-3">
              {column.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block text-sm text-white/70 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="section-shell mt-10 border-t border-white/10 pt-6 text-sm text-white/45">
        &copy; {new Date().getFullYear()} MeetupReykjavik. {tFooter("copyright")}
      </div>
    </footer>
  );
}
