import { notFound } from "next/navigation";
import { OrganizerEventWizard } from "@/components/forms/organizer-event-wizard";
import { requireSession } from "@/lib/auth/guards";
import { getEventFormData, getManagedOrganizerEvent } from "@/lib/dashboard-fetchers";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await requireSession(["organizer"]);

  // Verify the event exists (works with both DB and mock data)
  const event = await getManagedOrganizerEvent(slug);
  if (!event) {
    notFound();
  }

  // Try to get detailed form data from DB; fall back to basic fields from the managed event
  const formData = await getEventFormData(slug);

  const initialData = formData ?? {
    title: event.title,
    description: event.notes ?? "",
  };

  return (
    <OrganizerEventWizard
      organizerName={session.displayName}
      mode="edit"
      initialData={initialData}
      eventSlug={slug}
    />
  );
}
