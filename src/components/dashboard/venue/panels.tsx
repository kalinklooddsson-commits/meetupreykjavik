"use client";

export function VenueBookingCommandCenter({ bookings }: { bookings: readonly { key: string; organizer: string; event: string; date: string; attendance: string; message: string; status: string }[] }) {
  return <div className="text-zinc-400">Booking Command — rebuilding...</div>;
}

export function VenueAvailabilityStudio({ weeklyGrid }: { weeklyGrid: readonly { day: string; blocks: string[] }[] }) {
  return <div className="text-zinc-400">Availability Studio — rebuilding...</div>;
}

export function VenueDealStudio({ deals }: { deals: readonly { key: string; title: string; type: string; tier: string; status: string; redemption: string; note: string }[] }) {
  return <div className="text-zinc-400">Deal Studio — rebuilding...</div>;
}

export function VenueProfileSectionEditor({ sections }: { sections: readonly { key: string; title: string; items: readonly { label: string; value: string }[] }[] }) {
  return <div className="text-zinc-400">Profile Editor — rebuilding...</div>;
}
