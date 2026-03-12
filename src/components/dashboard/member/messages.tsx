import { PortalShell } from "@/components/layout/portal-shell";

export async function MemberMessagesScreen() {
  return (
    <PortalShell eyebrow="member" title="Dashboard" description="" links={[]} roleMode="member">
      <div className="p-8 text-zinc-400">Member Messages — rebuilding...</div>
    </PortalShell>
  );
}
