/**
 * Curated photo pools for venues, events, and groups.
 *
 * Used as a fallback chain after a real DB photo and a direct slug match.
 * Pools are keyed by venue type / event category so cards aren't all the
 * same image — a "Cafe" venue without a hero gets a real café photo,
 * a "Bar" venue gets a real bar photo, etc.
 *
 * Pool contents are bundled in /public so they always load fast and are
 * SSR-safe (no external API calls at request time).
 */

const CAFE = [
  "/place-images/reykjavik/venues/mokka.jpg",
  "/place-images/reykjavik/venues/reykjavik-roasters.jpg",
  "/place-images/reykjavik/venues/stofan-cafe.jpg",
  "/place-images/reykjavik/venues/cafe-rosenberg.jpg",
];

const BAR = [
  "/place-images/reykjavik/venues/lebowski-bar.jpg",
  "/place-images/reykjavik/venues/micro-bar.jpg",
  "/place-images/reykjavik/venues/dillon.jpg",
  "/demo-images/venues/gaukurinn.webp",
];

const RESTAURANT = [
  "/place-images/reykjavik/dill-0aeca160.jpg",
  "/place-images/reykjavik/venues/apotek.jpg",
  "/demo-images/venues/grandi-restaurant.jpg",
];

const HOSTEL_HUB = [
  "/place-images/reykjavik/venues/kex-hostel.jpg",
  "/place-images/reykjavik/venues/loft-hostel.jpg",
  "/place-images/reykjavik/venues/hlemmur-square.jpg",
  "/place-images/reykjavik/venues/grandi-hub.jpg",
  "/demo-images/venues/bryggjuhusid.jpg",
];

const MUSEUM = [
  "/place-images/reykjavik/hafnarborg-1be7b43b.jpg",
  "/place-images/reykjavik/listasafn-einars-jonssonar-e07f8c3b.JPG",
  "/place-images/reykjavik/hi-islenzka-re-asafn-cc53c242.JPG",
  "/place-images/reykjavik/arb-jarsafn-c71d7348.jpg",
  "/place-images/reykjavik/a-alstr-ti-10-f3bd2736.JPG",
];

const CULTURAL_HALL = [
  "/place-images/reykjavik/jo-leikhusi-52f6c2dd.jpg",
  "/place-images/reykjavik/hof-i-deccf755.jpg",
  "/place-images/reykjavik/o-inn-aca1fd38.JPG",
];

const OUTDOORS = [
  "/place-images/reykjavik/ufa-40055fa7.jpg",
  "/demo-images/events/esja.jpg",
  "/place-images/reykjavik/reykjavik-871-2-78434189.jpg",
];

const LANDMARK = [
  "/place-images/reykjavik/hallgrimskirkja-60f147a6.jpg",
  "/place-images/reykjavik/reykjavik-871-2-78434189.jpg",
];

/** Union of every photo across pools — used as the universal fallback so we
 *  never repeat the same placeholder across cards even if the type is unknown. */
const ANY_REAL = [
  ...CAFE,
  ...BAR,
  ...RESTAURANT,
  ...HOSTEL_HUB,
  ...MUSEUM,
  ...CULTURAL_HALL,
  ...OUTDOORS,
  ...LANDMARK,
];

function hash(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) {
    h = (h * 31 + value.charCodeAt(i)) >>> 0;
  }
  return h;
}

function pick(pool: readonly string[], seed: string): string {
  return pool[hash(seed) % pool.length];
}

/**
 * Direct slug → photo map for venues we have real photos of.
 * If a venue slug isn't in this map, the venue card renders the
 * typographic placeholder instead of a misleading stand-in image.
 */
const VENUE_DIRECT: Record<string, string> = {
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
  "dill": "/place-images/reykjavik/dill-0aeca160.jpg",
  "hallgrimskirkja": "/place-images/reykjavik/hallgrimskirkja-60f147a6.jpg",
  "hafnarborg": "/place-images/reykjavik/hafnarborg-1be7b43b.jpg",
  "gaukurinn": "/demo-images/venues/gaukurinn.webp",
  "bryggjuhusid": "/demo-images/venues/bryggjuhusid.jpg",
  "grandi-restaurant": "/demo-images/venues/grandi-restaurant.jpg",
};

/**
 * Pick a real photo for a venue ONLY if we have one — otherwise return null
 * and let the card render its typographic placeholder. Showing a generic
 * "cafe" photo for an arbitrary cafe is misleading; a clean wordmark is honest.
 */
export function pickVenuePhoto(_type: string | null | undefined, slug: string): string | null {
  return VENUE_DIRECT[slug] ?? null;
}

/** Pick a curated photo for an event based on category + slug. */
export function pickEventPhoto(category: string | null | undefined, slug: string): string {
  const c = (category ?? "").toLowerCase();

  if (/(food|dining|tasting|cook|chef)/.test(c)) return pick(RESTAURANT, slug);
  if (/(music|concert|gig|jazz|dj|band)/.test(c)) return pick(BAR, slug);
  if (/(outdoor|hike|run|nature|adventure)/.test(c)) return pick(OUTDOORS, slug);
  if (/(art|gallery|exhibit|culture|museum)/.test(c)) return pick(MUSEUM, slug);
  if (/(tech|workshop|talk|meetup|networking)/.test(c)) return pick(HOSTEL_HUB, slug);
  if (/(coffee|cafe|social|chat|language)/.test(c)) return pick(CAFE, slug);
  if (/(theatre|theater|performance|show)/.test(c)) return pick(CULTURAL_HALL, slug);

  return pick(ANY_REAL, slug);
}

/** Pick a curated photo for a group based on its category and slug. */
export function pickGroupPhoto(category: string | null | undefined, slug: string): string {
  // Groups follow the same category mapping as events.
  return pickEventPhoto(category, slug);
}
