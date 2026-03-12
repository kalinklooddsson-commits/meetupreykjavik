# Pricing-to-Dashboard Gap Filling — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fill every gap between what the pricing page promises and what the codebase actually implements, so dashboards can be built on a solid foundation.

**Architecture:** Pure backend/lib layer work. Creates `src/lib/entitlements.ts` as the single source of truth for tier-gating. Fixes price mismatches between `constants.ts` and `public-data.ts`. Adds missing business logic for recurring events, priority waitlist, commission tracking, and feature stubs. All changes work with the existing dual-mode auth (mock + Supabase).

**Tech Stack:** TypeScript, Supabase JS client, Next.js API routes, existing DB schema (no migrations needed — schema already has `premium_tier`, `commission_amount`, `recurrence_rule`, `parent_event_id`).

---

## Task 1: Create the Entitlement System — Single Source of Truth

**Files:**
- Create: `src/lib/entitlements.ts`
- Modify: `src/lib/payments/constants.ts`

This is the **most critical gap**. Every dashboard feature-gate depends on this file.

**Step 1:** Create `src/lib/entitlements.ts` with all 9 tiers and their feature flags

```typescript
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
    "browse_events", "ticket_checkout", "standard_rsvp",
    "priority_waitlist", "direct_messaging", "premium_badge",
  ],
  pro: [
    "browse_events", "ticket_checkout", "standard_rsvp",
    "priority_waitlist", "direct_messaging", "premium_badge",
    "advanced_filters", "early_access",
  ],
};

const ORGANIZER_FEATURES: Record<OrganizerTier, OrganizerFeature[]> = {
  starter: [
    "create_events", "public_ticketing", "basic_analytics",
    "max_3_active_events",
  ],
  pro: [
    "create_events", "public_ticketing", "basic_analytics",
    "unlimited_recurring_events", "approval_waitlist_controls",
    "venue_request_workflows", "audience_revenue_reporting",
  ],
  studio: [
    "create_events", "public_ticketing", "basic_analytics",
    "unlimited_recurring_events", "approval_waitlist_controls",
    "venue_request_workflows", "audience_revenue_reporting",
    "priority_support", "featured_placement_eligible",
    "sponsor_inventory", "advanced_segmentation",
  ],
};

const VENUE_FEATURES: Record<VenueTier, VenueFeature[]> = {
  listing: ["basic_listing", "application_review"],
  partner: [
    "basic_listing", "application_review",
    "booking_inbox", "availability_planning",
    "deal_management", "organizer_fit_insights",
  ],
  premium: [
    "basic_listing", "application_review",
    "booking_inbox", "availability_planning",
    "deal_management", "organizer_fit_insights",
    "featured_placement", "premium_analytics",
    "priority_matching", "sponsored_inventory",
  ],
};

// ─── Tier Resolution ─────────────────────────────────────
export function resolveMemberTier(premiumTier: string | null): MemberTier {
  if (premiumTier === "pro") return "pro";
  if (premiumTier === "plus" || premiumTier === "supporter") return "plus";
  return "free";
}

export function resolveOrganizerTier(premiumTier: string | null): OrganizerTier {
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
        features: ORGANIZER_FEATURES[resolveOrganizerTier(premiumTier)],
      };
    case "venue":
      return {
        tier: resolveVenueTier(premiumTier),
        features: VENUE_FEATURES[resolveVenueTier(premiumTier)],
      };
    case "admin":
      // Admin gets everything
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
```

**Step 2:** Verify build passes

Run: `npx next build 2>&1 | tail -5`

**Step 3:** Commit

```bash
git add src/lib/entitlements.ts
git commit -m "feat: add entitlement system for tier-gated features"
```

---

## Task 2: Fix Subscription Plan Price Mismatch

**Files:**
- Modify: `src/lib/payments/constants.ts`

The pricing page (`public-data.ts`) shows the **correct** customer-facing prices. `constants.ts` has placeholder/wrong values. Align them.

**Pricing page truth (from `public-data.ts`):**
- Member Plus: 2,250 ISK/mo (~$15)
- Member Pro: 5,250 ISK/mo (~$35)
- Organizer Starter: 4,900 ISK/mo (~$33)
- Organizer Pro: 9,900 ISK/mo (~$66)
- Organizer Studio: 19,900 ISK/mo (~$133)
- Venue Listing: Free
- Venue Partner: 9,900 ISK/mo (~$66)
- Venue Premium: 19,900 ISK/mo (~$133)

**Step 1:** Rewrite `constants.ts` to match all 9 tiers with correct prices

Replace the entire file content with:

