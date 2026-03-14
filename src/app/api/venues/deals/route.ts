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
    const { title, description, dealType, dealTier, validFrom, validUntil } = body as {
      title: string;
      description?: string;
      dealType?: string;
      dealTier?: string;
      validFrom?: string;
      validUntil?: string;
    };

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // deal_type and deal_tier are NOT NULL with CHECK constraints
    const validDealTypes = new Set(["percentage", "fixed_price", "free_item", "happy_hour", "group_package", "welcome_drink"]);
    const validDealTiers = new Set(["bronze", "silver", "gold"]);
    const resolvedType = dealType && validDealTypes.has(dealType) ? dealType : "happy_hour";
    const resolvedTier = dealTier && validDealTiers.has(dealTier) ? dealTier : "bronze";

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
      deal_type: resolvedType,
      deal_tier: resolvedTier,
      valid_from: validFrom ?? null,
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
