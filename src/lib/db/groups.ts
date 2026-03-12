import { createSupabaseServerClient } from "@/lib/supabase/server";
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
    .single();

  if (error) {
    console.error("Failed to fetch group by slug:", error);
    return null;
  }

  return data;
}

export async function createGroup(group: GroupInsert) {
  const supabase = await createSupabaseServerClient();
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
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Database unavailable");

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
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Database unavailable");

  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", userId);

  if (error) throw error;
}
