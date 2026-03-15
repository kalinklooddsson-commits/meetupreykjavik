"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Check, Loader2, Calendar, Ticket, X } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useUser } from "@/hooks/use-user";
import { PayPalCheckout } from "@/components/payments/paypal-checkout";

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

  // Trust the server count — it already includes real RSVPs.
  // Only adjust the count when the user RSVPs or cancels during this session.
  useEffect(() => {
    setCount(serverCount);
  }, [serverCount]);

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

/** Parse "750 ISK" → 750 (returns 0 if unparseable) */
function parseIskAmount(label?: string): number {
  if (!label) return 0;
  const num = parseInt(label.replace(/[^\d]/g, ""), 10);
  return isNaN(num) ? 0 : num;
}

export function RsvpButton({ eventSlug, className = "", ticketType, priceLabel }: RsvpButtonProps) {
  const t = useTranslations("common");
  const { toast } = useToast();
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();
  const [state, setState] = useState<"idle" | "loading" | "going" | "error">("idle");
  const [message, setMessage] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);

  const syncFromStorage = useCallback(() => {
    const isGoing = getStoredRsvps().has(eventSlug);
    setState((prev) => {
      if (prev === "loading") return prev;
      return isGoing ? "going" : "idle";
    });
  }, [eventSlug]);

  // Check actual RSVP status from server on mount (for logged-in users).
  // Falls back to localStorage only when user is not logged in or fetch fails.
  useEffect(() => {
    if (userLoading) return;

    if (!user) {
      // Not logged in — use localStorage as fallback
      syncFromStorage();
      return;
    }

    let cancelled = false;
    async function checkServerRsvp() {
      try {
        const res = await fetch(`/api/events/${eventSlug}/rsvp`);
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          const serverGoing = data.status === "going";
          setState((prev) => (prev === "loading" ? prev : serverGoing ? "going" : "idle"));
          // Sync localStorage to match server truth
          if (serverGoing) {
            saveRsvp(eventSlug);
          } else {
            removeRsvp(eventSlug);
          }
        } else {
          // Server error — fall back to localStorage
          syncFromStorage();
        }
      } catch {
        // Network error — fall back to localStorage
        if (!cancelled) syncFromStorage();
      }
    }

    checkServerRsvp();
    return () => { cancelled = true; };
  }, [user, userLoading, eventSlug, syncFromStorage]);

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

  /** Create RSVP via API (used for both free events and after payment) */
  async function createRsvpViaApi() {
    const response = await fetch(`/api/events/${eventSlug}/rsvp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (response.status === 403) {
      router.push(loginUrl);
      return false;
    }
    if (response.status === 409) {
      setState("error");
      const msg = t("eventFull") ?? "This event is full";
      setMessage(msg);
      toast("error", msg);
      return false;
    }
    if (!response.ok) {
      setState("error");
      setMessage(t("rsvpError") ?? "Something went wrong");
      toast("error", t("rsvpError") ?? "Something went wrong");
      return false;
    }
    saveRsvp(eventSlug);
    setState("going");
    setMessage("");
    toast("success", t("youreGoing"));
    return true;
  }

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

    // Paid event → open checkout modal
    if (isPaid) {
      setShowCheckout(true);
      return;
    }

    // Free event → create RSVP directly
    setState("loading");
    try {
      await createRsvpViaApi();
    } catch {
      setState("error");
      setMessage(t("rsvpError") ?? "Something went wrong");
      toast("error", t("rsvpError") ?? "Something went wrong");
    }
  }

  /** Called when PayPal payment succeeds */
  async function handlePaymentSuccess(details: { orderId: string; captureId: string | null }) {
    setShowCheckout(false);
    setState("loading");
    try {
      await createRsvpViaApi();
    } catch {
      // Payment succeeded but RSVP creation failed — still save locally
      saveRsvp(eventSlug);
      setState("going");
      toast("success", t("youreGoing"));
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

      {/* ── Checkout Modal ─────────────────────────────────── */}
      {showCheckout && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowCheckout(false); }}
        >
          <div className="relative mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowCheckout(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-editorial text-xl text-gray-900">Get tickets</h3>
            <div className="mt-3 flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
              <span className="text-sm text-gray-600">Ticket</span>
              <span className="text-sm font-bold text-gray-900">{priceLabel ?? "Paid"}</span>
            </div>

            <div className="mt-5">
              <PayPalCheckout
                eventSlug={eventSlug}
                tierName="General Admission"
                amountIsk={parseIskAmount(priceLabel)}
                quantity={1}
                onSuccess={handlePaymentSuccess}
                onError={(err) => {
                  toast("error", err);
                  setShowCheckout(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
