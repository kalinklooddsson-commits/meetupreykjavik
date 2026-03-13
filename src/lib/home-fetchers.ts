import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import type { HomeEvent, HomeGroup, HomeVenue } from "@/lib/home-data";
import {
  heroStats as fallbackHeroStats,
  events as fallbackEvents,
  groups as fallbackGroups,
  venues as fallbackVenues,
} from "@/lib/home-data";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type HeroStat = { value: string; label: string };

export type CategoryCount = { name: string; count: number };

export type HomePageData = {
  heroStats: readonly HeroStat[];
  events: HomeEvent[];
  groups: HomeGroup[];
  venues: HomeVenue[];
  categoryCounts: CategoryCount[];
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const DEFAULT_EVENT_PHOTO = "/place-images/reykjavik/hallgrimskirkja-60f147a6.jpg";
const DEFAULT_GROUP_PHOTO = "/place-images/reykjavik/hallgrimskirkja-60f147a6.jpg";
const DEFAULT_VENUE_PHOTO = "/place-images/reykjavik/hallgrimskirkja-60f147a6.jpg";

/** Format a starts_at timestamptz into day / date / time for the event card. */
function formatHomeDay(isoDate: string): { day: string; date: string; time: string } {
  const d = new Date(isoDate);
  const weekday = d.toLocaleDateString("en-GB", { weekday: "short", timeZone: "Atlantic/Reykjavik" });
  const dayNum = d.toLocaleDateString("en-GB", { day: "numeric", timeZone: "Atlantic/Reykjavik" });
  const month = d.toLocaleDateString("en-GB", { month: "short", timeZone: "Atlantic/Reykjavik" });
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Atlantic/Reykjavik" });
  return { day: `${weekday} ${dayNum} ${month}`, date: dayNum, time };
}

/** Format a number with commas (e.g. 2847 → "2,847"). */
function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

/** Guess a short tag from a category name_en. */
function categoryTag(categoryName: string | null | undefined): string {
  if (!categoryName) return "Social";
  const lower = categoryName.toLowerCase();
  if (lower.includes("nightlife") || lower.includes("social")) return "Social";
  if (lower.includes("outdoor") || lower.includes("hiking")) return "Outdoors";
  if (lower.includes("tech") || lower.includes("startup")) return "Tech";
  if (lower.includes("music") || lower.includes("arts")) return "Music";
  if (lower.includes("food") || lower.includes("drink")) return "Food";
  if (lower.includes("language")) return "Language";
  if (lower.includes("expat")) return "Social";
  if (lower.includes("sport") || lower.includes("fitness")) return "Social";
  return "Social";
}

/* ------------------------------------------------------------------ */
/*  Fetchers                                                           */
/* ------------------------------------------------------------------ */

async function fetchHeroStats(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
): Promise<readonly HeroStat[]> {
  if (!supabase) return fallbackHeroStats;

  try {
    // Count profiles
    const { count: profileCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // Count groups
    const { count: groupCount } = await supabase
      .from("groups")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    // Count events this week
    const now = new Date();
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + 7);
    const { count: eventsThisWeek } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("status", "published")
      .gte("starts_at", now.toISOString())
      .lte("starts_at", endOfWeek.toISOString());

    // Count active venues
    const { count: venueCount } = await supabase
      .from("venues")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    return [
      { value: formatNumber(profileCount ?? 0), label: "Members" },
      { value: formatNumber(groupCount ?? 0), label: "Groups" },
      { value: formatNumber(eventsThisWeek ?? 0), label: "This Week" },
      { value: formatNumber(venueCount ?? 0), label: "Venue Partners" },
    ];
  } catch {
    return fallbackHeroStats;
  }
}

async function fetchEvents(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
): Promise<HomeEvent[]> {
  if (!supabase) return [...fallbackEvents];

  try {
    const { data, error } = await supabase
      .from("events")
      .select(`
        id,
        slug,
        title,
        starts_at,
        venue_name,
        rsvp_count,
        attendee_limit,
        is_free,
        is_featured,
        featured_photo_url,
        venue_id,
        category_id,
        categories ( name_en ),
        venues!events_venue_id_fkey ( slug, name )
      `)
      .eq("status", "published")
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(6);

    if (error || !data || data.length === 0) return [...fallbackEvents];

    return data.map((row, index) => {
      const parsed = formatHomeDay(row.starts_at);
      const categoryRaw = row.categories as { name_en: string } | { name_en: string }[] | null;
      const categoryRow = Array.isArray(categoryRaw) ? categoryRaw[0] ?? null : categoryRaw;
      const venueRaw = row.venues as { slug: string; name: string } | { slug: string; name: string }[] | null;
      const venueRow = Array.isArray(venueRaw) ? venueRaw[0] ?? null : venueRaw;

      return {
        id: index + 1,
        slug: row.slug,
        title: row.title,
        tag: categoryTag(categoryRow?.name_en),
        day: parsed.day,
        date: parsed.date,
        time: parsed.time,
        venue: row.venue_name ?? venueRow?.name ?? "TBA",
        venueSlug: venueRow?.slug ?? "",
        attendees: row.rsvp_count ?? 0,
        deal: undefined,
        photo: row.featured_photo_url ?? DEFAULT_EVENT_PHOTO,
      };
    });
  } catch {
    return [...fallbackEvents];
  }
}

async function fetchGroups(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
): Promise<HomeGroup[]> {
  if (!supabase) return [...fallbackGroups];

  try {
    const { data, error } = await supabase
      .from("groups")
      .select(`
        slug,
        name,
        description,
        member_count,
        banner_url,
        category_id,
        categories ( name_en )
      `)
      .eq("status", "active")
      .order("member_count", { ascending: false })
      .limit(4);

    if (error || !data || data.length === 0) return [...fallbackGroups];

    return data.map((row) => {
      const categoryRaw = row.categories as { name_en: string } | { name_en: string }[] | null;
      const categoryRow = Array.isArray(categoryRaw) ? categoryRaw[0] ?? null : categoryRaw;
      return {
        slug: row.slug,
        name: row.name,
        category: categoryTag(categoryRow?.name_en),
        members: row.member_count ?? 0,
        description: row.description ?? "",
        photo: row.banner_url ?? DEFAULT_GROUP_PHOTO,
      };
    });
  } catch {
    return [...fallbackGroups];
  }
}

async function fetchVenues(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
): Promise<HomeVenue[]> {
  if (!supabase) return [...fallbackVenues];

  try {
    const { data, error } = await supabase
      .from("venues")
      .select(`
        slug,
        name,
        type,
        city,
        avg_rating,
        events_hosted,
        hero_photo_url,
        address
      `)
      .eq("status", "active")
      .order("avg_rating", { ascending: false })
      .limit(3);

    if (error || !data || data.length === 0) return [...fallbackVenues];

    return data.map((row) => ({
      slug: row.slug,
      name: row.name,
      type: row.type ?? "Venue",
      area: row.address ?? row.city ?? "Reykjavik",
      rating: Number(row.avg_rating) || 0,
      events: row.events_hosted ?? 0,
      deal: undefined,
      photo: row.hero_photo_url ?? DEFAULT_VENUE_PHOTO,
    }));
  } catch {
    return [...fallbackVenues];
  }
}

async function fetchCategoryCounts(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
): Promise<CategoryCount[]> {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("events")
      .select("category_id, categories ( name_en )")
      .eq("status", "published");

    if (error || !data) return [];

    const counts: Record<string, number> = {};
    for (const row of data) {
      const catRaw = row.categories as { name_en: string } | { name_en: string }[] | null;
      const cat = Array.isArray(catRaw) ? catRaw[0] : catRaw;
      const name = cat?.name_en ?? "Other";
      counts[name] = (counts[name] ?? 0) + 1;
    }

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------------ */
/*  Main fetcher                                                       */
/* ------------------------------------------------------------------ */

export async function fetchHomePageData(): Promise<HomePageData> {
  if (!hasSupabaseEnv()) {
    return {
      heroStats: fallbackHeroStats,
      events: [...fallbackEvents],
      groups: [...fallbackGroups],
      venues: [...fallbackVenues],
      categoryCounts: [],
    };
  }

  const supabase = await createSupabaseServerClient();

  const [heroStats, events, groups, venues, categoryCounts] = await Promise.all([
    fetchHeroStats(supabase),
    fetchEvents(supabase),
    fetchGroups(supabase),
    fetchVenues(supabase),
    fetchCategoryCounts(supabase),
  ]);

  return { heroStats, events, groups, venues, categoryCounts };
}
