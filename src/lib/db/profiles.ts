import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export async function getProfileById(id: string): Promise<Profile | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Failed to fetch profile by id:", error);
    return null;
  }

  return data;
}

export async function getProfileBySlug(
  slug: string,
): Promise<Profile | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Failed to fetch profile by slug:", error);
    return null;
  }

  return data;
}

export async function updateProfile(id: string, updates: ProfileUpdate) {
  // Use admin client — profiles may restrict updates via RLS
  const supabase = createSupabaseAdminClient() as Awaited<ReturnType<typeof createSupabaseServerClient>>;
  if (!supabase) throw new Error("Database unavailable");

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
