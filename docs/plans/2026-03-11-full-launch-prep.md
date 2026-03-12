# MeetupReykjavik Full Launch Prep — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the static frontend demo into a working MVP with live Supabase backend, auth, payments scaffold, email, maps, translations, and mobile polish.

**Architecture:** Bottom-up approach. Deploy Supabase schema first, build data access layer, wire auth, then replace mock data across all pages. PayPal and Resend are fully integrated but env-var gated (graceful degradation when keys not set). Frontend polish (Tailwind fixes, Leaflet maps, i18n, mobile) runs after backend is solid.

**Tech Stack:** Next.js 16, React 19, Supabase (Postgres + Auth + Storage), PayPal JS SDK, Resend, Leaflet/react-leaflet, next-intl, Tailwind CSS 4, Zod 4

---

## Phase 1: Supabase Connection & Schema Deployment

### Task 1: Configure Supabase Environment Variables

**Files:**
- Create: `.env.local`

**Step 1: Get Supabase credentials from the live project**

Open the Supabase dashboard in Chrome. Navigate to Project Settings > API. Copy:
- Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- service_role secret → `SUPABASE_SERVICE_ROLE_KEY`

**Step 2: Create `.env.local`**

```env
NEXT_PUBLIC_SUPABASE_URL=<from dashboard>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from dashboard>
SUPABASE_SERVICE_ROLE_KEY=<from dashboard>
ENABLE_SUPABASE_AUTH=true
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Step 3: Verify connection**

Run: `npm run dev` and check the console for no Supabase connection errors.

**Step 4: Commit**

```bash
# .env.local is gitignored — nothing to commit here
# But verify .gitignore includes .env.local
```

---

### Task 2: Deploy Database Schema

**Files:**
- Reference: `supabase/schema.sql`

**Step 1: Run schema SQL in Supabase SQL Editor**

Open the Supabase dashboard > SQL Editor. Paste and execute the contents of `supabase/schema.sql`. This creates all 24 tables, triggers, RLS policies, and helper functions.

**Step 2: Verify tables exist**

In the Supabase dashboard > Table Editor, verify all 24 tables are visible:
profiles, categories, venues, venue_availability, venue_deals, groups, group_members, events, event_invites, ticket_tiers, rsvps, event_comments, event_ratings, discussions, discussion_replies, venue_reviews, venue_bookings, blocked_users, notifications, messages, transactions, admin_audit_log, platform_settings, event_templates

**Step 3: Seed categories**

Run this SQL in the SQL Editor to seed the 10 event categories:

```sql
INSERT INTO public.categories (id, name_en, name_is, slug, icon_letter, bg_color, text_color, description_en, description_is, sort_order) VALUES
  (gen_random_uuid(), 'Nightlife', 'Næturlíf', 'nightlife', 'N', '#4f46e5', '#ffffff', 'Bars, clubs, and late-night events', 'Barir, klúbbar og næturviðburðir', 1),
  (gen_random_uuid(), 'Outdoors & Adventure', 'Útivist og ævintýri', 'outdoors', 'O', '#059669', '#ffffff', 'Hiking, hot springs, and nature', 'Gönguferðir, ylur og náttúra', 2),
  (gen_random_uuid(), 'Tech & Startups', 'Tækni og sprotafyrirtæki', 'tech', 'T', '#7c3aed', '#ffffff', 'Meetups, hackathons, and workshops', 'Hittingar, hackathon og vinnustofur', 3),
  (gen_random_uuid(), 'Music & Arts', 'Tónlist og listir', 'music', 'M', '#db2777', '#ffffff', 'Concerts, galleries, and performances', 'Tónleikar, gallerí og sýningar', 4),
  (gen_random_uuid(), 'Food & Drink', 'Matur og drykkur', 'food', 'F', '#ea580c', '#ffffff', 'Tastings, cooking classes, and food tours', 'Smökkun, matargerðarnámskeið og matarferðir', 5),
  (gen_random_uuid(), 'Sports & Fitness', 'Íþróttir og líkamsrækt', 'sports', 'S', '#0891b2', '#ffffff', 'Team sports, yoga, and fitness events', 'Hópíþróttir, jóga og líkamsræktarviðburðir', 6),
  (gen_random_uuid(), 'Language Exchange', 'Tungumálaskipti', 'language', 'L', '#65a30d', '#ffffff', 'Practice Icelandic and other languages', 'Æfðu íslensku og önnur tungumál', 7),
  (gen_random_uuid(), 'Expat Community', 'Útlendingasamfélag', 'expat', 'E', '#d97706', '#ffffff', 'Connect with the international community', 'Tengdu við alþjóðlega samfélagið', 8),
  (gen_random_uuid(), 'Book Clubs', 'Bókaklúbbar', 'books', 'B', '#be185d', '#ffffff', 'Reading groups and literary events', 'Leshópar og bókmenntaviðburðir', 9),
  (gen_random_uuid(), 'Professional', 'Fagleg tengslanet', 'professional', 'P', '#1e40af', '#ffffff', 'Networking and career development', 'Tengslanet og starfsþróun', 10)
ON CONFLICT (slug) DO NOTHING;
```

**Step 4: Commit**

Nothing to commit — schema deployment is a Supabase-side operation.

---

### Task 3: Build Data Access Layer

**Files:**
- Create: `src/lib/db/events.ts`
- Create: `src/lib/db/groups.ts`
- Create: `src/lib/db/venues.ts`
- Create: `src/lib/db/profiles.ts`
- Create: `src/lib/db/rsvps.ts`
- Create: `src/lib/db/bookings.ts`
- Create: `src/lib/db/categories.ts`
- Create: `src/lib/db/notifications.ts`
- Create: `src/lib/db/messages.ts`
- Create: `src/lib/db/transactions.ts`
- Create: `src/lib/db/index.ts`

**Step 1: Create `src/lib/db/categories.ts`**

```typescript
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getCategories() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
  return data;
}

