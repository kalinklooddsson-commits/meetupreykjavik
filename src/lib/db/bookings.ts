import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database, Json } from "@/types/database";

type BookingInsert = Database["public"]["Tables"]["venue_bookings"]["Insert"];

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
      profiles:organizer_id (*)
    `)
    .eq("venue_id", venueId)
    .order("requested_date", { ascending: true });

  if (error) {
    console.error("Failed to fetch venue bookings:", error);
    return [];
  }

  return data ?? [];
}

export async function updateBookingStatus(
  bookingId: string,
  status: string,
  counterOffer?: Json,
) {
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
