import type { Route } from "next";
import {
  CalendarCheck,
  Clock,
  Users,
  MessageSquare,
} from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import {
  Surface,
  DashboardTable,
  ToneBadge,
  StatCard,
} from "@/components/dashboard/primitives";
import type { DashboardTone } from "@/components/dashboard/primitives";
import { adminBookings as mockAdminBookings } from "@/lib/dashboard-data";
import { hasSupabaseEnv } from "@/lib/env";
import { getAllBookings } from "@/lib/db/bookings";

/* ── Shared helpers ──────────────────────────────────────────── */

function adminLinks(activeKey: string) {
  return [
    { key: "overview", label: "Overview", href: "/admin" as Route },
    { key: "users", label: "Users", href: "/admin/users" as Route },
    { key: "events", label: "Events", href: "/admin/events" as Route },
    { key: "venues", label: "Venues", href: "/admin/venues" as Route },
    { key: "groups", label: "Groups", href: "/admin/groups" as Route },
    { key: "bookings", label: "Bookings", href: "/admin/bookings" as Route },
    { key: "revenue", label: "Revenue", href: "/admin/revenue" as Route },
    { key: "payouts", label: "Payouts", href: "/admin/payouts" as Route },
    { key: "messages", label: "Messages", href: "/admin/messages" as Route },
    { key: "settings", label: "Settings", href: "/admin/settings" as Route },
    { key: "audit", label: "Audit Log", href: "/admin/audit" as Route },
  ].map((l) => ({ href: l.href, label: l.label, active: l.key === activeKey }));
}

function statusTone(s: string): DashboardTone {
  if (/active|published|approved|going|accepted|completed/i.test(s)) return "sage";
  if (/pending|draft|waitlisted|counter/i.test(s)) return "sand";
  if (/cancelled|rejected|suspended|declined|critical/i.test(s)) return "coral";
  return "neutral";
}

function formatStatus(s: string): string {
  return s
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ── Screen ──────────────────────────────────────────────────── */

export async function AdminBookingsScreen() {
  let bookings: Array<{
    key: string;
    organizer: string;
    venue: string;
    date: string;
    time: string;
    attendance: string;
    status: string;
    message?: string;
  }>;

  if (hasSupabaseEnv()) {
    try {
      const dbBookings = await getAllBookings();
      bookings = dbBookings.map((b: Record<string, unknown>) => {
        const organizer = b.organizer as { display_name: string } | null;
        const venue = b.venue as { name: string } | null;
        return {
          key: b.id as string,
          organizer: organizer?.display_name ?? "Unknown",
          venue: venue?.name ?? "Unknown venue",
          date: (b.requested_date as string) ?? "",
          time: (() => {
            // Try explicit time field first, then extract from date if it has a time component
            const t = b.requested_time as string | null;
            if (t) return t.replace(/:00$/, "");
            const dateStr = b.requested_date as string | null;
            if (dateStr && dateStr.includes("T")) {
              const d = new Date(dateStr);
              return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
            }
            // Fall back to event start time if available
            const event = b.events as Record<string, unknown> | null;
            const startsAt = event?.starts_at as string | null;
            if (startsAt) {
              const d = new Date(startsAt);
              return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
            }
            return "—";
          })(),
          attendance: String((b.expected_attendance as number) ?? 0),
          status: (b.status as string) ?? "pending",
          message: (b.message as string) ?? undefined,
        };
      });
    } catch {
      bookings = [...mockAdminBookings];
    }
  } else {
    bookings = [...mockAdminBookings];
  }

  const pending = bookings.filter((b) => b.status === "pending").length;
  const accepted = bookings.filter((b) => /accepted|completed/.test(b.status)).length;
  const totalAttendance = bookings.reduce((sum, b) => sum + parseInt(b.attendance, 10), 0);

  return (
    <PortalShell
      eyebrow="Admin portal"
      title="Bookings"
      description="Oversee venue booking requests between organizers and venue partners."
      links={adminLinks("bookings")}
      variant="admin"
      roleMode="admin"
    >
      {/* ── Summary stats ──────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total bookings"
          value={String(bookings.length)}
          detail="All booking requests on the platform"
          icon={CalendarCheck}
          tone="indigo"
        />
        <StatCard
          label="Pending"
          value={String(pending)}
          detail="Awaiting venue confirmation"
          icon={Clock}
          tone="sand"
        />
        <StatCard
          label="Confirmed"
          value={String(accepted)}
          detail="Accepted or completed bookings"
          icon={CalendarCheck}
          tone="sage"
        />
        <StatCard
          label="Total attendance"
          value={String(totalAttendance)}
          detail="Combined expected attendees"
          icon={Users}
          tone="neutral"
        />
      </div>

      {/* ── Bookings table ─────────────────────────────────── */}
      <Surface
        eyebrow="All bookings"
        title="Booking requests"
        description="Complete list of venue booking requests from organizers. Review status and respond to counter-offers."
      >
        <DashboardTable
          columns={["Organizer", "Venue", "Date", "Time", "Attendance", "Status", "Message"]}
          rows={bookings.map((b) => ({
            key: b.key,
            cells: [
              <span key="org" className="font-medium">{b.organizer}</span>,
              b.venue,
              b.date,
              b.time,
              <span key="att" className="flex items-center gap-1 tabular-nums">
                <Users className="h-3 w-3 text-brand-text-light" />
                {b.attendance}
              </span>,
              <ToneBadge key="status" tone={statusTone(b.status)}>
                {formatStatus(b.status)}
              </ToneBadge>,
              "message" in b && b.message ? (
                <span key="msg" className="flex items-center gap-1 text-xs text-brand-text-muted">
                  <MessageSquare className="h-3 w-3" />
                  {b.message}
                </span>
              ) : (
                <span key="msg" className="text-xs text-brand-text-light">—</span>
              ),
            ],
          }))}
          caption="Venue booking requests"
        />
      </Surface>
    </PortalShell>
  );
}
