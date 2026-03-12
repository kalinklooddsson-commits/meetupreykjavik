import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { redirectIfAuthenticated } from "@/lib/auth/guards";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  await redirectIfAuthenticated();
  const t = await getTranslations("auth");

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,var(--brand-sand-light),var(--brand-sand))] px-4 py-8 sm:py-12">
      <div className="section-shell">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-brand-border bg-white/78 px-4 py-2 text-sm font-semibold text-brand-text transition hover:-translate-y-0.5"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("backToHome")}
          </Link>
        </div>

        {children}
      </div>
    </div>
  );
}
