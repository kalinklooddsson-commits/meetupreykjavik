"use client";

import Link from "next/link";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="edge-shell px-4 py-12">
      <div className="section-shell">
        <div className="edge-card editorial-shell px-8 py-14 text-center sm:px-12">
          <div className="edge-pill">
            Something broke
          </div>
          <h1 className="font-editorial mt-5 text-5xl tracking-[-0.06em] text-[var(--brand-text)] sm:text-6xl">
            The page hit an unexpected error.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[var(--brand-text-muted)]">
            This is the branded app-level error state so the experience still feels intentional
            when a route fails.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <span className="edge-pill">Route-level failure</span>
            <span className="edge-pill">Safe retry</span>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="rounded-full bg-[var(--brand-coral)] px-6 py-3 text-sm font-bold text-white shadow-[0_18px_38px_rgba(232,97,77,0.24)] transition hover:-translate-y-0.5"
            >
              Try again
            </button>
            <Link
              href="/"
              className="rounded-full border border-[var(--brand-border)] bg-white/82 px-6 py-3 text-sm font-semibold text-[var(--brand-text)]"
            >
              Go home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
