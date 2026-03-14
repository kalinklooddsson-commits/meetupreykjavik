import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

type MessageInsert = Database["public"]["Tables"]["messages"]["Insert"];

export async function getUserConversations(userId: string, limit = 50) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  // Two separate parameterized queries to avoid string interpolation in .or()
  // Join both sender and receiver profiles so we can determine the "other" party
  const [sentResult, receivedResult] = await Promise.all([
    supabase
      .from("messages")
      .select(`*, sender:sender_id ( display_name ), receiver:receiver_id ( display_name )`)
      .eq("sender_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("messages")
      .select(`*, sender:sender_id ( display_name ), receiver:receiver_id ( display_name )`)
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

  // Annotate each message with `other_display_name` based on who the viewer is
  const annotated = unique.slice(0, limit).map((msg) => {
    const m = msg as Record<string, unknown>;
    const sender = m.sender as { display_name: string } | null;
    const receiver = m.receiver as { display_name: string } | null;
    const isSender = (m.sender_id as string) === userId;
    // If the viewer sent the message, the "other" party is the receiver; otherwise it's the sender
    const otherName = isSender ? receiver?.display_name : sender?.display_name;
    return { ...m, other_display_name: otherName ?? null };
  });

  return annotated;
}

export async function sendMessage(message: MessageInsert) {
  // Use admin client — messages table may restrict inserts via RLS
  const supabase = createSupabaseAdminClient() as Awaited<ReturnType<typeof createSupabaseServerClient>>;
  if (!supabase) throw new Error("Database unavailable");

  const { data, error } = await supabase
    .from("messages")
    .insert(message)
    .select()
    .single();

  if (error) throw error;
  return data;
}
