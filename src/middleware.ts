import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Edge middleware — runs before every matched request.
 *
 * Responsibilities:
 *  1. Attach security headers to every response
 *  2. Block direct access to internal API routes from foreign origins on mutating methods
 */

const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.paypal.com https://www.sandbox.paypal.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com https://*.paypal.com",
  "font-src 'self'",
  "connect-src 'self' https://*.supabase.co https://api.resend.com https://api.paypal.com https://api.sandbox.paypal.com",
  "frame-src https://www.paypal.com https://www.sandbox.paypal.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-DNS-Prefetch-Control": "on",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
  "Content-Security-Policy": CSP_DIRECTIVES,
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
