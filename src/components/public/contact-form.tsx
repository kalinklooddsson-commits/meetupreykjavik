"use client";

import { startTransition, useState } from "react";
import { useTranslations } from "next-intl";
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes-warning";
import { writeSessionDraft } from "@/lib/storage/session-drafts";

export function ContactForm() {
  const t = useTranslations("contactForm");
  const topics = [
    t("topics.general"),
    t("topics.organizer"),
    t("topics.venue"),
    t("topics.billing"),
    t("topics.privacy"),
  ] as const;
  const initialForm = {
    name: "",
    email: "",
    topic: topics[0],
    message: "",
  };
  const [form, setForm] = useState(initialForm);
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(initialForm));
  const [status, setStatus] = useState("");
  const isDirty = JSON.stringify(form) !== savedSnapshot;

  useUnsavedChangesWarning(isDirty);

  function updateField(field: keyof typeof form, value: string) {
    startTransition(() => {
      setForm((current) => ({ ...current, [field]: value }));
    });
  }

  function submit() {
    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();
    const trimmedMessage = form.message.trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      setStatus(t("status.incomplete"));
      return;
    }

    startTransition(() => {
      writeSessionDraft(
        "meetupreykjavik-contact-draft",
        {
          ...form,
          savedAt: new Date().toISOString(),
        },
      );
      setSavedSnapshot(JSON.stringify(form));
      setStatus(t("status.saved"));
    });
  }

  return (
    <div className="paper-panel-premium editorial-shell space-y-5 rounded-[1.7rem] border border-[rgba(255,255,255,0.74)] p-5 sm:p-6">
      <div>
        <div className="font-editorial text-3xl tracking-[-0.05em] text-brand-text">
          {t("title")}
        </div>
        <p className="mt-3 text-sm leading-7 text-brand-text-muted">
          {t("description")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-brand-text">
          {t("fields.name")}
          <input
            id="contact-name"
            name="name"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            autoComplete="name"
            className="field-luxe mt-2 px-4 py-3 text-sm outline-none"
          />
        </label>
        <label className="block text-sm font-semibold text-brand-text">
          {t("fields.email")}
          <input
            id="contact-email"
            name="email"
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            className="field-luxe mt-2 px-4 py-3 text-sm outline-none"
          />
        </label>
      </div>

      <label className="block text-sm font-semibold text-brand-text">
        {t("fields.topic")}
        <select
          id="contact-topic"
          name="topic"
          value={form.topic}
          onChange={(event) => updateField("topic", event.target.value)}
          className="field-luxe mt-2 px-4 py-3 text-sm outline-none"
        >
          {topics.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm font-semibold text-brand-text">
        {t("fields.message")}
        <textarea
          id="contact-message"
          name="message"
          value={form.message}
          onChange={(event) => updateField("message", event.target.value)}
          rows={7}
          className="field-luxe mt-2 rounded-[1.2rem] px-4 py-3 text-sm leading-7 outline-none"
        />
      </label>

      <div className="editorial-muted-panel flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <button
          type="button"
          onClick={submit}
          className="inline-flex min-h-11 items-center rounded-full bg-brand-coral px-5 py-3 text-sm font-bold text-white shadow-[0_18px_38px_rgba(232,97,77,0.22)] transition hover:-translate-y-0.5"
        >
          {t("submit")}
        </button>
        {status ? (
          <p
            role="status"
            aria-live="polite"
            className="text-sm leading-7 text-brand-text-muted"
          >
            {status}
          </p>
        ) : null}
      </div>
    </div>
  );
}
