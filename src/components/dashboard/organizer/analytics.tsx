import type { Route } from "next";
import { PortalShell } from "@/components/layout/portal-shell";
import {
  Surface,
  StatCard,
  TrendChart,
  DashboardTable,
  ToneBadge,
} from "@/components/dashboard/primitives";
import type { DashboardTone } from "@/components/dashboard/primitives";
import { getOrganizerPortalData } from "@/lib/dashboard-fetchers";
import { BarChart3, TrendingUp, Users, DollarSign } from "lucide-react";

function organizerLinks(activeKey: string) {
  return [
    { key: "overview", label: "Overview", href: "/organizer" as Route },
    { key: "events", label: "Events", href: "/organizer/events" as Route },
    { key: "groups", label: "Groups", href: "/organizer/groups" as Route },
    { key: "bookings", label: "Bookings", href: "/organizer/bookings" as Route },
    { key: "venues", label: "Venues", href: "/organizer/venues" as Route },
    { key: "analytics", label: "Analytics", href: "/organizer/analytics" as Route },
    { key: "messages", label: "Messages", href: "/organizer/messages" as Route },
    { key: "notifications", label: "Notifications", href: "/organizer/notifications" as Route },
  ].map((l) => ({ href: l.href, label: l.label, active: l.key === activeKey }));
}

function statusTone(s: string): DashboardTone {
  if (/active|published|approved|going|accepted|completed/i.test(s)) return "sage";
  if (/pending|draft|waitlisted|countered/i.test(s)) return "sand";
  if (/cancelled|rejected|suspended|declined/i.test(s)) return "coral";
  return "neutral";
}

/** Safely extract a numeric RSVP count from an event object */
function extractRsvpCount(e: Record<string, unknown>): number {
  // `.rsvps` is a number in both mock and real data
  const rsvps = e.rsvps;
  if (typeof rsvps === "number") return rsvps;
  // fallback: `.rsvpCount` (number) or length of `.attendees` array
  const rsvpCount = e.rsvpCount;
  if (typeof rsvpCount === "number") return rsvpCount;
  const attendees = e.attendees;
  if (Array.isArray(attendees)) return attendees.length;
  if (typeof attendees === "number") return attendees;
  return 0;
}

/** Find a metric value by fuzzy label match */
function findMetric(
  metrics: readonly { label: string; value: string }[],
  ...labels: string[]
): string | undefined {
  for (const label of labels) {
    const found = metrics.find((m) =>
      m.label.toLowerCase().includes(label.toLowerCase()),
    );
    if (found) return found.value;
  }
  return undefined;
}

export async function OrganizerAnalyticsScreen() {
  const data = await getOrganizerPortalData();

  // Use nextEvents (real + mock data) — events may have attendees as an array, nextEvents always has rsvps as number
  const events = data.nextEvents ?? data.events ?? [];

  // Find metrics by flexible label matching to handle both mock and real metric names
  const totalRevenue = findMetric(data.metrics, "revenue") ?? "0 ISK";
  const totalAttendees = findMetric(data.metrics, "rsvp", "attendee") ?? "0";
  const eventCount = findMetric(data.metrics, "event", "live") ?? String(events.length);

  // Compute revenue from events if the metric shows 0
  const computedRevenue =
    totalRevenue === "0 ISK" || totalRevenue === "0"
      ? (() => {
          const sum = events.reduce((acc, e) => {
            const rev = (e as unknown as Record<string, unknown>).revenue;
            if (typeof rev === "string") {
              const num = parseInt(rev.replace(/[^\d]/g, ""), 10);
              return acc + (isNaN(num) ? 0 : num);
            }
            return acc + (typeof rev === "number" ? rev : 0);
          }, 0);
          return sum > 0 ? `${sum.toLocaleString()} ISK` : totalRevenue;
        })()
      : totalRevenue;

  // Build table rows using the safe numeric extractor
  const eventRows = events.map((e, idx) => {
    const rec = e as unknown as Record<string, unknown>;
    const rsvpCount = extractRsvpCount(rec);
    const cap = typeof rec.capacity === "number" ? rec.capacity : 50;
    const fillPct = cap > 0 ? Math.round((rsvpCount / cap) * 100) : 0;
    return {
      key: `event-${idx}`,
      cells: [
        e.title,
        e.dateLabel ?? "—",
        e.venueName ?? "—",
        String(rsvpCount),
        `${fillPct}%`,
        e.status ?? "Published",
      ] as React.ReactNode[],
    };
  });

  // Compute avg fill rate from the actual event data
  const avgFillRate =
    events.length > 0
      ? `${Math.round(
          events.reduce((sum, e) => {
            const rec = e as unknown as Record<string, unknown>;
            const att = extractRsvpCount(rec);
            const cap = Math.max(typeof rec.capacity === "number" ? rec.capacity : 50, 1);
            return sum + (att / cap) * 100;
          }, 0) / events.length,
        )}%`
      : "—";

  const trendData = data.rsvpTrend ?? [];

  return (
    <PortalShell
      eyebrow="Organizer portal"
      title="Analytics"
      description="Track your event performance, attendance trends, and revenue."
      links={organizerLinks("analytics")}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Revenue" value={String(computedRevenue)} icon={DollarSign} />
        <StatCard label="Total Attendees" value={String(totalAttendees)} icon={Users} />
        <StatCard label="Events Created" value={String(eventCount)} icon={BarChart3} />
        <StatCard label="Avg Fill Rate" value={avgFillRate} icon={TrendingUp} />
      </div>

      <Surface title="RSVP Trend (Past Week)" className="mt-6">
        {trendData.length > 0 && trendData.some((d) => typeof d === "object" && d !== null && ((d as Record<string, unknown>).value as number) > 0) ? (
          <TrendChart
            data={trendData.map((d) => ({
              label: typeof d === "object" && d !== null ? ((d as Record<string, unknown>).label as string) ?? "" : "",
              value: typeof d === "object" && d !== null ? ((d as Record<string, unknown>).value as number) ?? 0 : 0,
            }))}
          />
        ) : (
          <p className="py-8 text-center text-sm text-gray-500">
            No RSVP data yet. Trends will appear once attendees start responding to your events.
          </p>
        )}
      </Surface>

      <Surface title="Event Performance" className="mt-6">
        {eventRows.length > 0 ? (
          <DashboardTable
            columns={["Event", "Date", "Venue", "RSVPs", "Fill Rate", "Status"]}
            rows={eventRows}
          />
        ) : (
          <p className="py-8 text-center text-sm text-gray-500">
            No events yet. Create your first event to see analytics.
          </p>
        )}
      </Surface>

      <Surface title="Revenue Summary" className="mt-6">
        <p className="text-sm text-gray-600">
          Total gross: {computedRevenue} · Platform commission: 5% ·{" "}
          Net earnings reflect your share after the platform fee.
        </p>
      </Surface>
    </PortalShell>
  );
}
