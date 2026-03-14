import { hasSupabaseEnv } from "@/lib/env";
import { getEvents } from "@/lib/db/events";
import { getGroups, getGroupBySlug } from "@/lib/db/groups";
import { getVenues, getVenueBySlug } from "@/lib/db/venues";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSceneCoverDataUrl } from "@/lib/visuals";
import {
  publicEvents,
  publicGroups,
  publicVenues,
  getEventBySlug as getMockEvent,
  getGroupBySlug as getMockGroup,
  getVenueBySlug as getMockVenue,
  type PublicEvent,
  type PublicGroup,
  type PublicVenue,
} from "@/lib/public-data";

/** Returns the photo if it's a real unique image, otherwise null. */
function realPhoto(url: unknown): string | null {
  if (typeof url !== "string" || !url) return null;
  if (url.includes("hallgrimskirkja")) return null;
  return url;
}

// ── Mappers: DB rows with joins → public presentation types ──

function mapDbEventToPublic(row: Record<string, unknown>): PublicEvent {
  const venue = row.venues as Record<string, unknown> | null;
  const host = row.profiles as Record<string, unknown> | null;
  const category = row.categories as Record<string, unknown> | null;
  const group = row.groups as Record<string, unknown> | null;

  const isFree = row.is_free !== false;
  // Enrich with mock data when DB has sparse/placeholder content
  const eventSlug = row.slug as string;
  const mockEvent = getMockEvent(eventSlug);

  const ageRaw = row.age_restriction as string | null;
  const ageMin = row.age_min as number | null;
  const ageMax = row.age_max as number | null;
  // Derive age label: DB fields → age_min/max → mock fallback → "All ages"
  let ageLabel: string;
  if (ageRaw && ageRaw !== "none") {
    ageLabel = ageRaw;
  } else if (ageMin && ageMax) {
    ageLabel = `${ageMin}–${ageMax}`;
  } else if (ageMin) {
    ageLabel = `${ageMin}+`;
  } else if (mockEvent?.ageLabel && mockEvent.ageLabel !== "All ages") {
    ageLabel = mockEvent.ageLabel;
  } else {
    ageLabel = "All ages";
  }

  // Map event_ratings / venue_reviews joined data if present
  const rawRatings = Array.isArray(row.event_ratings) ? row.event_ratings : [];
  const ratings = (rawRatings as Record<string, unknown>[]).map((r) => ({
    author: (r.reviewer_name as string) ?? (r.display_name as string) ?? "Anonymous",
    rating: (r.rating as number) ?? 5,
    text: (r.text as string) ?? "",
  }));

  const rawComments = Array.isArray(row.event_comments) ? row.event_comments : [];
  const comments = (rawComments as Record<string, unknown>[]).map((c) => ({
    author: (c.author_name as string) ?? (c.display_name as string) ?? "Anonymous",
    text: (c.text as string) ?? "",
    postedAt: (c.created_at as string) ?? new Date().toISOString(),
  }));
  const dbDesc = (row.description as string) ?? "";
  const isGenericEventDesc = !dbDesc || dbDesc.length < 30;

  return {
    slug: eventSlug,
    title: row.title as string,
    category: (category?.name_en as string) ?? mockEvent?.category ?? "Social",
    eventType: (row.event_type as PublicEvent["eventType"]) ?? "in_person",
    dateFilter: getDateFilter(row.starts_at as string),
    startsAt: row.starts_at as string,
    endsAt: (row.ends_at as string) ?? (row.starts_at as string),
    venueName: (venue?.name as string) ?? (row.venue_name as string) ?? mockEvent?.venueName ?? "",
    venueSlug: (venue?.slug as string) ?? mockEvent?.venueSlug ?? "",
    groupName: (group?.name as string) ?? mockEvent?.groupName ?? "",
    groupSlug: (group?.slug as string) ?? mockEvent?.groupSlug ?? "",
    hostName: (host?.display_name as string) ?? mockEvent?.hostName ?? "",
    area: (venue?.city as string) ?? mockEvent?.area ?? "Reykjavik",
    summary: isGenericEventDesc && mockEvent ? mockEvent.summary : dbDesc.slice(0, 200),
    description: isGenericEventDesc && mockEvent ? mockEvent.description : (dbDesc ? [dbDesc] : []),
    attendees: (row.rsvp_count as number) ?? mockEvent?.attendees ?? 0,
    capacity: (row.attendee_limit as number) ?? mockEvent?.capacity ?? 50,
    priceLabel: isFree ? (mockEvent?.priceLabel ?? "Free") : (mockEvent?.priceLabel ?? "Paid"),
    ageLabel,
    isFree,
    visibilityLabel: (row.visibility_mode as string) ?? mockEvent?.visibilityLabel ?? "public",
    approvalLabel: (row.rsvp_mode as string) ?? mockEvent?.approvalLabel ?? "open",
    reminderLabel: (row.reminder_policy as string) ?? mockEvent?.reminderLabel ?? "24h before",
    hostContact: (row.host_contact as string) ?? mockEvent?.hostContact ?? "",
    shareLabel: "Share this event",
    art:
      realPhoto(row.featured_photo_url) ??
      mockEvent?.art ??
      createSceneCoverDataUrl(row.title as string, (category?.name_en as string) ?? "Event"),
    gallery: (Array.isArray(row.gallery_photos) && (row.gallery_photos as string[]).length > 0)
      ? (row.gallery_photos as string[])
      : mockEvent?.gallery ?? [],
    comments: comments.length > 0 ? comments : mockEvent?.comments ?? [],
    ratings: ratings.length > 0 ? ratings : mockEvent?.ratings ?? [],
  };
}

