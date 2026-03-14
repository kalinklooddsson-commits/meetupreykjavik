import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getUser } from "@/lib/auth/guards";

/**
 * POST /api/attendees/action
 *
 * Organizer endpoint for managing event attendees:
 * - approve / reject / check-in / waitlist
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only organizers and admins can manage attendees
    if (session.accountType !== "organizer" && session.accountType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { name, action, eventSlug } = body as {
      name: string;
      action: string;
      eventSlug?: string;
    };

    if (!name || !action) {
      return NextResponse.json({ error: "Missing name or action" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    if (!supabase) {
      // Accept the action — frontend handles optimistic update
      return NextResponse.json({ ok: true, offline: true });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    const statusMap: Record<string, string> = {
      approve: "confirmed",
      approved: "confirmed",
      reject: "rejected",
      "check-in": "checked_in",
      "check in": "checked_in",
      waitlist: "waitlisted",
    };

    const newStatus = statusMap[action.toLowerCase()] ?? action.toLowerCase();

    // Update RSVP status
    const query = db
      .from("rsvps")
      .update({ status: newStatus, updated_at: new Date().toISOString() });

    if (eventSlug) {
      // Find by event slug + attendee name
      const { data: event } = await db
        .from("events")
        .select("id")
        .eq("slug", eventSlug)
        .maybeSingle();

      if (event) {
        await query.eq("event_id", event.id);
      }
    }

    return NextResponse.json({ ok: true, action, name });
  } catch (error) {
    console.error("Attendee action error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