export async function getCategoryBySlug(slug: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data;
}
```

**Step 2: Create `src/lib/db/events.ts`**

```typescript
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type EventRow = Database["public"]["Tables"]["events"]["Row"];
type EventInsert = Database["public"]["Tables"]["events"]["Insert"];

export async function getEvents(options?: {
  category?: string;
  limit?: number;
  offset?: number;
  status?: string;
}) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { data: [], count: 0 };

  let query = supabase
    .from("events")
    .select("*, venues(name, slug, address), profiles!events_organizer_id_fkey(display_name, slug, avatar_url), categories(name_en, name_is, slug)", { count: "exact" })
    .eq("status", options?.status ?? "published")
    .order("start_date", { ascending: true });

  if (options?.category) {
    query = query.eq("categories.slug", options.category);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options?.limit ?? 20) - 1);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Failed to fetch events:", error);
    return { data: [], count: 0 };
  }
  return { data: data ?? [], count: count ?? 0 };
}

export async function getEventBySlug(slug: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("events")
    .select("*, venues(name, slug, address, latitude, longitude), profiles!events_organizer_id_fkey(display_name, slug, avatar_url), categories(name_en, name_is, slug), ticket_tiers(*)")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data;
}

export async function getFeaturedEvents(limit = 6) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("events")
    .select("*, venues(name, slug), categories(name_en, slug)")
    .eq("status", "published")
    .eq("is_featured", true)
    .order("start_date", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch featured events:", error);
    return [];
  }
  return data ?? [];
}

export async function createEvent(event: EventInsert) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Database unavailable");

  const { data, error } = await supabase
    .from("events")
    .insert(event)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateEvent(slug: string, updates: Partial<EventInsert>) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Database unavailable");

  const { data, error } = await supabase
    .from("events")
    .update(updates)
    .eq("slug", slug)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteEvent(slug: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Database unavailable");

  const { error } = await supabase.from("events").delete().eq("slug", slug);
  if (error) throw error;
}
```

**Step 3: Create `src/lib/db/groups.ts`**

```typescript
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type GroupInsert = Database["public"]["Tables"]["groups"]["Insert"];

export async function getGroups(options?: { category?: string; limit?: number }) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  let query = supabase
    .from("groups")
    .select("*, profiles!groups_organizer_id_fkey(display_name, slug, avatar_url), categories(name_en, name_is, slug)")
    .eq("status", "active")
    .order("member_count", { ascending: false });

  if (options?.category) {
    query = query.eq("categories.slug", options.category);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Failed to fetch groups:", error);
    return [];
  }
  return data ?? [];
}

export async function getGroupBySlug(slug: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("groups")
    .select("*, profiles!groups_organizer_id_fkey(display_name, slug, avatar_url), categories(name_en, name_is, slug), group_members(id, user_id, role, status)")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data;
}

export async function createGroup(group: GroupInsert) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Database unavailable");

  const { data, error } = await supabase.from("groups").insert(group).select().single();
  if (error) throw error;
  return data;
}

export async function joinGroup(groupId: string, userId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Database unavailable");

  const { data, error } = await supabase
    .from("group_members")
    .insert({ group_id: groupId, user_id: userId, role: "member", status: "active" })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function leaveGroup(groupId: string, userId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Database unavailable");

  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", userId);

  if (error) throw error;
}
```

**Step 4: Create `src/lib/db/venues.ts`**

```typescript
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type VenueInsert = Database["public"]["Tables"]["venues"]["Insert"];

export async function getVenues(options?: { type?: string; limit?: number }) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  let query = supabase
    .from("venues")
    .select("*")
    .eq("status", "active")
    .order("avg_rating", { ascending: false });

  if (options?.type) {
    query = query.eq("type", options.type);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Failed to fetch venues:", error);
    return [];
  }
  return data ?? [];
}

export async function getVenueBySlug(slug: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("venues")
    .select("*, venue_availability(*), venue_deals(*), venue_reviews(*), venue_bookings(*)")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data;
}

export async function createVenue(venue: VenueInsert) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Database unavailable");

  const { data, error } = await supabase.from("venues").insert(venue).select().single();
  if (error) throw error;
  return data;
}

export async function updateVenue(slug: string, updates: Partial<VenueInsert>) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Database unavailable");

  const { data, error } = await supabase
    .from("venues")
    .update(updates)
    .eq("slug", slug)
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

**Step 5: Create `src/lib/db/profiles.ts`**

