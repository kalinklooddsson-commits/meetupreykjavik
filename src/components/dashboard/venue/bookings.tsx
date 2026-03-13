import type { Route } from "next";
import {
  Inbox,
  ShieldCheck,
} from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import {
  Surface,
  DashboardTable,
  ToneBadge,
  AvatarStamp,
} from "@/components/dashboard/primitives";
import type { DashboardTone } from "@/components/dashboard/primitives";
import { getVenuePortalData } from "@/lib/dashboard-fetchers";
import { venueHasFeature } from "@/lib/entitlements";
import { VenueBookingCommandCenter } from "./panels";

/* ── Helpers ─────────────────────────────────────────────────── */

function venueLinks(activeKey: string) {
  return [
    { key: "overview", label: "Overview", href: "/venue/dashboard" as Route },
    { key: "bookings", label: "Bookings", href: "/venue/bookings" as Route },
    { key: "availability", label: "Availability", href: "/venue/availability" as Route },
    { key: "deals", label: "Deals", href: "/venue/deals" as Route },
    { key: "events", label: "Events", href: "/venue/events" as Route },
    { key: "reviews", label: "Reviews", href: "/venue/reviews" as Route },
    { key: "analytics", label: "Analytics", href: "/venue/analytics" as Route },
    { key: "profile", label: "Profile", href: "/venue/profile" as Route },
  ].map((l) => ({ href: l.href, label: l.label, active: l.key === activeKey }));
}

function statusTone(s: string): DashboardTone {
  if (/active|published|approved|going|accepted|completed|confirmed/i.test(s)) return "sage";
  if (/pending|draft|waitlisted|counter/i.test(s)) return "sand";
  if (/cancelled|rejected|suspended|declined/i.test(s)) return "coral";
  return "neutral";
}

/* ── Screen ──────────────────────────────────────────────────── */

export async function VenueBookingsScreen() {
  const data = await getVenuePortalData();
  const hasBookingInbox = venueHasFeature(data.partnershipTier, "booking_inbox");

  if (!hasBookingInbox) {
    return (
      <PortalShell
        eyebrow="Venue portal"
        title="Bookings"
        description="Manage booking requests from organizers."
        links={venueLinks("bookings")}
        roleMode="venue"
      >
        <Surface
          eyebrow="Upgrade required"
          title="Booking Inbox"
          description="Upgrade to the Partner or Premium tier to receive and manage booking requests from organizers."
        >
          <div className="flex items-center gap-4 rounded-lg border border-brand-border-light bg-brand-sand-light p-4">
            <Inbox className="h-8 w-8 text-brand-text-muted" />
            <div>
              <p className="text-sm font-medium text-brand-text">
                The booking inbox is available on Partner and Premium plans.
              </p>
              <p className="mt-1 text-sm text-brand-text-muted">
                Accept, decline, or counter booking requests directly from organizers. Track your booking history and get guest fit insights.
              </p>
            </div>
          </div>
        </Surface>
      </PortalShell>
    );
  }

  const pendingBookings = data.bookings.incoming.filter(
    (b) => !/accepted/i.test(b.status),
  );
  const acceptedBookings = data.bookings.incoming.filter(
    (b) => /accepted/i.test(b.status),
  );

  return (
    <PortalShell
      eyebrow="Venue portal"
      title="Bookings"
      description="Review incoming requests and manage your booking pipeline."
      links={venueLinks("bookings")}
      roleMode="venue"
    >
      {/* ── Pending booking cards ─────────────────────────── */}
      {pendingBookings.length > 0 && (
        <Surface
          eyebrow="Action needed"
          title="Pending booking requests"
          description="These booking requests need your response."
        >
          <VenueBookingCommandCenter bookings={pendingBookings} />
        </Surface>
      )}

      {/* ── Accepted bookings ─────────────────────────────── */}
      {acceptedBookings.length > 0 && (
        <Surface
          eyebrow="Confirmed"
          title="Accepted bookings"
          description="Bookings you have confirmed."
        >
          <DashboardTable
            columns={["Organizer", "Event", "Date", "Attendance", "Status"]}
            rows={acceptedBookings.map((b) => ({
              key: b.key,
              cells: [
                <div key="org" className="flex items-center gap-2">
                  <AvatarStamp name={b.organizer} size="sm" />
                  <span className="font-medium">{b.organizer}</span>
                </div>,
                b.event,
                b.date,
                b.attendance,
                <ToneBadge key="status" tone="sage">
                  {b.status}
                </ToneBadge>,
              ],
            }))}
            caption="Accepted bookings"
          />
        </Surface>
      )}

      {/* ── Booking history ───────────────────────────────── */}
      <Surface
        eyebrow="History"
        title="Booking history"
        description="Past booking decisions and outcomes."
      >
        <DashboardTable
          columns={["Organizer", "Result", "Note"]}
          rows={data.bookings.history.map((h) => ({
            key: h.key,
            cells: [
              <span key="org" className="font-medium">{h.organizer}</span>,
              <ToneBadge key="result" tone={statusTone(h.result)}>
                {h.result}
              </ToneBadge>,
              <span key="note" className="text-brand-text-muted">{h.note}</span>,
            ],
          }))}
          caption="Booking history"
        />
      </Surface>

      {/* ── Guest fit insights ────────────────────────────── */}
      {venueHasFeature(data.partnershipTier, "organizer_fit_insights") && (
        <Surface
          eyebrow="Insights"
          title="Guest fit guidance"
          description={data.bookings.guestFit.summary}
        >
          <div className="space-y-4">
            {/* Signals */}
            <div>
              <h3 className="mb-2 text-sm font-medium text-brand-text">Audience signals</h3>
              <div className="flex flex-wrap gap-2">
                {data.bookings.guestFit.signals.map((signal) => (
                  <div
                    key={signal.key}
                    className="rounded-lg border border-brand-border-light bg-white px-3 py-2"
                  >
                    <div className="text-xs font-medium text-brand-text-muted">{signal.label}</div>
                    <div className="mt-0.5 text-sm font-semibold text-brand-text">{signal.score}/10</div>
                    <div className="mt-0.5 text-xs text-brand-text-muted">{signal.note}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Room guidance */}
            <div>
              <h3 className="mb-2 text-sm font-medium text-brand-text">Room guidance</h3>
              <div className="space-y-2">
                {data.bookings.guestFit.roomGuidance.map((tip, i) => (
                  <div
                    key={i}
                    className="flex gap-3 rounded-lg border border-brand-border-light bg-white p-3"
                  >
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-sage" />
                    <span className="text-sm leading-relaxed text-brand-text-muted">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Surface>
      )}
    </PortalShell>
  );
}
