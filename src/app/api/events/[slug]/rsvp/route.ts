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
      return NextResponse.json({ error: "Login required" }, { status: 401 });
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
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 },
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
      // Re-activate cancelled RSVP — atomic capacity check
      if (event.attendee_limit) {
        const { count } = await db
          .from("rsvps")
          .select("id", { count: "exact", head: true })
          .eq("event_id", event.id)
          .eq("status", "going");
        if (count !== null && count >= event.attendee_limit) {
          return NextResponse.json(
            { error: "Event is full", waitlisted: true },
            { status: 409 },
          );
        }
      }
      await db
        .from("rsvps")
        .update({ status: "going" })
        .eq("id", existing.id);
      // Best-effort counter update — never block the RSVP response
      try {
        await db.rpc("increment_counter", { row_id: event.id, table_name: "events", column_name: "rsvp_count", amount: 1 }).catch(() =>
          db.from("events").update({ rsvp_count: (event.rsvp_count ?? 0) + 1 }).eq("id", event.id)
        );
      } catch { /* counter update is non-critical */ }
      return NextResponse.json({ ok: true, action: "confirmed" });
    }

    // Atomic capacity check: count actual "going" RSVPs in the DB
    // rather than trusting the cached rsvp_count column (prevents race conditions)
    if (event.attendee_limit) {
      const { count } = await db
        .from("rsvps")
        .select("id", { count: "exact", head: true })
        .eq("event_id", event.id)
        .eq("status", "going");
      if (count !== null && count >= event.attendee_limit) {
        return NextResponse.json(
          { error: "Event is full", waitlisted: true },
          { status: 409 },
        );
      }
    }

    // Create new RSVP
    const { error } = await db.from("rsvps").insert({
      event_id: event.id,
      user_id: session.id,
      status: "going",
    });

    if (error) {
      // Unique constraint violation = duplicate RSVP (concurrent race)
      if (error.code === "23505") {
        return NextResponse.json({ ok: true, action: "already_going" });
      }
      console.error("RSVP creation failed:", error);
      return NextResponse.json(
        { error: "Could not create RSVP. Please try again." },
        { status: 500 },
      );
    }

    // Best-effort counter update — never block the RSVP response
    try {
      await db.rpc("increment_counter", { row_id: event.id, table_name: "events", column_name: "rsvp_count", amount: 1 }).catch(() =>
        db.from("events").update({ rsvp_count: (event.rsvp_count ?? 0) + 1 }).eq("id", event.id)
      );
    } catch { /* counter update is non-critical */ }

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
      return NextResponse.json({ error: "Login required" }, { status: 401 });
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
      // Best-effort counter update — never block the cancel response
      try {
        await db.rpc("increment_counter", { row_id: event.id, table_name: "events", column_name: "rsvp_count", amount: -1 }).catch(() =>
          db.from("events").update({ rsvp_count: Math.max((event.rsvp_count ?? 1) - 1, 0) }).eq("id", event.id)
        );
      } catch { /* counter update is non-critical */ }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("RSVP cancel error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
