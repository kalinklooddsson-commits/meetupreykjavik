import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, HandCoins, ShieldCheck, Store } from "lucide-react";

import { redirectIfAuthenticated } from "@/lib/auth/guards";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  await redirectIfAuthenticated();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,var(--brand-sand-light),var(--brand-sand))] px-4 py-8 sm:py-12">
      <div className="section-shell">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--brand-border)] bg-white/78 px-4 py-2 text-sm font-semibold text-[var(--brand-text)] transition hover:-translate-y-0.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to marketplace
          </Link>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Trust-led entry", Icon: ShieldCheck },
              { label: "Organizer revenue", Icon: HandCoins },
              { label: "Venue partner ops", Icon: Store },
            ].map((item) => (
              <span
                key={item.label}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[rgba(79,70,229,0.12)] bg-white/72 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand-text-light)]"
              >
                <item.Icon className="h-4 w-4 text-[var(--brand-indigo)]" />
                {item.label}
              </span>
            ))}
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
