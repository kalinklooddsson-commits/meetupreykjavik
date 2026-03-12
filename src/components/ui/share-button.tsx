"use client";

import { useState } from "react";
import { Share2, Check, Link2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface ShareButtonProps {
  title: string;
  text?: string;
  className?: string;
}

export function ShareButton({ title, text, className = "" }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  async function handleShare() {
    const url = window.location.href;

    // Try native share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // User cancelled or API unavailable — fall through to clipboard
      }
    }

    // Fallback: copy link to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast("success", "Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast("error", "Could not copy link");
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`inline-flex items-center gap-2 rounded-full border border-brand-border bg-white px-4 py-2.5 text-sm font-semibold text-brand-text transition hover:-translate-y-0.5 hover:shadow-md ${className}`}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-brand-sage" />
          Copied!
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          Share
        </>
      )}
    </button>
  );
}

export function CopyLinkButton({ className = "" }: { className?: string }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast("success", "Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast("error", "Could not copy link");
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 text-sm font-medium text-brand-text-muted hover:text-brand-indigo transition ${className}`}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-brand-sage" /> : <Link2 className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}
