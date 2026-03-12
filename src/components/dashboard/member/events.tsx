import { PortalShell } from "@/components/layout/portal-shell";

export async function MemberCalendarScreen() {
  return (
    <PortalShell eyebrow="member" title="Dashboard" description="" links={[]} roleMode="member">
      <div className="p-8 text-zinc-400">Member Events — rebuilding...</div>
    </PortalShell>
  );
}
