import Link from "next/link";
import { ArrowUpRight, Compass } from "lucide-react";
import type { MockSession } from "@/lib/auth/mock-auth-config";
import { SignOutButton } from "@/components/auth/sign-out-button";

export function PortalAccessBar({ session }: { session: MockSession }) {
  return (
    <div className="section-shell pt-4">
      <div className="paper-panel flex flex-col gap-4 rounded-[1.6rem] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-brand-indigo/14 bg-brand-indigo-soft px-4 py-2 text-sm font-semibold text-brand-indigo"
          >
            <Compass className="h-4 w-4" />
            Public site
          </Link>
          <div className="text-sm text-brand-text-muted">
            Signed in as{" "}
            <span className="font-semibold text-brand-text">
              {session.displayName}
            </span>
          </div>
          <span className="inline-flex min-h-8 items-center rounded-full border border-brand-coral/18 bg-brand-coral-soft px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-brand-coral">
            {session.accountType}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[rgba(153,148,168,0.16)] bg-white/78 px-4 py-2 text-sm font-semibold text-brand-text"
          >
            Account hub
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
