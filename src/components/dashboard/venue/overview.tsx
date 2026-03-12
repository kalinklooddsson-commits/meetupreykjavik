import { PortalShell } from "@/components/layout/portal-shell";

export async function VenueDashboardScreen() {
  return (
    <PortalShell eyebrow="venue" title="Dashboard" description="" links={[]} roleMode="venue">
      <div className="p-8 text-zinc-400">Venue Overview — rebuilding...</div>
    </PortalShell>
  );
}

export async function VenueMessagesScreen() {
  return (
    <PortalShell eyebrow="venue" title="Dashboard" description="" links={[]} roleMode="venue">
      <div className="p-8 text-zinc-400">Venue Messages — rebuilding...</div>
    </PortalShell>
  );
}

export async function VenueNotificationsScreen() {
  return (
    <PortalShell eyebrow="venue" title="Dashboard" description="" links={[]} roleMode="venue">
      <div className="p-8 text-zinc-400">Venue Notifications — rebuilding...</div>
    </PortalShell>
  );
}

export async function VenueAnalyticsScreen() {
  return (
    <PortalShell eyebrow="venue" title="Dashboard" description="" links={[]} roleMode="venue">
      <div className="p-8 text-zinc-400">Venue Analytics — rebuilding...</div>
    </PortalShell>
  );
}