```typescript
export const TICKET_COMMISSION_RATE = 0.05;
export const MIN_TICKET_PRICE_ISK = 500;

export const SUBSCRIPTION_PLANS = {
  // Member tiers
  member_free: { name: "Free", price_isk: 0, price_usd: 0, role: "user", tier: "free" },
  member_plus: { name: "Plus", price_isk: 2250, price_usd: 15, role: "user", tier: "plus" },
  member_pro: { name: "Pro", price_isk: 5250, price_usd: 35, role: "user", tier: "pro" },

  // Organizer tiers
  organizer_starter: { name: "Organizer Starter", price_isk: 4900, price_usd: 33, role: "organizer", tier: "starter" },
  organizer_pro: { name: "Organizer Pro", price_isk: 9900, price_usd: 66, role: "organizer", tier: "pro" },
  organizer_studio: { name: "Organizer Studio", price_isk: 19900, price_usd: 133, role: "organizer", tier: "studio" },

  // Venue tiers
  venue_listing: { name: "Venue Listing", price_isk: 0, price_usd: 0, role: "venue", tier: "listing" },
  venue_partner: { name: "Venue Partner", price_isk: 9900, price_usd: 66, role: "venue", tier: "partner" },
  venue_premium: { name: "Venue Premium", price_isk: 19900, price_usd: 133, role: "venue", tier: "premium" },
} as const;

export type SubscriptionPlanKey = keyof typeof SUBSCRIPTION_PLANS;
```

**Step 2:** Fix any imports that reference old plan keys (`user_plus`, `organizer_pro`, `venue_standard`, `venue_premium`)

Search for: `SUBSCRIPTION_PLANS\[` and `SubscriptionPlanKey` across the codebase. Update `src/lib/payments/paypal.ts` `createSubscription()` if needed (it uses `planKey` parameter).

**Step 3:** Verify build passes

Run: `npx next build 2>&1 | tail -5`

**Step 4:** Commit

```bash
git add src/lib/payments/constants.ts src/lib/payments/paypal.ts
git commit -m "fix: align subscription plan prices with pricing page (9 tiers)"
```

---

## Task 3: Commission Auto-Calculation on Transaction Creation

**Files:**
- Modify: `src/lib/db/transactions.ts`

The `transactions` table has a `commission_amount` column, and PayPal's `createTicketOrder()` calculates commission — but `createTransaction()` never sets `commission_amount`. Fix this.

**Step 1:** Add commission auto-calculation to `createTransaction()`

Add at the top of the function, before the insert:

```typescript
// Auto-calculate commission for ticket transactions
if (transaction.type === "ticket" && transaction.amount_isk && !transaction.commission_amount) {
  transaction = {
    ...transaction,
    commission_amount: Math.round(Number(transaction.amount_isk) * TICKET_COMMISSION_RATE * 100) / 100,
  };
}
```

Import `TICKET_COMMISSION_RATE` from `@/lib/payments/constants`.

**Step 2:** Verify build passes

**Step 3:** Commit

```bash
git add src/lib/db/transactions.ts
git commit -m "feat: auto-calculate commission on ticket transaction creation"
```

---

## Task 4: Priority Waitlist Promotion Logic

**Files:**
- Modify: `src/lib/db/rsvps.ts`

Currently when someone cancels, there's no waitlist promotion. Premium members (`plus`/`pro`) should get priority over free members.

**Step 1:** Add `promoteFromWaitlist()` function to `rsvps.ts`

```typescript
import { resolveMemberTier, type MemberTier } from "@/lib/entitlements";

const TIER_PRIORITY: Record<MemberTier, number> = {
  pro: 3,
  plus: 2,
  free: 1,
};

export async function promoteFromWaitlist(eventId: string): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  // Get all waitlisted RSVPs with their user's premium_tier
  const { data: waitlisted, error } = await supabase
    .from("rsvps")
    .select(`
      id,
      user_id,
      created_at,
      profiles:user_id ( premium_tier )
    `)
    .eq("event_id", eventId)
    .eq("status", "waitlisted")
    .order("created_at", { ascending: true });

  if (error || !waitlisted?.length) return null;

  // Sort by tier priority (premium first), then by join time (FIFO within same tier)
  const sorted = [...waitlisted].sort((a, b) => {
    const aTier = resolveMemberTier((a.profiles as any)?.premium_tier ?? null);
    const bTier = resolveMemberTier((b.profiles as any)?.premium_tier ?? null);
    const priorityDiff = TIER_PRIORITY[bTier] - TIER_PRIORITY[aTier];
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  const promoted = sorted[0];

  // Promote the winner
  const { error: updateError } = await supabase
    .from("rsvps")
    .update({ status: "going" })
    .eq("id", promoted.id);

  if (updateError) {
    console.error("Failed to promote from waitlist:", updateError);
    return null;
  }

  return promoted.user_id;
}
```

