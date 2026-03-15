import type { Route } from "next";
import {
  CalendarDays,
  Target,
  UserPlus,
  BarChart3,
} from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import {
  Surface,
  DashboardTable,
  ToneBadge,
  CalendarMatrix,
  KeyValueList,
  AvatarStamp,
  StatCard,
} from "@/components/dashboard/primitives";
import type { DashboardTone } from "@/components/dashboard/primitives";
import { getAdminPortalData } from "@/lib/dashboard-fetchers";
import { AdminEventOperationsDesk } from "./panels";

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
    { key: "analytics", label: "Analytics", href: "/admin/analytics" as Route },
    { key: "content", label: "Content", href: "/admin/content" as Route },
    { key: "comms", label: "Comms", href: "/admin/comms" as Route },
    { key: "moderation", label: "Moderation", href: "/admin/moderation" as Route },
  ].map((l) => ({ href: l.href, label: l.label, active: l.key === activeKey }));
}

function statusTone(s: string): DashboardTone {
  if (/active|published|approved|going|accepted|completed|paid/i.test(s)) return "sage";
  if (/pending|draft|waitlisted|counter|approval/i.test(s)) return "sand";
  if (/cancelled|rejected|suspended|declined|critical/i.test(s)) return "coral";
  return "neutral";
}

/* ── Screen ──────────────────────────────────────────────────── */

