"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { locales, type Locale } from "@/types/domain";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
} = {}) {
  const locale = useLocale() as Locale;
  const t = useTranslations("locale");
  const [pendingLocale, setPendingLocale] = useState<Locale | null>(null);

  async function switchLocale(nextLocale: Locale) {
    if (nextLocale === locale || pendingLocale) {
      return;
    }

    setPendingLocale(nextLocale);

    try {
      const response = await fetch("/api/locale", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({locale: nextLocale}),
      });

      if (!response.ok) {
        throw new Error("Failed to switch locale");
      }

      window.location.reload();
    } catch {
      // Locale switch failed — reset pending state
    } finally {
      setPendingLocale(null);
    }
  }

  const isBusy = pendingLocale !== null;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50/80 p-0.5",
        compact && "border-gray-200 bg-gray-50/80",
        className,
      )}
      aria-label={t("switcher")}
    >
      {locales.map((nextLocale) => (
        <button
          key={nextLocale}
          type="button"
          aria-pressed={locale === nextLocale}
          disabled={isBusy}
          onClick={() => void switchLocale(nextLocale)}
          className={cn(
            "rounded-md px-2 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.08em] transition-all duration-150",
            compact && "px-2 py-1",
            locale === nextLocale
              ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200"
              : "text-gray-500 hover:text-gray-700",
            isBusy ? "cursor-wait opacity-70" : "cursor-pointer",
          )}
        >
          {t(nextLocale)}
        </button>
      ))}
    </div>
  );
}