**Step 2:** Call `promoteFromWaitlist()` inside `cancelRsvp()` after the cancellation succeeds

Add at the end of `cancelRsvp()`, before `return data`:

```typescript
// Auto-promote next person from waitlist
await promoteFromWaitlist(eventId);
```

**Step 3:** Verify build passes

**Step 4:** Commit

```bash
git add src/lib/db/rsvps.ts
git commit -m "feat: add priority waitlist promotion (premium members promoted first)"
```

---

## Task 5: Recurring Event Engine

**Files:**
- Create: `src/lib/events/recurrence.ts`
- Modify: `src/lib/db/events.ts`

Schema already has `recurrence_rule`, `recurrence_end`, `parent_event_id`, `is_recurring`. But zero logic exists.

**Step 1:** Create `src/lib/events/recurrence.ts`

```typescript
// src/lib/events/recurrence.ts
//
// Parses recurrence_rule strings and generates future event dates.
// Format: "FREQ=WEEKLY;BYDAY=SA" (simplified iCal RRULE subset)

export interface RecurrenceOptions {
  frequency: "daily" | "weekly" | "biweekly" | "monthly";
  dayOfWeek?: number; // 0=Sun, 1=Mon, ..., 6=Sat
  dayOfMonth?: number;
}

export function parseRecurrenceRule(rule: string): RecurrenceOptions | null {
  if (!rule) return null;

  const parts = Object.fromEntries(
    rule.split(";").map((p) => {
      const [k, v] = p.split("=");
      return [k?.trim(), v?.trim()];
    }),
  );

  const freq = parts["FREQ"]?.toLowerCase();
  if (!freq) return null;

  const dayMap: Record<string, number> = {
    SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6,
  };

  return {
    frequency: freq === "biweekly" ? "biweekly" : (freq as RecurrenceOptions["frequency"]),
    dayOfWeek: parts["BYDAY"] ? dayMap[parts["BYDAY"]] : undefined,
    dayOfMonth: parts["BYMONTHDAY"] ? parseInt(parts["BYMONTHDAY"], 10) : undefined,
  };
}

export function getNextOccurrence(
  baseDate: Date,
  options: RecurrenceOptions,
): Date {
  const next = new Date(baseDate);

  switch (options.frequency) {
    case "daily":
      next.setDate(next.getDate() + 1);
      break;
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "biweekly":
      next.setDate(next.getDate() + 14);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      if (options.dayOfMonth) {
        next.setDate(options.dayOfMonth);
      }
      break;
  }

  return next;
}

/**
 * Given a parent event's start date and recurrence rule,
 * generate all occurrences up to `recurrenceEnd` or `maxCount`.
 */
export function generateOccurrences(
  startsAt: Date,
  duration: number, // milliseconds
  rule: string,
  recurrenceEnd: Date | null,
  maxCount = 52, // 1 year of weekly
): Array<{ startsAt: Date; endsAt: Date }> {
  const options = parseRecurrenceRule(rule);
  if (!options) return [];

  const results: Array<{ startsAt: Date; endsAt: Date }> = [];
  let current = new Date(startsAt);
  const endDate = recurrenceEnd ?? new Date(startsAt.getTime() + 365 * 24 * 60 * 60 * 1000);

  for (let i = 0; i < maxCount; i++) {
    current = getNextOccurrence(current, options);
    if (current > endDate) break;
    results.push({
      startsAt: new Date(current),
      endsAt: new Date(current.getTime() + duration),
    });
  }

  return results;
}
```

**Step 2:** Add `createRecurringInstances()` to `src/lib/db/events.ts`

