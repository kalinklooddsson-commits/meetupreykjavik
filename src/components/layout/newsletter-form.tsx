"use client";

import { useState } from "react";

export function NewsletterForm({
  placeholder,
  buttonLabel,
}: {
  placeholder: string;
  buttonLabel: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || status === "sending") return;

    setStatus("sending");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const result = await res.json();
      if (result.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p className="mt-2 text-sm text-brand-coral font-medium">
        Thanks for subscribing!
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
        disabled={status === "sending"}
        className="shrink-0 rounded-full bg-brand-coral px-5 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(232,97,77,0.3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-coral disabled:opacity-60"
      >
        {status === "sending" ? "..." : buttonLabel}
      </button>
      {status === "error" && (
        <span className="self-center text-xs text-red-400">Try again</span>
      )}
    </form>
  );
}
