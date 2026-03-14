import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { generateOccurrences } from "@/lib/events/recurrence";
import type { Database } from "@/types/database";

type Event = Database["public"]["Tables"]["events"]["Row"];
type EventInsert = Database["public"]["Tables"]["events"]["Insert"];
type EventUpdate = Database["public"]["Tables"]["events"]["Update"];

const EVENT_SELECT_WITH_JOINS = `
  *,
  venues (*),
  profiles:host_id (*),
  categories (*),
  groups:group_id ( id, slug, name )
` as const;

interface GetEventsOptions {
  category?: string;
  limit?: number;
  offset?: number;
  status?: string;
}

export async function getEvents(options: GetEventsOptions = {}) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { data: [] as Event[], count: 0 };

  const {
    category,
    limit = 20,
    offset = 0,
    status = "published",
  } = options;

  let query = supabase
    .from("events")
    .select(EVENT_SELECT_WITH_JOINS, { count: "exact" })
    .eq("status", status)
    .order("starts_at", { ascending: true })
    .range(offset, offset + limit - 1);

  if (category) {
    query = query.eq("categories.slug", category);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Failed to fetch events:", error);
    return { data: [], count: 0 };
  }

  return { data: data ?? [], count: count ?? 0 };
}

export async function getEventBySlug(slug: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("events")
    .select(`
      *,
      venues (*),
      profiles:host_id (*),
      categories (*),
      ticket_tiers (*)
    `)
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Failed to fetch event by slug:", error);
    return null;
  }

  return data;
}

export async function getFeaturedEvents(limit = 6) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("events")
    .select(EVENT_SELECT_WITH_JOINS)
    .eq("status", "published")
    .eq("is_featured", true)
    .order("starts_at", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch featured events:", error);
    return [];
  }

  return data ?? [];
}

export async function createEvent(event: EventInsert) {
  // Use admin client — events table may restrict inserts via RLS
  const supabase = createSupabaseAdminClient() as Awaited<ReturnType<typeof createSupabaseServerClient>>;
  if (!supabase) throw new Error("Database unavailable");

  const { data, error } = await supabase
    .from("events")
    .insert(event)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateEvent(slug: string, updates: EventUpdate) {
  // Use admin client — events table may restrict updates via RLS
  const supabase = createSupabaseAdminClient() as Awaited<ReturnType<typeof createSupabaseServerClient>>;
  if (!supabase) throw new Error("Database unavailable");

  const { data, error } = await supabase
    .from("events")
    .update(updates)
    .eq("slug", slug)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteEvent(slug: string) {
  // Use admin client — events table may restrict deletes via RLS
  const supabase = createSupabaseAdminClient() as Awaited<ReturnType<typeof createSupabaseServerClient>>;
  if (!supabase) throw new Error("Database unavailable");

  const { error } = await supabase.from("events").delete().eq("slug", slug);

  if (error) throw error;
}

// ─── Organizer Queries ───────────────────────────────────
export async function getEventsByHost(
  hostId: string,
  options: { status?: string; limit?: number } = {},
) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { status, limit = 50 } = options;

  let query = supabase
    .from("events")
    .select(EVENT_SELECT_WITH_JOINS)
    .eq("host_id", hostId)
    .order("starts_at", { ascending: false })
    .limit(limit);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch events by host:", error);
    return [];
  }

  return data ?? [];
}

// ─── Recurring Events ────────────────────────────────────
export async function createRecurringInstances(parentEventId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Database unavailable");

  const { data: parent, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", parentEventId)
    .single();

  if (error || !parent) throw new Error("Parent event not found");
  if (!parent.recurrence_rule)
    throw new Error("Event has no recurrence rule");

  const startsAt = new Date(parent.starts_at);
  const duration = parent.ends_at
    ? new Date(parent.ends_at).getTime() - startsAt.getTime()
    : 2 * 60 * 60 * 1000; // default 2h

  const recurrenceEnd = parent.recurrence_end
    ? new Date(parent.recurrence_end)
    : null;
  const occurrences = generateOccurrences(
    startsAt,
    duration,
    parent.recurrence_rule,
    recurrenceEnd,
  );

  // Check how many child events already exist
  const { count: existingCount } = await supabase
    .from("events")
    .select("id", { count: "exact", head: true })
    .eq("parent_event_id", parentEventId);

  const newOccurrences = occurrences.slice(existingCount ?? 0);
  if (newOccurrences.length === 0) return [];

  const inserts = newOccurrences.map((occ, i) => ({
    title: parent.title,
    slug: `${parent.slug}-${(existingCount ?? 0) + i + 1}`,
    description: parent.description,
    group_id: parent.group_id,
    host_id: parent.host_id,
    venue_id: parent.venue_id,
    category_id: parent.category_id,
    event_type: parent.event_type,
    status: "draft" as const,
    starts_at: occ.startsAt.toISOString(),
    ends_at: occ.endsAt.toISOString(),
    venue_name: parent.venue_name,
    venue_address: parent.venue_address,
    latitude: parent.latitude,
    longitude: parent.longitude,
    online_link: parent.online_link,
    featured_photo_url: parent.featured_photo_url,
    attendee_limit: parent.attendee_limit,
    guest_limit: parent.guest_limit,
    age_restriction: parent.age_restriction,
    is_free: parent.is_free,
    rsvp_mode: parent.rsvp_mode,
    parent_event_id: parentEventId,
  }));

  const { data: created, error: insertError } = await supabase
    .from("events")
    .insert(inserts)
    .select("id, slug, starts_at");

  if (insertError) throw insertError;
  return created ?? [];
}
