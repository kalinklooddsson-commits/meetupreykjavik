import Link from "next/link";
import { Compass } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("errors.notFound");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-brand-sand px-4 py-20">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-indigo">
          <Compass className="h-8 w-8 text-white" />
        </div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-coral">
          {t("code")}
        </p>
        <h1 className="font-editorial mt-3 text-4xl tracking-tight text-gray-900 sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-gray-500">
          {t("description")}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-brand-coral px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            {t("goHome")}
          </Link>
          <Link
            href="/events"
            className="rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            {t("browseEvents")}
          </Link>
          <Link
            href="/venues"
            className="rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            {t("exploreVenues")}
          </Link>
        </div>
      </div>
    </main>
  );
}
