import { OrganizerEventWizard } from "@/components/forms/organizer-event-wizard";
import { requireSession } from "@/lib/auth/guards";

export default async function NewEventPage() {
  const session = await requireSession(["organizer"]);

  return <OrganizerEventWizard organizerName={session.displayName} />;
}
