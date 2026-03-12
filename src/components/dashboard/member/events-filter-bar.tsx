"use client";

import { useState } from "react";
import { FilterChips } from "@/components/dashboard/primitives";

const filters = ["All", "Confirmed", "Waitlist", "Past", "Cancelled"];

export function EventsFilterBar() {
  const [selected, setSelected] = useState("All");

  return (
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
  );
}
