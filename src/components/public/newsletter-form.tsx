"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";

export function NewsletterForm({
  placeholder,
  buttonLabel,
}: {
  placeholder: string;
  buttonLabel: string;
}) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const result = await res.json();
      if (result.ok) {
        toast("success", result.message ?? "You're subscribed!");
        setEmail("");
        setSubscribed(true);
      } else {
        toast("error", result.error ?? "Could not subscribe. Please try again.");
      }
    } catch {
      toast("error", "Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (subscribed) {
    return (
      <p className="mt-2 text-sm text-emerald-400">
        Subscribed! We&apos;ll keep you posted.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex gap-2">
      <input
        type="email"
        name="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 rounded-full border border-white/15 bg-white/8 px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-brand-coral/60 focus:bg-white/12 focus:ring-2 focus:ring-brand-coral/20"
      />
      <button
        type="submit"
        disabled={submitting}
        className="shrink-0 rounded-full bg-brand-coral px-5 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(232,97,77,0.3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-coral disabled:opacity-60"
      >
        {submitting ? "..." : buttonLabel}
      </button>
    </form>
  );
}
