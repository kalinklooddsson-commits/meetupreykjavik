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
 * Pick a curated photo for a venue based on its type and slug.
 *
 * Returns a deterministic image so the same venue always gets the same
 * fallback — no flicker between renders, no duplicates clustered on one row.
 */
export function pickVenuePhoto(type: string | null | undefined, slug: string): string {
  const t = (type ?? "").toLowerCase();

  if (/(cafe|kaffi|coffee|bakery|bakari)/.test(t)) return pick(CAFE, slug);
  if (/(bar|pub|tap|brew|cocktail)/.test(t)) return pick(BAR, slug);
  if (/(restaur|bistro|kitchen|matsta|food|dining)/.test(t)) return pick(RESTAURANT, slug);
  if (/(hostel|hub|coworking|hotel|guest)/.test(t)) return pick(HOSTEL_HUB, slug);
  if (/(museum|safn|gallery|exhibit)/.test(t)) return pick(MUSEUM, slug);
  if (/(theatre|theater|hall|concert|leikhus|harpa|cultural)/.test(t)) return pick(CULTURAL_HALL, slug);
  if (/(outdoor|park|hike|nature|garden|mountain)/.test(t)) return pick(OUTDOORS, slug);
  if (/(church|landmark|monument|kirkja)/.test(t)) return pick(LANDMARK, slug);

  return pick(ANY_REAL, slug);
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
