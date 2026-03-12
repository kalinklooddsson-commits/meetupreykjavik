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
  const { data: venues } = await db.getVenues(options);
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