```typescript
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export async function getProfileById(id: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

export async function getProfileBySlug(slug: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data;
}

export async function updateProfile(id: string, updates: ProfileUpdate) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Database unavailable");

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

**Step 6: Create `src/lib/db/rsvps.ts`**

```typescript
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createRsvp(eventId: string, userId: string, ticketTierId?: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Database unavailable");

  const { data, error } = await supabase
    .from("rsvps")
    .insert({
      event_id: eventId,
      user_id: userId,
      ticket_tier_id: ticketTierId ?? null,
      status: "confirmed",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function cancelRsvp(eventId: string, userId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Database unavailable");

  const { error } = await supabase
    .from("rsvps")
    .update({ status: "cancelled" })
    .eq("event_id", eventId)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function getEventRsvps(eventId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("rsvps")
    .select("*, profiles(display_name, slug, avatar_url)")
    .eq("event_id", eventId)
    .in("status", ["confirmed", "waitlisted"]);

  if (error) return [];
  return data ?? [];
}

export async function getUserRsvps(userId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("rsvps")
    .select("*, events(title, slug, start_date, venues(name))")
    .eq("user_id", userId)
    .eq("status", "confirmed")
    .order("created_at", { ascending: false });

  if (error) return [];
  return data ?? [];
}
```

**Step 7: Create `src/lib/db/bookings.ts`**

```typescript
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createBooking(booking: {
  venue_id: string;
  requester_id: string;
  event_id?: string;
  requested_date: string;
  start_time: string;
  end_time: string;
  guest_count: number;
  notes?: string;
}) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Database unavailable");

  const { data, error } = await supabase
    .from("venue_bookings")
    .insert({ ...booking, status: "pending" })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getVenueBookings(venueId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("venue_bookings")
    .select("*, profiles(display_name, email)")
    .eq("venue_id", venueId)
    .order("requested_date", { ascending: true });

  if (error) return [];
  return data ?? [];
}

export async function updateBookingStatus(bookingId: string, status: string, counterOffer?: object) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Database unavailable");

  const updates: Record<string, unknown> = { status };
  if (counterOffer) updates.counter_offer = counterOffer;

  const { data, error } = await supabase
    .from("venue_bookings")
    .update(updates)
    .eq("id", bookingId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

**Step 8: Create `src/lib/db/notifications.ts`**

```typescript
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getUserNotifications(userId: string, limit = 20) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return data ?? [];
}

export async function markNotificationRead(notificationId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Database unavailable");

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);

  if (error) throw error;
}

export async function createNotification(notification: {
  user_id: string;
  type: string;
  title: string;
  body: string;
  link?: string;
}) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("notifications")
    .insert(notification)
    .select()
    .single();

  if (error) return null;
  return data;
}
```

**Step 9: Create `src/lib/db/messages.ts`**

```typescript
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getUserConversations(userId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("messages")
    .select("*, profiles!messages_sender_id_fkey(display_name, slug, avatar_url)")
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data ?? [];
}

export async function sendMessage(message: {
  sender_id: string;
  receiver_id: string;
  body: string;
  thread_id?: string;
}) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Database unavailable");

  const { data, error } = await supabase
    .from("messages")
    .insert(message)
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

**Step 10: Create `src/lib/db/transactions.ts`**

```typescript
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createTransaction(transaction: {
  user_id: string;
  type: string;
  amount_isk: number;
  description: string;
  event_id?: string;
  paypal_order_id?: string;
}) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Database unavailable");

  const { data, error } = await supabase
    .from("transactions")
    .insert({ ...transaction, status: "completed" })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserTransactions(userId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data ?? [];
}

export async function getPlatformRevenue(period?: { from: string; to: string }) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { total: 0, count: 0 };

  let query = supabase
    .from("transactions")
    .select("amount_isk", { count: "exact" })
    .eq("status", "completed");

  if (period) {
    query = query.gte("created_at", period.from).lte("created_at", period.to);
  }

  const { data, error, count } = await query;
  if (error) return { total: 0, count: 0 };

  const total = (data ?? []).reduce((sum, t) => sum + (t.amount_isk ?? 0), 0);
  return { total, count: count ?? 0 };
}
```

**Step 11: Create `src/lib/db/index.ts`**

```typescript
export * from "./categories";
export * from "./events";
export * from "./groups";
export * from "./venues";
export * from "./profiles";
export * from "./rsvps";
export * from "./bookings";
export * from "./notifications";
export * from "./messages";
export * from "./transactions";
```

**Step 12: Commit**

```bash
git add src/lib/db/
git commit -m "feat: add Supabase data access layer for all entities"
```

---

## Phase 2: Wire Auth to Supabase

### Task 4: Update API Auth Routes to Use Real Supabase Auth

**Files:**
- Modify: `src/app/api/[...path]/route.ts`

**Step 1: Update signup handler**

In the catch-all API route, find the signup handler section. When `hasLiveSupabaseAuth()` is true, use `supabase.auth.signUp()` instead of mock auth. The existing code already has this branching via the `hasLiveSupabaseAuth` check — verify the Supabase path works correctly.

**Step 2: Update login handler**

Similarly, when `hasLiveSupabaseAuth()`, use `supabase.auth.signInWithPassword()`. The session helper `getOrCreateSessionForSupabaseUser()` already handles profile creation.

**Step 3: Update logout handler**

Call `supabase.auth.signOut()` when live auth is active.

**Step 4: Update forgot-password handler**

Use `supabase.auth.resetPasswordForEmail()` with the site URL redirect.

**Step 5: Verify auth flow end-to-end**

Run the dev server, navigate to /signup, create an account, verify the profile appears in the Supabase dashboard profiles table.

**Step 6: Commit**

```bash
git add src/app/api/
git commit -m "feat: wire auth API routes to Supabase Auth"
```

---

### Task 5: Add Auth Middleware for Protected Routes

**Files:**
- Modify: `middleware.ts`

**Step 1: Add Supabase session refresh to middleware**

Update the middleware to refresh the Supabase auth session on every request (required for SSR auth). Use `@supabase/ssr` `createServerClient` with the request/response cookie pattern.

**Step 2: Add route protection**

Redirect unauthenticated users away from `/dashboard`, `/organizer`, `/venue`, `/admin` routes to `/login`. Check the Supabase session in middleware.

**Step 3: Test protected routes**

Navigate to `/dashboard` while logged out — should redirect to `/login`. Log in and navigate again — should show dashboard.

**Step 4: Commit**

```bash
git add middleware.ts
git commit -m "feat: add auth middleware with session refresh and route protection"
```

---

## Phase 3: Wire API Routes to Supabase

### Task 6: Replace Mock Data in API Handlers with Real Supabase Queries

**Files:**
- Modify: `src/app/api/[...path]/route.ts`

**Step 1: Update event API handlers**

Replace mock data returns with calls to `src/lib/db/events.ts` functions. For GET /api/events, call `getEvents()`. For GET /api/events/[slug], call `getEventBySlug()`. For POST /api/events, call `createEvent()`. Keep mock data as fallback when Supabase is unavailable.

**Step 2: Update group API handlers**

Same pattern: replace mock returns with `getGroups()`, `getGroupBySlug()`, `createGroup()`, `joinGroup()`, `leaveGroup()`.

**Step 3: Update venue API handlers**

Replace with `getVenues()`, `getVenueBySlug()`, `createVenue()`, `updateVenue()`.

**Step 4: Update RSVP handlers**

Wire `createRsvp()`, `cancelRsvp()`, `getEventRsvps()`.

**Step 5: Update booking handlers**

Wire `createBooking()`, `getVenueBookings()`, `updateBookingStatus()`.

**Step 6: Update profile handlers**

Wire `getProfileById()`, `updateProfile()`.

**Step 7: Test all API routes**

Use the browser dev tools or curl to verify each endpoint returns data from Supabase.

**Step 8: Commit**

```bash
git add src/app/api/
git commit -m "feat: wire all API routes to Supabase queries"
```

---

## Phase 4: PayPal Integration (env-var gated)

### Task 7: Create PayPal Service Module

**Files:**
- Create: `src/lib/payments/paypal.ts`
- Create: `src/lib/payments/constants.ts`

**Step 1: Create constants**

```typescript
// src/lib/payments/constants.ts
export const TICKET_COMMISSION_RATE = 0.05; // 5%
export const MIN_TICKET_PRICE_ISK = 500;

export const SUBSCRIPTION_PLANS = {
  organizer_plus: { name: "Organizer Plus", price_isk: 2990 },
  organizer_pro: { name: "Organizer Pro", price_isk: 5990 },
  venue_standard: { name: "Venue Standard", price_isk: 9990 },
  venue_premium: { name: "Venue Premium", price_isk: 19990 },
} as const;
```

**Step 2: Create PayPal service**

```typescript
// src/lib/payments/paypal.ts
import { env } from "@/lib/env";
import { TICKET_COMMISSION_RATE, SUBSCRIPTION_PLANS } from "./constants";

export function hasPayPalEnv() {
  return Boolean(env.PAYPAL_CLIENT_ID && env.PAYPAL_CLIENT_SECRET);
}

const PAYPAL_API = process.env.NODE_ENV === "production"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

async function getAccessToken() {
  const auth = Buffer.from(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`).toString("base64");
  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  return data.access_token as string;
}

export async function createTicketOrder(eventSlug: string, tierName: string, amountIsk: number, quantity: number) {
  if (!hasPayPalEnv()) throw new Error("PayPal not configured");

  const token = await getAccessToken();
  const commission = Math.round(amountIsk * quantity * TICKET_COMMISSION_RATE);
  const total = amountIsk * quantity;

  const res = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{
        description: `${tierName} x${quantity} — ${eventSlug}`,
        amount: { currency_code: "ISK", value: String(total) },
        custom_id: JSON.stringify({ eventSlug, tierName, quantity, commission }),
      }],
    }),
  });

  return res.json();
}

export async function captureOrder(orderId: string) {
  if (!hasPayPalEnv()) throw new Error("PayPal not configured");

  const token = await getAccessToken();
  const res = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return res.json();
}

export async function createSubscription(planKey: keyof typeof SUBSCRIPTION_PLANS, userId: string) {
  if (!hasPayPalEnv()) throw new Error("PayPal not configured");
  // Subscription creation requires PayPal billing plans to be set up in the dashboard.
  // This is a placeholder that returns the plan details for client-side SDK rendering.
  return { plan: SUBSCRIPTION_PLANS[planKey], userId };
}

export async function verifyWebhookSignature(headers: Record<string, string>, body: string) {
  if (!hasPayPalEnv() || !env.PAYPAL_WEBHOOK_ID) return false;

  const token = await getAccessToken();
  const res = await fetch(`${PAYPAL_API}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      auth_algo: headers["paypal-auth-algo"],
      cert_url: headers["paypal-cert-url"],
      transmission_id: headers["paypal-transmission-id"],
      transmission_sig: headers["paypal-transmission-sig"],
      transmission_time: headers["paypal-transmission-time"],
      webhook_id: env.PAYPAL_WEBHOOK_ID,
      webhook_event: JSON.parse(body),
    }),
  });

  const data = await res.json();
  return data.verification_status === "SUCCESS";
}
```

**Step 3: Commit**

```bash
git add src/lib/payments/
git commit -m "feat: add PayPal service module with order, subscription, and webhook support"
```

---

### Task 8: Create PayPal API Routes

**Files:**
- Create: `src/app/api/paypal/create-order/route.ts`
- Create: `src/app/api/paypal/capture-order/route.ts`
- Create: `src/app/api/paypal/webhook/route.ts`

**Step 1: Create order endpoint**

```typescript
// src/app/api/paypal/create-order/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createTicketOrder, hasPayPalEnv } from "@/lib/payments/paypal";

export async function POST(request: NextRequest) {
  if (!hasPayPalEnv()) {
    return NextResponse.json({ error: "Payments not configured" }, { status: 503 });
  }

  const body = await request.json();
  const { eventSlug, tierName, amountIsk, quantity } = body;

  if (!eventSlug || !tierName || !amountIsk || !quantity) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const order = await createTicketOrder(eventSlug, tierName, amountIsk, quantity);
    return NextResponse.json(order);
  } catch (error) {
    console.error("PayPal create order error:", error);
    return NextResponse.json({ error: "Payment failed" }, { status: 500 });
  }
}
```

**Step 2: Create capture endpoint**

```typescript
// src/app/api/paypal/capture-order/route.ts
import { NextRequest, NextResponse } from "next/server";
import { captureOrder, hasPayPalEnv } from "@/lib/payments/paypal";
import { createTransaction } from "@/lib/db/transactions";
import { createRsvp } from "@/lib/db/rsvps";
import { getCurrentAppSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  if (!hasPayPalEnv()) {
    return NextResponse.json({ error: "Payments not configured" }, { status: 503 });
  }

  const session = await getCurrentAppSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId } = await request.json();
  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }

  try {
    const capture = await captureOrder(orderId);

    if (capture.status === "COMPLETED") {
      const unit = capture.purchase_units?.[0];
      const customData = JSON.parse(unit?.payments?.captures?.[0]?.custom_id ?? "{}");

      await createTransaction({
        user_id: session.id,
        type: "ticket_purchase",
        amount_isk: parseInt(unit?.amount?.value ?? "0"),
        description: `Ticket: ${customData.tierName} x${customData.quantity}`,
        event_id: customData.eventSlug,
        paypal_order_id: orderId,
      });
    }

    return NextResponse.json(capture);
  } catch (error) {
    console.error("PayPal capture error:", error);
    return NextResponse.json({ error: "Capture failed" }, { status: 500 });
  }
}
```

**Step 3: Create webhook endpoint**

```typescript
// src/app/api/paypal/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature, hasPayPalEnv } from "@/lib/payments/paypal";

