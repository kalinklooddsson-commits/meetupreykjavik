import { VenueOnboardingWizard } from "@/components/forms/venue-onboarding-wizard";
import { requireSession } from "@/lib/auth/guards";

export default async function VenueOnboardingPage() {
  // Allow any authenticated user to access onboarding — they want to BECOME a venue.
  // This page lives outside the (venue) route group so the venue-only layout guard
  // does not block non-venue users from reaching onboarding.
  const session = await requireSession();

  return <VenueOnboardingWizard ownerName={session.displayName} />;
}
