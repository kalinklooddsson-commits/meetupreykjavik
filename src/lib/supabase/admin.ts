import {
  createClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

import { env, hasSupabaseEnv } from "@/lib/env";
import type { Database } from "@/types/database";

export function createSupabaseAdminClient(): SupabaseClient<Database> | null {
  if (!hasSupabaseEnv() || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
