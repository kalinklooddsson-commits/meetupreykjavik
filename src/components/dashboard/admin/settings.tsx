import { PortalShell } from "@/components/layout/portal-shell";

export async function AdminSettingsScreen() {
  return (
    <PortalShell eyebrow="admin" title="Dashboard" description="" links={[]} roleMode="admin">
      <div className="p-8 text-zinc-400">Admin Settings — rebuilding...</div>
    </PortalShell>
  );
}

export async function AdminContentScreen() {
  return (
    <PortalShell eyebrow="admin" title="Dashboard" description="" links={[]} roleMode="admin">
      <div className="p-8 text-zinc-400">Admin Content — rebuilding...</div>
    </PortalShell>
  );
}

export async function AdminModerationScreen() {
  return (
    <PortalShell eyebrow="admin" title="Dashboard" description="" links={[]} roleMode="admin">
      <div className="p-8 text-zinc-400">Admin Moderation — rebuilding...</div>
    </PortalShell>
  );
}

export async function AdminCommsScreen() {
  return (
    <PortalShell eyebrow="admin" title="Dashboard" description="" links={[]} roleMode="admin">
      <div className="p-8 text-zinc-400">Admin Comms — rebuilding...</div>
    </PortalShell>
  );
}
