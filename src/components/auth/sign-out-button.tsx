"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useTransition } from "react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { clearUser } from "@/hooks/use-user";

export function SignOutButton({ className }: { className?: string } = {}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("auth");

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          clearUser();
          router.push("/login");
          router.refresh();
        })
      }
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-full border border-[rgba(153,148,168,0.18)] bg-white/80 px-4 py-2 text-sm font-semibold text-brand-text transition hover:border-[rgba(79,70,229,0.18)] hover:text-brand-indigo disabled:opacity-70",
        className,
      )}
    >
      <LogOut className="h-4 w-4" />
      {t("signOut")}
    </button>
  );
}
