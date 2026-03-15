"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  FilterChips,
  DashboardTable,
  ToneBadge,
} from "@/components/dashboard/primitives";
import type { DashboardTone } from "@/components/dashboard/primitives";
import { RsvpButton } from "@/components/public/rsvp-button";

type EventRow = {
  event: { slug: string; title: string; venueName: string };
  status: string;
};

const filters = ["All", "Confirmed", "Waitlist", "Past", "Cancelled"];

function statusTone(s: string): DashboardTone {
  if (/active|published|approved|going|accepted|completed|confirmed/i.test(s)) return "sage";
  if (/pending|draft|waitlisted|waitlist/i.test(s)) return "sand";
  if (/cancelled|rejected|suspended|declined/i.test(s)) return "coral";
  return "neutral";
}

function matchesFilter(status: string, filter: string): boolean {
  if (filter === "All") return true;
  if (filter === "Confirmed") return /approved|confirmed|going|accepted/i.test(status);
  if (filter === "Waitlist") return /waitlist|waitlisted|pending/i.test(status);
  if (filter === "Past") return /completed|past/i.test(status);
  if (filter === "Cancelled") return /cancelled|rejected|declined/i.test(status);
  return true;
}

export function EventsFilterBar({ events = [] }: { events?: EventRow[] }) {
  const [selected, setSelected] = useState("All");

  const filtered = (events ?? []).filter((e) => matchesFilter(e.status, selected));

  return (
    <>
      <div className="rounded-xl border border-brand-border-light bg-white p-4">
        <div className="text-xs font-medium uppercase tracking-wider text-brand-text-light mb-2">
          Filter events
        </div>
        <FilterChips
          items={filters.map((f) => ({
            key: f,
            label: f,
            active: f === selected,
          }))}
          onSelect={setSelected}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-brand-border-light bg-white p-8 text-center text-sm text-brand-text-muted">
          No events match this filter.
        </div>
      ) : (
        <DashboardTable
          columns={["Event", "Venue", "Status", "Action"]}
          rows={filtered.map((e) => ({
            key: e.event.slug,
            cells: [
              <Link
                key="title"
                href={`/events/${e.event.slug}` as Route}
                className="font-medium text-brand-indigo hover:underline"
              >
                {e.event.title}
              </Link>,
              e.event.venueName,
              <ToneBadge key="status" tone={statusTone(e.status)}>
                {e.status}
              </ToneBadge>,
              <RsvpButton key="rsvp" eventSlug={e.event.slug} initialState="going" className="!min-h-0 !px-3 !py-1.5 !text-xs" />,
            ],
          }))}
          caption="Your RSVPs"
        />
      )}
    </>
  );
}
