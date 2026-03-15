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

    // Also accept frontend aliases: type, tier, note
    const rawType = dealType ?? (body.type as string | undefined);
    const rawTier = dealTier ?? (body.tier as string | undefined);
    const rawDescription = description ?? (body.note as string | undefined);

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Map human-readable type labels to DB enum values
    const typeLabelMap: Record<string, string> = {
      "free item": "free_item",
      "% off": "percentage",
      "fixed discount": "fixed_price",
      "bundle": "group_package",
      "happy hour": "happy_hour",
      "welcome drink": "welcome_drink",
    };

    // deal_type and deal_tier are NOT NULL with CHECK constraints
    const validDealTypes = new Set(["percentage", "fixed_price", "free_item", "happy_hour", "group_package", "welcome_drink"]);
    const validDealTiers = new Set(["bronze", "silver", "gold"]);
    const normalizedType = rawType ? (typeLabelMap[rawType.toLowerCase()] ?? rawType.toLowerCase().replace(/\s+/g, "_")) : undefined;
    const normalizedTier = rawTier?.toLowerCase();
    const resolvedType = normalizedType && validDealTypes.has(normalizedType) ? normalizedType : "happy_hour";
    const resolvedTier = normalizedTier && validDealTiers.has(normalizedTier) ? normalizedTier : "bronze";

    const supabase = createSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    // Admin users can specify venue_id or venue_slug directly in the request body
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

    // Find venue owned by this user (try owner_id, then email→profile→owner_id, then slug)
    if (!venue) {
      const { data: venueByOwner } = await db
        .from("venues")
        .select("id")
        .eq("owner_id", session.id)
        .maybeSingle();
      venue = venueByOwner;
    }

    // Try looking up venue via the user's email → profile → owner_id chain
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

    if (!venue) {
      return NextResponse.json({ error: "No venue found" }, { status: 404 });
    }

    const { error } = await db.from("venue_deals").insert({
      venue_id: venue.id,
      title,
      description: rawDescription ?? null,
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
