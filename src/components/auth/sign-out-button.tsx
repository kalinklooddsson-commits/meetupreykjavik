"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useTransition } from "react";

export function SignOutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          router.push("/login");
          router.refresh();
        })
      }
      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[rgba(153,148,168,0.18)] bg-white/80 px-4 py-2 text-sm font-semibold text-[var(--brand-text)] transition hover:border-[rgba(79,70,229,0.18)] hover:text-[var(--brand-indigo)] disabled:opacity-70"
    >
      <LogOut className="h-4 w-4" />
      Sign out
    </button>
  );
}
