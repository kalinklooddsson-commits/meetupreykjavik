import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import type { AccountType } from "@/types/domain";

/**
 * Edge middleware — runs before every matched request.
 *
 * Responsibilities:
 *  1. Attach security headers to every response
 *  2. Refresh Supabase auth tokens (when Supabase auth is enabled)
 *  3. Enforce role-based access to protected portal routes
 */

// ── Security headers ────────────────────────────────────────────────────────

const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.paypal.com https://www.sandbox.paypal.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com https://*.paypal.com https://*.openstreetmap.org https://tile.openstreetmap.org",
  "font-src 'self'",
  "connect-src 'self' https://*.supabase.co https://api.resend.com https://api.paypal.com https://api.sandbox.paypal.com",
  "frame-src https://www.paypal.com https://www.sandbox.paypal.com https://www.openstreetmap.org https://*.openstreetmap.org",
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

// ── Route protection rules ──────────────────────────────────────────────────

type RouteRule = {
  prefix: string;
  allowedRoles: AccountType[];
};

/** Routes that any authenticated user can access (no role restriction) */
const PUBLIC_AUTHENTICATED_ROUTES = ["/venue/onboarding"];

const PROTECTED_ROUTES: RouteRule[] = [
  { prefix: "/admin", allowedRoles: ["admin"] },
  { prefix: "/organizer", allowedRoles: ["organizer", "admin"] },
  { prefix: "/venue", allowedRoles: ["venue", "admin"] },
  { prefix: "/dashboard", allowedRoles: ["user", "organizer", "venue", "admin"] },
];

const MOCK_SESSION_COOKIE = "meetupreykjavik-session";

// ── Helpers ─────────────────────────────────────────────────────────────────

function readMockRole(request: NextRequest): AccountType | null {
  const cookie = request.cookies.get(MOCK_SESSION_COOKIE)?.value;
  if (!cookie) return null;

  const [payload] = cookie.split(".");
  if (!payload) return null;

  try {
    // atob works in Edge Runtime — decode the base64url payload to extract accountType
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return json.accountType ?? null;
  } catch {
    return null;
  }
}

function portalPathForRole(accountType: AccountType): string {
  switch (accountType) {
    case "admin":
      return "/admin";
    case "venue":
      return "/venue/dashboard";
    case "organizer":
      return "/organizer";
    case "user":
    default:
      return "/dashboard";
  }
}

function applySecurityHeaders(response: NextResponse) {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  response.headers.delete("X-Powered-By");
  return response;
}

function findRouteRule(pathname: string): RouteRule | undefined {
  return PROTECTED_ROUTES.find((rule) =>
    pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`),
  );
}

// ── Middleware ───────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const rule = findRouteRule(pathname);

  // No protection needed — just add security headers
  if (!rule) {
    return applySecurityHeaders(NextResponse.next());
  }

  const useSupabase =
    process.env.ENABLE_SUPABASE_AUTH === "true" &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let accountType: AccountType | null = null;
  let response = NextResponse.next({ request });

  if (useSupabase) {
    // Supabase auth — create middleware client to refresh tokens and get user
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => {
              request.cookies.set(name, value);
            });
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      },
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Not authenticated — redirect to login
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("redirect", pathname);
      return applySecurityHeaders(NextResponse.redirect(loginUrl));
    }

    // Get account type from user metadata (set during signup/login)
    accountType =
      (user.user_metadata?.account_type as AccountType) ??
      (user.user_metadata?.requestedAccountType as AccountType) ??
      null;

    // If we still don't have a role from metadata, allow through —
    // the page-level guard will do a proper DB lookup via requireSession()
    if (!accountType) {
      return applySecurityHeaders(response);
    }
  } else {
    // Mock auth — decode session cookie to extract role
    accountType = readMockRole(request);

    if (!accountType) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("redirect", pathname);
      return applySecurityHeaders(NextResponse.redirect(loginUrl));
    }
  }

  // Allow public authenticated routes (e.g. /venue/onboarding) for any logged-in user
  if (PUBLIC_AUTHENTICATED_ROUTES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return applySecurityHeaders(response);
  }

  // Check if the user's role is allowed for this route
  const isAllowed =
    accountType === "admin" || rule.allowedRoles.includes(accountType);

  if (!isAllowed) {
    // Redirect to the user's correct portal
    const correctPath = portalPathForRole(accountType);
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = correctPath;
    return applySecurityHeaders(NextResponse.redirect(redirectUrl));
  }

  return applySecurityHeaders(response);
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
