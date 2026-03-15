import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getUser } from "@/lib/auth/guards";

/* ── Shared: resolve venue for the authenticated user ─────── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function resolveVenue(session: any, body: any, db: any): Promise<{ id: string } | null> {
  let venue: { id: string } | null = null;

  if (session.accountType === "admin" && body.venue_id) {
    venue = { id: body.venue_id };
  } else if (session.accountType === "admin" && body.venue_slug) {
    const { data: venueBySlug } = await db
      .from("venues")
      .select("id")
      .eq("slug", body.venue_slug)
      .maybeSingle();
    venue = venueBySlug;
  }

  if (!venue) {
    const { data: venueByOwner } = await db
      .from("venues")
      .select("id")
      .eq("owner_id", session.id)
      .maybeSingle();
    venue = venueByOwner;
  }

  if (!venue && session.email) {
    const { data: profile } = await db
      .from("profiles")
      .select("id")
      .eq("email", session.email)
      .maybeSingle();
    if (profile) {
      const { data: venueByProfile } = await db
        .from("venues")
        .select("id")
        .eq("owner_id", profile.id)
        .maybeSingle();
      venue = venueByProfile;
    }
  }

  if (!venue && session.slug) {
    const { data: venueBySlug } = await db
      .from("venues")
      .select("id")
      .eq("slug", session.slug)
      .maybeSingle();
    venue = venueBySlug;
  }

  return venue;
}

/**
 * PATCH /api/venues/availability
 *
 * Update venue availability schedule.
 * Accepts { schedule: Array<{ day: string; blocks: string[] }> }
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.accountType !== "venue" && session.accountType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { schedule } = body as {
      schedule: Array<{ day: string; blocks: string[] }>;
    };

    if (!schedule || !Array.isArray(schedule)) {
      return NextResponse.json({ error: "Missing schedule" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    const venue = await resolveVenue(session, body, db);

    if (!venue) {
      return NextResponse.json({ error: "No venue found" }, { status: 404 });
    }

    const dayMap: Record<string, number> = {
      Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0,
    };

    // Build rows BEFORE deleting to avoid data loss on malformed input
    const rows = [];
    for (const dayEntry of schedule) {
      const dayOfWeek = dayMap[dayEntry.day] ?? 0;
      for (const block of dayEntry.blocks) {
        // Parse "18:00-22:00 Open" format
        const match = block.match(/^(\d{1,2}:\d{2})-(\d{1,2}:\d{2})\s*(.*)?$/);
        if (match) {
          rows.push({
            venue_id: venue.id,
            day_of_week: dayOfWeek,
            start_time: match[1],
            end_time: match[2],
            notes: match[3]?.trim() || null,
            is_recurring: true,
          });
        }
      }
    }

    // Delete existing non-blocked availability then insert new rows
    await db.from("venue_availability").delete().eq("venue_id", venue.id).eq("is_blocked", false);

    if (rows.length > 0) {
      const { error } = await db.from("venue_availability").insert(rows);
      if (error) {
        console.error("Availability update failed:", error);
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Venue availability error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/venues/availability
 *
 * Add a blocked date.
 * Accepts { blocked_date: string, reason?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.accountType !== "venue" && session.accountType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { blocked_date, reason } = body as {
      blocked_date: string;
      reason?: string | null;
    };

    if (!blocked_date) {
      return NextResponse.json({ error: "Missing blocked_date" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    const venue = await resolveVenue(session, body, db);

    if (!venue) {
      return NextResponse.json({ error: "No venue found" }, { status: 404 });
    }

    const { data, error } = await db.from("venue_availability").insert({
      venue_id: venue.id,
      specific_date: blocked_date,
      start_time: "00:00",
      end_time: "23:59",
      is_blocked: true,
      is_recurring: false,
      notes: reason || "Blocked",
    }).select("id").maybeSingle();

    if (error) {
      console.error("Blocked date insert failed:", error);
      return NextResponse.json({ error: "Insert failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: data?.id });
  } catch (error) {
    console.error("Venue blocked date error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/venues/availability
 *
 * Remove a blocked date by id.
 * Accepts { id: string }
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.accountType !== "venue" && session.accountType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { id } = body as { id: string };

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    const venue = await resolveVenue(session, body, db);

    if (!venue) {
      return NextResponse.json({ error: "No venue found" }, { status: 404 });
    }

    const { error } = await db
      .from("venue_availability")
      .delete()
      .eq("id", id)
      .eq("venue_id", venue.id)
      .eq("is_blocked", true);

    if (error) {
      console.error("Blocked date delete failed:", error);
      return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Venue blocked date delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