export async function POST(request: NextRequest) {
  if (!hasPayPalEnv()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const body = await request.text();
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => { headers[key] = value; });

  const isValid = await verifyWebhookSignature(headers, body);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body);

  switch (event.event_type) {
    case "PAYMENT.CAPTURE.COMPLETED":
      console.log("Payment captured:", event.resource?.id);
      break;
    case "BILLING.SUBSCRIPTION.ACTIVATED":
      console.log("Subscription activated:", event.resource?.id);
      break;
    case "BILLING.SUBSCRIPTION.CANCELLED":
      console.log("Subscription cancelled:", event.resource?.id);
      break;
    default:
      console.log("Unhandled PayPal event:", event.event_type);
  }

  return NextResponse.json({ received: true });
}
```

**Step 4: Commit**

```bash
git add src/app/api/paypal/
git commit -m "feat: add PayPal API routes (create-order, capture, webhook)"
```

---

### Task 9: Create PayPal Checkout Component

**Files:**
- Create: `src/components/payments/paypal-checkout.tsx`
- Create: `src/components/payments/payment-button.tsx`

**Step 1: Create PayPal checkout wrapper**

```typescript
// src/components/payments/paypal-checkout.tsx
"use client";

import { useEffect, useState } from "react";

type PayPalCheckoutProps = {
  eventSlug: string;
  tierName: string;
  amountIsk: number;
  quantity: number;
  onSuccess: (orderId: string) => void;
  onError: (error: string) => void;
};

