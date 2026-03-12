import { PortalShell } from "@/components/layout/portal-shell";

export async function AdminAuditScreen() {
  return (
    <PortalShell eyebrow="admin" title="Dashboard" description="" links={[]} roleMode="admin">
      <div className="p-8 text-zinc-400">Admin Audit — rebuilding...</div>
    </PortalShell>
  );
}
