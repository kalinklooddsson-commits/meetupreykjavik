import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

import { routing } from "@/i18n/routing";

const MOCK_SESSION_COOKIE = "meetupreykjavik-session";

const PROTECTED_PREFIXES = ["/dashboard", "/organizer", "/venue", "/admin"];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function redirectToLogin(request: NextRequest, pathname: string) {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(loginUrl);
}

export default async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  const isDevelopment = process.env.NODE_ENV !== "production";
  const contentSecurityPolicy = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""} blob:`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https: ws: wss:",
    "frame-src https://www.paypal.com https://www.sandbox.paypal.com https://www.openstreetmap.org https://maps.google.com https://*.google.com",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  response.headers.set("Content-Security-Policy", contentSecurityPolicy);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  );
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );

  if (!cookieLocale) {
    response.cookies.set({
      name: "NEXT_LOCALE",
      value: routing.defaultLocale,
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: false,
      path: "/",
    });
  }

  // Skip auth processing for the callback route — it handles its own session
  if (pathname.startsWith("/auth/callback")) {
    return response;
  }

  // Supabase session refresh and route protection
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const useLiveAuth =
    supabaseUrl && supabaseAnonKey && process.env.ENABLE_SUPABASE_AUTH === "true";

  if (useLiveAuth) {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          }
        },
      },
    });

    // Refresh the session — this call reads/writes auth cookies
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (isProtectedRoute(pathname) && !user) {
      return redirectToLogin(request, pathname);
    }
  } else if (supabaseUrl && supabaseAnonKey) {
    // Supabase is configured but ENABLE_SUPABASE_AUTH is not "true" — still
    // refresh the session so tokens stay fresh, but fall back to mock-session
    // cookie for route protection.
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          }
        },
      },
    });

    // Still refresh the Supabase token even when using mock auth — this keeps
    // the token valid for any background Supabase data queries.
    await supabase.auth.getUser();

    if (isProtectedRoute(pathname)) {
      const hasMockSession = request.cookies.has(MOCK_SESSION_COOKIE);
      if (!hasMockSession) {
        return redirectToLogin(request, pathname);
      }
    }
  } else {
    // No Supabase env at all — mock-only mode
    if (isProtectedRoute(pathname)) {
      const hasMockSession = request.cookies.has(MOCK_SESSION_COOKIE);
      if (!hasMockSession) {
        return redirectToLogin(request, pathname);
      }
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