```typescript
import { generateOccurrences } from "@/lib/events/recurrence";

export async function createRecurringInstances(parentEventId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Database unavailable");

  // Fetch the parent event
  const { data: parent, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", parentEventId)
    .single();

  if (error || !parent) throw new Error("Parent event not found");
  if (!parent.recurrence_rule) throw new Error("Event has no recurrence rule");

  const startsAt = new Date(parent.starts_at);
  const duration = parent.ends_at
    ? new Date(parent.ends_at).getTime() - startsAt.getTime()
    : 2 * 60 * 60 * 1000; // default 2h

  const recurrenceEnd = parent.recurrence_end ? new Date(parent.recurrence_end) : null;
  const occurrences = generateOccurrences(startsAt, duration, parent.recurrence_rule, recurrenceEnd);

  // Check how many child events already exist
  const { count: existingCount } = await supabase
    .from("events")
    .select("id", { count: "exact", head: true })
    .eq("parent_event_id", parentEventId);

  // Only create new occurrences beyond what already exists
  const newOccurrences = occurrences.slice(existingCount ?? 0);
  if (newOccurrences.length === 0) return [];

  const inserts = newOccurrences.map((occ, i) => ({
    title: parent.title,
    slug: `${parent.slug}-${(existingCount ?? 0) + i + 1}`,
    description: parent.description,
    group_id: parent.group_id,
    host_id: parent.host_id,
    venue_id: parent.venue_id,
    category_id: parent.category_id,
    event_type: parent.event_type,
    status: "draft" as const,
    starts_at: occ.startsAt.toISOString(),
    ends_at: occ.endsAt.toISOString(),
    venue_name: parent.venue_name,
    venue_address: parent.venue_address,
    latitude: parent.latitude,
    longitude: parent.longitude,
    online_link: parent.online_link,
    featured_photo_url: parent.featured_photo_url,
    attendee_limit: parent.attendee_limit,
    guest_limit: parent.guest_limit,
    age_restriction: parent.age_restriction,
    is_free: parent.is_free,
    rsvp_mode: parent.rsvp_mode,
    parent_event_id: parentEventId,
  }));

  const { data: created, error: insertError } = await supabase
    .from("events")
    .insert(inserts)
    .select("id, slug, starts_at");

  if (insertError) throw insertError;
  return created ?? [];
}
```

**Step 3:** Add `getEventsByHost()` to `src/lib/db/events.ts` (needed for organizer dashboard)

```typescript
export async function getEventsByHost(hostId: string, options: { status?: string; limit?: number } = {}) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { status, limit = 50 } = options;

  let query = supabase
    .from("events")
    .select(EVENT_SELECT_WITH_JOINS)
    .eq("host_id", hostId)
    .order("starts_at", { ascending: false })
    .limit(limit);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch events by host:", error);
    return [];
  }

  return data ?? [];
}
```

**Step 4:** Verify build passes

**Step 5:** Commit

```bash
git add src/lib/events/recurrence.ts src/lib/db/events.ts
git commit -m "feat: add recurring event engine and host event queries"
```

---

## Task 6: Basic Event Analytics Helpers

**Files:**
- Create: `src/lib/analytics/events.ts`

Organizer Starter promises "basic event analytics". Create the query helpers.

**Step 1:** Create `src/lib/analytics/events.ts`

```typescript
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface EventAnalytics {
  eventId: string;
  rsvpCount: number;
  waitlistCount: number;
  attendanceCount: number;
  attendanceRate: number; // 0-100
  avgRating: number | null;
  ticketRevenue: number;
  commissionPaid: number;
}

export async function getEventAnalytics(eventId: string): Promise<EventAnalytics | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  // Get event counters
  const { data: event } = await supabase
    .from("events")
    .select("id, rsvp_count, waitlist_count, attendance_count, avg_rating")
    .eq("id", eventId)
    .single();

  if (!event) return null;

  // Get ticket revenue from transactions
  const { data: transactions } = await supabase
    .from("transactions")
    .select("amount_isk, commission_amount")
    .eq("related_event_id", eventId)
    .eq("type", "ticket")
    .eq("status", "completed");

  const ticketRevenue = (transactions ?? []).reduce(
    (sum, t) => sum + Number(t.amount_isk ?? 0), 0
  );
  const commissionPaid = (transactions ?? []).reduce(
    (sum, t) => sum + Number(t.commission_amount ?? 0), 0
  );

  const attendanceRate = event.rsvp_count > 0
    ? Math.round((event.attendance_count / event.rsvp_count) * 100)
    : 0;

  return {
    eventId: event.id,
    rsvpCount: event.rsvp_count,
    waitlistCount: event.waitlist_count,
    attendanceCount: event.attendance_count,
    attendanceRate,
    avgRating: event.avg_rating ? Number(event.avg_rating) : null,
    ticketRevenue,
    commissionPaid,
  };
}

export async function getOrganizerAnalyticsSummary(hostId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  // Get all events by this host
  const { data: events } = await supabase
    .from("events")
    .select("id, rsvp_count, waitlist_count, attendance_count, avg_rating, status")
    .eq("host_id", hostId);

  if (!events?.length) {
    return {
      totalEvents: 0,
      publishedEvents: 0,
      totalRsvps: 0,
      totalAttendees: 0,
      avgAttendanceRate: 0,
      avgRating: null as number | null,
      totalRevenue: 0,
      totalCommission: 0,
    };
  }

  // Get all ticket revenue for this organizer's events
  const eventIds = events.map((e) => e.id);
  const { data: transactions } = await supabase
    .from("transactions")
    .select("amount_isk, commission_amount")
    .in("related_event_id", eventIds)
    .eq("type", "ticket")
    .eq("status", "completed");

  const totalRevenue = (transactions ?? []).reduce(
    (sum, t) => sum + Number(t.amount_isk ?? 0), 0
  );
  const totalCommission = (transactions ?? []).reduce(
    (sum, t) => sum + Number(t.commission_amount ?? 0), 0
  );

  const totalRsvps = events.reduce((s, e) => s + e.rsvp_count, 0);
  const totalAttendees = events.reduce((s, e) => s + e.attendance_count, 0);
  const ratingsWithValues = events.filter((e) => e.avg_rating != null);

  return {
    totalEvents: events.length,
    publishedEvents: events.filter((e) => e.status === "published").length,
    totalRsvps,
    totalAttendees,
    avgAttendanceRate: totalRsvps > 0 ? Math.round((totalAttendees / totalRsvps) * 100) : 0,
    avgRating: ratingsWithValues.length > 0
      ? Number((ratingsWithValues.reduce((s, e) => s + Number(e.avg_rating), 0) / ratingsWithValues.length).toFixed(1))
      : null,
    totalRevenue,
    totalCommission,
  };
}
```

