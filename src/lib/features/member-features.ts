import { memberHasFeature } from "@/lib/entitlements";

/**
 * Determines if a user should display a premium badge.
 * Used by profile cards, attendee lists, and comments.
 */
export function shouldShowPremiumBadge(
  premiumTier: string | null,
): boolean {
  return memberHasFeature(premiumTier, "premium_badge");
}

/**
 * Returns which advanced filter options are available for a user's tier.
 * Free: basic category + date range only.
 * Plus: adds area, group, price range.
 * Pro: adds rating, capacity, organizer history.
 */
export type FilterCapability =
  | "category"
  | "date_range"
  | "area"
  | "group"
  | "price_range"
  | "rating"
  | "capacity"
  | "organizer_history"
  | "venue_type";

export function getAvailableFilters(
  premiumTier: string | null,
): FilterCapability[] {
  const base: FilterCapability[] = ["category", "date_range"];

  if (memberHasFeature(premiumTier, "advanced_filters")) {
    // Pro tier: all filters
    return [
      ...base,
      "area",
      "group",
      "price_range",
      "rating",
      "capacity",
      "organizer_history",
      "venue_type",
    ];
  }

  if (memberHasFeature(premiumTier, "priority_waitlist")) {
    // Plus tier: mid-range filters
    return [...base, "area", "group", "price_range"];
  }

  return base;
}

/**
 * Check if a user can send direct messages.
 * Plus and Pro tiers can message; Free cannot.
 */
export function canSendDirectMessage(
  premiumTier: string | null,
): boolean {
  return memberHasFeature(premiumTier, "direct_messaging");
}
