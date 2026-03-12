import { notFound } from "next/navigation";
import { OrganizerEventDetailScreen } from "@/components/dashboard/organizer/event-detail";
import { getManagedOrganizerEvent } from "@/lib/dashboard-fetchers";

export default async function OrganizerEventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!getManagedOrganizerEvent(slug)) {
    notFound();
  }

  return <OrganizerEventDetailScreen slug={slug} />;
}
