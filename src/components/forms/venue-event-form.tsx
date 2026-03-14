"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  CalendarDays,
  Clock,
  DollarSign,
  Globe,
  Loader2,
  MapPin,
  MessageCircle,
  Plus,
  Repeat,
  Send,
  Shield,
  Tag,
  Ticket,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { categories } from "@/lib/home-data";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { ImageUpload } from "@/components/ui/image-upload";
import { cn } from "@/lib/utils";

type VenueEventFormProps = {
  venueSlug: string;
  venueName: string;
  mode?: "create" | "edit";
  initialData?: Partial<FormState>;
  eventSlug?: string;
};

type TicketTier = {
  name: string;
  priceIsk: string;
  priceUsd: string;
  quantity: string;
};

type FormState = {
  title: string;
  category: string;
  eventType: "in_person" | "online" | "hybrid";
  tags: string;
  startsOn: string;
  startTime: string;
  endTime: string;
  attendeeLimit: string;
  guestLimit: string;
  isFree: boolean;
  ticketTiers: TicketTier[];
  rsvpMode: "open" | "approval" | "invite_only";
  visibilityMode: "public" | "approval" | "members_only" | "invite_only";
  ageRestriction: string;
  ageMin: string;
  ageMax: string;
  onlineLink: string;
  hostContact: string;
  commentsEnabled: boolean;
  description: string;
  featuredPhotoUrl: string;
  venueAddress: string;
  guestQuestion: string;
  coHosts: string;
  recurrenceRule: string;
  recurrenceEnd: string;
  reminderPolicy: string;
};

const defaultForm: FormState = {
  title: "",
  category: "",
  eventType: "in_person",
  tags: "",
  startsOn: "",
  startTime: "18:00",
  endTime: "21:00",
  attendeeLimit: "50",
  guestLimit: "0",
  isFree: true,
  ticketTiers: [{ name: "General", priceIsk: "", priceUsd: "", quantity: "50" }],
  rsvpMode: "open",
  visibilityMode: "public",
  ageRestriction: "none",
  ageMin: "",
  ageMax: "",
  onlineLink: "",
  hostContact: "",
  commentsEnabled: true,
  description: "",
  featuredPhotoUrl: "",
  venueAddress: "",
  guestQuestion: "",
  coHosts: "",
  recurrenceRule: "",
  recurrenceEnd: "",
  reminderPolicy: "24h and 2h before start",
};

const eventTypeLabels: Record<string, string> = {
  in_person: "In person",
  online: "Online",
  hybrid: "Hybrid (in person + online)",
};

const rsvpModeLabels: Record<string, string> = {
  open: "Open — anyone can RSVP",
  approval: "Approval — you approve each RSVP",
  invite_only: "Invite only — by invitation",
};

const visibilityLabels: Record<string, string> = {
  public: "Public — visible to everyone",
  approval: "Semi-public — visible but requires approval",
  members_only: "Members only — visible to group members",
  invite_only: "Private — invite only",
};

const ageOptions = [
  { value: "none", label: "No restriction" },
  { value: "18+", label: "18+ (adult only)" },
  { value: "21+", label: "21+" },
  { value: "custom", label: "Custom range" },
];

const recurrenceOptions = [
  { value: "", label: "Does not repeat" },
  { value: "FREQ=WEEKLY;INTERVAL=1", label: "Weekly" },
  { value: "FREQ=WEEKLY;INTERVAL=2", label: "Every 2 weeks" },
  { value: "FREQ=MONTHLY;INTERVAL=1", label: "Monthly" },
];

const reminderOptions = [
  { value: "24h and 2h before start", label: "24 hours + 2 hours before" },
  { value: "24h before start", label: "24 hours before" },
  { value: "2h before start", label: "2 hours before" },
  { value: "1h before start", label: "1 hour before" },
  { value: "none", label: "No reminders" },
];