export async function AdminEventsScreen() {
  const data = await getAdminPortalData();
  const { events } = data;

  /* Build calendar days for March 2026 */
  const calendarDays = buildCalendarDays(events.calendar);

  return (
    <PortalShell
      eyebrow="Admin portal"
      title="Events"
      description="Manage all platform events, review scheduling, and curate audience invitations."
      links={adminLinks("events")}
      variant="admin"
      roleMode="admin"
    >
      {/* ── Events table ───────────────────────────────────── */}
      <Surface
        eyebrow="All events"
        title="Event directory"
        description={`${events.table.length} events across all categories. Review status, venues, and admin actions.`}
      >
        <AdminEventOperationsDesk events={events.table} />
      </Surface>

      {/* ── Calendar view ──────────────────────────────────── */}
      <Surface
        eyebrow="Schedule"
        title="March 2026 calendar"
        description="Visual overview of upcoming events across the month."
      >
        <CalendarMatrix
          monthLabel="March 2026"
          weekdays={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
          days={calendarDays}
        />
      </Surface>

      {/* ── Audience picker ────────────────────────────────── */}
      <Surface
        eyebrow="Audience curation"
        title={`Invite list: ${events.audiencePicker.eventTitle}`}
        description={events.audiencePicker.target}
        actionLabel="View event"
        actionHref={`/events/${events.audiencePicker.eventSlug}` as Route}
      >
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <StatCard
            label="Seats remaining"
            value={String(events.audiencePicker.seatsRemaining)}
            detail="Open spots for curated invites"
            tone="indigo"
            icon={Target}
          />
          <StatCard
            label="Selected"
            value={String(events.audiencePicker.selectedIds.length)}
            detail="Candidates already picked"
            tone="sage"
            icon={UserPlus}
          />
          <StatCard
            label="Candidates"
            value={String(events.audiencePicker.candidates.length)}
            detail="Total candidates evaluated"
            tone="neutral"
            icon={BarChart3}
          />
        </div>

        <DashboardTable
          columns={["Candidate", "Tier", "Status", "Fit score", "Last active", "Tags", "Reason"]}
          rows={events.audiencePicker.candidates.map((c) => ({
            key: c.id,
            cells: [
              <div key="name" className="flex items-center gap-2">
                <AvatarStamp name={c.name} size="sm" />
                <div>
                  <span className="font-medium">{c.name}</span>
                  {events.audiencePicker.selectedIds.includes(c.id) && (
                    <span className="ml-2 inline-flex items-center rounded bg-[rgba(124,154,130,0.14)] px-1.5 py-0.5 text-[10px] font-semibold text-brand-sage">
                      SELECTED
                    </span>
                  )}
                </div>
              </div>,
              <ToneBadge key="tier" tone={c.tier === "Free" ? "neutral" : "indigo"}>{c.tier}</ToneBadge>,
              <ToneBadge key="status" tone={statusTone(c.status)}>{c.status}</ToneBadge>,
              <span key="fit" className={`font-semibold ${c.fitScore >= 90 ? "text-brand-sage" : c.fitScore >= 80 ? "text-brand-indigo" : "text-brand-text-muted"}`}>
                {c.fitScore}%
              </span>,
              c.lastActive,
              <div key="tags" className="flex flex-wrap gap-1">
                {c.tags.map((tag) => (
                  <ToneBadge key={tag} tone="neutral">{tag}</ToneBadge>
                ))}
              </div>,
              <span key="reason" className="text-xs leading-relaxed text-brand-text-muted">{c.reason}</span>,
            ],
          }))}
          caption="Audience candidates"
        />
      </Surface>

      {/* ── Audience strategy ──────────────────────────────── */}
      <Surface
        eyebrow="Strategy"
        title="Audience strategy brief"
        description="Room composition goals, segment targets, and curation rules for this event."
      >
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="space-y-4">
            <KeyValueList
              items={events.audienceStrategy.brief.map((b) => ({
                key: b.key,
                label: b.label,
                value: b.value,
              }))}
            />
          </div>
          <div className="space-y-4">
            <div className="mb-2 text-xs font-medium uppercase tracking-wider text-brand-text-light">
              Segment targets
            </div>
            <DashboardTable
              columns={["Segment", "Target", "Current", "Note"]}
              dense
              rows={events.audienceStrategy.segments.map((seg) => ({
                key: seg.key,
                cells: [
                  <span key="label" className="font-medium">{seg.label}</span>,
                  String(seg.target),
                  <span key="current" className={seg.current >= seg.target ? "font-semibold text-brand-sage" : "font-semibold text-brand-indigo"}>
                    {seg.current}
                  </span>,
                  <span key="note" className="text-xs text-brand-text-muted">{seg.note}</span>,
                ],
              }))}
              caption="Audience segment targets"
            />
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-brand-text-light">
            Curation rules
          </div>
          <ul className="space-y-1.5">
            {events.audienceStrategy.rules.map((rule, i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed text-brand-text-muted">
                <span className="mt-1 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-brand-indigo" />
                {rule}
              </li>
            ))}
          </ul>
        </div>
      </Surface>
    </PortalShell>
  );
}

/* ── Calendar builder ────────────────────────────────────────── */

function buildCalendarDays(
  calendarEvents: readonly { day: string; label: string }[],
) {
  // March 2026 starts on Sunday (day index 6 in Mon-start grid)
  // Build a 5-week grid
  const eventsByDay = new Map<number, string[]>();
  for (const event of calendarEvents) {
    const dayNum = parseInt(event.day, 10);
    if (!eventsByDay.has(dayNum)) eventsByDay.set(dayNum, []);
    eventsByDay.get(dayNum)!.push(event.label);
  }

  const days: { day: number; outside?: boolean; emphasis?: boolean; items?: string[] }[] = [];

  // Fill leading days from February (March 2026 starts on Sunday)
  // In a Mon-start grid, Sunday is position 7, so we need 6 leading days
  for (let d = 23; d <= 28; d++) {
    days.push({ day: d, outside: true });
  }

  // March days
  for (let d = 1; d <= 31; d++) {
    const items = eventsByDay.get(d);
    days.push({
      day: d,
      emphasis: !!items,
      items,
    });
  }

  // Trailing days to fill the grid
  const remaining = 42 - days.length;
  for (let d = 1; d <= remaining; d++) {
    days.push({ day: d, outside: true });
  }

  return days;
}
