import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createRsvp(
  eventId: string,
  userId: string,
  ticketTierId?: string,
) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Database unavailable");

  const { data, error } = await supabase
    .from("rsvps")
    .insert({
      event_id: eventId,
      user_id: userId,
      ticket_tier_id: ticketTierId ?? null,
      status: "going",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function cancelRsvp(eventId: string, userId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Database unavailable");

  const { data, error } = await supabase
    .from("rsvps")
    .update({ status: "cancelled" })
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getEventRsvps(eventId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("rsvps")
    .select(`
      *,
      profiles:user_id (*)
    `)
    .eq("event_id", eventId)
    .in("status", ["going", "waitlisted"]);

  if (error) {
    console.error("Failed to fetch event RSVPs:", error);
    return [];
  }

  return data ?? [];
}

export async function getUserRsvps(userId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("rsvps")
    .select(`
      *,
      events (
        title,
        slug,
        starts_at,
        venues (name)
      )
    `)
    .eq("user_id", userId)
    .eq("status", "going")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch user RSVPs:", error);
    return [];
  }

  return data ?? [];
}
