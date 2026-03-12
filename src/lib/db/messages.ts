import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type MessageInsert = Database["public"]["Tables"]["messages"]["Insert"];

export async function getUserConversations(userId: string, limit = 50) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("messages")
    .select(`
      *,
      profiles:sender_id (*)
    `)
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch user conversations:", error);
    return [];
  }

  return data ?? [];
}

export async function sendMessage(message: MessageInsert) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Database unavailable");

  const { data, error } = await supabase
    .from("messages")
    .insert(message)
    .select()
    .single();

  if (error) throw error;
  return data;
}
