"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CalendarMatrix, ToneBadge } from "@/components/dashboard/primitives";

type CalendarDay = {
  day: number;
  outside?: boolean;
  emphasis?: boolean;
  items?: string[];
};

type RsvpEvent = {
  startsAt?: string;
  title: string;
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function buildCalendarDays(
  year: number,
  month: number,
  events: RsvpEvent[],
): CalendarDay[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7; // Mon=0

  // Build event-by-day map
  const eventsByDay = new Map<number, string[]>();
  for (const ev of events) {
    if (!ev.startsAt) continue;
    const d = new Date(ev.startsAt);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!eventsByDay.has(day)) eventsByDay.set(day, []);
      eventsByDay.get(day)!.push(ev.title);
    }
  }

  // Leading outside days
  const prevMonthDays = new Date(year, month, 0).getDate();
  const days: CalendarDay[] = [];
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    days.push({ day: prevMonthDays - i, outside: true });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const items = eventsByDay.get(d);
    days.push({
      day: d,
      ...(items ? { emphasis: true, items } : {}),
    });
  }

  // Trailing outside days to fill the grid (42 cells = 6 rows)
  const trailing = 42 - days.length;
  for (let d = 1; d <= trailing; d++) {
    days.push({ day: d, outside: true });
  }

  return days;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function MemberCalendarNav({
  initialYear,
  initialMonth,
  events,
  serverDays,
}: {
  initialYear: number;
  initialMonth: number;
  events: RsvpEvent[];
  serverDays: CalendarDay[];
}) {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);

  const isInitialMonth = year === initialYear && month === initialMonth;
  const days = isInitialMonth ? serverDays : buildCalendarDays(year, month, events);
  const monthLabel = `${MONTH_NAMES[month]} ${year}`;

  function goPrev() {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function goNext() {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  function goToday() {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth());
  }

  return (
    <div className="rounded-2xl border border-brand-border-light bg-white p-5 sm:p-6">
      <div className="mb-1">
        <div className="text-xs font-medium uppercase tracking-wider text-brand-text-light">
          Calendar
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 mb-1">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-brand-text">{monthLabel}</h2>
          <ToneBadge tone="sand">RSVP view</ToneBadge>
        </div>
        <div className="flex items-center gap-1">
          {!isInitialMonth && (
            <button
              type="button"
              onClick={goToday}
              className="mr-1 rounded-lg border border-brand-border-light px-2.5 py-1 text-xs font-medium text-brand-text-muted transition hover:border-brand-indigo hover:text-brand-indigo"
            >
              Today
            </button>
          )}
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous month"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-brand-border-light text-brand-text-muted transition hover:border-brand-indigo hover:text-brand-indigo"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next month"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-brand-border-light text-brand-text-muted transition hover:border-brand-indigo hover:text-brand-indigo"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <p className="mb-4 max-w-3xl text-sm leading-relaxed text-brand-text-muted">
        Days with your RSVPs are highlighted. Tap a day to see event details.
      </p>
      <CalendarMatrix
        monthLabel={monthLabel}
        weekdays={WEEKDAYS}
        days={days}
      />
    </div>
  );
}
