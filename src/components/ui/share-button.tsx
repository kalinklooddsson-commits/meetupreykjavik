"use client";

import { useState } from "react";
import { Share2, Check, Link2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useToast } from "@/components/ui/toast";

interface ShareButtonProps {
  title: string;
  text?: string;
  className?: string;
}

export function ShareButton({ title, text, className = "" }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const t = useTranslations("common");

  async function handleShare() {
    const url = window.location.href;

    // Only use the Web Share API on devices that reliably support it
    // (mobile / tablet with touch). On desktop browsers navigator.share
    // can exist but open about:blank or show a broken picker.
    const isTouchDevice =
      typeof navigator !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0);

    if (isTouchDevice && navigator.share) {
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
      toast("success", t("linkCopied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Final fallback for insecure contexts or denied clipboard permission
      try {
        const textarea = document.createElement("textarea");
        textarea.value = url;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setCopied(true);
        toast("success", t("linkCopied"));
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast("error", t("couldNotCopy"));
      }
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
          {t("copied")}
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          {t("share")}
        </>
      )}
    </button>
  );
}

export function CopyLinkButton({ className = "" }: { className?: string }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const t = useTranslations("common");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast("success", t("linkCopied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast("error", t("couldNotCopy"));
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 text-sm font-medium text-brand-text-muted hover:text-brand-indigo transition ${className}`}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-brand-sage" /> : <Link2 className="h-3.5 w-3.5" />}
      {copied ? t("copied") : t("copyLink")}
    </button>
  );
}
