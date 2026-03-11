import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import type { AccountType, Locale } from "@/types/domain";
import {
  mockAccounts,
  portalPathForRole,
  type MockAccount,
  type MockSession,
} from "@/lib/auth/mock-auth-config";

export const MOCK_SESSION_COOKIE = "meetupreykjavik-session";

function getMockSessionSecret() {
  const configuredSecret =
    process.env.MOCK_SESSION_SECRET ?? process.env.AUTH_SECRET;

  if (configuredSecret) {
    return configuredSecret;
  }

  if (process.env.NODE_ENV !== "production") {
    return "meetupreykjavik-local-mock-session-secret";
  }

  throw new Error(
    "MOCK_SESSION_SECRET or AUTH_SECRET must be configured while mock auth is enabled.",
  );
}

const mockSessionSecret = getMockSessionSecret();

function encodeSession(session: MockSession) {
  const payload = Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
  const signature = createHmac("sha256", mockSessionSecret).update(payload).digest("base64url");

  return `${payload}.${signature}`;
}

function decodeSession(value?: string) {
  if (!value) {
    return null;
  }

  try {
    const [payload, signature] = value.split(".");

    if (!payload || !signature) {
      return null;
    }

    const expectedSignature = createHmac("sha256", mockSessionSecret)
      .update(payload)
      .digest("base64url");

    const providedBytes = Buffer.from(signature);
    const expectedBytes = Buffer.from(expectedSignature);

    if (
      providedBytes.length !== expectedBytes.length ||
      !timingSafeEqual(providedBytes, expectedBytes)
    ) {
      return null;
    }

    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as MockSession;

    return parsed;
  } catch {
    return null;
  }
}

export function createMockSessionFromAccount(account: MockAccount): MockSession {
  return {
    id: account.id,
    email: account.email,
    displayName: account.displayName,
    slug: account.slug,
    accountType: account.accountType,
    locale: account.locale,
  };
}

export function findMockAccountByEmail(email: string) {
  return mockAccounts.find(
    (account) => account.email.toLowerCase() === email.toLowerCase(),
  );
}

export function createMockSignupSession(input: {
  displayName: string;
  email: string;
  locale: Locale;
  requestedAccountType: AccountType;
}) {
  return {
    id: `mock-${input.requestedAccountType}-${Date.now()}`,
    email: input.email,
    displayName: input.displayName,
    slug: input.displayName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, ""),
    accountType: input.requestedAccountType,
    locale: input.locale,
  } satisfies MockSession;
}

export function readMockSessionFromRequest(request: NextRequest) {
  return decodeSession(request.cookies.get(MOCK_SESSION_COOKIE)?.value);
}

export async function readServerMockSession() {
  const cookieStore = await cookies();
  return decodeSession(cookieStore.get(MOCK_SESSION_COOKIE)?.value);
}

export function withMockSessionCookie(
  response: NextResponse,
  session: MockSession,
) {
  response.cookies.set(MOCK_SESSION_COOKIE, encodeSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });

  return response;
}

export function clearMockSessionCookie(response: NextResponse) {
  response.cookies.set(MOCK_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}

export { portalPathForRole };
