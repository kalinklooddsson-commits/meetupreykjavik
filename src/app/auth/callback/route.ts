import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { getOrCreateSessionForSupabaseUser } from "@/lib/auth/session";
import { portalPathForRole } from "@/lib/auth/mock-auth-config";

/**
 * GET /auth/callback
 *
 * Handles the redirect from Supabase after:
 *  - Email confirmation (signup)
 *  - Magic link sign-in
 *  - OAuth provider sign-in
 *  - Password recovery link
 *
 * The `code` query parameter is exchanged for a session, then the user is
 * redirected to the appropriate destination.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? searchParams.get("redirect") ?? "/";
  const type = searchParams.get("type"); // e.g. "recovery", "signup", "magiclink"

  if (!code) {
    // No code present — redirect to login with an error hint
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set("error", "missing_code");
    return NextResponse.redirect(loginUrl);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Supabase not configured — fall back to login
    return NextResponse.redirect(new URL("/login", origin));
  }

  const response = NextResponse.redirect(new URL(next, origin));

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

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set("error", "callback_failed");
    return NextResponse.redirect(loginUrl);
  }

  // Ensure a profile row exists for this user
  const session = await getOrCreateSessionForSupabaseUser(data.user);

  // For recovery links, redirect to the reset-password page so the user can
  // set a new password while the session is active.
  if (type === "recovery") {
    const resetUrl = new URL("/reset-password", origin);
    return NextResponse.redirect(resetUrl);
  }

  // If we successfully resolved a profile, redirect to the requested page
  // or fall back to their portal dashboard
  if (session) {
    const destination = next && next !== "/" ? next : portalPathForRole(session.accountType);
    const redirectUrl = new URL(destination, origin);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
