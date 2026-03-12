import { PortalShell } from "@/components/layout/portal-shell";

export async function OrganizerEventDetailScreen({ slug }: { slug: string }) {
  return (
    <PortalShell eyebrow="organizer" title="Dashboard" description="" links={[]} roleMode="organizer">
      <div className="p-8 text-zinc-400">Event Detail: {slug} — rebuilding...</div>
    </PortalShell>
  );
}
