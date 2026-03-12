import { PortalShell } from "@/components/layout/portal-shell";

export async function AdminUsersScreen() {
  return (
    <PortalShell eyebrow="admin" title="Dashboard" description="" links={[]} roleMode="admin">
      <div className="p-8 text-zinc-400">Admin Users — rebuilding...</div>
    </PortalShell>
  );
}
