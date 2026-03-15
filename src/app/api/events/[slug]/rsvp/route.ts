import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getUser } from "@/lib/auth/guards";

/**
 * GET /api/events/[slug]/rsvp — Check current user's RSVP status
 * POST /api/events/[slug]/rsvp — Create RSVP
 * DELETE /api/events/[slug]/rsvp — Cancel RSVP
 *
 * Public endpoint for event RSVP management.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await getUser();
    if (!session) {
      return NextResponse.json({ status: "none" });
    }

    const { slug } = await params;
    const supabase = createSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({ status: "none" });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    const { data: event } = await db
      .from("events")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!event) {
      return NextResponse.json({ status: "none" });
    }

    const { data: rsvp } = await db
      .from("rsvps")
      .select("id, status")
      .eq("event_id", event.id)
      .eq("user_id", session.id)
      .maybeSingle();

    if (!rsvp || rsvp.status !== "going") {
      return NextResponse.json({ status: "none" });
    }

    return NextResponse.json({ status: "going" });
  } catch {
    return NextResponse.json({ status: "none" });
  }
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await getUser();
    if (!session) {
      return NextResponse.json({ error: "Login required" }, { status: 403 });
    }

    const { slug } = await params;
    const supabase = createSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    // Find event by slug — include attendee_limit and rsvp_count
    const { data: event } = await db
      .from("events")
      .select("id, title, attendee_limit, rsvp_count")
      .eq("slug", slug)
      .maybeSingle();

    if (!event) {
      // Graceful fallback: event exists in static/mock data but not in DB.
      // Return a local RSVP so the UI can update optimistically.
      return NextResponse.json(
        { ok: true, action: "created", id: `local-rsvp-${Date.now()}`, local: true },
        { status: 201 },
      );
    }

    // Check if already RSVPed
    const { data: existing } = await db
      .from("rsvps")
      .select("id, status")
      .eq("event_id", event.id)
      .eq("user_id", session.id)
      .maybeSingle();

    if (existing) {
      if (existing.status === "going") {
        // Already going — no-op
        return NextResponse.json({ ok: true, action: "already_going" });
      }
      // Re-activate cancelled RSVP — check capacity first
      if (event.attendee_limit && (event.rsvp_count ?? 0) >= event.attendee_limit) {
        return NextResponse.json(
          { error: "Event is full", waitlisted: true },
          { status: 409 },
        );
      }
      await db
        .from("rsvps")
        .update({ status: "going" })
        .eq("id", existing.id);
      // Increment rsvp_count
      await db
        .from("events")
        .update({ rsvp_count: (event.rsvp_count ?? 0) + 1 })
        .eq("id", event.id);
      return NextResponse.json({ ok: true, action: "confirmed" });
    }

    // Check attendee limit before creating new RSVP
    if (event.attendee_limit && (event.rsvp_count ?? 0) >= event.attendee_limit) {
      return NextResponse.json(
        { error: "Event is full", waitlisted: true },
        { status: 409 },
      );
    }

    // Create new RSVP
    const { error } = await db.from("rsvps").insert({
      event_id: event.id,
      user_id: session.id,
      status: "going",
    });

    if (error) {
      console.error("RSVP creation failed:", error);
      return NextResponse.json(
        { error: "Could not create RSVP. Please try again." },
        { status: 500 },
      );
    }

    // Increment rsvp_count
    await db
      .from("events")
      .update({ rsvp_count: (event.rsvp_count ?? 0) + 1 })
      .eq("id", event.id);

    return NextResponse.json({ ok: true, action: "created" });
  } catch (error) {
    console.error("RSVP error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await getUser();
    if (!session) {
      return NextResponse.json({ error: "Login required" }, { status: 403 });
    }

    const { slug } = await params;
    const supabase = createSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    // Find event by slug
    const { data: event } = await db
      .from("events")
      .select("id, rsvp_count")
      .eq("slug", slug)
      .maybeSingle();

    if (!event) {
      // Event only in static data — return success for UI update
      return NextResponse.json({ ok: true });
    }

    // Check current RSVP status before cancelling (to avoid double-decrement)
    const { data: existing } = await db
      .from("rsvps")
      .select("id, status")
      .eq("event_id", event.id)
      .eq("user_id", session.id)
      .maybeSingle();

    if (!existing || existing.status === "cancelled") {
      return NextResponse.json({ ok: true });
    }

    // Cancel RSVP
    const { error } = await db
      .from("rsvps")
      .update({ status: "cancelled" })
      .eq("id", existing.id);

    if (error) {
      console.error("RSVP cancellation failed:", error);
    } else {
      // Decrement rsvp_count (floor at 0)
      await db
        .from("events")
        .update({ rsvp_count: Math.max((event.rsvp_count ?? 1) - 1, 0) })
        .eq("id", event.id);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("RSVP cancel error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
