"use client";

import { startTransition, useMemo, useState } from "react";
import { CheckCheck, Flag, ImagePlus, Sparkles, UsersRound } from "lucide-react";
import { categories } from "@/lib/home-data";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes-warning";
import { writeSessionDraft } from "@/lib/storage/session-drafts";
import { cn } from "@/lib/utils";

type OrganizerGroupFormProps = {
  organizerName: string;
};

const bannerMoods = [
  {
    key: "indigo",
    label: "Indigo editorial",
    art: "linear-gradient(135deg, rgba(55,48,163,0.96), rgba(232,97,77,0.72))",
  },
  {
    key: "sage",
    label: "Sage outdoors",
    art: "linear-gradient(135deg, rgba(124,154,130,0.95), rgba(79,70,229,0.7))",
  },
  {
    key: "coral",
    label: "Coral social",
    art: "linear-gradient(135deg, rgba(232,97,77,0.92), rgba(245,240,232,0.88))",
  },
] as const;

const sectionClassName =
  "rounded-[1.5rem] border border-[rgba(153,148,168,0.12)] bg-white/84 p-5";
const fieldClassName =
  "luxe-field mt-2 w-full rounded-2xl px-4 py-3 outline-none transition focus-visible:border-brand-coral focus-visible:ring-4 focus-visible:ring-[rgba(232,97,77,0.1)]";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createInitialForm() {
  return {
    name: "",
    category: (categories[0]?.name ?? "Nightlife & Social") as string,
    description: "",
    city: "Reykjavik",
    visibility: "public",
    joinMode: "approval",
    tags: "hosts, curated, city",
    bannerMood: bannerMoods[0].key as (typeof bannerMoods)[number]["key"],
    moderationNotes: "Keep the first events structured and newcomer-safe.",
    accepted: false,
  };
}

