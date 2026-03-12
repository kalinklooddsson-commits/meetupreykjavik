export const TICKET_COMMISSION_RATE = 0.05;
export const MIN_TICKET_PRICE_ISK = 500;

export const SUBSCRIPTION_PLANS = {
  // Member tiers
  member_free: {
    name: "Free",
    price_isk: 0,
    price_usd: 0,
    role: "user",
    tier: "free",
  },
  member_plus: {
    name: "Plus",
    price_isk: 2250,
    price_usd: 15,
    role: "user",
    tier: "plus",
  },
  member_pro: {
    name: "Pro",
    price_isk: 5250,
    price_usd: 35,
    role: "user",
    tier: "pro",
  },

  // Organizer tiers
  organizer_starter: {
    name: "Organizer Starter",
    price_isk: 4900,
    price_usd: 33,
    role: "organizer",
    tier: "starter",
  },
  organizer_pro: {
    name: "Organizer Pro",
    price_isk: 9900,
    price_usd: 66,
    role: "organizer",
    tier: "pro",
  },
  organizer_studio: {
    name: "Organizer Studio",
    price_isk: 19900,
    price_usd: 133,
    role: "organizer",
    tier: "studio",
  },

  // Venue tiers
  venue_listing: {
    name: "Venue Listing",
    price_isk: 0,
    price_usd: 0,
    role: "venue",
    tier: "listing",
  },
  venue_partner: {
    name: "Venue Partner",
    price_isk: 9900,
    price_usd: 66,
    role: "venue",
    tier: "partner",
  },
  venue_premium: {
    name: "Venue Premium",
    price_isk: 19900,
    price_usd: 133,
    role: "venue",
    tier: "premium",
  },
} as const;

export type SubscriptionPlanKey = keyof typeof SUBSCRIPTION_PLANS;
