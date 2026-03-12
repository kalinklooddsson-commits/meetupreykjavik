import { PortalShell } from "@/components/layout/portal-shell";

export async function OrganizerOverviewScreen() {
  return (
    <PortalShell eyebrow="organizer" title="Dashboard" description="" links={[]} roleMode="organizer">
      <div className="p-8 text-zinc-400">Organizer Overview — rebuilding...</div>
    </PortalShell>
  );
}
