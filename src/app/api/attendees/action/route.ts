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
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    const statusMap: Record<string, string> = {
      approve: "going",
      approved: "going",
      reject: "cancelled",
      "check-in": "going",
      "check in": "going",
      waitlist: "waitlisted",
    };

    const newStatus = statusMap[action.toLowerCase()];
    if (!newStatus) {
      return NextResponse.json({ error: `Invalid action: ${action}` }, { status: 400 });
    }

    // Find the attendee's user profile by display name
    const { data: attendeeProfile } = await db
      .from("profiles")
      .select("id")
      .eq("display_name", name)
      .maybeSingle();

    if (!attendeeProfile) {
      return NextResponse.json({ error: `Attendee "${name}" not found` }, { status: 404 });
    }

    // Build the update query with proper filters
    if (eventSlug) {
      const { data: event } = await db
        .from("events")
        .select("id")
        .eq("slug", eventSlug)
        .maybeSingle();

      if (event) {
        await db
          .from("rsvps")
          .update({ status: newStatus })
          .eq("event_id", event.id)
          .eq("user_id", attendeeProfile.id);
      }
    } else {
      // No event slug — can't safely update without knowing which event
      return NextResponse.json({ error: "Event slug is required to update attendee status" }, { status: 400 });
    }

    return NextResponse.json({ ok: true, action, name });
  } catch (error) {
    console.error("Attendee action error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
