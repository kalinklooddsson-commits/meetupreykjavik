import { PortalShell } from "@/components/layout/portal-shell";

export async function VenueAvailabilityScreen() {
  return (
    <PortalShell eyebrow="venue" title="Dashboard" description="" links={[]} roleMode="venue">
      <div className="p-8 text-zinc-400">Venue Availability — rebuilding...</div>
    </PortalShell>
  );
}
