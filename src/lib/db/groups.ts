import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

type GroupInsert = Database["public"]["Tables"]["groups"]["Insert"];

interface GetGroupsOptions {
  category?: string;
  limit?: number;
}

export async function getGroups(options: GetGroupsOptions = {}) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { category, limit = 20 } = options;

  let query = supabase
    .from("groups")
    .select(`
      *,
      profiles:organizer_id (*),
      categories (*)
    `)
    .eq("status", "active")
    .order("member_count", { ascending: false })
    .limit(limit);

  if (category) {
    query = query.eq("categories.slug", category);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch groups:", error);
    return [];
  }

  return data ?? [];
}

export async function getGroupBySlug(slug: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("groups")
    .select(`
      *,
      profiles:organizer_id (*),
      categories (*),
      group_members (*)
    `)
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (error) {
    // PGRST116 = no rows found → return null to trigger mock fallback
    if (error.code !== "PGRST116") {
      console.error("Failed to fetch group by slug:", error);
    }
    return null;
  }

  return data;
}

export async function createGroup(group: GroupInsert) {
  // Use admin client — groups table may restrict inserts via RLS
  const supabase = createSupabaseAdminClient() as Awaited<ReturnType<typeof createSupabaseServerClient>>;
  if (!supabase) throw new Error("Database unavailable");

  const { data, error } = await supabase
    .from("groups")
    .insert(group)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function joinGroup(groupId: string, userId: string) {
  // Use admin client — group_members table may restrict inserts via RLS
  const supabase = createSupabaseAdminClient() as Awaited<ReturnType<typeof createSupabaseServerClient>>;
  if (!supabase) throw new Error("Database unavailable");

  // Check for existing membership
  const { data: existing } = await supabase
    .from("group_members")
    .select("id")
    .eq("group_id", groupId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    throw new Error("You are already a member of this group.");
  }

  const { data, error } = await supabase
    .from("group_members")
    .insert({
      group_id: groupId,
      user_id: userId,
      role: "member",
      status: "active",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function leaveGroup(groupId: string, userId: string) {
  // Use admin client — group_members table may restrict deletes via RLS
  const supabase = createSupabaseAdminClient() as Awaited<ReturnType<typeof createSupabaseServerClient>>;
  if (!supabase) throw new Error("Database unavailable");

  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", userId);

  if (error) throw error;
}
