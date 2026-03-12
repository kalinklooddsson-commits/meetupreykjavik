import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface VenueAnalytics {
  venueId: string;
  totalBookings: number;
  acceptedBookings: number;
  declinedBookings: number;
  acceptRate: number;
  totalEventsHosted: number;
  avgEventRating: number | null;
  totalReviews: number;
  avgVenueRating: number | null;
  revenueFromBookings: number;
}

export async function getVenueAnalytics(
  venueId: string,
): Promise<VenueAnalytics | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  // Bookings breakdown
  const { data: bookings } = await supabase
    .from("venue_bookings")
    .select("status")
    .eq("venue_id", venueId);

  const totalBookings = bookings?.length ?? 0;
  const acceptedBookings =
    bookings?.filter(
      (b) => b.status === "accepted" || b.status === "completed",
    ).length ?? 0;
  const declinedBookings =
    bookings?.filter((b) => b.status === "declined").length ?? 0;
  const acceptRate =
    totalBookings > 0
      ? Math.round((acceptedBookings / totalBookings) * 100)
      : 0;

  // Events hosted at this venue
  const { data: events } = await supabase
    .from("events")
    .select("id, avg_rating")
    .eq("venue_id", venueId)
    .in("status", ["published", "completed"]);

  const totalEventsHosted = events?.length ?? 0;
  const ratedEvents = events?.filter((e) => e.avg_rating != null) ?? [];
  const avgEventRating =
    ratedEvents.length > 0
      ? Number(
          (
            ratedEvents.reduce((s, e) => s + Number(e.avg_rating), 0) /
            ratedEvents.length
          ).toFixed(1),
        )
      : null;

  // Venue reviews
  const { data: reviews } = await supabase
    .from("venue_reviews")
    .select("rating")
    .eq("venue_id", venueId);

  const totalReviews = reviews?.length ?? 0;
  const avgVenueRating =
    totalReviews > 0
      ? Number(
          (
            reviews!.reduce((s, r) => s + r.rating, 0) / totalReviews
          ).toFixed(1),
        )
      : null;

  // Revenue from venue partnership transactions
  const { data: transactions } = await supabase
    .from("transactions")
    .select("amount_isk")
    .eq("related_venue_id", venueId)
    .eq("status", "completed");

  const revenueFromBookings = (transactions ?? []).reduce(
    (sum, t) => sum + Number(t.amount_isk ?? 0),
    0,
  );

  return {
    venueId,
    totalBookings,
    acceptedBookings,
    declinedBookings,
    acceptRate,
    totalEventsHosted,
    avgEventRating,
    totalReviews,
    avgVenueRating,
    revenueFromBookings,
  };
}

/** Organizer-fit insights: which organizers have worked with this venue */
export async function getOrganizerFitInsights(venueId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data: pastBookings } = await supabase
    .from("venue_bookings")
    .select(
      `
      organizer_id,
      status,
      events:event_id (
        avg_rating,
        rsvp_count,
        attendance_count
      ),
      profiles:organizer_id (
        display_name,
        slug,
        avatar_url
      )
    `,
    )
    .eq("venue_id", venueId)
    .in("status", ["accepted", "completed"])
    .limit(20);

  return (pastBookings ?? []).map((booking) => {
    const event = booking.events as unknown as {
      avg_rating: number | null;
      rsvp_count: number;
      attendance_count: number;
    } | null;
    const profile = booking.profiles as unknown as {
      display_name: string;
      slug: string;
      avatar_url: string | null;
    } | null;
    return {
      organizerId: booking.organizer_id,
      name: profile?.display_name ?? "Unknown",
      slug: profile?.slug ?? "",
      avatarUrl: profile?.avatar_url ?? null,
      avgRating: event?.avg_rating ? Number(event.avg_rating) : null,
      attendanceRate:
        event && event.rsvp_count > 0
          ? Math.round(
              (event.attendance_count / event.rsvp_count) * 100,
            )
          : 0,
      bookingStatus: booking.status,
    };
  });
}
