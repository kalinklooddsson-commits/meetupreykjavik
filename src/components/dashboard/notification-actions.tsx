"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck } from "lucide-react";
import { useToast } from "@/components/ui/toast";

/**
 * Mark-all-read button for notification screens.
 * Calls PATCH /api/notifications/read with the given notification IDs.
 */
export function MarkAllReadButton({ ids }: { ids: string[] }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  if (ids.length === 0) return null;

  async function handleMarkAllRead() {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications/read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const result = await res.json();
      if (result.ok) {
        toast("success", `Marked ${result.count} notification${result.count === 1 ? "" : "s"} as read`);
        router.refresh();
      } else {
        toast("error", result.error ?? "Could not mark notifications as read");
      }
    } catch {
      toast("error", "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleMarkAllRead}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-full border border-brand-border bg-white px-4 py-2 text-sm font-semibold text-brand-text transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60"
    >
      <CheckCheck className="h-4 w-4" />
      {loading ? "Marking..." : "Mark all read"}
    </button>
  );
}
