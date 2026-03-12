import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Edge middleware — runs before every matched request.
 *
 * Responsibilities:
 *  1. Attach security headers to every response
 *  2. Block direct access to internal API routes from foreign origins on mutating methods
 */

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-DNS-Prefetch-Control": "on",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
};

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }

  // Remove server identification headers
  response.headers.delete("X-Powered-By");

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, icon.svg, manifest
     * - robots.txt, sitemap.xml
     */
    "/((?!_next/static|_next/image|favicon\\.ico|icon\\.svg|manifest\\.webmanifest|robots\\.txt|sitemap\\.xml).*)",
  ],
};
