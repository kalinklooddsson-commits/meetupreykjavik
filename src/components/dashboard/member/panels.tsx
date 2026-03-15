"use client";

import { useState, useRef } from "react";
import { Save } from "lucide-react";
import { useToast } from "@/components/ui/toast";

type SettingsSection = {
  readonly key: string;
  readonly title: string;
  readonly description: string;
  readonly items: readonly { readonly label: string; readonly value: string }[];
};

type FormState = {
  displayName: string;
  bio: string;
  city: string;
  languages: string;
};

export function MemberSettingsStudio({
  sections,
}: {
  sections: readonly SettingsSection[];
}) {
  const profileSection = sections.find((s) => s.key === "profile");
  const findItem = (label: string) => profileSection?.items.find((i) => i.label === label)?.value ?? "";

  const [form, setForm] = useState<FormState>({
    displayName: findItem("Display name"),
    bio: findItem("Bio"),
    city: findItem("City") || findItem("Location") || "Reykjavik",
    languages: findItem("Languages") || "English, Icelandic",
  });

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { toast } = useToast();

  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) { toast("error", "Failed to save profile"); return; }
      const result = await response.json();
      if (result.ok) {
        setSaved(true);
        toast("success", "Profile updated successfully");
        if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
        savedTimerRef.current = setTimeout(() => setSaved(false), 3000);
      } else {
        toast("error", result.error || "Failed to save profile");
      }
    } catch {
      toast("error", "Could not save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Edit form ───────────────────────────────────────── */}
      <section className="rounded-xl border border-brand-border-light bg-white p-5 sm:p-6">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-brand-text-light">
            Edit profile
          </div>
          <h2 className="mt-1 text-lg font-semibold text-brand-text">
            Profile details
          </h2>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-brand-text-muted">
            Update your public identity, bio, and language preferences.
          </p>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {/* Display name */}
          <div>
            <label
              htmlFor="displayName"
              className="block text-sm font-medium text-brand-text"
            >
              Display name
            </label>
            <input
              id="displayName"
              type="text"
              value={form.displayName}
              onChange={(e) => handleChange("displayName", e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm text-brand-text transition focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
              placeholder="Your name"
            />
          </div>

          {/* City */}
          <div>
            <label
              htmlFor="city"
              className="block text-sm font-medium text-brand-text"
            >
              City
            </label>
            <input
              id="city"
              type="text"
              value={form.city}
              onChange={(e) => handleChange("city", e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm text-brand-text transition focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
              placeholder="Your city"
            />
          </div>

          {/* Languages */}
          <div className="sm:col-span-2">
            <label
              htmlFor="languages"
              className="block text-sm font-medium text-brand-text"
            >
              Languages
            </label>
            <input
              id="languages"
              type="text"
              value={form.languages}
              onChange={(e) => handleChange("languages", e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm text-brand-text transition focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
              placeholder="Comma-separated languages"
            />
            <p className="mt-1 text-xs text-brand-text-muted">
              Separate multiple languages with commas.
            </p>
          </div>

          {/* Bio */}
          <div className="sm:col-span-2">
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-brand-text"
            >
              Bio
            </label>
            <textarea
              id="bio"
              rows={4}
              value={form.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
              className="mt-1.5 w-full resize-y rounded-lg border border-brand-border bg-white px-3 py-2 text-sm leading-relaxed text-brand-text transition focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
              placeholder="Tell the community about yourself. What brings you to Reykjavik events?"
              maxLength={300}
            />
            <p className="mt-1 text-xs text-brand-text-muted">
              {form.bio.length} / 300 characters
            </p>
          </div>
        </div>

        {/* ── Actions ─────────────────────────────────────── */}
        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-indigo px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-indigo-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-indigo disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save changes"}
          </button>
          {saved ? (
            <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-sage">
              Changes saved successfully.
            </span>
          ) : null}
        </div>
      </section>

      {/* ── Read-only sections preview ──────────────────────── */}
      {sections
        .filter((s) => s.key !== "profile")
        .map((section) => (
          <section
            key={section.key}
            className="rounded-xl border border-brand-border-light bg-white p-5 sm:p-6"
          >
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-brand-text-light">
                Settings
              </div>
              <h2 className="mt-1 text-lg font-semibold text-brand-text">
                {section.title}
              </h2>
              <p className="mt-1 max-w-3xl text-sm leading-relaxed text-brand-text-muted">
                {section.description}
              </p>
            </div>
            <div className="mt-4 divide-y divide-brand-border-light rounded-lg border border-brand-border-light">
              {section.items.map((item) => (
                <div
                  key={item.label}
                  className="flex items-start justify-between gap-4 px-3 py-2.5"
                >
                  <dt className="text-sm text-brand-text-muted">{item.label}</dt>
                  <dd className="text-right text-sm font-medium text-brand-text">
                    {item.value}
                  </dd>
                </div>
              ))}
            </div>
          </section>
        ))}
    </div>
  );
}
