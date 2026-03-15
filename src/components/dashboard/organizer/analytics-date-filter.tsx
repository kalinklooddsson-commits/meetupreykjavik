"use client";

import { useState } from "react";
import {
  FilterChips,
  Surface,
  TrendChart,
  DashboardTable,
} from "@/components/dashboard/primitives";

const periods = ["Past Week", "Past Month", "Past 3 Months", "All Time"] as const;
type Period = (typeof periods)[number];

type EventRow = {
  key: string;
  cells: React.ReactNode[];
  dateLabel: string;
  startsAt: string | null;
};

type TrendPoint = { label: string; value: number };

export function AnalyticsDateFilter({
  events,
  trendData,
  computedRevenue,
}: {
  events: EventRow[];
  trendData: TrendPoint[];
  computedRevenue: string;
}) {
  const [selected, setSelected] = useState<Period>("Past Week");

  const cutoff = (() => {
    const now = new Date();
    switch (selected) {
      case "Past Week": now.setDate(now.getDate() - 7); return now;
      case "Past Month": now.setMonth(now.getMonth() - 1); return now;
      case "Past 3 Months": now.setMonth(now.getMonth() - 3); return now;
      case "All Time": return null;
    }
  })();

  const filtered = cutoff
    ? events.filter((e) => {
        if (!e.startsAt) return true;
        return new Date(e.startsAt) >= cutoff;
      })
    : events;

  return (
    <>
      <div className="rounded-xl border border-brand-border-light bg-white p-4">
        <div className="text-xs font-medium uppercase tracking-wider text-brand-text-light mb-2">
          Date range
        </div>
        <FilterChips
          items={periods.map((p) => ({
            key: p,
            label: p,
            active: p === selected,
          }))}
          onSelect={(key) => setSelected(key as Period)}
        />
      </div>

      <Surface title={`RSVP Trend (${selected})`} className="mt-6">
        {trendData.length > 0 && trendData.some((d) => d.value > 0) ? (
          <TrendChart data={trendData} />
        ) : (
          <p className="py-8 text-center text-sm text-gray-500">
            No RSVP data yet. Trends will appear once attendees start responding to your events.
          </p>
        )}
      </Surface>

      <Surface title="Event Performance" className="mt-6">
        {filtered.length > 0 ? (
          <DashboardTable
            columns={["Event", "Date", "Venue", "RSVPs", "Fill Rate", "Status"]}
            rows={filtered.map((e) => ({ key: e.key, cells: e.cells }))}
          />
        ) : (
          <p className="py-8 text-center text-sm text-gray-500">
            No events in this period.
          </p>
        )}
      </Surface>

      <Surface title="Revenue Summary" className="mt-6">
        <p className="text-sm text-gray-600">
          Total gross: {computedRevenue} · Platform commission: 5% ·{" "}
          Net earnings reflect your share after the platform fee.
        </p>
      </Surface>
    </>
  );
}
