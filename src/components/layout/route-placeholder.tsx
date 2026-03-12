import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Route } from "next";

type RoutePlaceholderProps = {
  title: string;
  description: string;
  ctaHref?: string;
  ctaLabel?: string;
};

export function RoutePlaceholder({
  title,
  description,
  ctaHref = "/signup",
  ctaLabel = "Join the launch list",
}: RoutePlaceholderProps) {
  return (
    <section className="section-shell px-0 py-20">
      <div className="paper-panel overflow-hidden rounded-[2rem]">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="border-b border-brand-border-light bg-white px-8 py-10 lg:border-r lg:border-b-0 lg:px-12 lg:py-14">
            <span className="eyebrow bg-[rgba(79,70,229,0.08)] px-4 py-2 text-brand-indigo">
              In progress
            </span>
            <h1 className="font-editorial mt-6 text-4xl leading-tight tracking-[-0.04em] text-brand-text sm:text-5xl">
              {title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-brand-text-muted sm:text-lg">
              {description}
            </p>
            <Link
              href={ctaHref as Route}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-indigo px-6 py-3 text-sm font-bold text-white shadow-[0_16px_42px_rgba(55,48,163,0.24)] transition-transform hover:-translate-y-0.5"
            >
              {ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grain-overlay relative overflow-hidden bg-[linear-gradient(135deg,rgba(55,48,163,1),rgba(30,27,46,0.96)_55%,rgba(232,97,77,0.82))] px-8 py-10 text-white lg:px-12 lg:py-14">
            <div className="ambient-orb float-slow left-[-3rem] top-[-2rem] h-36 w-36 bg-[rgba(255,255,255,0.16)]" />
            <div className="ambient-orb drift-slow bottom-[-5rem] right-[-2rem] h-52 w-52 bg-[rgba(232,97,77,0.26)]" />

            <div className="relative z-10 space-y-6">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.24em] text-white/55">
                  Build status
                </div>
                <div className="mt-2 text-3xl font-black tracking-[-0.05em]">
                  Foundations live
                </div>
              </div>
              <ul className="space-y-4 text-sm text-white/78">
                <li>Design system and navigation are being standardized.</li>
                <li>Core role-based routes are scaffolded for admin, venue, and organizer flows.</li>
                <li>Account wiring, auth, payments, and email will connect once keys are available.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
