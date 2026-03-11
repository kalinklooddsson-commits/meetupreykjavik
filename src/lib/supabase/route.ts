import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";

import { env, hasSupabaseEnv } from "@/lib/env";
import type { Database } from "@/types/database";

type CookieMutation = {
  name: string;
  value: string;
  options?: CookieOptions;
};

export function createSupabaseRouteClient(request: NextRequest) {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const cookieMutations: CookieMutation[] = [];

  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach((cookie) => {
            cookieMutations.push(cookie);

            try {
              request.cookies.set(cookie.name, cookie.value);
            } catch {
              // Request cookies are not always mutable in every runtime.
            }
          });
        },
      },
    },
  );

  return {
    supabase,
    applyCookies<T extends NextResponse>(response: T) {
      const latestMutations = new Map<string, CookieMutation>();

      cookieMutations.forEach((cookie) => {
        latestMutations.set(cookie.name, cookie);
      });

      latestMutations.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options);
      });

      return response;
    },
  };
}
