import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createRsvp(
  eventId: string,
  userId: string,
  ticketTierId?: string,
) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Database unavailable");

  // Check for existing active RSVP (prevent duplicates)
  const { data: existing } = await supabase
    .from("rsvps")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .in("status", ["going", "waitlisted"])
    .maybeSingle();

  if (existing) {
    throw new Error("You already have an active RSVP for this event.");
  }

  // Check event capacity before allowing RSVP
  const { data: event } = await supabase
    .from("events")
    .select("capacity")
    .eq("id", eventId)
    .single();

  if (event?.capacity) {
    const { count } = await supabase
      .from("rsvps")
      .select("id", { count: "exact", head: true })
      .eq("event_id", eventId)
      .eq("status", "going");

    if (count !== null && count >= event.capacity) {
      throw new Error("This event is full. You have been added to the waitlist.");
    }
  }

  const status =
    event?.capacity &&
    (await supabase
      .from("rsvps")
      .select("id", { count: "exact", head: true })
      .eq("event_id", eventId)
      .eq("status", "going")
      .then(({ count: c }) => c !== null && c >= event.capacity))
      ? "waitlisted"
      : "going";

  const { data, error } = await supabase
    .from("rsvps")
    .insert({
      event_id: eventId,
      user_id: userId,
      ticket_tier_id: ticketTierId ?? null,
      status,
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
    .eq("status", "going")
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("No active RSVP found to cancel.");
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
