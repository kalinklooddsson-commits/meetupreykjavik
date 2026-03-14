import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getUser } from "@/lib/auth/guards";

/**
 * POST /api/venues/reviews/[reviewId]/reply
 *
 * Venue-owner endpoint: saves a venue_response on a review.
 * Uses the admin (service-role) client to bypass RLS.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> },
) {
  try {
    const session = await getUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reviewId } = await params;
    const body = await request.json();
    const responseText = body.response as string | undefined;

    if (!responseText?.trim()) {
      return NextResponse.json(
        { error: "Response text is required" },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Database unavailable" },
        { status: 503 },
      );
    }

    // Use type assertion due to stale generated types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    // Verify the review exists and the caller owns the venue
    const { data: review } = await db
      .from("venue_reviews")
      .select("id, venue_id")
      .eq("id", reviewId)
      .maybeSingle();

    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 },
      );
    }

    // Check venue ownership — the profile's venue_id or managed venues
    const { data: venue } = await db
      .from("venues")
      .select("id, owner_id")
      .eq("id", review.venue_id)
      .maybeSingle();

    const isOwner =
      venue?.owner_id === session.id ||
      session.accountType === "admin";

    if (!isOwner) {
      return NextResponse.json(
        { error: "Not authorized to reply to this review" },
        { status: 403 },
      );
    }

    // Update the venue_response column
    // venue_reviews has no venue_responded_at column — only update venue_response
    const { error } = await db
      .from("venue_reviews")
      .update({ venue_response: responseText.trim() })
      .eq("id", reviewId);

    if (error) {
      console.error("Failed to save venue review reply:", error);
      return NextResponse.json(
        { error: "Failed to save reply" },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Venue review reply error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
