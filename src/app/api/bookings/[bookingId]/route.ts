import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getUser } from "@/lib/auth/guards";
import { hasTrustedOrigin } from "@/lib/security/request";

/**
 * PATCH /api/bookings/[bookingId]
 *
 * Update a booking request (accept, decline, counter).
 * Used by venue owners to respond to booking requests.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  if (!hasTrustedOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const session = await getUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId } = await params;
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid or missing JSON body" }, { status: 400 });
    }
    const { status, counterOffer, venueResponse } = body as {
      status: string;
      counterOffer?: Record<string, unknown> | string;
      venueResponse?: string;
    };

    if (!status) {
      return NextResponse.json({ error: "Missing status" }, { status: 400 });
    }

    // Validate status against allowed booking statuses
    // DB CHECK allows: pending, accepted, declined, counter_offered, cancelled, completed
    const statusAliases: Record<string, string> = { countered: "counter_offered" };
    const normalizedStatus = statusAliases[status.toLowerCase()] ?? status.toLowerCase();
    const validStatuses = new Set(["pending", "accepted", "declined", "counter_offered", "cancelled", "completed"]);
    if (!validStatuses.has(normalizedStatus)) {
      return NextResponse.json({ error: `Invalid booking status: ${status}` }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    // Verify the user has permission (venue owner or admin)
    const { data: booking } = await db
      .from("venue_bookings")
      .select("id, venue_id, organizer_id")
      .eq("id", bookingId)
      .maybeSingle();

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Check authorization: must be the organizer, venue owner, or admin
    if (session.accountType !== "admin") {
      const isOrganizer = booking.organizer_id === session.id;
      let isVenueOwner = false;
      if (booking.venue_id) {
        const { data: venue } = await db
          .from("venues")
          .select("owner_id")
          .eq("id", booking.venue_id)
          .maybeSingle();
        isVenueOwner = venue?.owner_id === session.id;
      }
      if (!isOrganizer && !isVenueOwner) {
        return NextResponse.json({ error: "Not authorized to update this booking" }, { status: 403 });
      }
    }

    const update: Record<string, unknown> = {
      status: normalizedStatus,
      updated_at: new Date().toISOString(),
    };

    if (counterOffer) {
      // counter_offer is jsonb in DB — wrap string in object if needed
      update.counter_offer =
        typeof counterOffer === "string" ? { note: counterOffer } : counterOffer;
    }

    if (venueResponse) {
      update.venue_response = venueResponse;
    }

    const { error } = await db
      .from("venue_bookings")
      .update(update)
      .eq("id", booking.id);

    if (error) {
      console.error("Booking update failed:", error);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, status: normalizedStatus });
  } catch (error) {
    console.error("Booking update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
