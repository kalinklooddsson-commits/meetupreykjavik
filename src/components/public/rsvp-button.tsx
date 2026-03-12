"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Loader2, Calendar } from "lucide-react";

interface RsvpButtonProps {
  eventSlug: string;
  className?: string;
}

export function RsvpButton({ eventSlug, className = "" }: RsvpButtonProps) {
  const t = useTranslations("common");
  const [state, setState] = useState<"idle" | "loading" | "going" | "error">("idle");
  const [message, setMessage] = useState("");

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
          setState("idle");
          setMessage("");
        } else {
          setState("going");
          setMessage(result.details?.formErrors?.[0] ?? "Could not cancel RSVP");
        }
      } catch {
        setState("going");
        setMessage("Network error. Try again.");
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
        setState("going");
        setMessage("");
      } else if (response.status === 403) {
        setState("error");
        setMessage("Sign in to RSVP");
      } else {
        setState("error");
        setMessage(result.details?.formErrors?.[0] ?? "Could not RSVP");
      }
    } catch {
      setState("error");
      setMessage("Network error. Try again.");
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
