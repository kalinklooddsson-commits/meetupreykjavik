import { OrganizerGroupForm } from "@/components/forms/organizer-group-form";
import { requireSession } from "@/lib/auth/guards";

export default async function NewGroupPage() {
  const session = await requireSession(["organizer"]);

  return <OrganizerGroupForm organizerName={session.displayName} />;
}