function mapDbGroupToPublic(
  row: Record<string, unknown>,
  eventSlugs?: string[],
): PublicGroup {
  const organizer = row.profiles as Record<string, unknown> | null;

  // Extract discussions from join if present
  const rawDiscussions = Array.isArray(row.discussions) ? row.discussions : [];
  const discussions = (rawDiscussions as Record<string, unknown>[]).map((d) => ({
    title: (d.title as string) ?? "",
    replies: (d.reply_count as number) ?? 0,
    preview: ((d.content as string) ?? "").slice(0, 100),
  }));

  // Enrich with mock data if DB has generic/placeholder content
  const slug = row.slug as string;
  const mockFallback = getMockGroup(slug);
  const dbDesc = (row.description as string) ?? "";
  const groupName = (row.name as string) ?? "";
  const isGenericDesc =
    !dbDesc ||
    dbDesc.length < 30 ||
    /community group in/i.test(dbDesc) ||
    /— community group/i.test(dbDesc) ||
    dbDesc.toLowerCase().startsWith(groupName.toLowerCase());

  return {
    slug,
    name: groupName,
    category:
      ((row.categories as Record<string, unknown> | null)?.name_en as string) ??
      mockFallback?.category ??
      "Social",
    members: (row.member_count as number) ?? mockFallback?.members ?? 0,
    activity: (row.activity_score as number) ?? 50,
    summary: isGenericDesc && mockFallback ? mockFallback.summary : dbDesc.slice(0, 200),
    description: isGenericDesc && mockFallback ? mockFallback.description : (dbDesc ? [dbDesc] : []),
    organizer: (organizer?.display_name as string) ?? mockFallback?.organizer ?? "",
    banner:
      realPhoto(row.banner_url) ??
      mockFallback?.banner ??
      createSceneCoverDataUrl(row.name as string, "Group"),
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : mockFallback?.tags ?? [],
    upcomingEventSlugs: eventSlugs ?? [],
    pastEvents: [],
    discussions,
  };
}

