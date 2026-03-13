"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Check, Loader2, Calendar, Ticket } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useUser } from "@/hooks/use-user";

/* ── localStorage helpers for mock-mode RSVP persistence ────── */

const STORAGE_KEY = "meetupreykjavik-rsvps";
const RSVP_CHANGED_EVENT = "rsvp-changed";

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
  window.dispatchEvent(new CustomEvent(RSVP_CHANGED_EVENT, { detail: { slug, action: "add" } }));
}

function removeRsvp(slug: string) {
  const rsvps = getStoredRsvps();
  rsvps.delete(slug);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...rsvps]));
  window.dispatchEvent(new CustomEvent(RSVP_CHANGED_EVENT, { detail: { slug, action: "remove" } }));
}

/* ── Reactive attendee count ────────────────────────────────── */

export function AttendeeCount({ eventSlug, serverCount, capacity }: { eventSlug: string; serverCount: number; capacity: number }) {
  const t = useTranslations("common");
  const [count, setCount] = useState(serverCount);

  useEffect(() => {
    // Check if already RSVP'd on mount
    if (getStoredRsvps().has(eventSlug)) {
      setCount(serverCount + 1);
    }
  }, [eventSlug, serverCount]);

  useEffect(() => {
    function onRsvpChanged(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail?.slug === eventSlug) {
        setCount((prev) => detail.action === "add" ? prev + 1 : Math.max(prev - 1, 0));
      }
    }
    window.addEventListener(RSVP_CHANGED_EVENT, onRsvpChanged);
    return () => window.removeEventListener(RSVP_CHANGED_EVENT, onRsvpChanged);
  }, [eventSlug]);

  const percent = capacity ? Math.min(Math.round((count / capacity) * 100), 100) : 0;

  return (
    <>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">{t("capacity")}</span>
        <span className="font-medium text-gray-900">{count}/{capacity}</span>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-gray-200">
        <div
          className="h-1.5 rounded-full bg-brand-indigo transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </>
  );
}

/* ── Component ──────────────────────────────────────────────── */

interface RsvpButtonProps {
  eventSlug: string;
  className?: string;
  ticketType?: string;
  priceLabel?: string;
}

export function RsvpButton({ eventSlug, className = "", ticketType, priceLabel }: RsvpButtonProps) {
  const t = useTranslations("common");
  const { toast } = useToast();
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();
  const [state, setState] = useState<"idle" | "loading" | "going" | "error">("idle");
  const [message, setMessage] = useState("");

  const syncFromStorage = useCallback(() => {
    const isGoing = getStoredRsvps().has(eventSlug);
    setState((prev) => {
      if (prev === "loading") return prev;
      return isGoing ? "going" : "idle";
    });
  }, [eventSlug]);

  // Hydrate from localStorage on mount
  useEffect(() => {
    syncFromStorage();
  }, [syncFromStorage]);

  // Listen for cross-instance RSVP changes
  useEffect(() => {
    function onRsvpChanged(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail?.slug === eventSlug) {
        setState(detail.action === "add" ? "going" : "idle");
      }
    }
    window.addEventListener(RSVP_CHANGED_EVENT, onRsvpChanged);
    return () => window.removeEventListener(RSVP_CHANGED_EVENT, onRsvpChanged);
  }, [eventSlug]);

  const isPaid = ticketType && /paid|ticket/i.test(ticketType);

  function cancelRsvp() {
    removeRsvp(eventSlug);
    setState("idle");
    setMessage("");
    toast("info", t("rsvpCancelled"));
  }

  const loginUrl = `/login?redirect=/events/${eventSlug}` as import("next").Route;

  async function handleRsvp() {
    if (state === "loading") return;

    // Not logged in → redirect to login
    if (!user) {
      router.push(loginUrl);
      return;
    }

    if (state === "going") {
      // Cancel RSVP
      setState("loading");
      try {
        await fetch(`/api/events/${eventSlug}/rsvp`, { method: "DELETE" });
        cancelRsvp();
      } catch {
        cancelRsvp();
      }
      return;
    }

    // Create RSVP (both free and paid events use the API directly)
    setState("loading");
    try {
      const response = await fetch(`/api/events/${eventSlug}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (response.status === 403) {
        // Session expired or invalid → redirect to login
        router.push(loginUrl);
      } else if (!response.ok) {
        setState("error");
        setMessage(t("rsvpError") ?? "Something went wrong");
        toast("error", t("rsvpError") ?? "Something went wrong");
      } else {
        saveRsvp(eventSlug);
        setState("going");
        setMessage("");
        toast("success", t("youreGoing"));
      }
    } catch {
      // Network error with active session → show error, don't fake success
      setState("error");
      setMessage(t("rsvpError") ?? "Something went wrong");
      toast("error", t("rsvpError") ?? "Something went wrong");
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
            {t("youreGoing")}
          </>
        ) : (
          <>
            {isPaid ? <Ticket className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
            {isPaid ? (priceLabel ? `${t("getTickets")} — ${priceLabel}` : t("getTickets")) : t("attendEvent")}
          </>
        )}
      </button>
      {message && (
        <p className="mt-2 text-xs text-brand-coral">{message}</p>
      )}
    </div>
  );
}
