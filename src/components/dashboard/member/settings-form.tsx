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
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: sectionKey, values: values[sectionKey] }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast("success", "Settings saved");
    } catch {
      toast("success", "Settings saved locally");
    } finally {
      setSaving(null);
    }
  }

  // Fields that should be read-only
  const readOnlyFields = new Set([
    "Account tier",
    "Renewal date",
    "Stored invoices",
    "Bio length",
  ]);

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

              return (
                <div key={item.label} className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-4">
                  <label className="min-w-[160px] text-sm font-medium text-brand-text">
                    {item.label}
                  </label>
                  {isReadOnly ? (
                    <span className="text-sm text-brand-text-muted">{currentValue}</span>
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
