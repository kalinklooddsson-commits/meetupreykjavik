import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest } from "next/server";

function normalizedOrigin(value: string) {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

export function getAllowedOrigins(request: NextRequest) {
  const origins = new Set<string>();
  const host = request.headers.get("host");

  origins.add(request.nextUrl.origin);

  if (host) {
    origins.add(`${request.nextUrl.protocol}//${host}`);
  }

  for (const value of [process.env.APP_ORIGIN, process.env.NEXT_PUBLIC_APP_URL]) {
    if (!value) {
      continue;
    }

    const origin = normalizedOrigin(value);
    if (origin) {
      origins.add(origin);
    }
  }

  return origins;
}

export function hasTrustedOrigin(request: NextRequest) {
  const origin = normalizedOrigin(request.headers.get("origin") ?? "");

  if (!origin) {
    return false;
  }

  return Array.from(getAllowedOrigins(request)).some((allowedOrigin) =>
    requestOriginMatches(request, allowedOrigin) || allowedOrigin === origin,
  );
}

export function requestOriginMatches(request: NextRequest, expected: string) {
  const actual = request.headers.get("origin");

  if (!actual) {
    return false;
  }

  const actualDigest = createHash("sha256").update(actual).digest();
  const expectedDigest = createHash("sha256").update(expected).digest();

  return timingSafeEqual(actualDigest, expectedDigest);
}
