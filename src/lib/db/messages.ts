import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type MessageInsert = Database["public"]["Tables"]["messages"]["Insert"];

export async function getUserConversations(userId: string, limit = 50) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  // Two separate parameterized queries to avoid string interpolation in .or()
  const [sentResult, receivedResult] = await Promise.all([
    supabase
      .from("messages")
      .select(`*, profiles:sender_id (*)`)
      .eq("sender_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("messages")
      .select(`*, profiles:sender_id (*)`)
      .eq("receiver_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit),
  ]);

  if (sentResult.error) {
    console.error("Failed to fetch sent messages:", sentResult.error);
  }
  if (receivedResult.error) {
    console.error("Failed to fetch received messages:", receivedResult.error);
  }

  // Merge, deduplicate by id, sort by created_at descending, limit
  const all = [...(sentResult.data ?? []), ...(receivedResult.data ?? [])];
  const seen = new Set<string>();
  const unique = all.filter((msg) => {
    const id = (msg as { id: string }).id;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  unique.sort((a, b) => {
    const aDate = (a as { created_at: string }).created_at;
    const bDate = (b as { created_at: string }).created_at;
    return bDate.localeCompare(aDate);
  });

  return unique.slice(0, limit);
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
