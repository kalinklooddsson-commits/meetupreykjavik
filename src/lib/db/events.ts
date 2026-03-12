import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type Event = Database["public"]["Tables"]["events"]["Row"];
type EventInsert = Database["public"]["Tables"]["events"]["Insert"];
type EventUpdate = Database["public"]["Tables"]["events"]["Update"];

const EVENT_SELECT_WITH_JOINS = `
  *,
  venues (*),
  profiles:host_id (*),
  categories (*)
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
  const supabase = await createSupabaseServerClient();
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
  const supabase = await createSupabaseServerClient();
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
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Database unavailable");

  const { error } = await supabase.from("events").delete().eq("slug", slug);

  if (error) throw error;
}
