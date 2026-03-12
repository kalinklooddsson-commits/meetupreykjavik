import { PortalShell } from "@/components/layout/portal-shell";

export async function AdminRevenueScreen() {
  return (
    <PortalShell eyebrow="admin" title="Dashboard" description="" links={[]} roleMode="admin">
      <div className="p-8 text-zinc-400">Admin Revenue — rebuilding...</div>
    </PortalShell>
  );
}

export async function AdminAnalyticsScreen() {
  return (
    <PortalShell eyebrow="admin" title="Dashboard" description="" links={[]} roleMode="admin">
      <div className="p-8 text-zinc-400">Admin Analytics — rebuilding...</div>
    </PortalShell>
  );
}
