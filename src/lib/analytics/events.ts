import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface EventAnalytics {
  eventId: string;
  rsvpCount: number;
  waitlistCount: number;
  attendanceCount: number;
  attendanceRate: number; // 0-100
  avgRating: number | null;
  ticketRevenue: number;
  commissionPaid: number;
}

export async function getEventAnalytics(
  eventId: string,
): Promise<EventAnalytics | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data: event } = await supabase
    .from("events")
    .select("id, rsvp_count, waitlist_count, attendance_count, avg_rating")
    .eq("id", eventId)
    .single();

  if (!event) return null;

  // Get ticket revenue from transactions
  const { data: transactions } = await supabase
    .from("transactions")
    .select("amount_isk, commission_amount")
    .eq("related_event_id", eventId)
    .eq("type", "ticket")
    .eq("status", "completed");

  const ticketRevenue = (transactions ?? []).reduce(
    (sum, t) => sum + Number(t.amount_isk ?? 0),
    0,
  );
  const commissionPaid = (transactions ?? []).reduce(
    (sum, t) => sum + Number(t.commission_amount ?? 0),
    0,
  );

  const attendanceRate =
    event.rsvp_count > 0
      ? Math.round((event.attendance_count / event.rsvp_count) * 100)
      : 0;

  return {
    eventId: event.id,
    rsvpCount: event.rsvp_count,
    waitlistCount: event.waitlist_count,
    attendanceCount: event.attendance_count,
    attendanceRate,
    avgRating: event.avg_rating ? Number(event.avg_rating) : null,
    ticketRevenue,
    commissionPaid,
  };
}

export async function getOrganizerAnalyticsSummary(hostId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data: events } = await supabase
    .from("events")
    .select(
      "id, rsvp_count, waitlist_count, attendance_count, avg_rating, status",
    )
    .eq("host_id", hostId);

  if (!events?.length) {
    return {
      totalEvents: 0,
      publishedEvents: 0,
      totalRsvps: 0,
      totalAttendees: 0,
      avgAttendanceRate: 0,
      avgRating: null as number | null,
      totalRevenue: 0,
      totalCommission: 0,
    };
  }

  const eventIds = events.map((e) => e.id);
  const { data: transactions } = await supabase
    .from("transactions")
    .select("amount_isk, commission_amount")
    .in("related_event_id", eventIds)
    .eq("type", "ticket")
    .eq("status", "completed");

  const totalRevenue = (transactions ?? []).reduce(
    (sum, t) => sum + Number(t.amount_isk ?? 0),
    0,
  );
  const totalCommission = (transactions ?? []).reduce(
    (sum, t) => sum + Number(t.commission_amount ?? 0),
    0,
  );

  const totalRsvps = events.reduce((s, e) => s + e.rsvp_count, 0);
  const totalAttendees = events.reduce((s, e) => s + e.attendance_count, 0);
  const ratingsWithValues = events.filter((e) => e.avg_rating != null);

  return {
    totalEvents: events.length,
    publishedEvents: events.filter((e) => e.status === "published").length,
    totalRsvps,
    totalAttendees,
    avgAttendanceRate:
      totalRsvps > 0
        ? Math.round((totalAttendees / totalRsvps) * 100)
        : 0,
    avgRating:
      ratingsWithValues.length > 0
        ? Number(
            (
              ratingsWithValues.reduce(
                (s, e) => s + Number(e.avg_rating),
                0,
              ) / ratingsWithValues.length
            ).toFixed(1),
          )
        : null,
    totalRevenue,
    totalCommission,
  };
}