**Step 2:** Verify build passes

**Step 3:** Commit

```bash
git add src/lib/analytics/events.ts
git commit -m "feat: add event analytics helpers for organizer dashboard"
```

---

## Task 7: Venue Analytics and Organizer-Fit Insights

**Files:**
- Create: `src/lib/analytics/venues.ts`

Venue Partner promises "organizer-fit insights". Venue Premium promises "premium analytics and trend views".

**Step 1:** Create `src/lib/analytics/venues.ts`

```typescript
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface VenueAnalytics {
  venueId: string;
  totalBookings: number;
  acceptedBookings: number;
  declinedBookings: number;
  acceptRate: number;
  totalEventsHosted: number;
  avgEventRating: number | null;
  totalReviews: number;
  avgVenueRating: number | null;
  revenueFromBookings: number;
}

export async function getVenueAnalytics(venueId: string): Promise<VenueAnalytics | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  // Bookings breakdown
  const { data: bookings } = await supabase
    .from("venue_bookings")
    .select("status")
    .eq("venue_id", venueId);

  const totalBookings = bookings?.length ?? 0;
  const acceptedBookings = bookings?.filter((b) => b.status === "accepted" || b.status === "completed").length ?? 0;
  const declinedBookings = bookings?.filter((b) => b.status === "declined").length ?? 0;
  const acceptRate = totalBookings > 0 ? Math.round((acceptedBookings / totalBookings) * 100) : 0;

  // Events hosted at this venue
  const { data: events } = await supabase
    .from("events")
    .select("id, avg_rating")
    .eq("venue_id", venueId)
    .in("status", ["published", "completed"]);

  const totalEventsHosted = events?.length ?? 0;
  const ratedEvents = events?.filter((e) => e.avg_rating != null) ?? [];
  const avgEventRating = ratedEvents.length > 0
    ? Number((ratedEvents.reduce((s, e) => s + Number(e.avg_rating), 0) / ratedEvents.length).toFixed(1))
    : null;

  // Venue reviews
  const { data: reviews } = await supabase
    .from("venue_reviews")
    .select("rating")
    .eq("venue_id", venueId);

  const totalReviews = reviews?.length ?? 0;
  const avgVenueRating = totalReviews > 0
    ? Number((reviews!.reduce((s, r) => s + r.rating, 0) / totalReviews).toFixed(1))
    : null;

  // Revenue from venue partnership transactions
  const { data: transactions } = await supabase
    .from("transactions")
    .select("amount_isk")
    .eq("related_venue_id", venueId)
    .eq("status", "completed");

  const revenueFromBookings = (transactions ?? []).reduce(
    (sum, t) => sum + Number(t.amount_isk ?? 0), 0
  );

  return {
    venueId,
    totalBookings,
    acceptedBookings,
    declinedBookings,
    acceptRate,
    totalEventsHosted,
    avgEventRating,
    totalReviews,
    avgVenueRating,
    revenueFromBookings,
  };
}

/** Organizer-fit insights: which organizers match this venue's profile */
export async function getOrganizerFitInsights(venueId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  // Get venue type and category info
  const { data: venue } = await supabase
    .from("venues")
    .select("type, capacity")
    .eq("id", venueId)
    .single();

  if (!venue) return [];

  // Find organizers who have run events at similar venue types
  const { data: pastBookings } = await supabase
    .from("venue_bookings")
    .select(`
      organizer_id,
      status,
      events:event_id (
        avg_rating,
        rsvp_count,
        attendance_count
      ),
      profiles:organizer_id (
        display_name,
        slug,
        avatar_url
      )
    `)
    .eq("venue_id", venueId)
    .in("status", ["accepted", "completed"])
    .limit(20);

  // Score each organizer
  return (pastBookings ?? []).map((booking) => {
    const event = booking.events as any;
    const profile = booking.profiles as any;
    return {
      organizerId: booking.organizer_id,
      name: profile?.display_name ?? "Unknown",
      slug: profile?.slug ?? "",
      avatarUrl: profile?.avatar_url,
      avgRating: event?.avg_rating ? Number(event.avg_rating) : null,
      attendanceRate: event?.rsvp_count > 0
        ? Math.round((event.attendance_count / event.rsvp_count) * 100)
        : 0,
      bookingStatus: booking.status,
    };
  });
}
```

