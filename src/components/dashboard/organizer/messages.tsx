import { PortalShell } from "@/components/layout/portal-shell";

export async function OrganizerMessagesScreen() {
  return (
    <PortalShell eyebrow="organizer" title="Dashboard" description="" links={[]} roleMode="organizer">
      <div className="p-8 text-zinc-400">Organizer Messages — rebuilding...</div>
    </PortalShell>
  );
}

export async function OrganizerNotificationsScreen() {
  return (
    <PortalShell eyebrow="organizer" title="Dashboard" description="" links={[]} roleMode="organizer">
      <div className="p-8 text-zinc-400">Organizer Notifications — rebuilding...</div>
    </PortalShell>
  );
}
