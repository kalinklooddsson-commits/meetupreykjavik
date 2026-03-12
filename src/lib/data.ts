import { hasSupabaseEnv } from "@/lib/env";
import * as db from "@/lib/db";
import {
  publicEvents,
  publicGroups,
  publicVenues,
  getEventBySlug as getMockEvent,
  getGroupBySlug as getMockGroup,
  getVenueBySlug as getMockVenue,
} from "@/lib/public-data";

export async function fetchEvents(options?: {
  category?: string;
  limit?: number;
}) {
  // Always use mock data for now — DB events lack presentation fields (art, gallery, etc.)
  return publicEvents.slice(0, options?.limit);
}

export async function fetchEventBySlug(slug: string) {
  // Always use mock data for now — DB events lack presentation fields
  return getMockEvent(slug);
}

export async function fetchGroups(options?: { limit?: number }) {
  // Always use mock data for now — DB groups lack presentation fields (banner, tags, etc.)
  return publicGroups.slice(0, options?.limit);
}

export async function fetchGroupBySlug(slug: string) {
  // Always use mock data for now — DB groups lack presentation fields
  return getMockGroup(slug);
}

export async function fetchVenues(options?: { limit?: number }) {
  // Always use mock data for now — DB venues lack presentation fields (art, rating, etc.)
  return publicVenues.slice(0, options?.limit);
}

export async function fetchVenueBySlug(slug: string) {
  // Always use mock data for now — DB venues lack presentation fields
  return getMockVenue(slug);
}

export async function fetchCategories() {
  if (!hasSupabaseEnv()) return [];
  return db.getCategories();
}
[];
  return db.getCategories();
}
[];
  return db.getCategories();
}
[];
  return db.getCategories();
}
