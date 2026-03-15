"use client";

import { startTransition, useMemo, useState } from "react";
import {
  CalendarClock,
  CheckCheck,
  ImagePlus,
  ListChecks,
  MapPinned,
  ScrollText,
  Ticket,
  UsersRound,
} from "lucide-react";
import { categories } from "@/lib/home-data";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  minimumTicketPriceIsk,
  publicGroups,
  publicVenues,
  ticketCommissionRate,
} from "@/lib/public-data";
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes-warning";
import { writeSessionDraft } from "@/lib/storage/session-drafts";
import { cn } from "@/lib/utils";

export type EventFormData = ReturnType<typeof createInitialForm>;

type OrganizerEventWizardProps = {
  organizerName: string;
  mode?: "create" | "edit";
  initialData?: Partial<EventFormData>;
  eventSlug?: string;
};

const steps = [
  { key: "basics", label: "Basics", icon: ScrollText },
  { key: "schedule", label: "Date & recurring", icon: CalendarClock },
  { key: "location", label: "Location", icon: MapPinned },
  { key: "capacity", label: "Capacity & access", icon: UsersRound },
  { key: "ticketing", label: "Ticketing", icon: Ticket },
  { key: "media", label: "Media & copy", icon: ImagePlus },
  { key: "review", label: "Review", icon: CheckCheck },
] as const;
const iskFormatter = new Intl.NumberFormat("is-IS");

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stepIsReady(stepIndex: number, form: ReturnType<typeof createInitialForm>) {
  switch (stepIndex) {
    case 0:
      return Boolean(form.title.trim() && form.groupSlug);
    case 1:
      return Boolean(form.startsOn && form.startTime);
    case 2:
      return form.locationMode === "venue"
        ? Boolean(form.venueSlug)
        : form.locationMode === "custom"
          ? Boolean(form.venueAddress.trim())
          : Boolean(form.onlineLink.trim());
    case 3:
      return form.attendeeLimit > 0;
    case 4:
      return form.isFree || getTicketPriceIsk(form.ticketPrice) >= minimumTicketPriceIsk;
    case 5:
      return Boolean(form.description.replace(/<[^>]*>/g, "").trim().length >= 100);
    case 6:
      return true;
    default:
      return false;
  }
}

function getTicketPriceIsk(value: string) {
  const digits = value.replace(/[^\d]/g, "");

  return digits ? Number.parseInt(digits, 10) : 0;
}

function formatIsk(value: number) {
  return `${iskFormatter.format(value)} ISK`;
}

function createInitialForm() {
  return {
    title: "",
    groupSlug: "",
    category: "",
    eventType: "in_person",
    tags: "",
    startsOn: "",
    startTime: "18:00",
    endTime: "21:00",
    recurring: false,
    recurrenceRule: "",
    recurrenceEnds: "",
    locationMode: "venue",
    venueSlug: "",
    venueAddress: "",
    onlineLink: "",
    attendeeLimit: 50,
    guestLimit: 0,
    rsvpMode: "open",
    visibilityMode: "public",
    ageRestriction: "",
    ageMin: "",
    ageMax: "",
    isFree: true,
    ticketPrice: "",
    ticketLabel: "",
    refundPolicy: "",
    coHosts: "",
    guestQuestion: "",
    reminderCadence: "24h before start",
    featuredPlacement: false,
    description: "",
    featuredPhotoUrl: "",
    galleryNotes: "",
    commentsEnabled: true,
    launchNotes: "",
  };
}

const sectionClassName =
  "conversion-panel rounded-[1.5rem] border border-[rgba(153,148,168,0.12)] bg-white/84 p-5";

