"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";

type SettingsSection = {
  key: string;
  title: string;
  description: string;
  items: { label: string; value: string }[];
};

export function SettingsForm({
  sections,
  userName,
  userEmail,
}: {
  sections: SettingsSection[];
  userName: string;
  userEmail: string;
}) {
  const { toast } = useToast();
  const [saving, setSaving] = useState<string | null>(null);

  // Editable state for each section's items
  const [values, setValues] = useState<Record<string, Record<string, string>>>(() => {
    const initial: Record<string, Record<string, string>> = {};
    for (const section of sections) {
      initial[section.key] = {};
      for (const item of section.items) {
        initial[section.key][item.label] = item.value;
      }
    }
    // Override with actual session data
    if (initial["profile"]) {
      initial["profile"]["Display name"] = userName;
    }
    if (initial["account"]) {
      initial["account"]["Primary email"] = userEmail;
    }
    return initial;
  });

  function updateValue(sectionKey: string, label: string, newValue: string) {
    setValues((prev) => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], [label]: newValue },
    }));
  }

  async function handleSave(sectionKey: string) {
    setSaving(sectionKey);
    try {
      const res = await fetch("/api/member/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: sectionKey, values: values[sectionKey] }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast("success", "Settings saved");
    } catch {
      toast("error", "Could not save settings. Please try again.");
    } finally {
      setSaving(null);
    }
  }

  // Fields that should be read-only
  const readOnlyFields = new Set([
    "Account tier",
    "Current plan",
    "Renewal date",
    "Stored invoices",
  ]);

  // Fields that should render as textareas
  const textareaFields = new Set(["Bio"]);

  // Fields that should render as tag inputs
  const tagFields = new Set(["Interests"]);

  // Fields that should render as select dropdowns
  const selectFields: Record<string, string[]> = {
    "Event reminders": ["24h and 2h before", "24h before", "2h before", "None"],
    "Weekly digest": ["Enabled", "Disabled"],
    "Waitlist alerts": ["Push + email", "Email only", "Push only", "None"],
    "Primary locale": ["English", "Icelandic"],
    "Secondary locale": ["Icelandic", "English", "None"],
    "Event copy fallback": ["Show both if available", "Primary only", "Secondary only"],
    "Profile visibility": ["Public", "Members only", "Private"],
    "Attendance history": ["Visible to joined groups", "Visible to all", "Hidden"],
    "Direct messages": ["Allow organizers only", "Allow all members", "Disabled"],
    "2-step auth": ["Recommended", "Enabled", "Disabled"],
  };

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div
          key={section.key}
          className="rounded-2xl border border-brand-border-light bg-white p-5 sm:p-6"
        >
          <div className="mb-4">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-widest text-brand-text-light">
              Settings
            </p>
            <h3 className="mt-1 text-lg font-semibold text-brand-text">
              {section.title}
            </h3>
            <p className="mt-0.5 text-sm text-brand-text-muted">
              {section.description}
            </p>
          </div>

          <div className="space-y-4">
            {section.items.map((item) => {
              const sectionVals = values[section.key] ?? {};
              const currentValue = sectionVals[item.label] ?? item.value;
              const isReadOnly = readOnlyFields.has(item.label);
              const options = selectFields[item.label];
              const isTextarea = textareaFields.has(item.label);
              const isTagField = tagFields.has(item.label);

              return (
                <div key={item.label} className={`flex flex-col gap-1.5 ${isTextarea || isTagField ? "" : "sm:flex-row sm:items-center"} sm:gap-4`}>
                  <label className="min-w-[160px] text-sm font-medium text-brand-text">
                    {item.label}
                  </label>
                  {isReadOnly ? (
                    <span className="text-sm text-brand-text-muted">{currentValue}</span>
                  ) : isTextarea ? (
                    <textarea
                      value={currentValue}
                      onChange={(e) => updateValue(section.key, item.label, e.target.value)}
                      rows={3}
                      placeholder={`Enter your ${item.label.toLowerCase()}…`}
                      className="flex-1 rounded-lg border border-brand-border-light bg-white px-3 py-2 text-sm text-brand-text transition focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20 resize-none"
                    />
                  ) : isTagField ? (
                    <TagInput
                      value={currentValue}
                      onChange={(newVal) => updateValue(section.key, item.label, newVal)}
                    />
                  ) : options ? (
                    <select
                      value={currentValue}
                      onChange={(e) => updateValue(section.key, item.label, e.target.value)}
                      className="rounded-lg border border-brand-border-light bg-white px-3 py-2 text-sm text-brand-text transition focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
                    >
                      {options.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={currentValue}
                      onChange={(e) => updateValue(section.key, item.label, e.target.value)}
                      className="flex-1 rounded-lg border border-brand-border-light bg-white px-3 py-2 text-sm text-brand-text transition focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={() => handleSave(section.key)}
              disabled={saving === section.key}
              className="rounded-lg bg-brand-indigo px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-indigo-dark disabled:opacity-50"
            >
              {saving === section.key ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Tag input for comma-separated values like interests */
function TagInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [inputValue, setInputValue] = useState("");
  const tags = value ? value.split(",").map((t) => t.trim()).filter(Boolean) : [];

  function addTag() {
    const trimmed = inputValue.trim();
    if (trimmed && !tags.includes(trimmed)) {
      const updated = [...tags, trimmed].join(", ");
      onChange(updated);
    }
    setInputValue("");
  }

  function removeTag(tag: string) {
    const updated = tags.filter((t) => t !== tag).join(", ");
    onChange(updated);
  }

  return (
    <div className="flex-1 space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-lg bg-brand-indigo/10 px-2.5 py-1 text-xs font-medium text-brand-indigo"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-0.5 text-brand-indigo/60 transition hover:text-brand-coral"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
          placeholder="Add interest and press Enter…"
          className="flex-1 rounded-lg border border-brand-border-light bg-white px-3 py-2 text-sm text-brand-text placeholder:text-brand-text-light transition focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
        />
        <button
          type="button"
          onClick={addTag}
          className="rounded-lg border border-brand-indigo/30 px-3 py-2 text-xs font-medium text-brand-indigo transition hover:bg-brand-indigo/5"
        >
          Add
        </button>
      </div>
    </div>
  );
}
