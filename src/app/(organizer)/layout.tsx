import type { ReactNode } from "react";
import { requireSession } from "@/lib/auth/guards";
import { PortalAccessBar } from "@/components/layout/portal-access-bar";

export default async function OrganizerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireSession(["organizer"]);

  return (
    <>
      <PortalAccessBar session={session} />
      {children}
    </>
  );
}
