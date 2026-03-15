import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import { createSceneCoverDataUrl } from "@/lib/visuals";
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

/** Generic placeholder image — if the DB has this, treat it as "no photo". */
const GENERIC_PLACEHOLDER = "/place-images/reykjavik/hallgrimskirkja-60f147a6.jpg";

/** Cycle through Reykjavik landmark photos so cards aren't all identical.
 *  hallgrimskirkja is excluded — it's the hero background and generic placeholder. */
const PLACE_PHOTOS = [
  "/place-images/reykjavik/hof-i-deccf755.jpg",
  "/place-images/reykjavik/reykjavik-871-2-78434189.jpg",
  "/place-images/reykjavik/dill-0aeca160.jpg",
  "/place-images/reykjavik/hafnarborg-1be7b43b.jpg",
  "/place-images/reykjavik/arb-jarsafn-c71d7348.jpg",
  "/place-images/reykjavik/venues/kex-hostel.jpg",
  "/place-images/reykjavik/venues/lebowski-bar.jpg",
  "/place-images/reykjavik/venues/grandi-hub.jpg",
  "/place-images/reykjavik/venues/reykjavik-roasters.jpg",
  "/place-images/reykjavik/venues/mokka.jpg",
];

function pickPhoto(slug: string, photos: readonly string[]): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  return photos[hash % photos.length];
}

/** Returns the photo if it's a real, accessible image, otherwise null. */
function realPhoto(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.includes("hallgrimskirkja")) return null;
  if (url.startsWith("data:")) return null;
  if (url.startsWith("#")) return null;
  // Reject Supabase storage URLs — they often require auth or don't exist publicly
  if (url.includes("supabase.co/storage")) return null;
  return url;
}

/** Venue-specific photos from the public directory. */
const VENUE_PHOTOS: Record<string, string> = {
  "kex-hostel": "/place-images/reykjavik/venues/kex-hostel.jpg",
  "loft-hostel": "/place-images/reykjavik/venues/loft-hostel.jpg",
  "lebowski-bar": "/place-images/reykjavik/venues/lebowski-bar.jpg",
  "mokka": "/place-images/reykjavik/venues/mokka.jpg",
  "cafe-rosenberg": "/place-images/reykjavik/venues/cafe-rosenberg.jpg",
  "dillon": "/place-images/reykjavik/venues/dillon.jpg",
  "reykjavik-roasters": "/place-images/reykjavik/venues/reykjavik-roasters.jpg",
  "apotek": "/place-images/reykjavik/venues/apotek.jpg",
  "grandi-hub": "/place-images/reykjavik/venues/grandi-hub.jpg",
  "hlemmur-square": "/place-images/reykjavik/venues/hlemmur-square.jpg",
  "micro-bar": "/place-images/reykjavik/venues/micro-bar.jpg",
  "stofan-cafe": "/place-images/reykjavik/venues/stofan-cafe.jpg",
};

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

/** Title-case a venue name (e.g. "lebowski bar" → "Lebowski Bar"). */
function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Detect generic placeholder descriptions like "X — community group in Reykjavik". */
function isGenericDescription(desc?: string | null, name?: string | null): boolean {
  if (!desc) return true;
  if (desc.length < 20) return true;
  if (/community group in/i.test(desc)) return true;
  if (/— community group/i.test(desc)) return true;
  // Description that just repeats the name
  if (name && desc.toLowerCase().startsWith(name.toLowerCase())) return true;
  return false;
}

/** Extract a short area label from address + city, avoiding "Reykjavik, Reykjavik". */
function extractArea(address?: string | null, city?: string | null): string {
  if (address) {
    // Use the street part (before first comma) as the area label
    const street = address.split(",")[0].trim();
    if (street && street.toLowerCase() !== (city ?? "").toLowerCase()) {
      return street;
    }
  }
  return city || "Reykjavik";
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

    // Count venue partners: only venues actually referenced by platform events
    const { data: venueIds } = await supabase
      .from("events")
      .select("venue_id")
      .eq("status", "published")
      .not("venue_id", "is", null);
    const uniqueVenueIds = new Set(
      (venueIds as { venue_id: string }[] ?? []).map((r) => r.venue_id).filter(Boolean),
    );
    const venueCount = uniqueVenueIds.size;

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
        venue: titleCase(row.venue_name ?? venueRow?.name ?? "TBA"),
        venueSlug: venueRow?.slug ?? "",
        attendees: row.rsvp_count ?? 0,
        deal: undefined,
        photo: realPhoto(row.featured_photo_url) ?? pickPhoto(row.slug, PLACE_PHOTOS),
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
        description: isGenericDescription(row.description, row.name)
          ? (fallbackGroups.find((g) => g.slug === row.slug)?.description ?? row.description ?? "")
          : (row.description ?? ""),
        photo: realPhoto(row.banner_url) ?? pickPhoto(row.slug, PLACE_PHOTOS),
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
      area: extractArea(row.address, row.city),
      rating: Number(row.avg_rating) || 0,
      events: row.events_hosted ?? 0,
      deal: undefined,
      photo: realPhoto(row.hero_photo_url) ?? VENUE_PHOTOS[row.slug] ?? `/place-images/reykjavik/generated/${row.slug}.svg`,
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
      .eq("status", "published")
      .gte("starts_at", new Date().toISOString());

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
