export const TICKET_COMMISSION_RATE = 0.05;
export const MIN_TICKET_PRICE_ISK = 500;

export const SUBSCRIPTION_PLANS = {
  user_plus: { name: "Plus", price_isk: 750, price_usd: 5 },
  organizer_pro: { name: "Organizer Pro", price_isk: 1500, price_usd: 10 },
  venue_standard: { name: "Venue Standard", price_isk: 2250, price_usd: 15 },
  venue_premium: { name: "Venue Premium", price_isk: 5250, price_usd: 35 },
} as const;

export type SubscriptionPlanKey = keyof typeof SUBSCRIPTION_PLANS;
