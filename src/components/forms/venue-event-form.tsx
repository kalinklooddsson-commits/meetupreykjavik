"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Loader2,
  MapPin,
  Save,
  Send,
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
  startsOn: string;
  startTime: string;
  endTime: string;
  attendeeLimit: string;
  isFree: boolean;
  description: string;
  featuredPhotoUrl: string;
};

const defaultForm: FormState = {
  title: "",
  category: "",
  startsOn: "",
  startTime: "18:00",
  endTime: "21:00",
  attendeeLimit: "50",
  isFree: true,
  description: "",
  featuredPhotoUrl: "",
};

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
      event_type: "in_person" as const,
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
      online_link: null,
      attendee_limit: form.attendeeLimit ? Number(form.attendeeLimit) : null,
      guest_limit: 0,
      age_restriction: "",
      age_min: null,
      age_max: null,
      is_free: form.isFree,
      rsvp_mode: "open" as const,
      comments_enabled: true,
      recurrence_rule: null,
      recurrence_end: null,
      featured_photo_url: form.featuredPhotoUrl || null,
      tags: null,
    };
  }

  function validate(): string | null {
    if (!form.title.trim() || form.title.trim().length < 3)
      return "Title must be at least 3 characters.";
    if (!form.startsOn) return "Please select a date.";
    if (!form.startTime) return "Please set a start time.";
    if (form.description.replace(/<[^>]*>/g, "").trim().length < 20)
      return "Description must be at least 20 characters.";
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-4 sm:px-6">
          <Link
            href={"/venue/events" as Route}
            className="flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to events
          </Link>
          <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="h-4 w-4" />
            {venueName}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? "Edit event" : "Create a new event"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Host an event at {venueName}. Fill in the details below and publish when ready.
        </p>

        <div className="mt-8 space-y-8">
          {/* Title */}
          <fieldset>
            <label
              htmlFor="event-title"
              className="block text-sm font-semibold text-gray-900"
            >
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

          {/* Category */}
          <fieldset>
            <label
              htmlFor="event-category"
              className="block text-sm font-semibold text-gray-900"
            >
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
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </fieldset>

          {/* Date & Time */}
          <fieldset>
            <legend className="block text-sm font-semibold text-gray-900">
              Date & time <span className="text-red-500">*</span>
            </legend>
            <div className="mt-2 grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="event-date" className="sr-only">
                  Date
                </label>
                <div className="relative">
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
                <label htmlFor="event-start" className="sr-only">
                  Start time
                </label>
                <div className="relative">
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
                <label htmlFor="event-end" className="sr-only">
                  End time
                </label>
                <div className="relative">
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
          </fieldset>

          {/* Capacity */}
          <fieldset>
            <label
              htmlFor="event-capacity"
              className="block text-sm font-semibold text-gray-900"
            >
              Capacity
            </label>
            <div className="mt-2 relative w-48">
              <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="event-capacity"
                type="number"
                min={1}
                max={10000}
                value={form.attendeeLimit}
                onChange={(e) => update("attendeeLimit", e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-gray-900 focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
              />
            </div>
          </fieldset>

          {/* Free event toggle */}
          <fieldset>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={form.isFree}
                onChange={(e) => update("isFree", e.target.checked)}
                className="h-5 w-5 rounded border-gray-300 text-brand-indigo focus:ring-brand-indigo"
              />
              <span className="text-sm font-semibold text-gray-900">Free event</span>
            </label>
            <p className="mt-1 ml-8 text-xs text-gray-500">
              Uncheck if you plan to charge admission.
            </p>
          </fieldset>

          {/* Featured image */}
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

          {/* Description */}
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

          {/* Venue info badge */}
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

          {/* Status message */}
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

          {/* Actions */}
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
      </main>
    </div>
  );
}
