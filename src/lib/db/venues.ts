import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type VenueInsert = Database["public"]["Tables"]["venues"]["Insert"];
type VenueUpdate = Database["public"]["Tables"]["venues"]["Update"];

interface GetVenuesOptions {
  type?: string;
  limit?: number;
}

export async function getVenues(options: GetVenuesOptions = {}) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { data: [], count: 0 };

  const { type, limit = 20 } = options;

  let query = supabase
    .from("venues")
    .select("*", { count: "exact" })
    .eq("status", "active")
    .order("avg_rating", { ascending: false })
    .limit(limit);

  if (type) {
    query = query.eq("type", type);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Failed to fetch venues:", error);
    return { data: [], count: 0 };
  }

  return { data: data ?? [], count: count ?? 0 };
}

export async function getVenueBySlug(slug: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("venues")
    .select(`
      *,
      venue_availability (*),
      venue_deals (*),
      venue_reviews (*),
      venue_bookings (*)
    `)
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Failed to fetch venue by slug:", error);
    return null;
  }

  return data;
}

export async function createVenue(venue: VenueInsert) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Database unavailable");

  const { data, error } = await supabase
    .from("venues")
    .insert(venue)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateVenue(slug: string, updates: VenueUpdate) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Database unavailable");

  const { data, error } = await supabase
    .from("venues")
    .update(updates)
    .eq("slug", slug)
    .select()
    .single();

  if (error) throw error;
  return data;
}
