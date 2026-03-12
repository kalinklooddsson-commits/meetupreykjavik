import { PortalShell } from "@/components/layout/portal-shell";

export async function OrganizerGroupsScreen() {
  return (
    <PortalShell eyebrow="organizer" title="Dashboard" description="" links={[]} roleMode="organizer">
      <div className="p-8 text-zinc-400">Organizer Groups — rebuilding...</div>
    </PortalShell>
  );
}
