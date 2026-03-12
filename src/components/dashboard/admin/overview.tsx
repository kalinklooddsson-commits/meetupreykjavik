import { PortalShell } from "@/components/layout/portal-shell";

export async function AdminOverviewScreen() {
  return (
    <PortalShell eyebrow="admin" title="Dashboard" description="" links={[]} roleMode="admin">
      <div className="p-8 text-zinc-400">Admin Overview — rebuilding...</div>
    </PortalShell>
  );
}
