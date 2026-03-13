import { VenueEventForm } from "@/components/forms/venue-event-form";
import { requireSession } from "@/lib/auth/guards";

export default async function VenueNewEventPage() {
  const session = await requireSession(["venue"]);

  return (
    <VenueEventForm
      venueSlug={session.slug}
      venueName={session.displayName}
    />
  );
}
