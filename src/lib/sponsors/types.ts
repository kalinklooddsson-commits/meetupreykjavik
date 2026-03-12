/**
 * Sponsor inventory types — stub for Organizer Studio tier.
 *
 * The full sponsor management system will be built later.
 * This establishes the data contract so dashboards can
 * reference it now and render placeholder UI.
 */

export interface SponsorSlot {
  id: string;
  eventId: string;
  name: string;
  tier: "title" | "gold" | "silver" | "community";
  logoUrl: string | null;
  websiteUrl: string | null;
  status: "available" | "reserved" | "confirmed";
  priceIsk: number | null;
  createdAt: string;
}

export interface SponsorInventorySummary {
  totalSlots: number;
  confirmedSlots: number;
  availableSlots: number;
  totalRevenueIsk: number;
}

/**
 * Placeholder: returns empty inventory.
 * Will be backed by a `sponsor_slots` table in a future migration.
 */
export function getEmptySponsorSummary(): SponsorInventorySummary {
  return {
    totalSlots: 0,
    confirmedSlots: 0,
    availableSlots: 0,
    totalRevenueIsk: 0,
  };
}