function mapDbVenueToPublic(
  row: Record<string, unknown>,
  eventSlugs?: string[],
): PublicVenue {
  // Extract deal text from venue_deals join if present
  const rawDeals = Array.isArray(row.venue_deals) ? row.venue_deals : [];
  const activeDeal = (rawDeals as Record<string, unknown>[]).find(
    (d) => d.is_active !== false,
  );
  const dealText = activeDeal
    ? (activeDeal.title as string) ?? (activeDeal.description as string) ?? ""
    : "";

  // Extract hours from venue_availability join if present
  const rawAvail = Array.isArray(row.venue_availability) ? row.venue_availability : [];
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const trimTime = (t: string) => t?.replace(/:00$/, "") ?? t; // "19:00:00" → "19:00"

  // Group by day and merge overlapping time slots
  const daySlots = new Map<number, { start: string; end: string }[]>();
  for (const a of rawAvail as Record<string, unknown>[]) {
    if (a.is_blocked === true) continue;
    const day = (a.day_of_week as number) ?? 0;
    const start = (a.start_time as string) ?? "12:00:00";
    const end = (a.end_time as string) ?? "23:00:00";
    if (!daySlots.has(day)) daySlots.set(day, []);
    daySlots.get(day)!.push({ start, end });
  }

  const hours: { day: string; open: string; highlighted?: boolean }[] = [];
  for (const [day, slots] of daySlots) {
    // Sort by start time and merge overlapping ranges
    slots.sort((a, b) => a.start.localeCompare(b.start));
    const merged: { start: string; end: string }[] = [];
    for (const slot of slots) {
      const last = merged[merged.length - 1];
      if (last && slot.start <= last.end) {
        last.end = slot.end > last.end ? slot.end : last.end;
      } else {
        merged.push({ ...slot });
      }
    }
    const range = merged.map((s) => `${trimTime(s.start)} – ${trimTime(s.end)}`).join(", ");
    hours.push({
      day: dayNames[day] ?? "Monday",
      open: range,
      highlighted: day === new Date().getDay(),
    });
  }
  // Sort by day of week (Monday first) and deduplicate same-day entries
  hours.sort((a, b) => {
    const order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    return order.indexOf(a.day) - order.indexOf(b.day);
  });
  // Merge any duplicate day entries (can happen with mixed day_of_week encodings)
  const dedupedHours: typeof hours = [];
  for (const h of hours) {
    const existing = dedupedHours.find((d) => d.day === h.day);
    if (existing) {
      existing.open = `${existing.open}, ${h.open}`;
    } else {
      dedupedHours.push({ ...h });
    }
  }
  hours.length = 0;
  hours.push(...dedupedHours);

  // Enrich with mock data when DB has sparse content
  const venueSlug = row.slug as string;
  const mockVenue = getMockVenue(venueSlug);
  const dbVenueDesc = (row.description as string) ?? "";
  const isGenericVenueDesc = !dbVenueDesc || dbVenueDesc.length < 30;

  return {
    slug: venueSlug,
    name: row.name as string,
    type: (row.type as string) ?? mockVenue?.type ?? "bar",
    area: (row.city as string) ?? mockVenue?.area ?? "Reykjavik",
    capacity:
      (row.capacity_total as number) ??
      (row.capacity_standing as number) ??
      mockVenue?.capacity ??
      0,
    rating: (row.avg_rating as number) ?? mockVenue?.rating ?? 0,
    summary: isGenericVenueDesc && mockVenue ? mockVenue.summary : dbVenueDesc.slice(0, 200),
    description: isGenericVenueDesc && mockVenue ? mockVenue.description : (dbVenueDesc ? [dbVenueDesc] : []),
    address: (row.address as string) ?? mockVenue?.address ?? "",
    amenities: (Array.isArray(row.amenities) && (row.amenities as string[]).length > 0)
      ? (row.amenities as string[])
      : mockVenue?.amenities ?? [],
    hours: hours.length > 0 ? hours : mockVenue?.hours ?? [],
    deal: dealText || mockVenue?.deal || "",
    upcomingEventSlugs: eventSlugs ?? mockVenue?.upcomingEventSlugs ?? [],
    gallery: (Array.isArray(row.photos) && (row.photos as string[]).length > 0)
      ? (row.photos as string[])
      : mockVenue?.gallery ?? [],
    art:
      realPhoto(row.hero_photo_url) ??
      mockVenue?.art ??
      createSceneCoverDataUrl(row.name as string, "Venue"),
    latitude: (row.latitude as number) ?? mockVenue?.latitude ?? undefined,
    longitude: (row.longitude as number) ?? mockVenue?.longitude ?? undefined,
  };
}