export function OrganizerGroupForm({
  organizerName,
}: OrganizerGroupFormProps) {
  const [form, setForm] = useState(createInitialForm);
  const [message, setMessage] = useState("");
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(createInitialForm()));

  const slug = useMemo(() => slugify(form.name), [form.name]);
  const tags = form.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 8);
  const selectedBanner =
    bannerMoods.find((mood) => mood.key === form.bannerMood) ?? bannerMoods[0];
  const isDirty = JSON.stringify(form) !== savedSnapshot;

  useUnsavedChangesWarning(isDirty);

  function updateField<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function saveDraft() {
    const payload = {
      ...form,
      slug,
      tags,
      organizerName,
      status: form.accepted ? "pending_review" : "draft",
    };

    writeSessionDraft("meetupreykjavik-group-draft", payload);
    setSavedSnapshot(JSON.stringify(form));

    if (form.accepted) {
      setMessage("Submitting group to server...");
      try {
        const response = await fetch("/api/groups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            description: form.description,
            visibility: form.visibility,
            join_mode: form.joinMode,
            tags: tags,
            banner_url: null,
          }),
        });
        const result = await response.json();
        if (result.ok) {
          setMessage("Group submitted for review! You'll be notified when it's approved.");
        } else {
          setMessage(`Server: ${result.details?.formErrors?.[0] ?? result.error ?? "Unknown error"}`);
        }
      } catch {
        setMessage("Could not reach the server. Group saved locally as a draft.");
      }
    } else {
      setMessage("Group draft saved locally. Accept the checklist when you are ready to submit.");
    }
  }

  const readiness = [
    Boolean(form.name.trim()),
    Boolean(form.description.replace(/<[^>]*>/g, "").trim().length >= 80),
    tags.length >= 2,
    form.accepted,
  ];

  return (
    <div className="section-shell py-10">
      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <aside className="space-y-6">
          <section className={sectionClassName}>
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-brand-text-light">
              Group launch
            </div>
            <h1 className="font-editorial mt-4 text-4xl tracking-[-0.05em] text-brand-text">
              Create a new group
            </h1>
            <p className="mt-4 text-sm leading-7 text-brand-text-muted">
              Build the group identity, join rules, banner tone, and moderation-ready
              positioning before you publish the first event.
            </p>
            <div className="mt-5 grid gap-3">
              {[
                {
                  label: "Organizer",
                  value: organizerName,
                  icon: UsersRound,
                },
                {
                  label: "Visibility",
                  value: form.visibility === "public" ? "Public discovery" : "Private invite",
                  icon: Flag,
                },
                {
                  label: "Moderation",
                  value: form.accepted ? "Ready to review" : "Draft only",
                  icon: CheckCheck,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-[1.1rem] bg-[rgba(245,240,232,0.84)] px-4 py-3"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-brand-indigo">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-brand-text-light">
                      {item.label}
                    </div>
                    <div className="text-sm font-semibold text-brand-text">
                      {item.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className={sectionClassName}>
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-brand-text-light">
              Readiness
            </div>
            <div className="mt-4 space-y-3">
              {[
                "Name and category chosen",
                "Description explains the format clearly",
                "Tags help with discovery and moderation review",
                "Organizer checklist accepted",
              ].map((label, index) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-[1rem] border border-[rgba(153,148,168,0.12)] bg-white/76 px-4 py-3"
                >
                  <span
                    className={cn(
                      "inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                      readiness[index]
                        ? "bg-[rgba(124,154,130,0.14)] text-brand-sage"
                        : "bg-[rgba(232,97,77,0.08)] text-brand-coral",
                    )}
                  >
                    {index + 1}
                  </span>
                  <span className="text-sm text-brand-text">{label}</span>
                </div>
              ))}
            </div>
          </section>
        </aside>

        <div className="space-y-6">
          <section className={sectionClassName}>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block text-sm font-semibold text-brand-text">
                Group name
                <input
                  id="group-name"
                  name="name"
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="Example: Reykjavik Makers Circle"
                  autoComplete="organization"
                  className={fieldClassName}
                />
              </label>
              <label className="block text-sm font-semibold text-brand-text">
                Category
                <select
                  id="group-category"
                  name="category"
                  value={form.category}
                  onChange={(event) => updateField("category", event.target.value)}
                  className={fieldClassName}
                >
                  {categories.map((category) => (
                    <option key={category.name} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <label className="block text-sm font-semibold text-brand-text">
                City
                <input
                  id="group-city"
                  name="city"
                  value={form.city}
                  onChange={(event) => updateField("city", event.target.value)}
                  autoComplete="address-level2"
                  className={fieldClassName}
                />
              </label>
              <div className="rounded-2xl border border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.8)] px-4 py-3">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-brand-text-light">
                  Generated slug
                </div>
                <div className="mt-2 text-sm font-semibold text-brand-text">
                  {slug || "group-slug-preview"}
                </div>
              </div>
            </div>

            <div className="mt-5 block text-sm font-semibold text-brand-text">
              Group description
              <RichTextEditor
                content={form.description}
                onChange={(html) => updateField("description", html)}
                placeholder="Describe the format, who the group is for, what a first-timer should expect, and why this group belongs in Reykjavik."
                className="mt-2"
              />
              <span className="mt-2 block text-xs font-medium text-brand-text-light">
                Aim for 80-240 words so the moderation team can understand the concept and the tone quickly.
              </span>
            </div>
          </section>

          <section className={sectionClassName}>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block text-sm font-semibold text-brand-text">
                Visibility
                <select
                  id="group-visibility"
                  name="visibility"
                  value={form.visibility}
                  onChange={(event) => updateField("visibility", event.target.value)}
                  className={fieldClassName}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </label>

              <label className="block text-sm font-semibold text-brand-text">
                Join mode
                <select
                  id="group-join-mode"
                  name="joinMode"
                  value={form.joinMode}
                  onChange={(event) => updateField("joinMode", event.target.value)}
                  className={fieldClassName}
                >
                  <option value="approval">Approval</option>
                  <option value="open">Open</option>
                </select>
              </label>
            </div>

            <label className="mt-5 block text-sm font-semibold text-brand-text">
              Discovery tags
              <input
                id="group-tags"
                name="tags"
                value={form.tags}
                onChange={(event) => updateField("tags", event.target.value)}
                placeholder="hosts, newcomers, workshops"
                className={fieldClassName}
              />
            </label>

            <label className="mt-5 block text-sm font-semibold text-brand-text">
              Moderation notes
              <textarea
                id="group-moderation-notes"
                name="moderationNotes"
                value={form.moderationNotes}
                onChange={(event) => updateField("moderationNotes", event.target.value)}
                rows={3}
                className={`${fieldClassName} leading-7`}
              />
            </label>
          </section>

          <section className={sectionClassName}>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(79,70,229,0.08)] text-brand-indigo">
                <ImagePlus className="h-5 w-5" />
              </span>
              <div>
                <div className="font-semibold text-brand-text">Banner direction</div>
                <p className="text-sm text-brand-text-muted">
                  Pick the visual tone the group should open with on cards and the group detail header.
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {bannerMoods.map((mood) => (
                <button
                  key={mood.key}
                  type="button"
                  onClick={() => updateField("bannerMood", mood.key)}
                  className={cn(
                    "overflow-hidden rounded-[1.25rem] border text-left transition",
                    form.bannerMood === mood.key
                      ? "border-[rgba(79,70,229,0.22)] shadow-[0_12px_32px_rgba(79,70,229,0.12)]"
                      : "border-[rgba(153,148,168,0.12)]",
                  )}
                >
                  <div className="h-28" style={{ background: mood.art }} />
                  <div className="bg-white/86 px-4 py-3 text-sm font-semibold text-brand-text">
                    {mood.label}
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className={sectionClassName}>
            <div className="rounded-[1.45rem] border border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.82)] p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-5 w-5 text-brand-coral" />
                <div>
                  <div className="font-semibold text-brand-text">
                    Launch checklist
                  </div>
                  <p className="mt-2 text-sm leading-7 text-brand-text-muted">
                    I understand the group will stay local-only for now, save as a draft in this folder’s workflow, and later connect to Supabase moderation and publishing.
                  </p>
                </div>
              </div>
              <label className="mt-4 flex items-center gap-3 text-sm font-medium text-brand-text">
                <input
                  type="checkbox"
                  checked={form.accepted}
                  onChange={(event) => updateField("accepted", event.target.checked)}
                  className="h-4 w-4 rounded border-brand-border text-brand-coral"
                />
                Mark this group ready for review
              </label>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={saveDraft}
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand-coral px-5 py-3 text-sm font-bold text-white shadow-[0_16px_40px_rgba(232,97,77,0.24)] transition hover:-translate-y-0.5"
              >
                Save local group draft
                <CheckCheck className="h-4 w-4" />
              </button>
              <div className="text-sm text-brand-text-muted">
                Drafts save to local storage only. Nothing is deployed or published.
              </div>
            </div>

            {message ? (
              <div
                role="status"
                aria-live="polite"
                className="mt-4 rounded-[1.1rem] border border-[rgba(124,154,130,0.22)] bg-[rgba(124,154,130,0.12)] px-4 py-3 text-sm text-brand-sage-dark"
              >
                {message}
              </div>
            ) : null}
          </section>

          <section className={sectionClassName}>
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-brand-text-light">
              Live preview
            </div>
            <div className="mt-4 overflow-hidden rounded-[1.45rem] border border-[rgba(153,148,168,0.12)] bg-white">
              <div className="h-40" style={{ background: selectedBanner.art }} />
              <div className="p-5">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-[rgba(79,70,229,0.08)] px-3 py-1 text-xs font-semibold text-brand-indigo">
                    {form.category}
                  </span>
                  <span className="rounded-full bg-[rgba(245,240,232,0.92)] px-3 py-1 text-xs font-semibold text-brand-text">
                    {form.joinMode === "approval" ? "Approval join" : "Open join"}
                  </span>
                </div>
                <div className="font-editorial mt-4 text-3xl tracking-[-0.05em] text-brand-text">
                  {form.name || "Your group name"}
                </div>
                {/* Safe: user's own Tiptap editor output previewed back to them (StarterKit restricts to safe HTML subset) */}
                {form.description.replace(/<[^>]*>/g, "").trim() ? (
                  <div
                    className="prose prose-sm mt-3 max-w-none text-brand-text-muted"
                    dangerouslySetInnerHTML={{ __html: form.description }}
                  />
                ) : (
                  <p className="mt-3 text-sm leading-7 text-brand-text-muted">
                    Your group description will appear here as you write it.
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  {tags.length > 0 ? (
                    tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-[rgba(153,148,168,0.16)] px-3 py-1 text-xs font-semibold text-brand-text-muted"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-brand-text-light">
                      Add at least two tags to improve discovery.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
