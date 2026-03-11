import type { ReactNode } from "react";
import { accountTypes } from "@/types/domain";
import { requireSession } from "@/lib/auth/guards";
import { PortalAccessBar } from "@/components/layout/portal-access-bar";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireSession([...accountTypes]);

  return (
    <>
      <PortalAccessBar session={session} />
      {children}
    </>
  );
}
