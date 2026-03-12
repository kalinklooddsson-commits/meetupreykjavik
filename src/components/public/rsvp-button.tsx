"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Loader2, Calendar } from "lucide-react";
import { useToast } from "@/components/ui/toast";

/* ── localStorage helpers for mock-mode RSVP persistence ────── */

const STORAGE_KEY = "meetupreykjavik-rsvps";

function getStoredRsvps(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveRsvp(slug: string) {
  const rsvps = getStoredRsvps();
  rsvps.add(slug);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...rsvps]));
}

function removeRsvp(slug: string) {
  const rsvps = getStoredRsvps();
  rsvps.delete(slug);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...rsvps]));
}

/* ── Component ──────────────────────────────────────────────── */

interface RsvpButtonProps {
  eventSlug: string;
  className?: string;
}

export function RsvpButton({ eventSlug, className = "" }: RsvpButtonProps) {
  const t = useTranslations("common");
  const { toast } = useToast();
  const [state, setState] = useState<"idle" | "loading" | "going" | "error">("idle");
  const [message, setMessage] = useState("");

  // Hydrate from localStorage on mount
  useEffect(() => {
    if (getStoredRsvps().has(eventSlug)) {
      setState("going");
    }
  }, [eventSlug]);

  async function handleRsvp() {
    if (state === "loading") return;

    if (state === "going") {
      // Cancel RSVP
      setState("loading");
      try {
        const response = await fetch(`/api/events/${eventSlug}/rsvp`, {
          method: "DELETE",
        });
        const result = await response.json();
        if (result.ok) {
          removeRsvp(eventSlug);
          setState("idle");
          setMessage("");
          toast("info", "RSVP cancelled");
        } else {
          // Fallback: allow cancel in mock mode even if API returns 501
          removeRsvp(eventSlug);
          setState("idle");
          setMessage("");
          toast("info", "RSVP cancelled");
        }
      } catch {
        // Offline fallback
        removeRsvp(eventSlug);
        setState("idle");
        setMessage("");
        toast("info", "RSVP cancelled");
      }
      return;
    }

    // Create RSVP
    setState("loading");
    try {
      const response = await fetch(`/api/events/${eventSlug}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const result = await response.json();
      if (result.ok) {
        saveRsvp(eventSlug);
        setState("going");
        setMessage("");
        toast("success", t("youreGoing") ?? "You're going! See you there.");
      } else if (response.status === 403) {
        setState("error");
        setMessage("Sign in to RSVP");
        toast("error", "Sign in to RSVP");
      } else {
        // Fallback: succeed locally in mock mode (API returns 501 scaffold)
        saveRsvp(eventSlug);
        setState("going");
        setMessage("");
        toast("success", t("youreGoing") ?? "You're going! See you there.");
      }
    } catch {
      // Offline fallback — still persist locally
      saveRsvp(eventSlug);
      setState("going");
      setMessage("");
      toast("success", t("youreGoing") ?? "You're going! See you there.");
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleRsvp}
        disabled={state === "loading"}
        className={`inline-flex min-h-12 items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition hover:-translate-y-0.5 disabled:opacity-60 ${
          state === "going"
            ? "border border-brand-sage bg-brand-sage/10 text-brand-sage-dark hover:bg-brand-coral/10 hover:text-brand-coral hover:border-brand-coral"
            : state === "error"
              ? "bg-brand-coral text-white shadow-[0_8px_20px_rgba(232,97,77,0.3)]"
              : "bg-brand-coral text-white shadow-[0_8px_20px_rgba(232,97,77,0.3)]"
        } ${className}`}
      >
        {state === "loading" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("processing")}
          </>
        ) : state === "going" ? (
          <>
            <Check className="h-4 w-4" />
            {t("youreGoing") ?? "You're going!"}
          </>
        ) : (
          <>
            <Calendar className="h-4 w-4" />
            {t("attendEvent") ?? "Attend this event"}
          </>
        )}
      </button>
      {message && (
        <p className="mt-2 text-xs text-brand-coral">{message}</p>
      )}
    </div>
  );
}