export function VenueEventForm({
  venueSlug,
  venueName,
  mode = "create",
  initialData,
  eventSlug,
}: VenueEventFormProps) {
  const isEdit = mode === "edit";
  const [form, setForm] = useState<FormState>(() => {
    const merged = { ...defaultForm, ...initialData };
    // Ensure ticketTiers is always an array (guards against stale HMR state)
    if (!Array.isArray(merged.ticketTiers) || merged.ticketTiers.length === 0) {
      merged.ticketTiers = [{ name: "General", priceIsk: "", priceUsd: "", quantity: "50" }];
    }
    return merged;
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setMessage("");
  }

  // Safe accessor for ticketTiers (guards against stale HMR state)
  const tiers: TicketTier[] = Array.isArray((form as Record<string, unknown>).ticketTiers)
    ? (form as Record<string, unknown>).ticketTiers as TicketTier[]
    : [{ name: "General", priceIsk: "", priceUsd: "", quantity: "50" }];

  function updateTier(index: number, field: keyof TicketTier, value: string) {
    setForm((prev) => {
      const tiers = [...(prev.ticketTiers ?? [])];
      tiers[index] = { ...tiers[index], [field]: value };
      return { ...prev, ticketTiers: tiers };
    });
  }

  function addTier() {
    setForm((prev) => ({
      ...prev,
      ticketTiers: [...(prev.ticketTiers ?? []), { name: "", priceIsk: "", priceUsd: "", quantity: "" }],
    }));
  }

  function removeTier(index: number) {
    setForm((prev) => ({
      ...prev,
      ticketTiers: (prev.ticketTiers ?? []).filter((_, i) => i !== index),
    }));
  }

  function buildPayload() {
    return {
      title: form.title,
      description: form.description || "Event description",
      status: "draft",
      eventType: form.eventType,
      startsAt:
        form.startsOn && form.startTime
          ? new Date(`${form.startsOn}T${form.startTime}`).toISOString()
          : undefined,
      endsAt:
        form.startsOn && form.endTime
          ? new Date(`${form.startsOn}T${form.endTime}`).toISOString()
          : undefined,
      venueName: venueName,
      venueAddress: form.venueAddress || undefined,
      venueSlug: venueSlug,
      onlineLink: form.onlineLink || undefined,
      attendeeLimit: form.attendeeLimit ? Number(form.attendeeLimit) : undefined,
      guestLimit: form.guestLimit ? Number(form.guestLimit) : 0,
      ageRestriction: form.ageRestriction,
      ageMin: form.ageMin ? Number(form.ageMin) : undefined,
      ageMax: form.ageMax ? Number(form.ageMax) : undefined,
      isFree: form.isFree,
      ticketTiers: form.isFree
        ? []
        : tiers
            .filter((t) => t.name && t.priceIsk)
            .map((t) => ({
              name: t.name,
              priceIsk: Number(t.priceIsk),
              priceUsd: t.priceUsd ? Number(t.priceUsd) : Math.round(Number(t.priceIsk) / 140),
              quantity: t.quantity ? Number(t.quantity) : undefined,
            })),
      rsvpMode: form.rsvpMode,
      visibilityMode: form.visibilityMode,
      commentsEnabled: form.commentsEnabled,
      hostContact: form.hostContact || undefined,
      guestQuestion: form.guestQuestion || undefined,
      coHostNames: form.coHosts
        ? form.coHosts.split(",").map((n) => n.trim()).filter(Boolean)
        : [],
      recurrenceRule: form.recurrenceRule || undefined,
      recurrenceEnd: form.recurrenceEnd || undefined,
      reminderPolicy: form.reminderPolicy,
      featuredPhotoUrl: form.featuredPhotoUrl || undefined,
      tags: form.tags
        ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : undefined,
    };
  }

  function validate(): string | null {
    if (!form.title.trim() || form.title.trim().length < 3)
      return "Title must be at least 3 characters.";
    if (!form.startsOn) return "Please select a date.";
    if (!form.startTime) return "Please set a start time.";
    if (form.description.replace(/<[^>]*>/g, "").trim().length < 20)
      return "Description must be at least 20 characters.";
    if ((form.eventType === "online" || form.eventType === "hybrid") && !form.onlineLink.trim())
      return "Please provide an online meeting link.";
    if (!form.isFree) {
      const validTiers = tiers.filter((t) => t.name && t.priceIsk);
      if (validTiers.length === 0)
        return "Please add at least one ticket tier with a name and price.";
      for (const tier of validTiers) {
        if (Number(tier.priceIsk) <= 0) return `Ticket "${tier.name}" must have a positive price.`;
      }
    }
    return null;
  }

  async function handleSubmit() {
    const error = validate();
    if (error) {
      setMessage(error);
      setMessageType("error");
      return;
    }

    setSubmitting(true);
    setMessage(isEdit ? "Saving changes..." : "Submitting for review...");
    setMessageType("success");

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
          const createdSlug = result.data?.slug;
          if (createdSlug) {
            window.location.href = `/events/${createdSlug}`;
            return;
          }
          setMessage("Changes saved successfully!");
        } else {
          setMessage("Event submitted for review! The platform admin will approve it shortly.");
        }
        setMessageType("success");
      } else {
        setMessage(
          result.details?.formErrors?.[0] ?? result.error ?? "Something went wrong.",
        );
        setMessageType("error");
      }
    } catch {
      setMessage("Could not reach the server. Please try again.");
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  }

  // Tomorrow as min date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  const sectionClass = "space-y-6 rounded-xl border border-gray-200 bg-white p-6";
  const sectionTitle = "text-sm font-bold uppercase tracking-wider text-gray-400";
  const inputClass = "mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20";
  const labelClass = "block text-sm font-semibold text-gray-900";

  return (
    <div className="space-y-8">
      {/* ── Basics ────────────────────────────── */}
      <section className={sectionClass}>
        <h3 className={sectionTitle}>Basics</h3>

        <fieldset>
          <label htmlFor="event-title" className={labelClass}>
            Event title <span className="text-red-500">*</span>
          </label>
          <input
            id="event-title"
            type="text"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="e.g. Friday Jazz Night, Wine Tasting Evening"
            maxLength={160}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-gray-400">{form.title.length}/160</p>
        </fieldset>

        <div className="grid gap-6 sm:grid-cols-2">
          <fieldset>
            <label htmlFor="event-category" className={labelClass}>
              Category
            </label>
            <select
              id="event-category"
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              className={inputClass}
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </fieldset>

          <fieldset>
            <label htmlFor="event-type" className={labelClass}>
              Event format
            </label>
            <select
              id="event-type"
              value={form.eventType}
              onChange={(e) => update("eventType", e.target.value as FormState["eventType"])}
              className={inputClass}
            >
              {Object.entries(eventTypeLabels).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </fieldset>
        </div>

        <fieldset>
          <label htmlFor="event-tags" className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Tag className="h-4 w-4 text-gray-400" />
            Tags
          </label>
          <input
            id="event-tags"
            type="text"
            value={form.tags}
            onChange={(e) => update("tags", e.target.value)}
            placeholder="e.g. jazz, live-music, friday-night"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-gray-400">Comma-separated. Helps people discover your event.</p>
        </fieldset>
      </section>

      {/* ── Date & Time ──────────────────────── */}
      <section className={sectionClass}>
        <h3 className={sectionTitle}>Date & time</h3>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="event-date" className={labelClass}>
              Date <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-2">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="event-date"
                type="date"
                value={form.startsOn}
                min={minDate}
                onChange={(e) => update("startsOn", e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-gray-900 focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
              />
            </div>
          </div>
          <div>
            <label htmlFor="event-start" className={labelClass}>
              Start time <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-2">
              <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="event-start"
                type="time"
                value={form.startTime}
                onChange={(e) => update("startTime", e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-gray-900 focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
              />
            </div>
          </div>
          <div>
            <label htmlFor="event-end" className={labelClass}>
              End time
            </label>
            <div className="relative mt-2">
              <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="event-end"
                type="time"
                value={form.endTime}
                onChange={(e) => update("endTime", e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-gray-900 focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
              />
            </div>
          </div>
        </div>

        {/* Recurrence */}
        <div className="grid gap-6 sm:grid-cols-2">
          <fieldset>
            <label htmlFor="event-recurrence" className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Repeat className="h-4 w-4 text-gray-400" />
              Repeat
            </label>
            <select
              id="event-recurrence"
              value={form.recurrenceRule}
              onChange={(e) => update("recurrenceRule", e.target.value)}
              className={inputClass}
            >
              {recurrenceOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </fieldset>

          {form.recurrenceRule && (
            <fieldset>
              <label htmlFor="event-recurrence-end" className={labelClass}>
                Repeat until
              </label>
              <input
                id="event-recurrence-end"
                type="date"
                value={form.recurrenceEnd}
                min={form.startsOn || minDate}
                onChange={(e) => update("recurrenceEnd", e.target.value)}
                className={inputClass}
              />
            </fieldset>
          )}
        </div>

        {/* Reminder policy */}
        <fieldset>
          <label htmlFor="event-reminder" className={labelClass}>
            Reminder emails
          </label>
          <select
            id="event-reminder"
            value={form.reminderPolicy}
            onChange={(e) => update("reminderPolicy", e.target.value)}
            className={cn(inputClass, "sm:max-w-md")}
          >
            {reminderOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </fieldset>
      </section>

      {/* ── Online link (for online/hybrid) ──── */}
      {(form.eventType === "online" || form.eventType === "hybrid") && (
        <section className={sectionClass}>
          <h3 className={sectionTitle}>Online details</h3>
          <fieldset>
            <label htmlFor="event-online-link" className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Globe className="h-4 w-4 text-gray-400" />
              Meeting link <span className="text-red-500">*</span>
            </label>
            <input
              id="event-online-link"
              type="url"
              value={form.onlineLink}
              onChange={(e) => update("onlineLink", e.target.value)}
              placeholder="https://zoom.us/j/... or Google Meet link"
              className={inputClass}
            />
          </fieldset>
        </section>
      )}

      {/* ── Pricing & tickets ────────────────── */}
      <section className={sectionClass}>
        <h3 className={sectionTitle}>
          <span className="flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            Pricing & tickets
          </span>
        </h3>

        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={form.isFree}
            onChange={(e) => update("isFree", e.target.checked)}
            className="h-5 w-5 rounded border-gray-300 text-brand-indigo focus:ring-brand-indigo"
          />
          <span className="text-sm font-semibold text-gray-900">Free event</span>
          <span className="text-xs text-gray-400">No ticket purchase required</span>
        </label>

        {!form.isFree && (
          <div className="space-y-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">Ticket tiers</p>
              {tiers.length < 5 && (
                <button
                  type="button"
                  onClick={addTier}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add tier
                </button>
              )}
            </div>

            {tiers.map((tier, i) => (
              <div key={i} className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-5">
                <fieldset className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-500">Tier name</label>
                  <input
                    type="text"
                    value={tier.name}
                    onChange={(e) => updateTier(i, "name", e.target.value)}
                    placeholder="e.g. General, VIP, Early Bird"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-indigo focus:outline-none focus:ring-1 focus:ring-brand-indigo/20"
                  />
                </fieldset>
                <fieldset>
                  <label className="block text-xs font-medium text-gray-500">Price (ISK)</label>
                  <div className="relative mt-1">
                    <DollarSign className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      min={0}
                      step={100}
                      value={tier.priceIsk}
                      onChange={(e) => updateTier(i, "priceIsk", e.target.value)}
                      placeholder="0"
                      className="w-full rounded-md border border-gray-300 py-2 pl-8 pr-3 text-sm text-gray-900 focus:border-brand-indigo focus:outline-none focus:ring-1 focus:ring-brand-indigo/20"
                    />
                  </div>
                </fieldset>
                <fieldset>
                  <label className="block text-xs font-medium text-gray-500">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={tier.quantity}
                    onChange={(e) => updateTier(i, "quantity", e.target.value)}
                    placeholder="∞"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-indigo focus:outline-none focus:ring-1 focus:ring-brand-indigo/20"
                  />
                </fieldset>
                <div className="flex items-end">
                  {tiers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTier(i)}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-2 text-xs font-medium text-red-500 transition-colors hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  )}
                </div>
                {tier.priceIsk && Number(tier.priceIsk) > 0 && (
                  <p className="text-xs text-gray-400 sm:col-span-5">
                    ≈ ${Math.round(Number(tier.priceIsk) / 140)} USD (auto-converted)
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Capacity & access ────────────────── */}
      <section className={sectionClass}>
        <h3 className={sectionTitle}>Capacity & access</h3>

        <div className="grid gap-6 sm:grid-cols-2">
          <fieldset>
            <label htmlFor="event-capacity" className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Users className="h-4 w-4 text-gray-400" />
              Attendee limit
            </label>
            <input
              id="event-capacity"
              type="number"
              min={1}
              max={10000}
              value={form.attendeeLimit}
              onChange={(e) => update("attendeeLimit", e.target.value)}
              className="mt-2 w-48 rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
            />
          </fieldset>

          <fieldset>
            <label htmlFor="event-guest-limit" className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <UserCheck className="h-4 w-4 text-gray-400" />
              Guests per RSVP (+1s)
            </label>
            <input
              id="event-guest-limit"
              type="number"
              min={0}
              max={6}
              value={form.guestLimit}
              onChange={(e) => update("guestLimit", e.target.value)}
              className="mt-2 w-48 rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
            />
            <p className="mt-1 text-xs text-gray-400">0 = no extra guests allowed</p>
          </fieldset>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <fieldset>
            <label htmlFor="event-rsvp-mode" className={labelClass}>
              RSVP mode
            </label>
            <select
              id="event-rsvp-mode"
              value={form.rsvpMode}
              onChange={(e) => update("rsvpMode", e.target.value as FormState["rsvpMode"])}
              className={cn(inputClass, "sm:max-w-md")}
            >
              {Object.entries(rsvpModeLabels).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </fieldset>

          <fieldset>
            <label htmlFor="event-visibility" className={labelClass}>
              Visibility
            </label>
            <select
              id="event-visibility"
              value={form.visibilityMode}
              onChange={(e) => update("visibilityMode", e.target.value as FormState["visibilityMode"])}
              className={cn(inputClass, "sm:max-w-md")}
            >
              {Object.entries(visibilityLabels).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </fieldset>
        </div>

        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={form.commentsEnabled}
            onChange={(e) => update("commentsEnabled", e.target.checked)}
            className="h-5 w-5 rounded border-gray-300 text-brand-indigo focus:ring-brand-indigo"
          />
          <span className="text-sm font-semibold text-gray-900">Allow comments</span>
        </label>
      </section>

      {/* ── Guest question ──────────────────────── */}
      <section className={sectionClass}>
        <h3 className={sectionTitle}>
          <span className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            RSVP question
          </span>
        </h3>

        <fieldset>
          <label htmlFor="event-guest-question" className={labelClass}>
            Question for attendees (optional)
          </label>
          <input
            id="event-guest-question"
            type="text"
            value={form.guestQuestion}
            onChange={(e) => update("guestQuestion", e.target.value)}
            placeholder="e.g. Any dietary requirements? What topics interest you?"
            maxLength={255}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-gray-400">
            Shown during RSVP. Attendees can respond with a short answer.
          </p>
        </fieldset>
      </section>

      {/* ── Age restriction ───────────────────── */}
      <section className={sectionClass}>
        <h3 className={sectionTitle}>
          <span className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Age restriction
          </span>
        </h3>

        <div className="flex flex-wrap gap-3">
          {ageOptions.map((opt) => (
            <label
              key={opt.value}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors",
                form.ageRestriction === opt.value
                  ? "border-brand-indigo bg-brand-indigo/5 text-brand-indigo"
                  : "border-gray-200 text-gray-700 hover:border-gray-300",
              )}
            >
              <input
                type="radio"
                name="age-restriction"
                value={opt.value}
                checked={form.ageRestriction === opt.value}
                onChange={(e) => update("ageRestriction", e.target.value)}
                className="sr-only"
              />
              {opt.label}
            </label>
          ))}
        </div>

        {form.ageRestriction === "custom" && (
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={13}
              max={99}
              placeholder="Min"
              value={form.ageMin}
              onChange={(e) => update("ageMin", e.target.value)}
              className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
            />
            <span className="text-gray-400">to</span>
            <input
              type="number"
              min={13}
              max={99}
              placeholder="Max"
              value={form.ageMax}
              onChange={(e) => update("ageMax", e.target.value)}
              className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
            />
            <span className="text-sm text-gray-400">years old</span>
          </div>
        )}
      </section>

      {/* ── Media & description ────────────────── */}
      <section className={sectionClass}>
        <h3 className={sectionTitle}>Media & description</h3>

        <fieldset>
          <label className={labelClass}>
            Event photo
          </label>
          <div className="mt-2">
            <ImageUpload
              value={form.featuredPhotoUrl}
              onChange={(url) => update("featuredPhotoUrl", url)}
              label="Upload event photo"
              hint="Recommended: 16:9 ratio, at least 1200px wide"
              folder="events"
            />
          </div>
        </fieldset>

        <fieldset>
          <label className={labelClass}>
            Description <span className="text-red-500">*</span>
          </label>
          <p className="mt-1 text-xs text-gray-500">
            Describe the event, what to expect, and any important details.
          </p>
          <div className="mt-2 overflow-hidden rounded-lg border border-gray-300 focus-within:border-brand-indigo focus-within:ring-2 focus-within:ring-brand-indigo/20">
            <RichTextEditor
              content={form.description}
              onChange={(html) => update("description", html)}
              placeholder="Tell attendees what this event is about..."
            />
          </div>
        </fieldset>
      </section>

      {/* ── Contact & co-hosts ──────────────────── */}
      <section className={sectionClass}>
        <h3 className={sectionTitle}>Contact & co-hosts</h3>

        <fieldset>
          <label htmlFor="event-host-contact" className={labelClass}>
            Host contact (visible to attendees)
          </label>
          <input
            id="event-host-contact"
            type="text"
            value={form.hostContact}
            onChange={(e) => update("hostContact", e.target.value)}
            placeholder="e.g. info@lebowskibar.is or a phone number"
            maxLength={120}
            className={cn(inputClass, "sm:max-w-md")}
          />
          <p className="mt-1 text-xs text-gray-400">So attendees can reach out with questions.</p>
        </fieldset>

        <fieldset>
          <label htmlFor="event-cohosts" className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <UserPlus className="h-4 w-4 text-gray-400" />
            Co-hosts (optional)
          </label>
          <input
            id="event-cohosts"
            type="text"
            value={form.coHosts}
            onChange={(e) => update("coHosts", e.target.value)}
            placeholder="e.g. DJ Magni, Bryggjuhusid"
            maxLength={400}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-gray-400">Comma-separated names. Up to 8 co-hosts.</p>
        </fieldset>
      </section>

      {/* ── Venue info ───────────────────────── */}
      <div className="rounded-lg border border-brand-indigo/10 bg-brand-indigo/5 p-5">
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-indigo" />
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Location: {venueName}
              </p>
              <p className="text-xs text-gray-500">
                This event will be listed at your venue automatically.
              </p>
            </div>
            <fieldset>
              <label htmlFor="event-venue-address" className="block text-xs font-medium text-gray-600">
                Specific location / room (optional)
              </label>
              <input
                id="event-venue-address"
                type="text"
                value={form.venueAddress}
                onChange={(e) => update("venueAddress", e.target.value)}
                placeholder="e.g. Main hall, Rooftop terrace, Room 2B"
                maxLength={200}
                className="mt-1 w-full rounded-md border border-brand-indigo/20 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-indigo focus:outline-none focus:ring-1 focus:ring-brand-indigo/20"
              />
            </fieldset>
          </div>
        </div>
      </div>

      {/* ── Status message ──────────────────────── */}
      {message && (
        <div
          className={cn(
            "rounded-lg border p-4 text-sm",
            messageType === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-green-200 bg-green-50 text-green-700",
          )}
        >
          {message}
        </div>
      )}

      {/* ── Actions ─────────────────────────────── */}
      <div className="flex flex-col gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end">
        <Link
          href={"/venue/events" as Route}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          Cancel
        </Link>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-indigo px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-indigo-light disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {isEdit ? "Save changes" : "Submit for review"}
        </button>
      </div>
    </div>
  );
}
