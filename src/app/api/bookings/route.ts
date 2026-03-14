import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getUser } from "@/lib/auth/guards";

/**
 * POST /api/bookings
 *
 * Create a new booking request from an organizer to a venue.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      venueSlug,
      requestedDate,
      requestedStart,
      requestedEnd,
      expectedAttendance,
      eventTitle,
      message,
    } = body as {
      venueSlug: string;
      requestedDate: string;
      requestedStart?: string;
      requestedEnd?: string;
      expectedAttendance?: number;
      eventTitle?: string;
      message?: string;
    };

    if (!venueSlug || !requestedDate) {
      return NextResponse.json(
        { error: "Missing venue or date" },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    // Find venue by slug — venue_id is NOT NULL in DB
    const { data: venue } = await db
      .from("venues")
      .select("id")
      .eq("slug", venueSlug)
      .maybeSingle();

    if (!venue) {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 });
    }

    const { error } = await db.from("venue_bookings").insert({
      organizer_id: session.id,
      venue_id: venue.id,
      requested_date: requestedDate,
      requested_start: requestedStart ?? "18:00",
      requested_end: requestedEnd ?? "22:00",
      expected_attendance: expectedAttendance ?? null,
      event_description: eventTitle ?? null,
      message: message ?? null,
      status: "pending",
    });

    if (error) {
      console.error("Create booking failed:", error);
      return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Create booking error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
