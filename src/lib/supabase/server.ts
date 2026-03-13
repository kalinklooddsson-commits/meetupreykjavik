import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { env, hasLiveSupabaseAuth, hasSupabaseEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "./admin";

export async function createSupabaseServerClient() {
  if (!hasSupabaseEnv()) {
    return null;
  }

  // When using mock auth (not Supabase auth), use the admin client
  // which bypasses RLS — there's no Supabase session in cookies.
  if (!hasLiveSupabaseAuth()) {
    return createSupabaseAdminClient();
  }

  const cookieStore = await cookies();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(items) {
          items.forEach(({ name, value, options }) => {
            try {
              cookieStore.set(name, value, options);
            } catch {
              // Server component renders cannot mutate cookies; auth refresh is
              // handled in route handlers where mutation is allowed.
            }
          });
        },
      },
    },
  );
}