export function PayPalCheckout({ eventSlug, tierName, amountIsk, quantity, onSuccess, onError }: PayPalCheckoutProps) {
  const [sdkReady, setSdkReady] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=ISK`;
    script.onload = () => setSdkReady(true);
    document.body.appendChild(script);

    return () => { document.body.removeChild(script); };
  }, [clientId]);

  useEffect(() => {
    if (!sdkReady || !(window as any).paypal) return;

    (window as any).paypal.Buttons({
      createOrder: async () => {
        const res = await fetch("/api/paypal/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventSlug, tierName, amountIsk, quantity }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        return data.id;
      },
      onApprove: async (data: { orderID: string }) => {
        const res = await fetch("/api/paypal/capture-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: data.orderID }),
        });
        const capture = await res.json();
        if (capture.status === "COMPLETED") {
          onSuccess(data.orderID);
        } else {
          onError("Payment not completed");
        }
      },
      onError: (err: any) => onError(err.message ?? "Payment failed"),
    }).render("#paypal-button-container");
  }, [sdkReady, eventSlug, tierName, amountIsk, quantity, onSuccess, onError]);

  if (!clientId) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">
        Payments coming soon
      </div>
    );
  }

  return <div id="paypal-button-container" />;
}
```

**Step 2: Create generic payment button**

```typescript
// src/components/payments/payment-button.tsx
"use client";

import { useState } from "react";

type PaymentButtonProps = {
  label: string;
  disabled?: boolean;
  onClick: () => Promise<void>;
};

export function PaymentButton({ label, disabled, onClick }: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);

  return (
    <button
      onClick={async () => {
        setLoading(true);
        try { await onClick(); }
        finally { setLoading(false); }
      }}
      disabled={disabled || loading}
      className="w-full rounded-lg px-4 py-3 font-semibold text-white transition-colors"
      style={{ backgroundColor: loading ? "#9ca3af" : "#4f46e5" }}
    >
      {loading ? "Processing..." : label}
    </button>
  );
}
```

**Step 3: Commit**

```bash
git add src/components/payments/
git commit -m "feat: add PayPal checkout and payment button components"
```

---

## Phase 5: Email System (env-var gated)

### Task 10: Create Resend Email Service

**Files:**
- Create: `src/lib/email/resend.ts`
- Create: `src/lib/email/templates.ts`

**Step 1: Create Resend service**

```typescript
// src/lib/email/resend.ts
import { env } from "@/lib/env";

export function hasResendEnv() {
  return Boolean(env.RESEND_API_KEY);
}

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail(payload: EmailPayload) {
  if (!hasResendEnv()) {
    console.log("[Email] Would send:", payload.subject, "to", payload.to);
    return { id: "mock-" + Date.now() };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "MeetupReykjavik <noreply@meetupreykjavik.com>",
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    console.error("[Email] Failed:", error);
    throw new Error(`Email send failed: ${res.status}`);
  }

  return res.json();
}
```

**Step 2: Create email templates**

```typescript
// src/lib/email/templates.ts
const baseStyle = `
  font-family: 'DM Sans', -apple-system, sans-serif;
  max-width: 600px; margin: 0 auto; padding: 40px 20px;
  color: #2a2638; background: #ffffff;
`;

const buttonStyle = `
  display: inline-block; padding: 12px 24px; border-radius: 8px;
  background-color: #4f46e5; color: #ffffff; text-decoration: none;
  font-weight: 600; font-size: 16px;
`;

function wrap(content: string) {
  return `<!DOCTYPE html><html><body style="${baseStyle}">${content}<hr style="margin-top:40px;border:none;border-top:1px solid #e5e5e5"/><p style="font-size:12px;color:#9ca3af;text-align:center">MeetupReykjavik — Connecting Reykjavik's community</p></body></html>`;
}

