import type { Route } from "next";
import { Tag } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import {
  Surface,
} from "@/components/dashboard/primitives";
import { getVenuePortalData } from "@/lib/dashboard-fetchers";
import { venueHasFeature } from "@/lib/entitlements";
import { VenueDealStudio } from "./panels";

/* ── Helpers ─────────────────────────────────────────────────── */

function venueLinks(activeKey: string) {
  return [
    { key: "overview", label: "Overview", href: "/venue/dashboard" as Route },
    { key: "bookings", label: "Bookings", href: "/venue/bookings" as Route },
    { key: "availability", label: "Availability", href: "/venue/availability" as Route },
    { key: "deals", label: "Deals", href: "/venue/deals" as Route },
    { key: "events", label: "Events", href: "/venue/events" as Route },
    { key: "reviews", label: "Reviews", href: "/venue/reviews" as Route },
    { key: "messages", label: "Messages", href: "/venue/messages" as Route },
    { key: "notifications", label: "Notifications", href: "/venue/notifications" as Route },
    { key: "analytics", label: "Analytics", href: "/venue/analytics" as Route },
    { key: "profile", label: "Profile", href: "/venue/profile" as Route },
  ].map((l) => ({ href: l.href, label: l.label, active: l.key === activeKey }));
}

/* ── Screen ──────────────────────────────────────────────────── */

export async function VenueDealsScreen() {
  const data = await getVenuePortalData();
  const hasDealManagement = venueHasFeature(data.partnershipTier, "deal_management");

  if (!hasDealManagement) {
    return (
      <PortalShell
        eyebrow="Venue portal"
        title="Deals"
        description="Create and manage member and organizer deals."
        links={venueLinks("deals")}
        roleMode="venue"
      >
        <Surface
          eyebrow="Upgrade required"
          title="Deal Management"
          description="Upgrade to the Partner or Premium tier to create deals and track redemption."
        >
          <div className="flex items-center gap-4 rounded-lg border border-brand-border-light bg-brand-sand-light p-4">
            <Tag className="h-8 w-8 text-brand-text-muted" />
            <div>
              <p className="text-sm font-medium text-brand-text">
                Deal management is available on Partner and Premium plans.
              </p>
              <p className="mt-1 text-sm text-brand-text-muted">
                Offer welcome drinks, group discounts, and special perks to members and organizers booking your venue.
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
      title="Deals"
      description="Manage perks and promotions for members and organizers."
      links={venueLinks("deals")}
      roleMode="venue"
    >
      {/* ── All deal management (tables + studio in one client component for consistent state) ── */}
      <Surface
        eyebrow="Manage"
        title="Deal studio"
        description="Create, edit, and manage deals. Tables update in sync with changes."
      >
        <VenueDealStudio deals={data.deals} venueId={(data.venue as Record<string, unknown>)?.id as string | undefined} showTables />
      </Surface>
    </PortalShell>
  );
}
