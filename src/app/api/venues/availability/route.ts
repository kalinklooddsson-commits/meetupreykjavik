import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getUser } from "@/lib/auth/guards";

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

    // Find venue owned by this user
    const { data: venue } = await db
      .from("venues")
      .select("id")
      .eq("owner_id", session.id)
      .maybeSingle();

    if (!venue) {
      return NextResponse.json({ error: "No venue found" }, { status: 404 });
    }

    // Delete existing availability and replace
    await db.from("venue_availability").delete().eq("venue_id", venue.id);

    const dayMap: Record<string, number> = {
      Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0,
    };

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