function getDateFilter(startsAt: string): PublicEvent["dateFilter"] {
  const start = new Date(startsAt);
  const now = new Date();
  const diff = start.getTime() - now.getTime();
  const days = diff / (1000 * 60 * 60 * 24);

  if (days < 1) return "Today";
  if (days < 7) return "This Week";
  if (start.getDay() === 0 || start.getDay() === 6) return "Weekend";
  return "Month";
}

// ── Helper queries for related data ──

async function getUpcomingEventSlugsForVenue(venueId: string): Promise<string[]> {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return [];
    const { data } = await supabase
      .from("events")
      .select("slug")
      .eq("venue_id", venueId)
      .eq("status", "published")
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(10);
    return (data ?? []).map((e) => e.slug);
  } catch {
    return [];
  }
}

async function getUpcomingEventSlugsForGroup(groupId: string): Promise<string[]> {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return [];
    const { data } = await supabase
      .from("events")
      .select("slug")
      .eq("group_id", groupId)
      .eq("status", "published")
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(10);
    return (data ?? []).map((e) => e.slug);
  } catch {
    return [];
  }
}

/**
 * Batch-fetch the next upcoming event slug for each group in a single query.
 * Returns a Map from group_id → [slug, ...].
 */
async function getUpcomingEventSlugsByGroup(
  groupIds: string[],
): Promise<Map<string, string[]>> {
  const result = new Map<string, string[]>();
  if (groupIds.length === 0) return result;

  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return result;
    const { data } = await supabase
      .from("events")
      .select("slug, group_id")
      .in("group_id", groupIds)
      .eq("status", "published")
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true });
    for (const row of data ?? []) {
      const gid = row.group_id as string;
      const existing = result.get(gid) ?? [];
      existing.push(row.slug);
      result.set(gid, existing);
    }
  } catch {
    // Ignore — returns empty map
  }
  return result;
}

/**
 * Compute activity score for a group based on upcoming event count + member count.
 * Returns a percentage 0-100.
 */
function computeGroupActivity(
  memberCount: number,
  upcomingEventCount: number,
): number {
  if (memberCount === 0 && upcomingEventCount === 0) return 0;
  // Base 20 for existing groups
  let score = 20;
  // +15 per upcoming event (capped at 45 for 3+ events)
  score += Math.min(45, upcomingEventCount * 15);
  // Member scale: larger communities get a boost (log scale)
  if (memberCount > 0) {
    score += Math.min(20, Math.round(Math.log2(memberCount) * 2.5));
  }
  // Event density bonus: events per 100 members
  if (memberCount > 0 && upcomingEventCount > 0) {
    const density = (upcomingEventCount / memberCount) * 100;
    score += Math.min(15, Math.round(density * 5));
  }
  return Math.min(100, score);
}

async function getEventBySlugWithRatings(slug: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("events")
    .select(`
      *,
      venues (*),
      profiles:host_id (*),
      categories (*),
      ticket_tiers (*),
      event_ratings ( id, rating, text, created_at, profiles:user_id ( display_name ) ),
      event_comments ( id, text, created_at, profiles:user_id ( display_name ) )
    `)
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Failed to fetch event with ratings:", error);
    return null;
  }

  // Flatten the nested profile join for ratings/comments
  if (data) {
    const row = data as Record<string, unknown>;
    if (Array.isArray(row.event_ratings)) {
      row.event_ratings = (row.event_ratings as Record<string, unknown>[]).map((r) => ({
        ...r,
        reviewer_name: (r.profiles as Record<string, unknown> | null)?.display_name ?? "Anonymous",
      }));
    }
    if (Array.isArray(row.event_comments)) {
      row.event_comments = (row.event_comments as Record<string, unknown>[]).map((c) => ({
        ...c,
        author_name: (c.profiles as Record<string, unknown> | null)?.display_name ?? "Anonymous",
      }));
    }
  }

  return data;
}

// ── Public data fetchers (try real DB first, fall back to mock) ──

