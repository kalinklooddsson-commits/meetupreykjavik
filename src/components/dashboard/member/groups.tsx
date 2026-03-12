import { PortalShell } from "@/components/layout/portal-shell";

export async function MemberGroupsScreen() {
  return (
    <PortalShell eyebrow="member" title="Dashboard" description="" links={[]} roleMode="member">
      <div className="p-8 text-zinc-400">Member Groups — rebuilding...</div>
    </PortalShell>
  );
}
