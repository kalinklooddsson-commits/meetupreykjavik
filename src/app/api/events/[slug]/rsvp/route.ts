import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getUser } from "@/lib/auth/guards";

/**
 * POST /api/events/[slug]/rsvp — Create RSVP
 * DELETE /api/events/[slug]/rsvp — Cancel RSVP
 *
 * Public endpoint for event RSVP management.
 */
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

    // Find event by slug
    const { data: event } = await db
      .from("events")
      .select("id, title")
      .eq("slug", slug)
      .maybeSingle();

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if already RSVPed
    const { data: existing } = await db
      .from("rsvps")
      .select("id")
      .eq("event_id", event.id)
      .eq("user_id", session.id)
      .maybeSingle();

    if (existing) {
      // Already RSVPed — update status to confirmed
      await db
        .from("rsvps")
        .update({ status: "confirmed", updated_at: new Date().toISOString() })
        .eq("id", existing.id);
      return NextResponse.json({ ok: true, action: "confirmed" });
    }

    // Create new RSVP
    const { error } = await db.from("rsvps").insert({
      event_id: event.id,
      user_id: session.id,
      status: "confirmed",
    });

    if (error) {
      console.error("RSVP creation failed:", error);
      return NextResponse.json({ error: "RSVP failed" }, { status: 500 });
    }

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
      return NextResponse.json({ ok: true, offline: true });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    // Find event by slug
    const { data: event } = await db
      .from("events")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Cancel RSVP
    const { error } = await db
      .from("rsvps")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("event_id", event.id)
      .eq("user_id", session.id);

    if (error) {
      console.error("RSVP cancellation failed:", error);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("RSVP cancel error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