export async function fetchEvents(options?: {
  category?: string;
  limit?: number;
}) {
  if (hasSupabaseEnv()) {
    try {
      const result = await getEvents({
        category: options?.category,
        limit: options?.limit ?? 20,
        status: "published",
      });
      if (result.data.length > 0) {
        const dbEvents = result.data.map((row) =>
          mapDbEventToPublic(row as unknown as Record<string, unknown>),
        );
        // Merge in mock events that aren't in the DB (e.g. demo/seed events)
        const dbSlugs = new Set(dbEvents.map((e) => e.slug));
        const missingMocks = publicEvents.filter((e) => !dbSlugs.has(e.slug));
        return [...dbEvents, ...missingMocks].slice(0, options?.limit ?? 50);
      }
    } catch {
      // Fall through to mock data
    }
  }
  return publicEvents.slice(0, options?.limit);
}

export async function fetchEventBySlug(slug: string) {
  if (hasSupabaseEnv()) {
    try {
      const row = await getEventBySlugWithRatings(slug);
      if (row) {
        return mapDbEventToPublic(row as unknown as Record<string, unknown>);
      }
    } catch {
      // Fall through to mock
    }
  }
  return getMockEvent(slug);
}

export async function fetchGroups(options?: { limit?: number }) {
  if (hasSupabaseEnv()) {
    try {
      const rows = await getGroups({ limit: options?.limit ?? 20 });
      if (rows.length > 0) {
        // Batch-fetch upcoming events for all groups in one query
        const groupIds = rows.map((r) => (r as unknown as Record<string, unknown>).id as string).filter(Boolean);
        const eventsByGroup = await getUpcomingEventSlugsByGroup(groupIds);

        return rows.map((row) => {
          const r = row as unknown as Record<string, unknown>;
          const gid = r.id as string;
          const eventSlugs = eventsByGroup.get(gid) ?? [];
          const mapped = mapDbGroupToPublic(r, eventSlugs);
          // Compute real activity if DB doesn't have it
          if (!r.activity_score) {
            mapped.activity = computeGroupActivity(mapped.members, eventSlugs.length);
          }
          return mapped;
        });
      }
    } catch {
      // Fall through to mock
    }
  }
  return publicGroups.slice(0, options?.limit);
}

export async function fetchGroupBySlug(slug: string) {
  if (hasSupabaseEnv()) {
    try {
      const row = await getGroupBySlug(slug);
      if (row) {
        // Query upcoming events for this group
        const eventSlugs = await getUpcomingEventSlugsForGroup(
          (row as Record<string, unknown>).id as string,
        );
        return mapDbGroupToPublic(
          row as unknown as Record<string, unknown>,
          eventSlugs,
        );
      }
    } catch {
      // Fall through to mock
    }
  }
  return getMockGroup(slug);
}

export async function fetchVenues(options?: { limit?: number }) {
  if (hasSupabaseEnv()) {
    try {
      const result = await getVenues({ limit: options?.limit ?? 100 });
      if (result.data.length > 0) {
        return result.data.map((row) =>
          mapDbVenueToPublic(row as unknown as Record<string, unknown>),
        );
      }
    } catch {
      // Fall through to mock
    }
  }
  return publicVenues.slice(0, options?.limit);
}

export async function fetchVenueBySlug(slug: string) {
  if (hasSupabaseEnv()) {
    try {
      const row = await getVenueBySlug(slug);
      if (row) {
        // Query upcoming events at this venue
        const eventSlugs = await getUpcomingEventSlugsForVenue(
          (row as Record<string, unknown>).id as string,
        );
        return mapDbVenueToPublic(
          row as unknown as Record<string, unknown>,
          eventSlugs,
        );
      }
    } catch {
      // Fall through to mock
    }
  }
  return getMockVenue(slug);
}

export async function fetchCategories() {
  if (hasSupabaseEnv()) {
    try {
      const supabase = await createSupabaseServerClient();
      if (supabase) {
        const { data } = await supabase
          .from("categories")
          .select("*")
          .order("name");
        if (data && data.length > 0) {
          return data;
        }
      }
    } catch {
      // Fall through to empty
    }
  }
  return [];
}
