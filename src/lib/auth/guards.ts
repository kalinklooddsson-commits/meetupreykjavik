import { redirect } from "next/navigation";
import type { AccountType } from "@/types/domain";
import { getCurrentAppSession, portalPathForRole } from "@/lib/auth/session";

export async function getCurrentSession() {
  return getCurrentAppSession();
}

/**
 * Server-component helper that returns the current user session or `null`.
 *
 * Usage in a React Server Component:
 * ```tsx
 * import { getUser } from "@/lib/auth/guards";
 *
 * export default async function Page() {
 *   const user = await getUser();
 *   if (!user) return <p>Not signed in</p>;
 *   return <p>Hello {user.displayName}</p>;
 * }
 * ```
 */
export async function getUser() {
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
