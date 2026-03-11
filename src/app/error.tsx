"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--brand-sand)] px-4 py-20">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--brand-coral)]">
          <AlertTriangle className="h-8 w-8 text-white" />
        </div>
        <p className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: "#E8614D" }}>
          Something went wrong
        </p>
        <h1 className="font-editorial mt-3 text-4xl tracking-tight text-gray-900 sm:text-5xl">
          Unexpected error
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-gray-500">
          Something didn&apos;t load correctly. You can try again or head back to the homepage.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-[var(--brand-coral)] px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
