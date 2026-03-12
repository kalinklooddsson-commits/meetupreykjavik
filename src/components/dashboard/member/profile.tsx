import { PortalShell } from "@/components/layout/portal-shell";

export async function MemberProfileScreen({ slug }: { slug?: string }) {
  return (
    <PortalShell eyebrow="member" title="Dashboard" description="" links={[]} roleMode="member">
      <div className="p-8 text-zinc-400">Member Profile — rebuilding...</div>
    </PortalShell>
  );
}

export async function MemberSettingsScreen() {
  return (
    <PortalShell eyebrow="member" title="Dashboard" description="" links={[]} roleMode="member">
      <div className="p-8 text-zinc-400">Member Settings — rebuilding...</div>
    </PortalShell>
  );
}

export async function MemberNotificationsScreen() {
  return (
    <PortalShell eyebrow="member" title="Dashboard" description="" links={[]} roleMode="member">
      <div className="p-8 text-zinc-400">Member Notifications — rebuilding...</div>
    </PortalShell>
  );
}
