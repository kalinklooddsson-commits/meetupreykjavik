import { VenueOnboardingWizard } from "@/components/forms/venue-onboarding-wizard";
import { requireSession } from "@/lib/auth/guards";

export default async function VenueOnboardingPage() {
  const session = await requireSession(["venue"]);

  return <VenueOnboardingWizard ownerName={session.displayName} />;
}
