import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getUser } from "@/lib/auth/guards";

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
  try {
    const session = await getUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId } = await params;
    const body = await request.json();
    const { status, counter_note } = body as {
      status: string;
      counter_note?: string;
    };

    if (!status) {
      return NextResponse.json({ error: "Missing status" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    const update: Record<string, unknown> = {
      status: status.toLowerCase(),
      updated_at: new Date().toISOString(),
    };

    if (counter_note) {
      update.counter_note = counter_note;
    }

    const { error } = await db
      .from("bookings")
      .update(update)
      .or(`id.eq.${bookingId},slug.eq.${bookingId}`);

    if (error) {
      console.error("Booking update failed:", error);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, status });
  } catch (error) {
    console.error("Booking update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
