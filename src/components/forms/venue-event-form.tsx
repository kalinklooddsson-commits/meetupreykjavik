"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  CalendarDays,
  Clock,
  Globe,
  Loader2,
  MapPin,
  Send,
  Shield,
  Tag,
  UserCheck,
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

export function VenueEventForm({
  venueSlug,
  venueName,
  mode = "create",
  initialData,
  eventSlug,
}: VenueEventFormProps) {
  const isEdit = mode === "edit";
  const [form, setForm] = useState<FormState>({ ...defaultForm, ...initialData });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setMessage("");
  }

  function buildPayload() {
    return {
      title: form.title,
      description: form.description,
      status: "published",
      group_slug: null,
      category_id: null,
      event_type: form.eventType,
      starts_at:
        form.startsOn && form.startTime
          ? new Date(`${form.startsOn}T${form.startTime}`).toISOString()
          : null,
      ends_at:
        form.startsOn && form.endTime
          ? new Date(`${form.startsOn}T${form.endTime}`).toISOString()
          : null,
      venue_slug: venueSlug,
      venue_name: venueName,
      venue_address: null,
      online_link: form.onlineLink || null,
      attendee_limit: form.attendeeLimit ? Number(form.attendeeLimit) : null,
      guest_limit: form.guestLimit ? Number(form.guestLimit) : 0,
      age_restriction: form.ageRestriction,
      age_min: form.ageMin ? Number(form.ageMin) : null,
      age_max: form.ageMax ? Number(form.ageMax) : null,
      is_free: form.isFree,
      rsvp_mode: form.rsvpMode,
      visibility_mode: form.visibilityMode,
      comments_enabled: form.commentsEnabled,
      host_contact: form.hostContact || null,
      recurrence_rule: null,
      recurrence_end: null,
      featured_photo_url: form.featuredPhotoUrl || null,
      tags: form.tags
        ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : null,
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
    setMessage(isEdit ? "Saving changes..." : "Publishing event...");
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
        const createdSlug = result.data?.slug;
        if (createdSlug) {
          window.location.href = `/events/${createdSlug}`;
          return;
        }
        setMessage("Event published successfully!");
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

  return (
    <div className="space-y-8">
      {/* ── Basics ────────────────────────────── */}
      <section className={sectionClass}>
        <h3 className={sectionTitle}>Basics</h3>

        <fieldset>
          <label htmlFor="event-title" className="block text-sm font-semibold text-gray-900">
            Event title <span className="text-red-500">*</span>
          </label>
          <input
            id="event-title"
            type="text"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="e.g. Friday Jazz Night, Wine Tasting Evening"
            maxLength={160}
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
          />
          <p className="mt-1 text-xs text-gray-400">{form.title.length}/160</p>
        </fieldset>

        <div className="grid gap-6 sm:grid-cols-2">
          <fieldset>
            <label htmlFor="event-category" className="block text-sm font-semibold text-gray-900">
              Category
            </label>
            <select
              id="event-category"
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </fieldset>

          <fieldset>
            <label htmlFor="event-type" className="block text-sm font-semibold text-gray-900">
              Event format
            </label>
            <select
              id="event-type"
              value={form.eventType}
              onChange={(e) => update("eventType", e.target.value as FormState["eventType"])}
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
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
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
          />
          <p className="mt-1 text-xs text-gray-400">Comma-separated. Helps people discover your event.</p>
        </fieldset>
      </section>

      {/* ── Date & Time ──────────────────────── */}
      <section className={sectionClass}>
        <h3 className={sectionTitle}>Date & time</h3>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="event-date" className="block text-sm font-semibold text-gray-900">
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
            <label htmlFor="event-start" className="block text-sm font-semibold text-gray-900">
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
            <label htmlFor="event-end" className="block text-sm font-semibold text-gray-900">
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
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
            />
          </fieldset>
        </section>
      )}

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

        <fieldset>
          <label htmlFor="event-rsvp-mode" className="block text-sm font-semibold text-gray-900">
            RSVP mode
          </label>
          <select
            id="event-rsvp-mode"
            value={form.rsvpMode}
            onChange={(e) => update("rsvpMode", e.target.value as FormState["rsvpMode"])}
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20 sm:max-w-md"
          >
            {Object.entries(rsvpModeLabels).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </fieldset>

        <fieldset>
          <label htmlFor="event-visibility" className="block text-sm font-semibold text-gray-900">
            Visibility
          </label>
          <select
            id="event-visibility"
            value={form.visibilityMode}
            onChange={(e) => update("visibilityMode", e.target.value as FormState["visibilityMode"])}
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20 sm:max-w-md"
          >
            {Object.entries(visibilityLabels).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </fieldset>

        <div className="flex flex-col gap-3 sm:flex-row sm:gap-8">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={form.isFree}
              onChange={(e) => update("isFree", e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-brand-indigo focus:ring-brand-indigo"
            />
            <span className="text-sm font-semibold text-gray-900">Free event</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={form.commentsEnabled}
              onChange={(e) => update("commentsEnabled", e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-brand-indigo focus:ring-brand-indigo"
            />
            <span className="text-sm font-semibold text-gray-900">Allow comments</span>
          </label>
        </div>
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
          <label className="block text-sm font-semibold text-gray-900">
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
          <label className="block text-sm font-semibold text-gray-900">
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

      {/* ── Contact info ──────────────────────── */}
      <section className={sectionClass}>
        <h3 className={sectionTitle}>Contact</h3>

        <fieldset>
          <label htmlFor="event-host-contact" className="block text-sm font-semibold text-gray-900">
            Host contact (visible to attendees)
          </label>
          <input
            id="event-host-contact"
            type="text"
            value={form.hostContact}
            onChange={(e) => update("hostContact", e.target.value)}
            placeholder="e.g. info@lebowskibar.is or a phone number"
            maxLength={120}
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20 sm:max-w-md"
          />
          <p className="mt-1 text-xs text-gray-400">So attendees can reach out with questions.</p>
        </fieldset>
      </section>

      {/* ── Venue info badge ───────────────────── */}
      <div className="rounded-lg border border-brand-indigo/10 bg-brand-indigo/5 p-4">
        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-brand-indigo" />
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Location: {venueName}
            </p>
            <p className="text-xs text-gray-500">
              This event will be listed at your venue automatically.
            </p>
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
          {isEdit ? "Save changes" : "Publish event"}
        </button>
      </div>
    </div>
  );
}
