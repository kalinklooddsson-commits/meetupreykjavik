import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveVenueTier } from "@/lib/entitlements";

export interface VenueMatch {
  venueId: string;
  name: string;
  slug: string;
  type: string;
  capacity: number;
  rating: number | null;
  area: string;
  isPremium: boolean;
  matchScore: number; // 0-100
}

/**
 * Search venues with priority matching.
 * Premium venues get a score boost and appear first.
 */
export async function searchVenuesWithPriority(options: {
  venueType?: string;
  minCapacity?: number;
  area?: string;
  limit?: number;
}): Promise<VenueMatch[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { venueType, minCapacity, area, limit = 20 } = options;

  let query = supabase
    .from("venues")
    .select(
      `
      id, name, slug, type, capacity, rating, area,
      profiles:owner_id ( premium_tier )
    `,
    )
    .eq("status", "active")
    .limit(limit * 2); // fetch extra to allow for scoring

  if (venueType) query = query.eq("type", venueType);
  if (minCapacity) query = query.gte("capacity", minCapacity);
  if (area) query = query.eq("area", area);

  const { data: venues } = await query;
  if (!venues?.length) return [];

  const scored = venues.map((v) => {
    const ownerTier =
      (v.profiles as unknown as { premium_tier: string | null })
        ?.premium_tier ?? null;
    const venueTier = resolveVenueTier(ownerTier);
    const isPremium = venueTier === "premium";
    const isPartner = venueTier === "partner";

    let matchScore = 50; // base score

    // Tier boost
    if (isPremium) matchScore += 30;
    else if (isPartner) matchScore += 15;

    // Rating boost (0-20 points)
    if (v.rating)
      matchScore += Math.min(20, Math.round(Number(v.rating) * 4));

    return {
      venueId: v.id,
      name: v.name,
      slug: v.slug,
      type: v.type,
      capacity: v.capacity ?? 0,
      rating: v.rating ? Number(v.rating) : null,
      area: v.area ?? "",
      isPremium,
      matchScore: Math.min(100, matchScore),
    };
  });

  scored.sort((a, b) => b.matchScore - a.matchScore);

  return scored.slice(0, limit);
}
