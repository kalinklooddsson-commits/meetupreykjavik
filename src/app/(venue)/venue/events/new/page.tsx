import type { Route } from "next";
import { PortalShell } from "@/components/layout/portal-shell";
import { Surface } from "@/components/dashboard/primitives";
import { VenueEventForm } from "@/components/forms/venue-event-form";
import { requireSession } from "@/lib/auth/guards";
import { getVenuePortalData } from "@/lib/dashboard-fetchers";

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

export default async function VenueNewEventPage() {
  const session = await requireSession(["venue"]);
  const data = await getVenuePortalData();
  const venueObj = data.venue as Record<string, unknown> | undefined;
  const venueName = (venueObj?.name as string) || "your venue";
  const venueSlug = (venueObj?.slug as string) || session.slug;

  return (
    <PortalShell
      eyebrow="Venue portal"
      title="Create event"
      description={`Host an event at ${venueName}. Fill in the details below and publish when ready.`}
      links={venueLinks("events")}
      roleMode="venue"
    >
      <Surface
        eyebrow="Event details"
        title="New event"
        description="Fill in the details for your event."
      >
        <VenueEventForm
          venueSlug={venueSlug}
          venueName={venueName}
        />
      </Surface>
    </PortalShell>
  );
}
