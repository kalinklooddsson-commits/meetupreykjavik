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
  ].map((l) => ({ href: l.href, label: l.label, active: l.key === activeKey }));
}

function statusTone(s: string): DashboardTone {
  if (/active|published|approved|going|accepted|completed/i.test(s)) return "sage";
  if (/pending|draft|waitlisted|countered/i.test(s)) return "sand";
  if (/cancelled|rejected|suspended|declined/i.test(s)) return "coral";
  return "neutral";
}

export async function OrganizerAnalyticsScreen() {
  const data = await getOrganizerPortalData();

  const events = data.events ?? [];
  const totalRevenue = data.metrics.find((m) => m.label === "Revenue")?.value ?? "0 ISK";
  const totalAttendees = data.metrics.find((m) => m.label === "Total RSVPs")?.value ?? "0";
  const eventCount = data.metrics.find((m) => m.label === "Active events")?.value ?? "0";

  // Safely extract attendees and capacity from event data
  const eventRows = events.map((e, idx) => {
    const attendees = (e as unknown as Record<string, unknown>).rsvpCount ?? (e as unknown as Record<string, unknown>).attendees ?? 0;
    const cap = (e as unknown as Record<string, unknown>).capacity ?? 50;
    return {
      key: `event-${idx}`,
      cells: [
        e.title,
        e.dateLabel ?? "—",
        e.venueName ?? "—",
        String(attendees),
        `${attendees}/${cap}`,
        e.status ?? "Published",
      ] as React.ReactNode[],
    };
  });

  const trendData = data.rsvpTrend ?? [];

  return (
    <PortalShell
      eyebrow="Organizer portal"
      title="Analytics"
      description="Track your event performance, attendance trends, and revenue."
      links={organizerLinks("analytics")}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Revenue" value={String(totalRevenue)} icon={DollarSign} />
        <StatCard label="Total Attendees" value={String(totalAttendees)} icon={Users} />
        <StatCard label="Events Created" value={String(eventCount)} icon={BarChart3} />
        <StatCard
          label="Avg Fill Rate"
          value={
            events.length > 0
              ? `${Math.round(
                  events.reduce((sum, e) => {
                    const att = Number((e as unknown as Record<string, unknown>).rsvpCount ?? (e as unknown as Record<string, unknown>).attendees ?? 0);
                    const cap = Math.max(Number((e as unknown as Record<string, unknown>).capacity ?? 50), 1);
                    return sum + (att / cap) * 100;
                  }, 0) / events.length,
                )}%`
              : "—"
          }
          icon={TrendingUp}
        />
      </div>

      {trendData.length > 0 && (
        <Surface title="RSVP Trend (Past Week)" className="mt-6">
          <TrendChart
            data={trendData.map((d) => ({
              label: typeof d === "object" && d !== null ? ((d as Record<string, unknown>).label as string) ?? "" : "",
              value: typeof d === "object" && d !== null ? ((d as Record<string, unknown>).value as number) ?? 0 : 0,
            }))}
          />
        </Surface>
      )}

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
          Total gross: {totalRevenue} · Platform commission: 5% ·{" "}
          Net earnings reflect your share after the platform fee.
        </p>
      </Surface>
    </PortalShell>
  );
}
