// src/lib/entitlements.ts
//
// Single source of truth for what each pricing tier unlocks.
// Consumed by dashboards, API routes, and UI components.

import type { AccountType } from "@/types/domain";

// ─── Tier Keys ───────────────────────────────────────────
export const MEMBER_TIERS = ["free", "plus", "pro"] as const;
export const ORGANIZER_TIERS = ["starter", "pro", "studio"] as const;
export const VENUE_TIERS = ["listing", "partner", "premium"] as const;

export type MemberTier = (typeof MEMBER_TIERS)[number];
export type OrganizerTier = (typeof ORGANIZER_TIERS)[number];
export type VenueTier = (typeof VENUE_TIERS)[number];
export type AnyTier = MemberTier | OrganizerTier | VenueTier;

// ─── Feature Flags ───────────────────────────────────────
export type MemberFeature =
  | "browse_events"
  | "ticket_checkout"
  | "standard_rsvp"
  | "priority_waitlist"
  | "direct_messaging"
  | "premium_badge"
  | "advanced_filters"
  | "early_access";

export type OrganizerFeature =
  | "create_events"
  | "public_ticketing"
  | "basic_analytics"
  | "max_3_active_events"
  | "unlimited_recurring_events"
  | "approval_waitlist_controls"
  | "venue_request_workflows"
  | "audience_revenue_reporting"
  | "priority_support"
  | "featured_placement_eligible"
  | "sponsor_inventory"
  | "advanced_segmentation";

export type VenueFeature =
  | "basic_listing"
  | "application_review"
  | "booking_inbox"
  | "availability_planning"
  | "deal_management"
  | "organizer_fit_insights"
  | "featured_placement"
  | "premium_analytics"
  | "priority_matching"
  | "sponsored_inventory";

// ─── Tier → Feature Maps ─────────────────────────────────
const MEMBER_FEATURES: Record<MemberTier, MemberFeature[]> = {
  free: ["browse_events", "ticket_checkout", "standard_rsvp"],
  plus: [
    "browse_events",
    "ticket_checkout",
    "standard_rsvp",
    "priority_waitlist",
    "direct_messaging",
    "premium_badge",
  ],
  pro: [
    "browse_events",
    "ticket_checkout",
    "standard_rsvp",
    "priority_waitlist",
    "direct_messaging",
    "premium_badge",
    "advanced_filters",
    "early_access",
  ],
};

const ORGANIZER_FEATURES: Record<OrganizerTier, OrganizerFeature[]> = {
  starter: [
    "create_events",
    "public_ticketing",
    "basic_analytics",
    "max_3_active_events",
  ],
  pro: [
    "create_events",
    "public_ticketing",
    "basic_analytics",
    "unlimited_recurring_events",
    "approval_waitlist_controls",
    "venue_request_workflows",
    "audience_revenue_reporting",
  ],
  studio: [
    "create_events",
    "public_ticketing",
    "basic_analytics",
    "unlimited_recurring_events",
    "approval_waitlist_controls",
    "venue_request_workflows",
    "audience_revenue_reporting",
    "priority_support",
    "featured_placement_eligible",
    "sponsor_inventory",
    "advanced_segmentation",
  ],
};

const VENUE_FEATURES: Record<VenueTier, VenueFeature[]> = {
  listing: ["basic_listing", "application_review"],
  partner: [
    "basic_listing",
    "application_review",
    "booking_inbox",
    "availability_planning",
    "deal_management",
    "organizer_fit_insights",
  ],
  premium: [
    "basic_listing",
    "application_review",
    "booking_inbox",
    "availability_planning",
    "deal_management",
    "organizer_fit_insights",
    "featured_placement",
    "premium_analytics",
    "priority_matching",
    "sponsored_inventory",
  ],
};

// ─── Tier Resolution ─────────────────────────────────────
export function resolveMemberTier(premiumTier: string | null): MemberTier {
  if (premiumTier === "pro") return "pro";
  if (premiumTier === "plus" || premiumTier === "supporter") return "plus";
  return "free";
}

export function resolveOrganizerTier(
  premiumTier: string | null,
): OrganizerTier {
  if (premiumTier === "studio") return "studio";
  if (premiumTier === "pro") return "pro";
  return "starter";
}

export function resolveVenueTier(premiumTier: string | null): VenueTier {
  if (premiumTier === "premium") return "premium";
  if (premiumTier === "partner" || premiumTier === "standard") return "partner";
  return "listing";
}

// ─── Feature Checks ──────────────────────────────────────
export function memberHasFeature(
  premiumTier: string | null,
  feature: MemberFeature,
): boolean {
  const tier = resolveMemberTier(premiumTier);
  return MEMBER_FEATURES[tier].includes(feature);
}

export function organizerHasFeature(
  premiumTier: string | null,
  feature: OrganizerFeature,
): boolean {
  const tier = resolveOrganizerTier(premiumTier);
  return ORGANIZER_FEATURES[tier].includes(feature);
}

export function venueHasFeature(
  premiumTier: string | null,
  feature: VenueFeature,
): boolean {
  const tier = resolveVenueTier(premiumTier);
  return VENUE_FEATURES[tier].includes(feature);
}

// ─── Convenience: Get All Features for a Profile ─────────
export function getEntitlements(
  accountType: AccountType,
  premiumTier: string | null,
) {
  switch (accountType) {
    case "organizer":
      return {
        tier: resolveOrganizerTier(premiumTier),
        features: ORGANIZER_FEATURES[
          resolveOrganizerTier(premiumTier)
        ] as string[],
      };
    case "venue":
      return {
        tier: resolveVenueTier(premiumTier),
        features: VENUE_FEATURES[resolveVenueTier(premiumTier)] as string[],
      };
    case "admin":
      return { tier: "admin" as const, features: ["*"] as string[] };
    case "user":
    default:
      return {
        tier: resolveMemberTier(premiumTier),
        features: MEMBER_FEATURES[resolveMemberTier(premiumTier)] as string[],
      };
  }
}

// ─── Limits ──────────────────────────────────────────────
export function getMaxActiveEvents(premiumTier: string | null): number {
  const tier = resolveOrganizerTier(premiumTier);
  if (tier === "starter") return 3;
  return Infinity; // pro and studio = unlimited
}
