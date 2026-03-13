import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  resolveMemberTier,
  type MemberTier,
} from "@/lib/entitlements";

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
    .select("attendee_limit")
    .eq("id", eventId)
    .single();

  let status: "going" | "waitlisted" = "going";

  if (event?.attendee_limit) {
    const { count } = await supabase
      .from("rsvps")
      .select("id", { count: "exact", head: true })
      .eq("event_id", eventId)
      .eq("status", "going");

    if (count !== null && count >= event.attendee_limit) {
      status = "waitlisted";
    }
  }

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
    .in("status", ["going", "waitlisted"])
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("No active RSVP found to cancel.");

  // Auto-promote next person from waitlist
  await promoteFromWaitlist(eventId);

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

// ─── Priority Waitlist Promotion ─────────────────────────
const TIER_PRIORITY: Record<MemberTier, number> = {
  pro: 3,
  plus: 2,
  free: 1,
};

/**
 * Promotes the next waitlisted user for an event.
 * Premium members (Plus/Pro) get priority over free members.
 * Within the same tier, FIFO order is used.
 */
export async function promoteFromWaitlist(
  eventId: string,
): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data: waitlisted, error } = await supabase
    .from("rsvps")
    .select(
      `
      id,
      user_id,
      created_at,
      profiles:user_id ( premium_tier )
    `,
    )
    .eq("event_id", eventId)
    .eq("status", "waitlisted")
    .order("created_at", { ascending: true });

  if (error || !waitlisted?.length) return null;

  // Sort by tier priority (premium first), then by join time (FIFO)
  const sorted = [...waitlisted].sort((a, b) => {
    const aTier = resolveMemberTier(
      (a.profiles as unknown as { premium_tier: string | null })
        ?.premium_tier ?? null,
    );
    const bTier = resolveMemberTier(
      (b.profiles as unknown as { premium_tier: string | null })
        ?.premium_tier ?? null,
    );
    const priorityDiff = TIER_PRIORITY[bTier] - TIER_PRIORITY[aTier];
    if (priorityDiff !== 0) return priorityDiff;
    return (
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  });

  const promoted = sorted[0];

  const { error: updateError } = await supabase
    .from("rsvps")
    .update({ status: "going" })
    .eq("id", promoted.id);

  if (updateError) {
    console.error("Failed to promote from waitlist:", updateError);
    return null;
  }

  return promoted.user_id;
}
