import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface RevenueReportRow {
  eventSlug: string;
  eventTitle: string;
  date: string;
  ticketsSold: number;
  grossRevenue: number;
  commission: number;
  netRevenue: number;
}

export async function getOrganizerRevenueReport(
  hostId: string,
  from?: string,
  to?: string,
): Promise<RevenueReportRow[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data: events } = await supabase
    .from("events")
    .select("id, slug, title, starts_at")
    .eq("host_id", hostId)
    .order("starts_at", { ascending: false });

  if (!events?.length) return [];

  const eventIds = events.map((e) => e.id);

  let txQuery = supabase
    .from("transactions")
    .select("related_event_id, amount_isk, commission_amount")
    .in("related_event_id", eventIds)
    .eq("type", "ticket")
    .eq("status", "completed");

  if (from) txQuery = txQuery.gte("created_at", from);
  if (to) txQuery = txQuery.lte("created_at", to);

  const { data: transactions } = await txQuery;

  // Group by event
  const eventMap = new Map(events.map((e) => [e.id, e]));
  const revenueMap = new Map<
    string,
    { gross: number; commission: number; count: number }
  >();

  for (const tx of transactions ?? []) {
    const eventId = tx.related_event_id;
    if (!eventId) continue;
    const existing = revenueMap.get(eventId) ?? {
      gross: 0,
      commission: 0,
      count: 0,
    };
    existing.gross += Number(tx.amount_isk ?? 0);
    existing.commission += Number(tx.commission_amount ?? 0);
    existing.count += 1;
    revenueMap.set(eventId, existing);
  }

  return events
    .filter((e) => revenueMap.has(e.id))
    .map((e) => {
      const rev = revenueMap.get(e.id)!;
      return {
        eventSlug: e.slug,
        eventTitle: e.title,
        date: e.starts_at,
        ticketsSold: rev.count,
        grossRevenue: rev.gross,
        commission: rev.commission,
        netRevenue: rev.gross - rev.commission,
      };
    });
}

export interface AudienceReportRow {
  eventSlug: string;
  eventTitle: string;
  date: string;
  rsvpCount: number;
  attendanceCount: number;
  attendanceRate: number;
  waitlistCount: number;
  avgRating: number | null;
}

export async function getOrganizerAudienceReport(
  hostId: string,
): Promise<AudienceReportRow[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data: events } = await supabase
    .from("events")
    .select(
      "slug, title, starts_at, rsvp_count, attendance_count, waitlist_count, avg_rating",
    )
    .eq("host_id", hostId)
    .in("status", ["published", "completed"])
    .order("starts_at", { ascending: false });

  return (events ?? []).map((e) => ({
    eventSlug: e.slug,
    eventTitle: e.title,
    date: e.starts_at,
    rsvpCount: e.rsvp_count,
    attendanceCount: e.attendance_count,
    attendanceRate:
      e.rsvp_count > 0
        ? Math.round((e.attendance_count / e.rsvp_count) * 100)
        : 0,
    waitlistCount: e.waitlist_count,
    avgRating: e.avg_rating ? Number(e.avg_rating) : null,
  }));
}
