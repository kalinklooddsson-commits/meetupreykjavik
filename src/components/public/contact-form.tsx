"use client";

import { startTransition, useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes-warning";
import { writeSessionDraft } from "@/lib/storage/session-drafts";
import { useToast } from "@/components/ui/toast";

type FieldErrors = {
  name?: string;
  email?: string;
  message?: string;
};

export function ContactForm() {
  const t = useTranslations("contactForm");
  const tCommon = useTranslations("common");
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
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const { toast } = useToast();
  const isDirty = JSON.stringify(form) !== savedSnapshot;

  useUnsavedChangesWarning(isDirty);

  function updateField(field: keyof typeof form, value: string) {
    startTransition(() => {
      setForm((current) => ({ ...current, [field]: value }));
    });
    // Clear error for this field when user starts typing
    if (fieldErrors[field as keyof FieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  const validateField = useCallback(
    (field: keyof FieldErrors, value: string): string | undefined => {
      const trimmed = value.trim();
      switch (field) {
        case "name":
          if (!trimmed) return t("errors.nameRequired") ?? "Name is required";
          return undefined;
        case "email":
          if (!trimmed) return t("errors.emailRequired") ?? "Email is required";
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed))
            return t("errors.emailInvalid") ?? "Please enter a valid email address";
          return undefined;
        case "message":
          if (!trimmed) return t("errors.messageRequired") ?? "Message is required";
          return undefined;
        default:
          return undefined;
      }
    },
    [t],
  );

  function handleBlur(field: keyof FieldErrors) {
    const error = validateField(field, form[field]);
    setFieldErrors((prev) => ({ ...prev, [field]: error }));
  }

  async function submit() {
    // Validate all fields
    const nameError = validateField("name", form.name);
    const emailError = validateField("email", form.email);
    const messageError = validateField("message", form.message);

    if (nameError || emailError || messageError) {
      setFieldErrors({ name: nameError, email: emailError, message: messageError });
      setStatus(t("status.incomplete"));
      return;
    }

    // Save locally as backup
    writeSessionDraft("meetupreykjavik-contact-draft", {
      ...form,
      savedAt: new Date().toISOString(),
    });
    setSavedSnapshot(JSON.stringify(form));

    // Submit to API
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await res.json();
      if (result.ok) {
        setStatus(result.message ?? t("status.saved"));
        toast("success", tCommon("messageSent"));
        startTransition(() => {
          setForm(initialForm);
          setFieldErrors({});
        });
      } else {
        setStatus(result.error ?? tCommon("messageFailed"));
        toast("error", result.error ?? tCommon("messageFailed"));
      }
    } catch {
      setStatus(tCommon("messageFailed"));
      toast("error", tCommon("messageFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); submit(); }}
      aria-busy={submitting}
      className="paper-panel-premium editorial-shell space-y-5 rounded-[1.7rem] border border-[rgba(255,255,255,0.74)] p-5 sm:p-6"
    >
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
            onBlur={() => handleBlur("name")}
            autoComplete="name"
            required
            aria-invalid={fieldErrors.name ? true : undefined}
            aria-describedby={fieldErrors.name ? "contact-name-error" : undefined}
            className="field-luxe mt-2 px-4 py-3 text-sm outline-none"
          />
          {fieldErrors.name && (
            <span id="contact-name-error" className="mt-1 block text-xs text-red-600" role="alert">
              {fieldErrors.name}
            </span>
          )}
        </label>
        <label className="block text-sm font-semibold text-brand-text">
          {t("fields.email")}
          <input
            id="contact-email"
            name="email"
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            onBlur={() => handleBlur("email")}
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            required
            aria-invalid={fieldErrors.email ? true : undefined}
            aria-describedby={fieldErrors.email ? "contact-email-error" : undefined}
            className="field-luxe mt-2 px-4 py-3 text-sm outline-none"
          />
          {fieldErrors.email && (
            <span id="contact-email-error" className="mt-1 block text-xs text-red-600" role="alert">
              {fieldErrors.email}
            </span>
          )}
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
          onBlur={() => handleBlur("message")}
          rows={7}
          required
          aria-invalid={fieldErrors.message ? true : undefined}
          aria-describedby={fieldErrors.message ? "contact-message-error" : undefined}
          className="field-luxe mt-2 rounded-[1.2rem] px-4 py-3 text-sm leading-7 outline-none"
        />
        {fieldErrors.message && (
          <span id="contact-message-error" className="mt-1 block text-xs text-red-600" role="alert">
            {fieldErrors.message}
          </span>
        )}
      </label>

      <div className="editorial-muted-panel flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex min-h-11 items-center rounded-full bg-brand-coral px-5 py-3 text-sm font-bold text-white shadow-[0_18px_38px_rgba(232,97,77,0.22)] transition hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? t("status.sending") ?? "Sending…" : t("submit")}
        </button>
        <p
          role="status"
          aria-live="polite"
          className="text-sm leading-7 text-brand-text-muted"
        >
          {status}
        </p>
      </div>
    </form>
  );
}