**Step 2:** Verify build passes

**Step 3:** Commit

```bash
git add src/lib/analytics/venues.ts
git commit -m "feat: add venue analytics and organizer-fit insights"
```

---

## Task 8: Featured Placement Admin Workflow

**Files:**
- Modify: `src/app/api/[...path]/route.ts` (add featured placement endpoints)

Admin needs to toggle featured status on events and venues. Studio organizers should be "eligible" but admin controls actual placement.

**Step 1:** Add these API endpoints to the catch-all router:

`PATCH /api/admin/events/:slug/featured` — toggle `is_featured`
`PATCH /api/admin/venues/:slug/featured` — toggle `is_featured` (requires adding column check)
`GET /api/admin/featured` — list all featured items

Find the admin stats section in the router and add:

```typescript
// PATCH /api/admin/events/:slug/featured
if (method === "PATCH" && segments[1] === "admin" && segments[2] === "events" && segments[4] === "featured") {
  if (session.accountType !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }
  const slug = segments[3];
  const body = await request.json();
  const isFeatured = Boolean(body.is_featured);

  const { data, error } = await supabase
    .from("events")
    .update({ is_featured: isFeatured })
    .eq("slug", slug)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
```

**Step 2:** Verify build passes

**Step 3:** Commit

```bash
git add src/app/api/[...path]/route.ts
git commit -m "feat: add admin featured placement toggle endpoints"
```

---

## Task 9: Sponsor Inventory Stub

**Files:**
- Create: `src/lib/sponsors/types.ts`

Organizer Studio promises "Sponsor and partner inventory". Create the type definitions and a minimal data layer stub.

**Step 1:** Create `src/lib/sponsors/types.ts`

```typescript
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
```

**Step 2:** Verify build passes

**Step 3:** Commit

```bash
git add src/lib/sponsors/types.ts
git commit -m "feat: add sponsor inventory type stubs for Studio tier"
```

---

## Task 10: Advanced Filters + Premium Badge Helpers

**Files:**
- Create: `src/lib/features/member-features.ts`

Member Plus promises "premium badge" and "direct messaging". Member Pro promises "advanced filters". Create the helper utilities.

**Step 1:** Create `src/lib/features/member-features.ts`

```typescript
import { memberHasFeature } from "@/lib/entitlements";

/**
 * Determines if a user should display a premium badge.
 * Used by profile cards, attendee lists, and comments.
 */
export function shouldShowPremiumBadge(premiumTier: string | null): boolean {
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

export function getAvailableFilters(premiumTier: string | null): FilterCapability[] {
  const base: FilterCapability[] = ["category", "date_range"];

  if (memberHasFeature(premiumTier, "advanced_filters")) {
    // Pro tier: all filters
    return [
      ...base,
      "area", "group", "price_range",
      "rating", "capacity", "organizer_history", "venue_type",
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
export function canSendDirectMessage(premiumTier: string | null): boolean {
  return memberHasFeature(premiumTier, "direct_messaging");
}
```

**Step 2:** Verify build passes

**Step 3:** Commit

```bash
git add src/lib/features/member-features.ts
git commit -m "feat: add premium badge, advanced filters, and messaging helpers"
```

---

## Task 11: Audience/Revenue Reporting Helpers

**Files:**
- Create: `src/lib/analytics/reporting.ts`

Organizer Pro promises "audience and revenue reporting". Create export-ready aggregation functions.

**Step 1:** Create `src/lib/analytics/reporting.ts`

