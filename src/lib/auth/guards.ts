import { redirect } from "next/navigation";
import type { AccountType } from "@/types/domain";
import { getCurrentAppSession, portalPathForRole } from "@/lib/auth/session";

export async function getCurrentSession() {
  return getCurrentAppSession();
}

export async function redirectIfAuthenticated() {
  const session = await getCurrentSession();

  if (session) {
    redirect(portalPathForRole(session.accountType));
  }
}

export async function requireSession(allowedRoles?: AccountType[]) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (
    allowedRoles &&
    session.accountType !== "admin" &&
    !allowedRoles.includes(session.accountType)
  ) {
    redirect(portalPathForRole(session.accountType));
  }

  return session;
}
