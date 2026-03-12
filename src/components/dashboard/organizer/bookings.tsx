import { PortalShell } from "@/components/layout/portal-shell";

export async function OrganizerBookingsScreen() {
  return (
    <PortalShell eyebrow="organizer" title="Dashboard" description="" links={[]} roleMode="organizer">
      <div className="p-8 text-zinc-400">Organizer Bookings — rebuilding...</div>
    </PortalShell>
  );
}

export async function OrganizerVenuesScreen() {
  return (
    <PortalShell eyebrow="organizer" title="Dashboard" description="" links={[]} roleMode="organizer">
      <div className="p-8 text-zinc-400">Organizer Venues — rebuilding...</div>
    </PortalShell>
  );
}
