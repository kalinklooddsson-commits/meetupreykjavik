"use client";

import { useState, useEffect } from "react";
import { Check, Reply, Send, X, Loader2 } from "lucide-react";
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
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setIsRead(getReadMessages().has(messageKey));
  }, [messageKey]);

  async function handleMarkRead() {
    markAsRead(messageKey);
    setIsRead(true);
    window.dispatchEvent(new Event("message-read"));
    toast("success", `Marked "${subject}" as read`);
    // Persist to backend
    try {
      await fetch("/api/notifications/read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [messageKey] }),
      });
    } catch { /* localStorage is primary, API is best-effort */ }
  }

  async function handleSendReply() {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId: messageKey, body: replyText.trim(), subject: `Re: ${subject}` }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to send");
      }
      // Mark as read after replying
      markAsRead(messageKey);
      setIsRead(true);
      window.dispatchEvent(new Event("message-read"));
      toast("success", "Reply sent");
      setReplyText("");
      setShowReply(false);
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Could not send reply. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        {isRead ? (
          <span className="inline-flex items-center gap-1 text-xs text-brand-sage">
            <Check className="h-3 w-3" />
            Read
          </span>
        ) : (
          <button
            type="button"
            onClick={handleMarkRead}
            className="inline-flex items-center gap-1 rounded-md border border-brand-border-light px-2 py-1 text-xs font-medium text-brand-text-muted transition hover:border-brand-indigo hover:text-brand-indigo"
          >
            <Check className="h-3 w-3" />
            Mark read
          </button>
        )}
        <button
          type="button"
          onClick={() => setShowReply(!showReply)}
          className="inline-flex items-center gap-1 rounded-md border border-brand-border-light px-2 py-1 text-xs font-medium text-brand-text-muted transition hover:border-brand-indigo hover:text-brand-indigo"
        >
          <Reply className="h-3 w-3" />
          Reply
        </button>
      </div>
      {showReply && (
        <div className="flex items-start gap-2">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type your reply…"
            rows={2}
            className="flex-1 rounded-lg border border-brand-border-light bg-white px-3 py-2 text-sm text-brand-text placeholder:text-brand-text-light transition focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20 resize-none"
          />
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={handleSendReply}
              disabled={sending || !replyText.trim()}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-indigo text-white transition hover:bg-brand-indigo-dark disabled:opacity-50"
            >
              {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => { setShowReply(false); setReplyText(""); }}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-brand-border-light text-brand-text-muted transition hover:border-brand-coral hover:text-brand-coral"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compose button — opens a new message form.
 * Used in the messages page header across all 4 roles.
 */
export function ComposeMessageButton() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSend() {
    if (!to.trim() || !subject.trim() || !body.trim()) {
      toast("error", "Please fill in all fields.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: to.trim(), subject: subject.trim(), body: body.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to send");
      }
      toast("success", "Message sent");
      setTo("");
      setSubject("");
      setBody("");
      setOpen(false);
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Could not send message. Please try again.");
    } finally {
      setSending(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-brand-indigo px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-indigo-dark"
      >
        <Send className="h-4 w-4" />
        New message
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-brand-border-light bg-white p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-brand-text">New Message</h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-brand-text-muted transition hover:text-brand-coral"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <input
        type="text"
        placeholder="To (name or email)"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        className="w-full rounded-lg border border-brand-border-light bg-white px-3 py-2 text-sm text-brand-text placeholder:text-brand-text-light transition focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
      />
      <input
        type="text"
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="w-full rounded-lg border border-brand-border-light bg-white px-3 py-2 text-sm text-brand-text placeholder:text-brand-text-light transition focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
      />
      <textarea
        placeholder="Your message…"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        className="w-full rounded-lg border border-brand-border-light bg-white px-3 py-2 text-sm text-brand-text placeholder:text-brand-text-light transition focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20 resize-none"
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-brand-border-light px-4 py-2 text-sm font-medium text-brand-text-muted transition hover:border-brand-coral hover:text-brand-coral"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSend}
          disabled={sending}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-indigo px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-indigo-dark disabled:opacity-50"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Send
        </button>
      </div>
    </div>
  );
}
