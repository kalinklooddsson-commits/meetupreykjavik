import { PortalShell } from "@/components/layout/portal-shell";

export async function VenueOnboardingScreen() {
  return (
    <PortalShell eyebrow="venue" title="Dashboard" description="" links={[]} roleMode="venue">
      <div className="p-8 text-zinc-400">Venue Onboarding — rebuilding...</div>
    </PortalShell>
  );
}
