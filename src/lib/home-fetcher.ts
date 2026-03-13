/**
 * Server-side data fetcher for the homepage.
 *
 * Queries Supabase for live stats, events, groups, and venues.
 * Falls back to static data from home-data.ts when DB is unavailable.
 */

import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  heroStats as staticHeroStats,
  events as staticEvents,
  groups as staticGroups,
  venues as staticVenues,
  categories as staticCategories,
  type HomeEvent,
  type HomeGroup,
  type HomeVenue,
} from "@/lib/home-data";

export interface HomePageData {
  heroStats: { value: string; label: string }[];
  events: HomeEvent[];
  groups: HomeGroup[];
  venues: HomeVenue[];
  categories: { name: string; count: number; letter: string; tone: string }[];
}

export async function getHomePageData(): Promise<HomePageData> {
  if (!hasSupabaseEnv()) {
    return {
      heroStats: [...staticHeroStats],
      events: staticEvents,
      groups: staticGroups,
      venues: [...staticVenues],
      categories: [...staticCategories],
    };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return {
      heroStats: [...staticHeroStats],
      events: staticEvents,
      groups: staticGroups,
      venues: [...staticVenues],
      categories: [...staticCategories],
    };
  }

  try {
    const [profilesResult, groupsResult, eventsResult, venuesResult] =
      await Promise.all([
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("groups")
          .select("id", { count: "exact", head: true })
          .eq("status", "active"),
        supabase
          .from("events")
          .select(
            `*, venues (name, slug), categories (name)`,
            { count: "exact" },
          )
          .eq("status", "published")
          .gte("starts_at", new Date().toISOString())
          .order("starts_at", { ascending: true })
          .limit(6),
        supabase
          .from("venues")
          .select("*", { count: "exact" })
          .eq("status", "active")
          .order("avg_rating", { ascending: false })
          .limit(3),
      ]);

    const memberCount = profilesResult.count ?? 0;
    const groupCount = groupsResult.count ?? 0;
    const eventCount = eventsResult.count ?? 0;
    const venueCount = venuesResult.count ?? 0;

    // Build hero stats from real DB counts
    const heroStats = [
      { value: memberCount.toLocaleString(), label: "Members" },
      { value: groupCount.toLocaleString(), label: "Groups" },
      { value: String(eventCount), label: "This Week" },
      { value: String(venueCount), label: "Venue Partners" },
    ];

    // Map DB events to HomeEvent shape
    const dbEvents = eventsResult.data ?? [];
    const events: HomeEvent[] =
      dbEvents.length > 0
        ? dbEvents.map((e: Record<string, unknown>, i: number) => {
            const startsAt = new Date(e.starts_at as string);
            const weekday = startsAt.toLocaleDateString("en-GB", {
              weekday: "short",
              timeZone: "Atlantic/Reykjavik",
            });
            const dayNum = startsAt.toLocaleDateString("en-GB", {
              day: "numeric",
              timeZone: "Atlantic/Reykjavik",
            });
            const month = startsAt.toLocaleDateString("en-GB", {
              month: "short",
              timeZone: "Atlantic/Reykjavik",
            });
            const time = startsAt.toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
              timeZone: "Atlantic/Reykjavik",
            });

            const venue = e.venues as Record<string, string> | null;
            const category = e.categories as Record<string, string> | null;

            return {
              id: i + 1,
              slug: e.slug as string,
              title: e.title as string,
              tag: category?.name?.split(" ")[0] ?? "Social",
              day: `${weekday} ${dayNum} ${month}`,
              date: dayNum,
              time,
              venue: venue?.name ?? "TBD",
              venueSlug: venue?.slug ?? "",
              attendees: (e.attendee_count as number) ?? 0,
              photo:
                (e.image_url as string) ??
                "/place-images/reykjavik/hallgrimskirkja-60f147a6.jpg",
            };
          })
        : staticEvents;

    // Map DB venues to HomeVenue shape
    const dbVenues = venuesResult.data ?? [];
    const venues: HomeVenue[] =
      dbVenues.length > 0
        ? dbVenues.map((v: Record<string, unknown>) => ({
            slug: v.slug as string,
            name: v.name as string,
            type: (v.type as string) ?? "Venue",
            area: (v.area as string) ?? "Reykjavik",
            rating: (v.avg_rating as number) ?? 0,
            events: (v.event_count as number) ?? 0,
            photo:
              (v.image_url as string) ??
              `/place-images/reykjavik/venues/${v.slug}.jpg`,
          }))
        : [...staticVenues];

    // Fetch groups for homepage
    const groupsQueryResult = await supabase
      .from("groups")
      .select("*, categories (name)")
      .eq("status", "active")
      .order("member_count", { ascending: false })
      .limit(4);

    const dbGroups = groupsQueryResult.data ?? [];
    const groups: HomeGroup[] =
      dbGroups.length > 0
        ? dbGroups.map((g: Record<string, unknown>) => {
            const category = g.categories as Record<string, string> | null;
            return {
              slug: g.slug as string,
              name: g.name as string,
              category: category?.name?.split(" ")[0] ?? "Community",
              members: (g.member_count as number) ?? 0,
              description: (g.description as string) ?? "",
              photo:
                (g.image_url as string) ??
                "/place-images/reykjavik/hallgrimskirkja-60f147a6.jpg",
            };
          })
        : staticGroups;

    // Build category counts from events
    const categoryCountMap = new Map<string, number>();
    if (dbEvents.length > 0) {
      for (const e of dbEvents) {
        const cat = e.categories as Record<string, string> | null;
        if (cat?.name) {
          categoryCountMap.set(
            cat.name,
            (categoryCountMap.get(cat.name) ?? 0) + 1,
          );
        }
      }
    }

    const categories = staticCategories.map((c) => ({
      ...c,
      count: categoryCountMap.get(c.name) ?? c.count,
    }));

    return { heroStats, events, groups, venues, categories };
  } catch (error) {
    console.error("Failed to fetch homepage data:", error);
    return {
      heroStats: [...staticHeroStats],
      events: staticEvents,
      groups: staticGroups,
      venues: [...staticVenues],
      categories: [...staticCategories],
    };
  }
}
