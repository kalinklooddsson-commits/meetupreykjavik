"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-20">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-coral/10">
          <AlertTriangle className="h-7 w-7 text-brand-coral" />
        </div>
        <h2 className="font-editorial text-2xl tracking-tight text-gray-900">
          Something went wrong
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-gray-500">
          An unexpected error occurred in the admin panel. Try again or return to the admin dashboard.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-brand-coral px-5 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5"
          >
            Try again
          </button>
          <Link
            href="/admin"
            className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:-translate-y-0.5"
          >
            Admin home
          </Link>
        </div>
      </div>
    </div>
  );
}
