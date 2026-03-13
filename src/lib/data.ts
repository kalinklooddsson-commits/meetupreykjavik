import { hasSupabaseEnv } from "@/lib/env";
import { getEvents, getEventBySlug } from "@/lib/db/events";
import { getGroups, getGroupBySlug } from "@/lib/db/groups";
import { getVenues, getVenueBySlug } from "@/lib/db/venues";
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
import { createSupabaseServerClient } from "@/lib/supabase/server";

// ── Mappers: DB rows with joins → public presentation types ──

function mapDbEventToPublic(row: Record<string, unknown>): PublicEvent {
  const venue = row.venues as Record<string, unknown> | null;
  const host = row.profiles as Record<string, unknown> | null;
  const category = row.categories as Record<string, unknown> | null;

  return {
    slug: row.slug as string,
    title: row.title as string,
    category: (category?.name_en as string) ?? "Social",
    eventType: (row.event_type as PublicEvent["eventType"]) ?? "in_person",
    dateFilter: getDateFilter(row.starts_at as string),
    startsAt: row.starts_at as string,
    endsAt: (row.ends_at as string) ?? (row.starts_at as string),
    venueName: (venue?.name as string) ?? (row.venue_name as string) ?? "",
    venueSlug: (venue?.slug as string) ?? "",
    groupName: "",
    groupSlug: "",
    hostName: (host?.display_name as string) ?? "",
    area: (venue?.city as string) ?? "Reykjavik",
    summary: ((row.description as string) ?? "").slice(0, 200),
    description: row.description ? [(row.description as string)] : [],
    attendees: (row.rsvp_count as number) ?? 0,
    capacity: (row.attendee_limit as number) ?? 50,
    priceLabel: row.is_free === true ? "Free" : "Paid",
    ageLabel: (row.age_restriction as string) ?? "All ages",
    isFree: (row.is_free as boolean) ?? true,
    visibilityLabel: (row.visibility_mode as string) ?? "public",
    approvalLabel: (row.rsvp_mode as string) ?? "open",
    reminderLabel: (row.reminder_policy as string) ?? "24h before",
    hostContact: (row.host_contact as string) ?? "",
    shareLabel: "Share this event",
    art:
      (row.featured_photo_url as string) ??
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Reykjavik_rooftops.jpg/1200px-Reykjavik_rooftops.jpg",
    gallery: Array.isArray(row.gallery_photos)
      ? (row.gallery_photos as string[])
      : [],
    comments: [],
    ratings: [],
  };
}

function mapDbGroupToPublic(row: Record<string, unknown>): PublicGroup {
  const organizer = row.profiles as Record<string, unknown> | null;

  return {
    slug: row.slug as string,
    name: row.name as string,
    category:
      ((row.categories as Record<string, unknown> | null)?.name_en as string) ??
      "Social",
    members: (row.member_count as number) ?? 0,
    activity: (row.activity_score as number) ?? 50,
    summary: ((row.description as string) ?? "").slice(0, 200),
    description: row.description ? [(row.description as string)] : [],
    organizer: (organizer?.display_name as string) ?? "",
    banner:
      (row.banner_url as string) ??
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Reykjavik_rooftops.jpg/1200px-Reykjavik_rooftops.jpg",
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    upcomingEventSlugs: [],
    pastEvents: [],
    discussions: [],
  };
}

function mapDbVenueToPublic(row: Record<string, unknown>): PublicVenue {
  return {
    slug: row.slug as string,
    name: row.name as string,
    type: (row.type as string) ?? "bar",
    area: (row.city as string) ?? "Reykjavik",
    capacity:
      (row.capacity_total as number) ??
      (row.capacity_standing as number) ??
      0,
    rating: (row.avg_rating as number) ?? 0,
    summary: ((row.description as string) ?? "").slice(0, 200),
    description: row.description ? [(row.description as string)] : [],
    address: (row.address as string) ?? "",
    amenities: Array.isArray(row.amenities)
      ? (row.amenities as string[])
      : [],
    hours: [],
    deal: "",
    upcomingEventSlugs: [],
    gallery: Array.isArray(row.photos) ? (row.photos as string[]) : [],
    art:
      (row.hero_photo_url as string) ??
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Reykjavik_rooftops.jpg/1200px-Reykjavik_rooftops.jpg",
    latitude: (row.latitude as number) ?? undefined,
    longitude: (row.longitude as number) ?? undefined,
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
        return result.data.map((row) =>
          mapDbEventToPublic(row as unknown as Record<string, unknown>),
        );
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
      const row = await getEventBySlug(slug);
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
        return rows.map((row) =>
          mapDbGroupToPublic(row as unknown as Record<string, unknown>),
        );
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
        return mapDbGroupToPublic(row as unknown as Record<string, unknown>);
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
      const result = await getVenues({ limit: options?.limit ?? 20 });
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
        return mapDbVenueToPublic(row as unknown as Record<string, unknown>);
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
