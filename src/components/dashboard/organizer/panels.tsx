"use client";

export function OrganizerAttendeeControlCenter({ attendees }: { attendees: readonly { name: string; status: string; ticket: string; checkedIn: string; note: string }[] }) {
  return <div className="text-zinc-400">Attendee Control — rebuilding...</div>;
}

export function OrganizerVenueRequestStudio({ venues }: { venues: readonly { venue: unknown; score: string; nextSlot: string; fit: string }[] }) {
  return <div className="text-zinc-400">Venue Request Studio — rebuilding...</div>;
}
