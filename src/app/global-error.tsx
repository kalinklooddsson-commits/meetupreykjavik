"use client";

import Link from "next/link";

export default function GlobalError() {
  return (
    <html lang="en">
      <body>
        <div className="edge-shell grid min-h-screen place-items-center p-8 font-sans text-[var(--brand-text)]">
          <div className="edge-card w-full max-w-[760px] px-10 py-14 text-center">
            <div className="edge-pill">
              System error
            </div>
            <h1 className="font-editorial mt-5 text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-[-0.06em]">
              The app hit a global failure.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[var(--brand-text-muted)]">
              This global fallback is in place so even the worst-case route state still has a
              branded, intentional screen.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <span className="edge-pill">System-level failure</span>
              <span className="edge-pill">Branded fallback</span>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/"
                className="rounded-full bg-[var(--brand-coral)] px-6 py-3 text-sm font-bold text-white shadow-[0_18px_38px_rgba(232,97,77,0.24)] transition hover:-translate-y-0.5"
              >
                Go home
              </Link>
              <Link
                href="/events"
                className="rounded-full border border-[var(--brand-border)] bg-white/82 px-6 py-3 text-sm font-semibold text-[var(--brand-text)]"
              >
                Browse events
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
