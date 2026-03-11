"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { locales, type Locale } from "@/types/domain";
import { cn } from "@/lib/utils";

export function LocaleSwitcher() {
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
    } catch (error) {
      console.error(error);
    } finally {
      setPendingLocale(null);
    }
  }

  const isBusy = pendingLocale !== null;

  return (
    <div
      className="inline-flex items-center gap-1 rounded-full border border-[var(--brand-border)] bg-white/72 p-1"
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
            "min-h-11 min-w-11 rounded-full px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] transition-colors",
            locale === nextLocale
              ? "bg-[var(--brand-indigo)] text-white"
              : "text-[var(--brand-text-light)] hover:text-[var(--brand-indigo)]",
            isBusy ? "cursor-wait opacity-70" : "cursor-pointer",
          )}
        >
          {t(nextLocale)}
        </button>
      ))}
    </div>
  );
}