export function welcomeEmail(displayName: string) {
  return {
    subject: "Welcome to MeetupReykjavik!",
    html: wrap(`
      <h1 style="font-size:28px;margin-bottom:16px">Welcome, ${displayName}!</h1>
      <p>You're now part of Reykjavik's community platform. Discover events, join groups, and connect with locals.</p>
      <p style="margin-top:24px"><a href="https://meetupreykjavik.vercel.app/events" style="${buttonStyle}">Browse Events</a></p>
    `),
  };
}

export function rsvpConfirmationEmail(displayName: string, eventTitle: string, eventDate: string, eventSlug: string) {
  return {
    subject: `You're going to ${eventTitle}!`,
    html: wrap(`
      <h1 style="font-size:24px;margin-bottom:16px">See you there, ${displayName}!</h1>
      <p>You've confirmed your spot at <strong>${eventTitle}</strong> on ${eventDate}.</p>
      <p style="margin-top:24px"><a href="https://meetupreykjavik.vercel.app/events/${eventSlug}" style="${buttonStyle}">View Event Details</a></p>
    `),
  };
}

export function eventReminderEmail(displayName: string, eventTitle: string, eventDate: string, eventSlug: string) {
  return {
    subject: `Reminder: ${eventTitle} is tomorrow!`,
    html: wrap(`
      <h1 style="font-size:24px;margin-bottom:16px">Don't forget, ${displayName}!</h1>
      <p><strong>${eventTitle}</strong> is happening tomorrow, ${eventDate}.</p>
      <p style="margin-top:24px"><a href="https://meetupreykjavik.vercel.app/events/${eventSlug}" style="${buttonStyle}">Event Details</a></p>
    `),
  };
}

export function passwordResetEmail(resetUrl: string) {
  return {
    subject: "Reset your password",
    html: wrap(`
      <h1 style="font-size:24px;margin-bottom:16px">Password Reset</h1>
      <p>Click the button below to reset your password. This link expires in 1 hour.</p>
      <p style="margin-top:24px"><a href="${resetUrl}" style="${buttonStyle}">Reset Password</a></p>
      <p style="margin-top:16px;font-size:13px;color:#6b7280">If you didn't request this, you can safely ignore this email.</p>
    `),
  };
}