export function OrganizerEventWizard({
  organizerName,
  mode = "create",
  initialData,
  eventSlug,
}: OrganizerEventWizardProps) {
  const isEdit = mode === "edit";
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(() => {
    const base = createInitialForm();
    return initialData ? { ...base, ...initialData } : base;
  });
  const [message, setMessage] = useState("");
  const [savedSnapshot, setSavedSnapshot] = useState(() => {
    const base = createInitialForm();
    return JSON.stringify(initialData ? { ...base, ...initialData } : base);
  });

  const selectedGroup =
    publicGroups.find((group) => group.slug === form.groupSlug) ?? publicGroups[0];
  const selectedVenue =
    publicVenues.find((venue) => venue.slug === form.venueSlug) ?? publicVenues[0];
  const slug = useMemo(() => slugify(form.title), [form.title]);
  const tags = form.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 8);
  const ticketPriceIsk = useMemo(() => getTicketPriceIsk(form.ticketPrice), [form.ticketPrice]);
  const estimatedGrossAtCapacity = form.isFree ? 0 : ticketPriceIsk * form.attendeeLimit;
  const estimatedPlatformFee = form.isFree
    ? 0
    : Math.round((estimatedGrossAtCapacity * ticketCommissionRate) / 100);
  const isPaidTicketValid = form.isFree || ticketPriceIsk >= minimumTicketPriceIsk;
  const isDirty = JSON.stringify(form) !== savedSnapshot;
  const completion = Math.round(
    (steps.filter((_, index) => stepIsReady(index, form)).length / steps.length) * 100,
  );

  useUnsavedChangesWarning(isDirty);

  function updateField<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function moveStep(direction: "back" | "forward") {
    startTransition(() => {
      setStep((current) => {
        if (direction === "back") {
          return Math.max(current - 1, 0);
        }

        return Math.min(current + 1, steps.length - 1);
      });
    });
  }

  function buildPayload() {
    const selectedVenue = publicVenues.find((v) => v.slug === form.venueSlug);
    return {
      title: form.title,
      description: form.description,
      status: "published",
      groupSlug: form.groupSlug || null,
      eventType: form.locationMode === "online" ? "online" : "in_person",
      startsAt: form.startsOn && form.startTime
        ? new Date(`${form.startsOn}T${form.startTime}:00+00:00`).toISOString()
        : null,
      endsAt: form.startsOn && form.endTime
        ? new Date(`${form.startsOn}T${form.endTime}:00+00:00`).toISOString()
        : null,
      venueSlug: form.venueSlug || null,
      venueName: selectedVenue?.name ?? form.venueAddress ?? null,
      venueAddress: form.venueAddress || selectedVenue?.address || null,
      onlineLink: form.onlineLink || null,
      attendeeLimit: form.attendeeLimit || null,
      guestLimit: form.guestLimit || 0,
      ageRestriction: form.ageRestriction || "",
      ageMin: form.ageMin ? Number(form.ageMin) : null,
      ageMax: form.ageMax ? Number(form.ageMax) : null,
      isFree: form.isFree,
      rsvpMode: form.rsvpMode,
      commentsEnabled: form.commentsEnabled,
      recurrence: form.recurring ? form.recurrenceRule : null,
      featuredPhotoUrl: form.featuredPhotoUrl || null,
      category: form.category || null,
      tags: tags.length > 0 ? tags : null,
      // Build single-tier ticketTiers array for paid events
      ticketTiers: form.isFree
        ? []
        : [
            {
              name: form.ticketLabel || "General admission",
              priceIsk: ticketPriceIsk,
              priceUsd: 0,
              quantity: form.attendeeLimit || 50,
            },
          ],
    };
  }

  const [submitting, setSubmitting] = useState(false);

  async function saveDraft(action: "draft" | "publish-ready") {
    if (submitting) return;
    // Always save locally first
    if (!isEdit) {
      writeSessionDraft(
        "meetupreykjavik-event-draft",
        {
          ...form,
          slug,
          tags,
          ticketPriceIsk,
          organizerName,
          status: action === "publish-ready" ? "ready_for_review" : "draft",
        },
      );
    }
    setSavedSnapshot(JSON.stringify(form));

    if (action === "publish-ready") {
      // Submit to API
      setSubmitting(true);
      setMessage(isEdit ? "Saving changes..." : "Submitting event to server...");
      try {
        const url = isEdit ? `/api/events/${eventSlug}` : "/api/events";
        const method = isEdit ? "PATCH" : "POST";
        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildPayload()),
        });
        const result = await response.json();
        if (result.ok) {
          if (isEdit) {
            window.location.href = `/organizer/events/${eventSlug}`;
            return;
          }
          const createdSlug = result.data?.slug;
          if (createdSlug) {
            window.location.href = `/events/${createdSlug}`;
            return;
          }
          setMessage("Event published successfully!");
        } else {
          setMessage(`Server responded: ${result.details?.formErrors?.[0] ?? result.error ?? "Unknown error"}`);
        }
      } catch {
        setMessage(isEdit
          ? "Could not reach the server. Changes were not saved."
          : "Could not reach the server. Please try again later.");
      } finally {
        setSubmitting(false);
      }
    } else {
      setMessage("Event draft saved locally. Nothing has been published or deployed.");
    }
  }

  return (
    <div className="section-shell py-10">
      <div className="grid gap-6 xl:grid-cols-[290px_1fr_350px]">
        <aside className={sectionClassName}>
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-brand-text-light">
            Seven-step wizard
          </div>
          <h1 className="font-editorial mt-4 text-4xl tracking-[-0.05em] text-brand-text">
            Create a new event
          </h1>
          <p className="mt-4 text-sm leading-7 text-brand-text-muted">
            Work through the full organizer flow: group selection, recurring setup,
            venue or online location, attendee controls, ticketing, media, and final review.
          </p>

          <div className="mt-6 rounded-[1.3rem] bg-[rgba(245,240,232,0.84)] p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand-text-light">
                Completion
              </span>
              <span className="text-sm font-semibold text-brand-text">
                {completion}%
              </span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/80">
              <div
                className="h-2 rounded-full bg-[linear-gradient(90deg,var(--brand-indigo),var(--brand-coral))]"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {steps.map((item, index) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setStep(index)}
                className={cn(
                  "wizard-step-card flex w-full items-center gap-3 rounded-[1.1rem] border px-4 py-3 text-left transition",
                  step === index
                    ? "wizard-step-card-active border-[rgba(79,70,229,0.2)] bg-[rgba(79,70,229,0.08)]"
                    : "border-[rgba(153,148,168,0.12)] bg-white/78",
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-10 w-10 items-center justify-center rounded-2xl",
                    stepIsReady(index, form)
                      ? "bg-[rgba(124,154,130,0.14)] text-brand-sage"
                      : "bg-[rgba(245,240,232,0.94)] text-brand-text-muted",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-sm font-semibold text-brand-text">
                    Step {index + 1}
                  </div>
                  <div className="text-xs text-brand-text-muted">{item.label}</div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <div className="space-y-6">
          {step === 0 ? (
            <section className={sectionClassName}>
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block text-sm font-semibold text-brand-text">
                  Event title
                  <input
                    id="event-title"
                    name="title"
                    value={form.title}
                    onChange={(event) => updateField("title", event.target.value)}
                    placeholder="React systems night"
                    autoComplete="off"
                    className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-sand-light px-4 py-3 outline-none transition focus:border-brand-coral"
                  />
                </label>
                <label className="block text-sm font-semibold text-brand-text">
                  Group
                  <select
                    value={form.groupSlug}
                    onChange={(event) => updateField("groupSlug", event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-sand-light px-4 py-3 outline-none transition focus:border-brand-coral"
                  >
                    {publicGroups.map((group) => (
                      <option key={group.slug} value={group.slug}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <label className="block text-sm font-semibold text-brand-text">
                  Category
                  <select
                    value={form.category}
                    onChange={(event) => updateField("category", event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-sand-light px-4 py-3 outline-none transition focus:border-brand-coral"
                  >
                    {categories.map((category) => (
                      <option key={category.name} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-semibold text-brand-text">
                  Event type
                  <select
                    value={form.eventType}
                    onChange={(event) => updateField("eventType", event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-sand-light px-4 py-3 outline-none transition focus:border-brand-coral"
                  >
                    <option value="in_person">In person</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="online">Online</option>
                  </select>
                </label>
              </div>

              <label className="mt-5 block text-sm font-semibold text-brand-text">
                  Tags
                  <input
                    id="event-tags"
                    name="tags"
                    value={form.tags}
                    onChange={(event) => updateField("tags", event.target.value)}
                    placeholder="react, architecture, systems"
                  className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-sand-light px-4 py-3 outline-none transition focus:border-brand-coral"
                />
              </label>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <label className="block text-sm font-semibold text-brand-text">
                  Visibility mode
                  <select
                    value={form.visibilityMode}
                    onChange={(event) => updateField("visibilityMode", event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-sand-light px-4 py-3 outline-none transition focus:border-brand-coral"
                  >
                    <option value="public">Public discovery</option>
                    <option value="approval">Public with host approval</option>
                    <option value="members_only">Members only</option>
                    <option value="invite_only">Invite only</option>
                  </select>
                </label>
                <label className="block text-sm font-semibold text-brand-text">
                  Co-hosts
                  <input
                    id="event-cohosts"
                    name="coHosts"
                    value={form.coHosts}
                    onChange={(event) => updateField("coHosts", event.target.value)}
                    placeholder="Name one or more co-hosts"
                    className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-sand-light px-4 py-3 outline-none transition focus:border-brand-coral"
                  />
                </label>
              </div>
            </section>
          ) : null}

          {step === 1 ? (
            <section className={sectionClassName}>
              <div className="grid gap-5 md:grid-cols-3">
                <label className="block text-sm font-semibold text-brand-text">
                  Start date
                  <input
                    type="date"
                    value={form.startsOn}
                    onChange={(event) => updateField("startsOn", event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-sand-light px-4 py-3 outline-none transition focus:border-brand-coral"
                  />
                </label>
                <label className="block text-sm font-semibold text-brand-text">
                  Start time
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(event) => updateField("startTime", event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-sand-light px-4 py-3 outline-none transition focus:border-brand-coral"
                  />
                </label>
                <label className="block text-sm font-semibold text-brand-text">
                  End time
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(event) => updateField("endTime", event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-sand-light px-4 py-3 outline-none transition focus:border-brand-coral"
                  />
                </label>
              </div>

              <label className="mt-5 flex items-center gap-3 text-sm font-semibold text-brand-text">
                <input
                  type="checkbox"
                  checked={form.recurring}
                  onChange={(event) => updateField("recurring", event.target.checked)}
                  className="h-4 w-4 rounded border-brand-border text-brand-coral"
                />
                Make this a recurring event
              </label>

              {form.recurring ? (
                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <label className="block text-sm font-semibold text-brand-text">
                    Recurrence rule
                    <input
                      value={form.recurrenceRule}
                      onChange={(event) => updateField("recurrenceRule", event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-sand-light px-4 py-3 outline-none transition focus:border-brand-coral"
                    />
                  </label>
                  <label className="block text-sm font-semibold text-brand-text">
                    Recurrence end
                    <input
                      type="date"
                      value={form.recurrenceEnds}
                      onChange={(event) => updateField("recurrenceEnds", event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-sand-light px-4 py-3 outline-none transition focus:border-brand-coral"
                    />
                  </label>
                </div>
              ) : null}
            </section>
          ) : null}

          {step === 2 ? (
            <section className={sectionClassName}>
              <div className="flex flex-wrap gap-3">
                {[
                  ["venue", "Partner venue"],
                  ["custom", "Custom address"],
                  ["online", "Online"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => updateField("locationMode", key)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-semibold transition",
                      form.locationMode === key
                        ? "border-[rgba(79,70,229,0.18)] bg-[rgba(79,70,229,0.08)] text-brand-indigo"
                        : "border-[rgba(153,148,168,0.14)] bg-white/78 text-brand-text-muted",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {form.locationMode === "venue" ? (
                <label className="mt-5 block text-sm font-semibold text-brand-text">
                  Venue partner
                  <select
                    value={form.venueSlug}
                    onChange={(event) => updateField("venueSlug", event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-sand-light px-4 py-3 outline-none transition focus:border-brand-coral"
                  >
                    {publicVenues.map((venue) => (
                      <option key={venue.slug} value={venue.slug}>
                        {venue.name} · {venue.area}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              {form.locationMode === "custom" ? (
                <label className="mt-5 block text-sm font-semibold text-brand-text">
                  Venue address
                  <input
                    value={form.venueAddress}
                    onChange={(event) => updateField("venueAddress", event.target.value)}
                    placeholder="Tryggvagata 12, 101 Reykjavik"
                    className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-sand-light px-4 py-3 outline-none transition focus:border-brand-coral"
                  />
                </label>
              ) : null}

              {form.locationMode === "online" ? (
                <label className="mt-5 block text-sm font-semibold text-brand-text">
                  Online link
                  <input
                    id="event-online-link"
                    name="onlineLink"
                    type="url"
                    value={form.onlineLink}
                    onChange={(event) => updateField("onlineLink", event.target.value)}
                    placeholder="https://meet.google.com/example"
                    autoComplete="url"
                    autoCapitalize="none"
                    inputMode="url"
                    spellCheck={false}
                    className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-sand-light px-4 py-3 outline-none transition focus:border-brand-coral"
                  />
                </label>
              ) : null}
            </section>
          ) : null}

          {step === 3 ? (
            <section className={sectionClassName}>
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block text-sm font-semibold text-brand-text">
                  Attendee limit
                  <input
                    type="number"
                    min={1}
                    value={form.attendeeLimit}
                    onChange={(event) =>
                      updateField("attendeeLimit", Number(event.target.value))
                    }
                    className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-sand-light px-4 py-3 outline-none transition focus:border-brand-coral"
                  />
                </label>
                <label className="block text-sm font-semibold text-brand-text">
                  Guest limit
                  <input
                    type="number"
                    min={0}
                    value={form.guestLimit}
                    onChange={(event) =>
                      updateField("guestLimit", Number(event.target.value))
                    }
                    className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-sand-light px-4 py-3 outline-none transition focus:border-brand-coral"
                  />
                </label>
              </div>
              <div className="mt-5 grid gap-5 md:grid-cols-3">
                <label className="block text-sm font-semibold text-brand-text">
                  RSVP mode
                  <select
                    value={form.rsvpMode}
                    onChange={(event) => updateField("rsvpMode", event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-sand-light px-4 py-3 outline-none transition focus:border-brand-coral"
                  >
                    <option value="open">Open</option>
                    <option value="approval">Approval</option>
                    <option value="invite_only">Invite only</option>
                  </select>
                </label>
                <label className="block text-sm font-semibold text-brand-text">
                  Age label
                  <input
                    value={form.ageRestriction}
                    onChange={(event) => updateField("ageRestriction", event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-sand-light px-4 py-3 outline-none transition focus:border-brand-coral"
                  />
                </label>
                <label className="block text-sm font-semibold text-brand-text">
                  Minimum age
                  <input
                    value={form.ageMin}
                    onChange={(event) => updateField("ageMin", event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-sand-light px-4 py-3 outline-none transition focus:border-brand-coral"
                  />
                </label>
              </div>
            </section>
          ) : null}

          {step === 4 ? (
            <section className={sectionClassName}>
              <label className="flex items-center gap-3 text-sm font-semibold text-brand-text">
                <input
                  type="checkbox"
                  checked={form.isFree}
                  onChange={(event) => updateField("isFree", event.target.checked)}
                  className="h-4 w-4 rounded border-brand-border text-brand-coral"
                />
                Free or sponsor-backed event
              </label>
              <p className="mt-3 text-sm leading-7 text-brand-text-muted">
                Reserve free publishing for sponsor-backed launches, invite-only formats,
                or admin-approved community exceptions. Public paid events should start at{" "}
                <span className="font-semibold text-brand-text">
                  {formatIsk(minimumTicketPriceIsk)}
                </span>
                .
              </p>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <label className="block text-sm font-semibold text-brand-text">
                  Ticket label
                  <input
                    value={form.ticketLabel}
                    onChange={(event) => updateField("ticketLabel", event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-sand-light px-4 py-3 outline-none transition focus:border-brand-coral"
                  />
                </label>
                <label className="block text-sm font-semibold text-brand-text">
                  Ticket price
                  <input
                    id="event-ticket-price"
                    name="ticketPrice"
                    inputMode="numeric"
                    value={form.ticketPrice}
                    onChange={(event) => updateField("ticketPrice", event.target.value)}
                    disabled={form.isFree}
                    placeholder={formatIsk(minimumTicketPriceIsk)}
                    className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-sand-light px-4 py-3 outline-none transition focus:border-brand-coral disabled:opacity-60"
                  />
                </label>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-[1.15rem] border border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.84)] px-4 py-4">
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-brand-text-light">
                    Ticket floor
                  </div>
                  <div className="mt-2 font-semibold text-brand-text">
                    {formatIsk(minimumTicketPriceIsk)}
                  </div>
                </div>
                <div className="rounded-[1.15rem] border border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.84)] px-4 py-4">
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-brand-text-light">
                    Platform commission
                  </div>
                  <div className="mt-2 font-semibold text-brand-text">
                    {ticketCommissionRate}% of paid sales
                  </div>
                </div>
                <div className="rounded-[1.15rem] border border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.84)] px-4 py-4">
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-brand-text-light">
                    Capacity gross
                  </div>
                  <div className="mt-2 font-semibold text-brand-text">
                    {form.isFree ? "Sponsor-backed" : formatIsk(estimatedGrossAtCapacity)}
                  </div>
                </div>
              </div>
              {!isPaidTicketValid ? (
                <div className="mt-5 rounded-[1.1rem] border border-[rgba(232,97,77,0.22)] bg-[rgba(232,97,77,0.1)] px-4 py-3 text-sm leading-7 text-brand-coral-dark">
                  Public paid events must be priced at {formatIsk(minimumTicketPriceIsk)} or
                  above to protect platform revenue and avoid low-signal inventory.
                </div>
              ) : null}
              <label className="mt-5 block text-sm font-semibold text-brand-text">
                Refund policy
                <textarea
                  value={form.refundPolicy}
                  onChange={(event) => updateField("refundPolicy", event.target.value)}
                  rows={4}
                  className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-sand-light px-4 py-3 outline-none transition focus:border-brand-coral"
                />
              </label>
            </section>
          ) : null}

          {step === 5 ? (
            <section className={sectionClassName}>
              <div className="block text-sm font-semibold text-brand-text">
                Event description
                <RichTextEditor
                  content={form.description}
                  onChange={(html) => updateField("description", html)}
                  placeholder="Describe your event in detail (min 100 characters)…"
                  className="mt-2"
                />
              </div>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div className="block text-sm font-semibold text-brand-text">
                  Featured photo
                  <ImageUpload
                    value={form.featuredPhotoUrl}
                    onChange={(url) => updateField("featuredPhotoUrl", url)}
                    label="Drop event photo here"
                    hint="PNG, JPG or WebP up to 5 MB"
                    aspectHint="16:9 recommended"
                    className="mt-2"
                  />
                </div>
                <label className="block text-sm font-semibold text-brand-text">
                  Gallery notes
                  <input
                    value={form.galleryNotes}
                    onChange={(event) => updateField("galleryNotes", event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-sand-light px-4 py-3 outline-none transition focus:border-brand-coral"
                  />
                </label>
              </div>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <label className="block text-sm font-semibold text-brand-text">
                  Guest question
                  <textarea
                    value={form.guestQuestion}
                    onChange={(event) => updateField("guestQuestion", event.target.value)}
                    rows={4}
                    className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-sand-light px-4 py-3 outline-none transition focus:border-brand-coral"
                  />
                </label>
                <div className="space-y-5">
                  <label className="block text-sm font-semibold text-brand-text">
                    Reminder cadence
                    <select
                      value={form.reminderCadence}
                      onChange={(event) =>
                        updateField("reminderCadence", event.target.value)
                      }
                      className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-sand-light px-4 py-3 outline-none transition focus:border-brand-coral"
                    >
                      <option value="24h and 2h before start">24h and 2h before start</option>
                      <option value="48h, 24h, and 2h before start">
                        48h, 24h, and 2h before start
                      </option>
                      <option value="Same day only">Same day only</option>
                    </select>
                  </label>
                  <label className="flex items-center gap-3 text-sm font-semibold text-brand-text">
                    <input
                      type="checkbox"
                      checked={form.featuredPlacement}
                      onChange={(event) =>
                        updateField("featuredPlacement", event.target.checked)
                      }
                      className="h-4 w-4 rounded border-brand-border text-brand-coral"
                    />
                    Request featured placement in discovery
                  </label>
                </div>
              </div>
              <label className="mt-5 flex items-center gap-3 text-sm font-semibold text-brand-text">
                <input
                  type="checkbox"
                  checked={form.commentsEnabled}
                  onChange={(event) =>
                    updateField("commentsEnabled", event.target.checked)
                  }
                  className="h-4 w-4 rounded border-brand-border text-brand-coral"
                />
                Enable event comments
              </label>
            </section>
          ) : null}

          {step === 6 ? (
            <section className={sectionClassName}>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded-[1.25rem] border border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.82)] p-4">
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-brand-text-light">
                    Final event summary
                  </div>
                  <div className="font-editorial mt-3 text-3xl tracking-[-0.05em] text-brand-text">
                    {form.title || "Event title"}
                  </div>
                  <div className="mt-3 text-sm leading-7 text-brand-text-muted">
                    {selectedGroup?.name} · {form.startsOn} · {form.startTime}
                  </div>
                  <div className="mt-3 text-sm leading-7 text-brand-text-muted">
                    {form.locationMode === "venue"
                      ? `${selectedVenue?.name} · ${selectedVenue?.area}`
                      : form.locationMode === "custom"
                        ? form.venueAddress || "Custom address"
                        : form.onlineLink || "Online link"}
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1rem] bg-white/80 px-4 py-3 text-sm text-brand-text">
                      {form.isFree ? "Sponsor-backed / free" : `Ticket ${form.ticketPrice}`}
                    </div>
                    <div className="rounded-[1rem] bg-white/80 px-4 py-3 text-sm text-brand-text">
                      {form.isFree
                        ? "No commission on free issue"
                        : `${formatIsk(estimatedPlatformFee)} estimated platform fee at capacity`}
                    </div>
                    <div className="rounded-[1rem] bg-white/80 px-4 py-3 text-sm text-brand-text">
                      Visibility: {form.visibilityMode.replaceAll("_", " ")}
                    </div>
                    <div className="rounded-[1rem] bg-white/80 px-4 py-3 text-sm text-brand-text">
                      Reminders: {form.reminderCadence}
                    </div>
                  </div>
                </div>
                <label className="block text-sm font-semibold text-brand-text">
                  Launch notes
                  <textarea
                    value={form.launchNotes}
                    onChange={(event) => updateField("launchNotes", event.target.value)}
                    rows={6}
                    className="mt-2 w-full rounded-2xl border border-brand-border bg-brand-sand-light px-4 py-3 outline-none transition focus:border-brand-coral"
                  />
                </label>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {!isEdit && (
                  <button
                    type="button"
                    onClick={() => saveDraft("draft")}
                    className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[rgba(79,70,229,0.18)] bg-white px-5 py-3 text-sm font-bold text-brand-indigo transition hover:-translate-y-0.5"
                  >
                    Save local draft
                    <ListChecks className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => saveDraft("publish-ready")}
                  disabled={submitting || !steps.every((_, i) => stepIsReady(i, form))}
                  className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand-coral px-5 py-3 text-sm font-bold text-white shadow-[0_16px_40px_rgba(232,97,77,0.24)] transition hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {submitting ? "Submitting…" : isEdit ? "Save changes" : "Mark ready for review"}
                  <CheckCheck className="h-4 w-4" />
                </button>
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
          ) : null}

          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => moveStep("back")}
              disabled={step === 0}
              className="inline-flex min-h-11 items-center rounded-full border border-[rgba(153,148,168,0.18)] bg-white/78 px-4 py-2 text-sm font-semibold text-brand-text disabled:opacity-50"
            >
              Back
            </button>
            <div className="text-sm text-brand-text-muted">
              Step {step + 1} of {steps.length}
            </div>
            <button
              type="button"
              onClick={() => moveStep("forward")}
              disabled={step === steps.length - 1 || !stepIsReady(step, form)}
              className="inline-flex min-h-11 items-center rounded-full bg-brand-indigo px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Next step
            </button>
          </div>
        </div>

        <aside className="space-y-6">
          <section className={sectionClassName}>
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-brand-text-light">
              Live event card
            </div>
            <div className="mt-4 overflow-hidden rounded-[1.45rem] border border-[rgba(153,148,168,0.12)] bg-white">
              <div
                className="h-40 bg-[linear-gradient(135deg,rgba(55,48,163,0.96),rgba(232,97,77,0.78))]"
                aria-hidden="true"
              />
              <div className="p-5">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-[rgba(79,70,229,0.08)] px-3 py-1 text-xs font-semibold text-brand-indigo">
                    {form.category}
                  </span>
                  <span className="rounded-full bg-[rgba(245,240,232,0.9)] px-3 py-1 text-xs font-semibold text-brand-text">
                    {form.isFree ? "Free RSVP" : form.ticketPrice || "Paid"}
                  </span>
                  <span className="rounded-full bg-[rgba(124,154,130,0.12)] px-3 py-1 text-xs font-semibold text-brand-sage">
                    {form.visibilityMode.replaceAll("_", " ")}
                  </span>
                  {form.featuredPlacement ? (
                    <span className="rounded-full bg-[rgba(232,97,77,0.12)] px-3 py-1 text-xs font-semibold text-brand-coral">
                      Featured request
                    </span>
                  ) : null}
                </div>
                <div className="font-editorial mt-4 text-3xl tracking-[-0.05em] text-brand-text">
                  {form.title || "Event title"}
                </div>
                {/* Safe: content comes from user's own Tiptap editor in this form (StarterKit restricts to safe HTML subset) */}
                <div
                  className="prose prose-sm mt-3 max-w-none text-brand-text-muted"
                  dangerouslySetInnerHTML={{ __html: form.description }}
                />
                <div className="mt-4 grid gap-3">
                  <div className="rounded-[1rem] bg-[rgba(245,240,232,0.84)] px-4 py-3 text-sm text-brand-text">
                    {selectedGroup?.name} · hosted by {organizerName}
                  </div>
                  <div className="rounded-[1rem] bg-[rgba(245,240,232,0.84)] px-4 py-3 text-sm text-brand-text">
                    {form.startsOn} · {form.startTime}-{form.endTime}
                  </div>
                  <div className="rounded-[1rem] bg-[rgba(245,240,232,0.84)] px-4 py-3 text-sm text-brand-text">
                    {form.locationMode === "venue"
                      ? `${selectedVenue?.name} · ${selectedVenue?.area}`
                      : form.locationMode === "custom"
                        ? form.venueAddress || "Custom address"
                        : form.onlineLink || "Online event"}
                  </div>
                  <div className="rounded-[1rem] bg-[rgba(245,240,232,0.84)] px-4 py-3 text-sm text-brand-text">
                    {form.isFree
                      ? "Free / sponsor-backed event"
                      : `${form.ticketPrice || formatIsk(minimumTicketPriceIsk)} · ${ticketCommissionRate}% platform commission`}
                  </div>
                  <div className="rounded-[1rem] bg-[rgba(245,240,232,0.84)] px-4 py-3 text-sm text-brand-text">
                    Reminder flow: {form.reminderCadence}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[rgba(153,148,168,0.14)] px-3 py-1 text-xs font-semibold text-brand-text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className={sectionClassName}>
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-brand-text-light">
              Organizer notes
            </div>
            <div className="mt-4 space-y-3">
              {[
                "Approval mode is best for quality-sensitive formats and premium room inventory.",
                "Recurring sessions should keep timing identical so venue and attendee habits can form.",
                `Use ${formatIsk(minimumTicketPriceIsk)} as the minimum public ticket unless the event is sponsor-backed or invite-only.`,
                "Visibility, reminders, and host contact should be clear enough that a first-time attendee can commit without chasing details.",
                "Launch notes are saved locally with the draft so nothing gets lost before Supabase is connected.",
              ].map((note) => (
                <div
                  key={note}
                  className="rounded-[1.1rem] border border-[rgba(153,148,168,0.12)] bg-white/78 px-4 py-3 text-sm leading-7 text-brand-text-muted"
                >
                  {note}
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
