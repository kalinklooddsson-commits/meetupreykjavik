import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function PublicNotFound() {
  const t = await getTranslations("errors.notFound");

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-20">
      <div className="text-center">
        <p className="font-editorial text-7xl tracking-[-0.04em] text-brand-text sm:text-8xl">
          {t("code")}
        </p>
        <h1 className="font-editorial mt-4 text-3xl tracking-[-0.035em] text-brand-text sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-brand-text-muted">
          {t("description")}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-brand-text px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-basalt"
          >
            {t("goHome")}
          </Link>
          <Link
            href="/events"
            className="rounded-full border border-brand-border px-6 py-3 text-sm font-medium text-brand-text transition hover:bg-brand-sand-light"
          >
            {t("browseEvents")}
          </Link>
          <Link
            href="/venues"
            className="rounded-full border border-brand-border px-6 py-3 text-sm font-medium text-brand-text transition hover:bg-brand-sand-light"
          >
            {t("exploreVenues")}
          </Link>
        </div>
      </div>
    </div>
  );
}
