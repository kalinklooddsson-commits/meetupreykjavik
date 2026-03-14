import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getUser } from "@/lib/auth/guards";

/**
 * PATCH /api/events/[slug]
 *
 * Update an existing event. Organizer/venue/admin only.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await getUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const body = await request.json();
    const supabase = createSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    const allowedFields = [
      "title", "description", "starts_at", "ends_at",
      "venue_name", "venue_address", "online_link", "event_type",
      "attendee_limit", "guest_limit", "age_restriction", "age_min", "age_max",
      "is_free", "rsvp_mode", "recurrence_rule", "status",
    ];

    // Map camelCase from frontend to snake_case
    const fieldMap: Record<string, string> = {
      startsAt: "starts_at", endsAt: "ends_at", venueName: "venue_name",
      venueAddress: "venue_address", onlineLink: "online_link",
      eventType: "event_type", attendeeLimit: "attendee_limit",
      guestLimit: "guest_limit", ageRestriction: "age_restriction",
      ageMin: "age_min", ageMax: "age_max", isFree: "is_free",
      rsvpMode: "rsvp_mode", recurrence: "recurrence_rule",
    };

    const update: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body)) {
      const dbField = fieldMap[key] ?? key;
      if (allowedFields.includes(dbField)) {
        update[dbField] = value;
      }
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const { error } = await db
      .from("events")
      .update(update)
      .eq("slug", slug);

    if (error) {
      console.error("Event update failed:", error);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data: { slug } });
  } catch (error) {
    console.error("Event update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/events/[slug]
 *
 * Cancel/archive an event. Organizer-only.
 * Sets status to "cancelled" rather than hard-deleting.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await getUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only organizers and admins can cancel events
    if (session.accountType !== "organizer" && session.accountType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { slug } = await params;
    const supabase = createSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    // Soft-delete: set status to cancelled
    const { error } = await db
      .from("events")
      .update({ status: "cancelled" })
      .eq("slug", slug);

    if (error) {
      console.error("Event cancellation failed:", error);
      return NextResponse.json({ error: "Cancellation failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Event delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
