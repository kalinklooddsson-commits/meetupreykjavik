"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

/**
 * Global error boundary — last resort when root layout itself fails.
 * Cannot use next-intl because the provider may not be available.
 * Shows bilingual EN/IS content inline.
 */
export default function GlobalError() {
  return (
    <html lang="en">
      <body className="font-sans" style={{ margin: 0 }}>
        <div className="grid min-h-screen place-items-center bg-brand-sand p-4 text-brand-text sm:p-8">
          <div className="w-full max-w-[680px] rounded-2xl border border-gray-200 bg-white px-6 py-10 text-center shadow-sm sm:px-10 sm:py-14">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-coral text-white">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-coral">
              System error / Kerfisvilla
            </p>
            <h1 className="font-editorial mt-4 text-3xl leading-tight tracking-tight text-gray-900 sm:text-4xl">
              Something went wrong
            </h1>
            <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-gray-500">
              An unexpected error occurred. Please try again or return to the home page.
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-gray-400">
              Óvænt villa kom upp. Reyndu aftur eða farðu á forsíðu.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/"
                className="rounded-full bg-brand-coral px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                Go home / Fara heim
              </Link>
              <Link
                href="/events"
                className="rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                Browse events / Skoða viðburði
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
