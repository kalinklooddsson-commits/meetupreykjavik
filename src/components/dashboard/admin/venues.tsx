import { PortalShell } from "@/components/layout/portal-shell";

export async function AdminVenuesScreen() {
  return (
    <PortalShell eyebrow="admin" title="Dashboard" description="" links={[]} roleMode="admin">
      <div className="p-8 text-zinc-400">Admin Venues — rebuilding...</div>
    </PortalShell>
  );
}
