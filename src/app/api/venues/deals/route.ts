import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getUser } from "@/lib/auth/guards";

/**
 * POST /api/venues/deals
 *
 * Create a new venue deal/perk.
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
    const { title, description, type, validUntil } = body as {
      title: string;
      description?: string;
      type?: string;
      validUntil?: string;
    };

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
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

    const { error } = await db.from("venue_deals").insert({
      venue_id: venue.id,
      title,
      description: description ?? null,
      type: type ?? "perk",
      valid_until: validUntil ?? null,
      is_active: true,
    });

    if (error) {
      console.error("Create deal failed:", error);
      return NextResponse.json({ error: "Failed to create deal" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Create deal error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
