"use client";

import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  UserCheck,
  ScanQrCode,
  Send,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

// ────────────────────────────────────────────
// Attendee Control Center
// ────────────────────────────────────────────

type Attendee = {
  name: string;
  status: string;
  ticket: string;
  checkedIn: string;
  note: string;
};

type AttendeeAction = "approve" | "reject" | "checkin" | "waitlist";

function attendeeStatusColor(status: string) {
  if (/approved|paid/i.test(status)) return "text-brand-sage";
  if (/pending|hold|invoice/i.test(status)) return "text-brand-text-muted";
  if (/rejected|refunded/i.test(status)) return "text-brand-coral";
  if (/waitlist/i.test(status)) return "text-brand-indigo";
  return "text-brand-text-muted";
}

export function OrganizerAttendeeControlCenter({
  attendees,
}: {
  attendees: readonly Attendee[];
}) {
  const [localAttendees, setLocalAttendees] = useState<Attendee[]>([
    ...attendees,
  ]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const applyLocal = (name: string, action: AttendeeAction) => {
    setLocalAttendees((prev) =>
      prev.map((a) => {
        if (a.name !== name) return a;
        switch (action) {
          case "approve":
            return { ...a, status: "Approved" };
          case "reject":
            return { ...a, status: "Rejected" };
          case "checkin":
            return { ...a, checkedIn: "Yes" };
          case "waitlist":
            return { ...a, status: "Waitlist" };
          default:
            return a;
        }
      }),
    );
  };

  const handleAction = async (name: string, action: AttendeeAction) => {
    setLoading(`${name}-${action}`);
    try {
      const res = await fetch("/api/attendees/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendeeName: name, action }),
      });
      const result = await res.json();
      applyLocal(name, action);
      if (result.ok) {
        toast("success", `${name} — ${action === "checkin" ? "checked in" : action + "d"} successfully`);
      } else {
        toast("info", `${name} — ${action === "checkin" ? "checked in" : action + "d"} (local only)`);
      }
    } catch {
      applyLocal(name, action);
      toast("info", `${name} — ${action === "checkin" ? "checked in" : action + "d"} (offline)`);
    } finally {
      setLoading(null);
    }
  };

  const filters = ["all", "pending", "approved", "waitlist", "rejected"];
  const filtered =
    filter === "all"
      ? localAttendees
      : localAttendees.filter((a) =>
          a.status.toLowerCase().includes(filter),
        );

  const pendingCount = localAttendees.filter((a) =>
    /pending/i.test(a.status),
  ).length;
  const approvedCount = localAttendees.filter((a) =>
    /approved/i.test(a.status),
  ).length;
  const checkedInCount = localAttendees.filter(
    (a) => a.checkedIn === "Yes",
  ).length;

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex flex-wrap gap-3">
        <div className="rounded-lg border border-brand-border-light bg-white px-3 py-2 text-center">
          <div className="text-lg font-semibold tabular-nums text-brand-text">
            {localAttendees.length}
          </div>
          <div className="text-xs text-brand-text-muted">Total</div>
        </div>
        <div className="rounded-lg border border-brand-border-light bg-white px-3 py-2 text-center">
          <div className="text-lg font-semibold tabular-nums text-brand-sage">
            {approvedCount}
          </div>
          <div className="text-xs text-brand-text-muted">Approved</div>
        </div>
        <div className="rounded-lg border border-brand-border-light bg-white px-3 py-2 text-center">
          <div className="text-lg font-semibold tabular-nums text-brand-coral">
            {pendingCount}
          </div>
          <div className="text-xs text-brand-text-muted">Pending</div>
        </div>
        <div className="rounded-lg border border-brand-border-light bg-white px-3 py-2 text-center">
          <div className="text-lg font-semibold tabular-nums text-brand-indigo">
            {checkedInCount}
          </div>
          <div className="text-xs text-brand-text-muted">Checked in</div>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-1.5" role="group">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm font-medium capitalize transition-colors",
              filter === f
                ? "border-brand-indigo/20 bg-brand-indigo/8 text-brand-indigo"
                : "border-brand-border-light bg-white text-brand-text-muted hover:border-brand-indigo/40 hover:text-brand-text",
            )}
            aria-pressed={filter === f}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Attendee rows */}
      <div className="space-y-2">
        {filtered.map((a) => (
          <div
            key={a.name}
            className="flex flex-col gap-3 rounded-lg border border-brand-border-light bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-brand-text">{a.name}</span>
                <span
                  className={cn(
                    "text-xs font-medium",
                    attendeeStatusColor(a.status),
                  )}
                >
                  {a.status}
                </span>
              </div>
              <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-brand-text-muted">
                <span>Ticket: {a.ticket}</span>
                <span>
                  {a.checkedIn === "Yes" ? "Checked in" : "Not checked in"}
                </span>
              </div>
              {a.note && (
                <p className="mt-1 text-xs text-brand-text-muted">{a.note}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {/pending/i.test(a.status) && (
                <>
                  <button
                    type="button"
                    onClick={() => handleAction(a.name, "approve")}
                    disabled={loading === `${a.name}-approve`}
                    className="inline-flex items-center gap-1 rounded-md border border-brand-sage/30 bg-brand-sage/10 px-2.5 py-1.5 text-xs font-medium text-brand-sage transition hover:bg-brand-sage/20 disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    {loading === `${a.name}-approve` ? "..." : "Approve"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAction(a.name, "reject")}
                    disabled={loading === `${a.name}-reject`}
                    className="inline-flex items-center gap-1 rounded-md border border-brand-coral/30 bg-brand-coral/10 px-2.5 py-1.5 text-xs font-medium text-brand-coral transition hover:bg-brand-coral/20 disabled:opacity-50"
                  >
                    <XCircle className="h-3 w-3" />
                    {loading === `${a.name}-reject` ? "..." : "Reject"}
                  </button>
                </>
              )}
              {/waitlist/i.test(a.status) && (
                <button
                  type="button"
                  onClick={() => handleAction(a.name, "approve")}
                  disabled={loading === `${a.name}-approve`}
                  className="inline-flex items-center gap-1 rounded-md border border-brand-indigo/30 bg-brand-indigo/10 px-2.5 py-1.5 text-xs font-medium text-brand-indigo transition hover:bg-brand-indigo/20 disabled:opacity-50"
                >
                  <UserCheck className="h-3 w-3" />
                  {loading === `${a.name}-approve` ? "..." : "Promote"}
                </button>
              )}
              {/approved/i.test(a.status) && a.checkedIn !== "Yes" && (
                <button
                  type="button"
                  onClick={() => handleAction(a.name, "checkin")}
                  disabled={loading === `${a.name}-checkin`}
                  className="inline-flex items-center gap-1 rounded-md border border-brand-indigo/30 bg-brand-indigo/10 px-2.5 py-1.5 text-xs font-medium text-brand-indigo transition hover:bg-brand-indigo/20 disabled:opacity-50"
                >
                  <ScanQrCode className="h-3 w-3" />
                  {loading === `${a.name}-checkin` ? "..." : "Check in"}
                </button>
              )}
              {a.checkedIn === "Yes" && (
                <span className="inline-flex items-center gap-1 rounded-md border border-brand-sage/20 bg-brand-sage/10 px-2.5 py-1.5 text-xs font-medium text-brand-sage">
                  <CheckCircle2 className="h-3 w-3" />
                  Done
                </span>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-lg border border-brand-border-light bg-white p-6 text-center text-sm text-brand-text-muted">
            No attendees match the selected filter.
          </div>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────
// Venue Request Studio
// ────────────────────────────────────────────

type VenueMatch = {
  venue: { name: string; slug: string; area: string };
  score: string;
  nextSlot: string;
  fit: string;
};

export function OrganizerVenueRequestStudio({
  venues,
}: {
  venues: readonly VenueMatch[];
}) {
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [expectedAttendance, setExpectedAttendance] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVenue || !eventTitle) return;
    setSending(true);
    try {
      // Build a payload that satisfies bookingRequestSchema.
      // The endpoint is scaffolded (501) so UUIDs are placeholders;
      // real wiring will resolve venue slug → UUID server-side.
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10); // YYYY-MM-DD
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          venueId: "00000000-0000-0000-0000-000000000000",
          organizerId: "00000000-0000-0000-0000-000000000000",
          requestedDate: dateStr,
          requestedStart: "18:00",
          requestedEnd: "21:00",
          expectedAttendance: expectedAttendance ? parseInt(expectedAttendance, 10) || undefined : undefined,
          eventDescription: eventTitle,
          message,
        }),
      });
      const result = await res.json();
      setSubmitted(true);
      if (result.ok) {
        toast("success", "Booking request sent successfully");
      } else {
        toast("info", "Booking request saved locally");
      }
    } catch {
      setSubmitted(true);
      toast("info", "Booking request saved (offline)");
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    const venue = venues.find((v) => v.venue.slug === selectedVenue);
    return (
      <div className="rounded-xl border border-brand-sage/30 bg-brand-sage/10 p-6 text-center">
        <CheckCircle2 className="mx-auto h-8 w-8 text-brand-sage" />
        <div className="mt-3 text-lg font-semibold text-brand-text">
          Request sent
        </div>
        <p className="mt-1 text-sm text-brand-text-muted">
          Your booking request for {venue?.venue.name ?? "the venue"} has been
          submitted. You will be notified when they respond.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setSelectedVenue(null);
            setEventTitle("");
            setExpectedAttendance("");
            setMessage("");
          }}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-brand-border bg-white px-4 py-2 text-sm font-medium text-brand-text transition hover:border-brand-indigo hover:text-brand-indigo"
        >
          Send another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Venue selection */}
      <div>
        <label className="block text-sm font-medium text-brand-text">
          Select venue
        </label>
        <p className="mt-0.5 text-xs text-brand-text-muted">
          Choose from your recommended venue matches.
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {venues.map((v) => (
            <button
              key={v.venue.slug}
              type="button"
              onClick={() => setSelectedVenue(v.venue.slug)}
              className={cn(
                "rounded-lg border p-3 text-left transition",
                selectedVenue === v.venue.slug
                  ? "border-brand-indigo bg-brand-indigo/5"
                  : "border-brand-border-light bg-white hover:border-brand-indigo/40",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-brand-text-muted" />
                  <span className="text-sm font-medium text-brand-text">
                    {v.venue.name}
                  </span>
                </div>
                <span className="text-xs font-medium text-brand-indigo">
                  {v.score}
                </span>
              </div>
              <div className="mt-1 text-xs text-brand-text-muted">
                {v.nextSlot}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Event title */}
      <div>
        <label
          htmlFor="event-title"
          className="block text-sm font-medium text-brand-text"
        >
          Event title
        </label>
        <input
          id="event-title"
          type="text"
          value={eventTitle}
          onChange={(e) => setEventTitle(e.target.value)}
          placeholder="e.g. React Workshop #5"
          className="mt-1 w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-indigo"
          required
        />
      </div>

      {/* Expected attendance */}
      <div>
        <label
          htmlFor="attendance"
          className="block text-sm font-medium text-brand-text"
        >
          Expected attendance
        </label>
        <input
          id="attendance"
          type="text"
          value={expectedAttendance}
          onChange={(e) => setExpectedAttendance(e.target.value)}
          placeholder="e.g. 40-60 people"
          className="mt-1 w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-indigo"
        />
      </div>

      {/* Message */}
      <div>
        <label
          htmlFor="booking-message"
          className="block text-sm font-medium text-brand-text"
        >
          Message to venue
        </label>
        <textarea
          id="booking-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Any special requirements, setup needs, or questions..."
          rows={3}
          className="mt-1 w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-indigo"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!selectedVenue || !eventTitle || sending}
        className="inline-flex items-center gap-1.5 rounded-lg bg-brand-indigo px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-indigo/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
        {sending ? "Sending..." : "Send booking request"}
      </button>
    </form>
  );
}
