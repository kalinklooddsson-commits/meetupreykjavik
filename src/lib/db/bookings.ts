import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database, Json } from "@/types/database";
import { bookingStatuses, type BookingStatus } from "@/types/domain";

type BookingInsert = Database["public"]["Tables"]["venue_bookings"]["Insert"];

const validStatuses = new Set<string>(bookingStatuses);

export async function createBooking(booking: BookingInsert) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Database unavailable");

  const { data, error } = await supabase
    .from("venue_bookings")
    .insert({ ...booking, status: "pending" })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getVenueBookings(venueId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("venue_bookings")
    .select(`
      *,
      profiles:organizer_id (*),
      events:event_id ( title, slug )
    `)
    .eq("venue_id", venueId)
    .order("requested_date", { ascending: true });

  if (error) {
    console.error("Failed to fetch venue bookings:", error);
    return [];
  }

  return data ?? [];
}

export async function getAllBookings() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("venue_bookings")
    .select(`
      *,
      organizer:organizer_id ( display_name ),
      venue:venue_id ( name ),
      events:event_id ( title, starts_at )
    `)
    .order("requested_date", { ascending: false });

  if (error) {
    console.error("Failed to fetch all bookings:", error);
    return [];
  }

  return data ?? [];
}

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
  counterOffer?: Json,
) {
  if (!validStatuses.has(status)) {
    throw new Error(`Invalid booking status: ${status}`);
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Database unavailable");

  const updates: Record<string, unknown> = { status };
  if (counterOffer !== undefined) {
    updates.counter_offer = counterOffer;
  }

  const { data, error } = await supabase
    .from("venue_bookings")
    .update(updates)
    .eq("id", bookingId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