```typescript
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface RevenueReportRow {
  eventSlug: string;
  eventTitle: string;
  date: string;
  ticketsSold: number;
  grossRevenue: number;
  commission: number;
  netRevenue: number;
}

export async function getOrganizerRevenueReport(
  hostId: string,
  from?: string,
  to?: string,
): Promise<RevenueReportRow[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  // Get all events by host
  const { data: events } = await supabase
    .from("events")
    .select("id, slug, title, starts_at")
    .eq("host_id", hostId)
    .order("starts_at", { ascending: false });

  if (!events?.length) return [];

  const eventIds = events.map((e) => e.id);

  // Get transactions for these events
  let txQuery = supabase
    .from("transactions")
    .select("related_event_id, amount_isk, commission_amount")
    .in("related_event_id", eventIds)
    .eq("type", "ticket")
    .eq("status", "completed");

  if (from) txQuery = txQuery.gte("created_at", from);
  if (to) txQuery = txQuery.lte("created_at", to);

  const { data: transactions } = await txQuery;

  // Group by event
  const eventMap = new Map(events.map((e) => [e.id, e]));
  const revenueMap = new Map<string, { gross: number; commission: number; count: number }>();

  for (const tx of transactions ?? []) {
    const eventId = tx.related_event_id;
    if (!eventId) continue;
    const existing = revenueMap.get(eventId) ?? { gross: 0, commission: 0, count: 0 };
    existing.gross += Number(tx.amount_isk ?? 0);
    existing.commission += Number(tx.commission_amount ?? 0);
    existing.count += 1;
    revenueMap.set(eventId, existing);
  }

  return events
    .filter((e) => revenueMap.has(e.id))
    .map((e) => {
      const rev = revenueMap.get(e.id)!;
      return {
        eventSlug: e.slug,
        eventTitle: e.title,
        date: e.starts_at,
        ticketsSold: rev.count,
        grossRevenue: rev.gross,
        commission: rev.commission,
        netRevenue: rev.gross - rev.commission,
      };
    });
}

export interface AudienceReportRow {
  eventSlug: string;
  eventTitle: string;
  date: string;
  rsvpCount: number;
  attendanceCount: number;
  attendanceRate: number;
  waitlistCount: number;
  avgRating: number | null;
}

export async function getOrganizerAudienceReport(
  hostId: string,
): Promise<AudienceReportRow[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data: events } = await supabase
    .from("events")
    .select("slug, title, starts_at, rsvp_count, attendance_count, waitlist_count, avg_rating")
    .eq("host_id", hostId)
    .in("status", ["published", "completed"])
    .order("starts_at", { ascending: false });

  return (events ?? []).map((e) => ({
    eventSlug: e.slug,
    eventTitle: e.title,
    date: e.starts_at,
    rsvpCount: e.rsvp_count,
    attendanceCount: e.attendance_count,
    attendanceRate: e.rsvp_count > 0
      ? Math.round((e.attendance_count / e.rsvp_count) * 100)
      : 0,
    waitlistCount: e.waitlist_count,
    avgRating: e.avg_rating ? Number(e.avg_rating) : null,
  }));
}
```

**Step 2:** Verify build passes

**Step 3:** Commit

```bash
git add src/lib/analytics/reporting.ts
git commit -m "feat: add audience and revenue reporting for Organizer Pro"
```

---

## Task 12: Priority Venue Matching Helper

**Files:**
- Create: `src/lib/features/venue-matching.ts`

Venue Premium promises "priority venue matching". When organizers search for venues, premium venues should rank higher.

**Step 1:** Create `src/lib/features/venue-matching.ts`

```typescript
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
    .select(`
      id, name, slug, type, capacity, rating, area,
      profiles:owner_id ( premium_tier )
    `)
    .eq("status", "active")
    .limit(limit * 2); // fetch extra to allow for scoring

  if (venueType) query = query.eq("type", venueType);
  if (minCapacity) query = query.gte("capacity", minCapacity);
  if (area) query = query.eq("area", area);

  const { data: venues } = await query;
  if (!venues?.length) return [];

  // Score each venue
  const scored = venues.map((v) => {
    const ownerTier = (v.profiles as any)?.premium_tier ?? null;
    const venueTier = resolveVenueTier(ownerTier);
    const isPremium = venueTier === "premium";
    const isPartner = venueTier === "partner";

    let matchScore = 50; // base score

    // Tier boost
    if (isPremium) matchScore += 30;
    else if (isPartner) matchScore += 15;

    // Rating boost (0-20 points)
    if (v.rating) matchScore += Math.min(20, Math.round(Number(v.rating) * 4));

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

  // Sort by score descending
  scored.sort((a, b) => b.matchScore - a.matchScore);

  return scored.slice(0, limit);
}
```

