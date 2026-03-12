import { PortalShell } from "@/components/layout/portal-shell";

export async function AdminGroupsScreen() {
  return (
    <PortalShell eyebrow="admin" title="Dashboard" description="" links={[]} roleMode="admin">
      <div className="p-8 text-zinc-400">Admin Groups — rebuilding...</div>
    </PortalShell>
  );
}
