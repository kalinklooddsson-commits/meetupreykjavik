import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getUser } from "@/lib/auth/guards";

/**
 * POST /api/events
 *
 * Create a new event (submitted by organizer or venue for admin review).
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getUser();
    if (!session) {
      return NextResponse.json({ error: "Login required" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title, description, startsAt, endsAt, venueName, venueSlug,
      venueAddress, onlineLink, eventType, attendeeLimit, guestLimit,
      ageRestriction, ageMin, ageMax, isFree, ticketTiers,
      rsvpMode, recurrence, recurrenceRule, groupSlug,
      commentsEnabled, featuredPhotoUrl,
    } = body;

    if (!title) {
      return NextResponse.json({
        error: "Validation failed",
        details: { formErrors: ["Event title is required"] },
      }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    // Generate slug
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Find venue by slug if provided
    let venueId = null;
    if (venueSlug) {
      const { data: venue } = await db
        .from("venues")
        .select("id")
        .eq("slug", venueSlug)
        .maybeSingle();
      venueId = venue?.id ?? null;
    }

    // Find group by slug if provided
    let groupId = null;
    if (groupSlug) {
      const { data: group } = await db
        .from("groups")
        .select("id")
        .eq("slug", groupSlug)
        .maybeSingle();
      groupId = group?.id ?? null;
    }

    if (!startsAt) {
      return NextResponse.json({
        error: "Validation failed",
        details: { formErrors: ["Event start date/time is required"] },
      }, { status: 400 });
    }

    const { data, error } = await db.from("events").insert({
      title,
      slug,
      description: description ?? null,
      starts_at: startsAt,
      ends_at: endsAt ?? null,
      venue_id: venueId,
      group_id: groupId,
      venue_name: venueName ?? null,
      venue_address: venueAddress ?? null,
      online_link: onlineLink ?? null,
      event_type: eventType ?? "in_person",
      attendee_limit: attendeeLimit ?? null,
      guest_limit: guestLimit ?? 0,
      age_restriction: ageRestriction || "none",
      age_min: ageMin ?? null,
      age_max: ageMax ?? null,
      is_free: isFree ?? true,
      rsvp_mode: rsvpMode ?? "open",
      recurrence_rule: recurrence ?? recurrenceRule ?? null,
      comments_enabled: commentsEnabled ?? true,
      featured_photo_url: featuredPhotoUrl ?? null,
      host_id: session.id,
      status: "draft",
    }).select("id, slug").single();

    if (error) {
      console.error("Event creation failed:", error);
      return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
    }

    // Create ticket tiers if provided
    if (ticketTiers && Array.isArray(ticketTiers) && ticketTiers.length > 0 && data?.id) {
      for (const tier of ticketTiers) {
        await db.from("ticket_tiers").insert({
          event_id: data.id,
          name: tier.name,
          price_isk: tier.priceIsk ?? 0,
          price_usd: tier.priceUsd ?? 0,
          quantity: tier.quantity ?? 0,
        });
      }
    }

    return NextResponse.json({ ok: true, data: { slug: data?.slug } });
  } catch (error) {
    console.error("Event creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