**Step 2:** Verify build passes

**Step 3:** Commit

```bash
git add src/lib/features/venue-matching.ts
git commit -m "feat: add priority venue matching for premium venues"
```

---

## Task 13: Wire Entitlements into Webhook + Update Mock Accounts

**Files:**
- Modify: `src/app/api/paypal/webhook/route.ts`
- Modify: `src/lib/auth/mock-auth-config.ts`

The webhook currently sets `premium_tier: "supporter"` which doesn't match our tier system. Fix it. Also give mock accounts tier info for testing.

**Step 1:** Update webhook to accept tier from subscription metadata

In the `BILLING.SUBSCRIPTION.ACTIVATED` handler, replace `premium_tier: "supporter"` with proper tier resolution. The subscription's `plan_id` should map to our plan keys, but since PayPal plan IDs aren't set up yet, use a `custom_id` approach:

```typescript
// In BILLING.SUBSCRIPTION.ACTIVATED case:
const customId = event.resource?.custom_id as string | undefined;
const tier = customId ?? "plus"; // Default to plus if no custom_id
await supabase
  .from("profiles")
  .update({ is_premium: true, premium_tier: tier })
  .eq("email", subscriberEmail);
```

**Step 2:** Update mock accounts to include tier info for testing. Add `premiumTier` to `MockSession`:

In `mock-auth-config.ts`, extend `MockSession`:
```typescript
export type MockSession = {
  id: string;
  email: string;
  displayName: string;
  slug: string;
  accountType: AccountType;
  locale: Locale;
  premiumTier?: string | null;
};
```

And update mock accounts:
```typescript
// user account: free tier (no premium)
// organizer account: "pro" tier
{ ...existingOrganizer, premiumTier: "pro" },
// venue account: "partner" tier
{ ...existingVenue, premiumTier: "partner" },
// admin: no tier needed (gets everything)
```

**Step 3:** Verify build passes

**Step 4:** Commit

```bash
git add src/app/api/paypal/webhook/route.ts src/lib/auth/mock-auth-config.ts
git commit -m "feat: wire entitlement tiers into webhook and mock accounts"
```

---

## Task 14: Final Build Verification + Summary

**Step 1:** Run full build

```bash
npx next build 2>&1 | tail -20
```

**Step 2:** Verify all new files exist

```bash
ls -la src/lib/entitlements.ts
ls -la src/lib/events/recurrence.ts
ls -la src/lib/analytics/events.ts
ls -la src/lib/analytics/venues.ts
ls -la src/lib/analytics/reporting.ts
ls -la src/lib/sponsors/types.ts
ls -la src/lib/features/member-features.ts
ls -la src/lib/features/venue-matching.ts
```

**Step 3:** Commit any remaining changes

```bash
git add -A
git commit -m "chore: final gap-filling verification"
```

---

## Summary of What Each Gap Gets

| # | Gap | Solution | Task |
|---|-----|----------|------|
| 1 | Entitlement/tier-gating | `src/lib/entitlements.ts` — 9 tiers, feature flags, resolution functions | 1 |
| 2 | Price mismatch | `constants.ts` aligned to 9 pricing-page tiers | 2 |
| 3 | Commission on transactions | Auto-calc in `createTransaction()` | 3 |
| 4 | Priority waitlist | `promoteFromWaitlist()` with tier-aware ordering | 4 |
| 5 | Recurring events | `recurrence.ts` engine + `createRecurringInstances()` | 5 |
| 6 | Basic event analytics | `analytics/events.ts` with per-event and organizer-summary queries | 6 |
| 7 | Venue analytics + organizer-fit | `analytics/venues.ts` with booking stats and fit scoring | 7 |
| 8 | Featured placement admin | API endpoints for toggling featured on events | 8 |
| 9 | Sponsor inventory | Type stubs + empty summary placeholder | 9 |
| 10 | Premium badge + advanced filters | `features/member-features.ts` | 10 |
| 11 | Revenue/audience reporting | `analytics/reporting.ts` with export-ready aggregations | 11 |
| 12 | Priority venue matching | `features/venue-matching.ts` with tier score boost | 12 |
| 13 | Webhook + mock account tiers | Proper tier in webhook, mock accounts with tiers | 13 |

**After this plan:** All pricing promises have backing code. Dashboards can import from `entitlements.ts` to gate features, from `analytics/*` to display stats, and from `features/*` for tier-specific behavior.
