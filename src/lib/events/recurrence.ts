// src/lib/events/recurrence.ts
//
// Parses recurrence_rule strings and generates future event dates.
// Format: "FREQ=WEEKLY;BYDAY=SA" (simplified iCal RRULE subset)

export interface RecurrenceOptions {
  frequency: "daily" | "weekly" | "biweekly" | "monthly";
  dayOfWeek?: number; // 0=Sun, 1=Mon, ..., 6=Sat
  dayOfMonth?: number;
}

const DAY_MAP: Record<string, number> = {
  SU: 0,
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6,
};

export function parseRecurrenceRule(rule: string): RecurrenceOptions | null {
  if (!rule) return null;

  const parts = Object.fromEntries(
    rule.split(";").map((p) => {
      const [k, v] = p.split("=");
      return [k?.trim(), v?.trim()];
    }),
  );

  const freq = parts["FREQ"]?.toLowerCase();
  if (!freq) return null;

  return {
    frequency:
      freq === "biweekly"
        ? "biweekly"
        : (freq as RecurrenceOptions["frequency"]),
    dayOfWeek: parts["BYDAY"] ? DAY_MAP[parts["BYDAY"]] : undefined,
    dayOfMonth: parts["BYMONTHDAY"]
      ? parseInt(parts["BYMONTHDAY"], 10)
      : undefined,
  };
}

export function getNextOccurrence(
  baseDate: Date,
  options: RecurrenceOptions,
): Date {
  const next = new Date(baseDate);

  switch (options.frequency) {
    case "daily":
      next.setDate(next.getDate() + 1);
      break;
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "biweekly":
      next.setDate(next.getDate() + 14);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      if (options.dayOfMonth) {
        next.setDate(options.dayOfMonth);
      }
      break;
  }

  return next;
}

/**
 * Given a parent event's start date and recurrence rule,
 * generate all occurrences up to `recurrenceEnd` or `maxCount`.
 */
export function generateOccurrences(
  startsAt: Date,
  duration: number, // milliseconds
  rule: string,
  recurrenceEnd: Date | null,
  maxCount = 52, // 1 year of weekly
): Array<{ startsAt: Date; endsAt: Date }> {
  const options = parseRecurrenceRule(rule);
  if (!options) return [];

  const results: Array<{ startsAt: Date; endsAt: Date }> = [];
  let current = new Date(startsAt);
  const endDate =
    recurrenceEnd ??
    new Date(startsAt.getTime() + 365 * 24 * 60 * 60 * 1000);

  for (let i = 0; i < maxCount; i++) {
    current = getNextOccurrence(current, options);
    if (current > endDate) break;
    results.push({
      startsAt: new Date(current),
      endsAt: new Date(current.getTime() + duration),
    });
  }

  return results;
}
