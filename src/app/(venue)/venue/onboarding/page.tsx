import { VenueOnboardingWizard } from "@/components/forms/venue-onboarding-wizard";
import { requireSession } from "@/lib/auth/guards";

export default async function VenueOnboardingPage() {
  // Allow any authenticated user to access onboarding — they want to BECOME a venue
  const session = await requireSession();

  return <VenueOnboardingWizard ownerName={session.displayName} />;
}
