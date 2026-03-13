import type { Route } from "next";
import { CalendarRange, AlertTriangle } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import {
  Surface,
  KeyValueList,
} from "@/components/dashboard/primitives";
import { getVenuePortalData } from "@/lib/dashboard-fetchers";
import { venueHasFeature } from "@/lib/entitlements";
import { VenueAvailabilityStudio } from "./panels";

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

/* ── Screen ──────────────────────────────────────────────────── */

export async function VenueAvailabilityScreen() {
  const data = await getVenuePortalData();
  const hasAvailability = venueHasFeature(data.partnershipTier, "availability_planning");

  if (!hasAvailability) {
    return (
      <PortalShell
        eyebrow="Venue portal"
        title="Availability"
        description="Manage your venue schedule and event time slots."
        links={venueLinks("availability")}
        roleMode="venue"
      >
        <Surface
          eyebrow="Upgrade required"
          title="Availability Planning"
          description="Upgrade to the Partner or Premium tier to manage your weekly schedule, recurring slots, and exceptions."
        >
          <div className="flex items-center gap-4 rounded-lg border border-brand-border-light bg-brand-sand-light p-4">
            <CalendarRange className="h-8 w-8 text-brand-text-muted" />
            <div>
              <p className="text-sm font-medium text-brand-text">
                Availability planning is available on Partner and Premium plans.
              </p>
              <p className="mt-1 text-sm text-brand-text-muted">
                Set recurring time slots, manage weekly grids, and block out dates for private events or maintenance.
              </p>
            </div>
          </div>
        </Surface>
      </PortalShell>
    );
  }

  return (
    <PortalShell
      eyebrow="Venue portal"
      title="Availability"
      description="Your weekly schedule, recurring slots, and blocked dates."
      links={venueLinks("availability")}
      roleMode="venue"
    >
      {/* ── Weekly grid (interactive) ──────────────────── */}
      <Surface
        eyebrow="Schedule"
        title="Weekly availability grid"
        description="Your available time blocks for each day of the week. Click a day to add or remove slots."
      >
        <VenueAvailabilityStudio weeklyGrid={data.availability.weeklyGrid} />
      </Surface>

      {/* ── Recurring schedule ────────────────────────────── */}
      <Surface
        eyebrow="Recurring"
        title="Recurring availability"
        description="Your standing weekly patterns for organizer bookings."
      >
        <KeyValueList
          items={data.availability.recurring.map((slot, i) => ({
            key: `rec-${i}`,
            label: `Slot ${i + 1}`,
            value: slot,
          }))}
        />
      </Surface>

      {/* ── Exceptions ───────────────────────────────────── */}
      <Surface
        eyebrow="Exceptions"
        title="Blocked dates and overrides"
        description="Dates where normal availability does not apply."
      >
        <div className="space-y-2">
          {data.availability.exceptions.map((exception, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border border-brand-border-light bg-white p-3"
            >
              <AlertTriangle className="h-4 w-4 shrink-0 text-brand-coral" />
              <span className="text-sm text-brand-text">{exception}</span>
            </div>
          ))}
        </div>
      </Surface>
    </PortalShell>
  );
}