export function weeklyDigestEmail(displayName: string, eventCount: number, topEvents: { title: string; slug: string; date: string }[]) {
  const eventList = topEvents.map(e =>
    `<li style="margin-bottom:8px"><a href="https://meetupreykjavik.vercel.app/events/${e.slug}" style="color:#4f46e5;text-decoration:none"><strong>${e.title}</strong></a> — ${e.date}</li>`
  ).join("");

  return {
    subject: `This week in Reykjavik: ${eventCount} events`,
    html: wrap(`
      <h1 style="font-size:24px;margin-bottom:16px">Hey ${displayName}, here's what's happening</h1>
      <p>${eventCount} events this week in Reykjavik:</p>
      <ul style="padding-left:20px;margin-top:16px">${eventList}</ul>
      <p style="margin-top:24px"><a href="https://meetupreykjavik.vercel.app/events" style="${buttonStyle}">See All Events</a></p>
    `),
  };
}
```

**Step 3: Commit**

```bash
git add src/lib/email/
git commit -m "feat: add Resend email service with 5 HTML templates"
```

---

## Phase 6: Frontend Polish

### Task 11: Audit and Fix Tailwind v4 Color Bug

**Files:**
- Modify: Multiple component files

**Step 1: Find all instances**

Search the codebase for `text-[var(--brand` and `text-[#` patterns. These are ambiguous in Tailwind v4 and may silently fail.

```bash
grep -rn "text-\[var(--brand" src/ --include="*.tsx"
grep -rn "text-\[#" src/ --include="*.tsx"
```

**Step 2: Replace each instance with inline styles**

For each match, replace the Tailwind class with `style={{ color: "..." }}`. Use the actual color value from globals.css.

Color reference:
- `--brand-indigo`: `#4f46e5`
- `--brand-coral`: `#e8614d`
- `--brand-sand`: `#f5f0e8`
- `--brand-sage`: `#7c9a82`
- `--brand-basalt`: `#1e1b2e`
- `--brand-text`: `#2a2638`
- `--brand-muted`: `#6e6a7a`

**Step 3: Also check `bg-[var(--brand` patterns**

Same ambiguity can apply to background colors.

**Step 4: Commit**

```bash
git add -A
git commit -m "fix: replace all Tailwind v4 ambiguous color classes with inline styles"
```

---

### Task 12: Add Leaflet Maps to Venue Detail Pages

**Files:**
- Create: `src/components/maps/venue-map.tsx`
- Modify: `src/components/public/public-pages.tsx` (venue detail section)

**Step 1: Create dynamic map component**

```typescript
// src/components/maps/venue-map.tsx
"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

const MapContainer = dynamic(
  () => import("react-leaflet").then(mod => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then(mod => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then(mod => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then(mod => mod.Popup),
  { ssr: false }
);

type VenueMapProps = {
  latitude: number;
  longitude: number;
  name: string;
  address: string;
};

export default function VenueMap({ latitude, longitude, name, address }: VenueMapProps) {
  const position = useMemo(() => [latitude, longitude] as [number, number], [latitude, longitude]);

  return (
    <div style={{ height: 300, width: "100%", borderRadius: 12, overflow: "hidden" }}>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />
      <MapContainer center={position} zoom={15} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            <strong>{name}</strong><br />{address}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
```

**Step 2: Import VenueMap into venue detail section**

In `public-pages.tsx`, find the VenueDetailScreen component. Add the map below the venue info section, conditionally rendering when coordinates exist:

```tsx
{venue.coordinates && (
  <VenueMap
    latitude={venue.coordinates.lat}
    longitude={venue.coordinates.lng}
    name={venue.name}
    address={venue.address}
  />
)}
```

**Step 3: Test with a venue that has coordinates**

Navigate to a venue detail page and verify the map renders with a pin.

**Step 4: Commit**

```bash
git add src/components/maps/ src/components/public/public-pages.tsx
git commit -m "feat: add Leaflet OpenStreetMap to venue detail pages"
```

---

### Task 13: Complete Icelandic Translations

**Files:**
- Modify: `messages/is.json`

**Step 1: Audit missing translations**

Compare `messages/en.json` and `messages/is.json` key by key. Identify any keys present in EN but missing or still in English in IS.

**Step 2: Translate all remaining strings**

Complete all Icelandic translations. Focus on:
- Navigation labels
- Button text
- Form labels and placeholders
- Error messages
- Page headings and descriptions
- Footer text

**Step 3: Test locale switching**

Navigate to the site, switch locale to Icelandic, verify all visible text is translated.

**Step 4: Commit**

```bash
git add messages/is.json
git commit -m "feat: complete Icelandic translations for all UI strings"
```

---

### Task 14: Mobile Responsive Audit and Fixes

**Files:**
- Modify: Various component files as needed

**Step 1: Test all pages at mobile viewport (375px)**

Systematically check each page:
- Homepage
- Events listing and detail
- Groups listing and detail
- Venues listing and detail
- About, Pricing, Blog, Contact, FAQ
- Login, Signup
- Dashboard pages

**Step 2: Fix layout issues**

Common fixes:
- Grid columns: ensure responsive grid classes (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`)
- Hero text sizes: scale down on mobile
- Padding/margins: reduce on mobile
- Navigation: verify mobile menu works
- Card layouts: stack on mobile
- Tables: horizontal scroll wrapper on mobile

**Step 3: Test at tablet viewport (768px)**

Verify intermediate breakpoint looks good.

**Step 4: Commit**

```bash
git add -A
git commit -m "fix: mobile responsive layout fixes across all pages"
```

---

### Task 15: Add Loading Skeleton States

**Files:**
- Create: `src/components/ui/skeleton.tsx`
- Modify: Page components that fetch data

**Step 1: Create skeleton component**

```typescript
// src/components/ui/skeleton.tsx
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gray-200 ${className}`}
      style={{ minHeight: 20 }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4">
      <Skeleton className="mb-4 h-48 w-full" />
      <Skeleton className="mb-2 h-5 w-3/4" />
      <Skeleton className="mb-2 h-4 w-1/2" />
      <Skeleton className="h-4 w-1/3" />
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
```

**Step 2: Add Suspense boundaries to pages that fetch data**

Wrap data-dependent sections in `<Suspense fallback={<CardGridSkeleton />}>`.

**Step 3: Commit**

```bash
git add src/components/ui/skeleton.tsx
git commit -m "feat: add skeleton loading states for data-fetching pages"
```

---

## Phase 7: Wire Public Pages to Live Data

### Task 16: Create Data Fetching Wrappers with Mock Fallback

**Files:**
- Create: `src/lib/data.ts`

**Step 1: Create unified data layer**

This file provides functions that try Supabase first, fall back to mock data. This is the bridge between the existing static pages and live data.

```typescript
// src/lib/data.ts
import { hasSupabaseEnv } from "@/lib/env";
import * as db from "@/lib/db";
import { publicEvents, publicGroups, publicVenues, getEventBySlug as getMockEvent, getGroupBySlug as getMockGroup, getVenueBySlug as getMockVenue } from "@/lib/public-data";

export async function fetchEvents(options?: { category?: string; limit?: number }) {
  if (!hasSupabaseEnv()) return publicEvents.slice(0, options?.limit);
  const { data } = await db.getEvents(options);
  return data.length > 0 ? data : publicEvents.slice(0, options?.limit);
}

export async function fetchEventBySlug(slug: string) {
  if (!hasSupabaseEnv()) return getMockEvent(slug);
  const event = await db.getEventBySlug(slug);
  return event ?? getMockEvent(slug);
}

export async function fetchGroups(options?: { limit?: number }) {
  if (!hasSupabaseEnv()) return publicGroups.slice(0, options?.limit);
  const groups = await db.getGroups(options);
  return groups.length > 0 ? groups : publicGroups.slice(0, options?.limit);
}

export async function fetchGroupBySlug(slug: string) {
  if (!hasSupabaseEnv()) return getMockGroup(slug);
  const group = await db.getGroupBySlug(slug);
  return group ?? getMockGroup(slug);
}

export async function fetchVenues(options?: { limit?: number }) {
  if (!hasSupabaseEnv()) return publicVenues.slice(0, options?.limit);
  const venues = await db.getVenues(options);
  return venues.length > 0 ? venues : publicVenues.slice(0, options?.limit);
}

export async function fetchVenueBySlug(slug: string) {
  if (!hasSupabaseEnv()) return getMockVenue(slug);
  const venue = await db.getVenueBySlug(slug);
  return venue ?? getMockVenue(slug);
}

export async function fetchCategories() {
  if (!hasSupabaseEnv()) return [];
  return db.getCategories();
}
```

**Step 2: Update page components to use the new data layer**

Replace direct imports of `publicEvents`, `publicGroups`, `publicVenues` in page files with calls to `fetchEvents()`, `fetchGroups()`, `fetchVenues()`.

**Step 3: Test with Supabase connected**

With env vars set, verify pages attempt to fetch from Supabase (will show empty until seeded). Without env vars, verify mock data still renders.

**Step 4: Commit**

```bash
git add src/lib/data.ts
git commit -m "feat: add unified data layer with Supabase-first, mock-fallback pattern"
```

---

### Task 17: Seed Supabase with Initial Content

**Files:**
- Create: `scripts/seed.ts`

**Step 1: Create seed script**

Build a script that reads from `src/lib/public-data.ts` and inserts the mock data into Supabase. This populates the live database with the 12 events, 8 groups, and 30 venues.

The seed script should:
1. Create a system admin profile (for owning seeded content)
2. Insert all categories (if not already seeded from Task 2)
3. Insert all venues
4. Insert all groups
5. Insert all events

**Step 2: Run the seed script**

```bash
npx tsx scripts/seed.ts
```

**Step 3: Verify in Supabase dashboard**

Check that events, groups, and venues tables have data.

**Step 4: Commit**

```bash
git add scripts/seed.ts
git commit -m "feat: add database seed script from mock data"
```

---

### Task 18: Update Public Page Components to Use Live Data

**Files:**
- Modify: `src/app/(public)/events/page.tsx`
- Modify: `src/app/(public)/events/[slug]/page.tsx`
- Modify: `src/app/(public)/groups/page.tsx`
- Modify: `src/app/(public)/groups/[slug]/page.tsx`
- Modify: `src/app/(public)/venues/page.tsx`
- Modify: `src/app/(public)/venues/[slug]/page.tsx`
- Modify: `src/components/home/home-page.tsx`

**Step 1: Update each page file**

Replace static data imports with async calls to `src/lib/data.ts`. Since these are Server Components in Next.js App Router, they can `await` directly.

Example for events page:
```tsx
import { fetchEvents } from "@/lib/data";

export default async function EventsPage() {
  const events = await fetchEvents();
  return <EventsScreen events={events} />;
}
```

**Step 2: Adapt component props if needed**

The live data shape from Supabase may differ slightly from mock data types. Create adapter functions in `src/lib/data.ts` if needed to map Supabase rows to the existing component prop shapes.

**Step 3: Test all pages**

Navigate through all public pages, verify data renders correctly from Supabase.

**Step 4: Commit**

```bash
git add src/app/ src/components/ src/lib/data.ts
git commit -m "feat: wire all public pages to live Supabase data with mock fallback"
```

---

## Phase 8: SEO & Final Polish

### Task 19: Generate Dynamic Sitemap and robots.txt

**Files:**
- Create: `src/app/sitemap.ts`
- Create: `src/app/robots.ts`

**Step 1: Create sitemap**

```typescript
// src/app/sitemap.ts
import type { MetadataRoute } from "next";
import { fetchEvents, fetchGroups, fetchVenues } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://meetupreykjavik.vercel.app";

  const staticPages = [
    "", "/events", "/groups", "/venues", "/about", "/pricing",
    "/blog", "/contact", "/faq", "/privacy", "/terms",
    "/for-venues", "/for-organizers", "/categories",
  ].map(path => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const events = await fetchEvents({ limit: 100 });
  const eventPages = (Array.isArray(events) ? events : []).map((e: any) => ({
    url: `${baseUrl}/events/${e.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  const groups = await fetchGroups({ limit: 100 });
  const groupPages = (Array.isArray(groups) ? groups : []).map((g: any) => ({
    url: `${baseUrl}/groups/${g.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const venues = await fetchVenues({ limit: 100 });
  const venuePages = (Array.isArray(venues) ? venues : []).map((v: any) => ({
    url: `${baseUrl}/venues/${v.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...eventPages, ...groupPages, ...venuePages];
}
```

**Step 2: Create robots.txt**

```typescript
// src/app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard/", "/organizer/", "/venue/", "/admin/"],
    },
    sitemap: "https://meetupreykjavik.vercel.app/sitemap.xml",
  };
}
```

**Step 3: Verify**

Run dev server and check `/sitemap.xml` and `/robots.txt` return correct content.

**Step 4: Commit**

```bash
git add src/app/sitemap.ts src/app/robots.ts
git commit -m "feat: add dynamic sitemap.xml and robots.txt"
```

---

### Task 20: Final Integration Test

**Step 1: Verify all public pages render with live data**

Navigate through every page and confirm no errors, data displays correctly.

**Step 2: Test auth flow end-to-end**

Sign up → verify email (if configured) → log in → see dashboard → log out.

**Step 3: Test RSVP flow**

Log in → go to event → click RSVP → verify it's recorded in the database.

**Step 4: Verify PayPal graceful degradation**

Without PayPal env vars, verify "Payments coming soon" message appears. No errors.

**Step 5: Verify email graceful degradation**

Without Resend env vars, verify emails log to console. No errors.

**Step 6: Test Icelandic locale**

Switch to IS locale, navigate through pages, verify translations.

**Step 7: Test mobile viewport**

Check all pages at 375px width.

**Step 8: Final commit**

```bash
git add -A
git commit -m "chore: final integration verification pass"
```

---

## Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| 1 | 1-3 | Supabase connection, schema deployment, data access layer |
| 2 | 4-5 | Wire auth to Supabase, add middleware protection |
| 3 | 6 | Replace mock data in API routes with Supabase queries |
| 4 | 7-9 | PayPal service, API routes, checkout component |
| 5 | 10 | Resend email service with HTML templates |
| 6 | 11-15 | Tailwind fix, Leaflet maps, i18n, mobile, skeletons |
| 7 | 16-18 | Data layer, seed script, wire public pages |
| 8 | 19-20 | Sitemap, robots.txt, final integration test |
