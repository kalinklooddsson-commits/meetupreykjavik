"use client";

import { useState, useEffect } from "react";
import { Check, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/toast";

const STORAGE_KEY = "meetupreykjavik-read-messages";

function getReadMessages(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function markAsRead(key: string) {
  const read = getReadMessages();
  read.add(key);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...read]));
}

export function MessageStatusBadge({ messageKey, serverStatus }: { messageKey: string; serverStatus: string }) {
  const [status, setStatus] = useState(serverStatus);

  useEffect(() => {
    if (getReadMessages().has(messageKey)) {
      setStatus("Read");
    }
  }, [messageKey]);

  // Listen for mark-read events from MessageActions
  useEffect(() => {
    function onStorage() {
      if (getReadMessages().has(messageKey)) setStatus("Read");
    }
    window.addEventListener("storage", onStorage);
    // Also poll on custom event for same-tab updates
    window.addEventListener("message-read", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("message-read", onStorage);
    };
  }, [messageKey]);

  const tone = /read/i.test(status) ? "sage" : "coral";
  return (
    <span
      className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold ${
        tone === "sage"
          ? "bg-[rgba(124,154,130,0.1)] text-brand-sage"
          : "bg-[rgba(232,97,77,0.1)] text-brand-coral"
      }`}
    >
      {status}
    </span>
  );
}

export function MessageActions({ messageKey, subject }: { messageKey: string; subject: string }) {
  const { toast } = useToast();
  const [isRead, setIsRead] = useState(false);

  useEffect(() => {
    setIsRead(getReadMessages().has(messageKey));
  }, [messageKey]);

  function handleMarkRead() {
    markAsRead(messageKey);
    setIsRead(true);
    window.dispatchEvent(new Event("message-read"));
    toast("success", `Marked "${subject}" as read`);
  }

  if (isRead) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-brand-sage">
        <Check className="h-3 w-3" />
        Read
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleMarkRead}
      className="inline-flex items-center gap-1 rounded-md border border-brand-border-light px-2 py-1 text-xs font-medium text-brand-text-muted transition hover:border-brand-indigo hover:text-brand-indigo"
    >
      <Check className="h-3 w-3" />
      Mark read
    </button>
  );
}
