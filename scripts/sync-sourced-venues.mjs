import { createHash, randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const ROOT = process.cwd();
const DEFAULT_OWNER_EMAIL = "vendors+seed@meetupreykjavik.local";
const DEFAULT_OWNER_SLUG = "meetup-reykjavik-venue-imports";
const DEFAULT_OWNER_NAME = "Meetup Reykjavik Venue Imports";
const EXCLUDED_KINDS = new Set([
  "college",
  "fast_food",
  "place_of_worship",
  "polling_station",
]);

function loadEnvFile() {
  const filePath = join(ROOT, ".env.local");
  const text = readFileSync(filePath, "utf8");
  const values = {};

  for (const line of text.split("\n")) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    values[key] = value;
  }

  return values;
}

function hashNumber(value, modulo) {
  const digest = createHash("sha1").update(value).digest("hex").slice(0, 8);
  return parseInt(digest, 16) % modulo;
}

function readJson(fileName) {
  return JSON.parse(readFileSync(join(ROOT, "data", "external", fileName), "utf8"));
}

function mapVenueType(place) {
  if (place.rawKind === "nightclub") {
    return "club";
  }

  if (place.rawKind === "bar" || place.rawKind === "pub") {
    return "bar";
  }

  if (place.rawKind === "restaurant") {
    return "restaurant";
  }

  if (place.rawKind === "cafe") {
    return "cafe";
  }

  if (place.rawKind === "coworking") {
    return "coworking";
  }

  if (
    [
      "theatre",
      "cinema",
      "arts_centre",
      "gallery",
      "museum",
      "books",
    ].includes(place.rawKind)
  ) {
    return "studio";
  }

  if (
    ["sports_centre", "fitness_centre", "public_bath"].includes(place.rawKind) ||
    (place.rawKind === "attraction" &&
      /lagoon|park|reserve|hike|trail|outdoor/i.test(
        `${place.name} ${place.summary} ${place.area}`,
      ))
  ) {
    return "outdoor";
  }

  return "other";
}

function deriveCapacities(place, venueType) {
  const variance = hashNumber(place.slug, 24);
  const profiles = {
    bar: { seated: 42, standing: 104 },
    restaurant: { seated: 56, standing: 84 },
    club: { seated: 28, standing: 180 },
    cafe: { seated: 32, standing: 54 },
    coworking: { seated: 48, standing: 72 },
    studio: { seated: 68, standing: 118 },
    outdoor: { seated: 24, standing: 132 },
    other: { seated: 44, standing: 76 },
  };
  const profile = profiles[venueType] ?? profiles.other;
  const seated = profile.seated + variance;
  const standing = profile.standing + variance * 2;

  return {
    seated,
    standing,
    total: Math.max(seated, standing),
  };
}

function deriveAmenities(place, venueType) {
  const amenities = new Set(["hosted-arrivals", "event-friendly"]);
  const text = `${place.summary} ${place.kindLabel} ${place.area}`.toLowerCase();

  if (place.website) {
    amenities.add("website-listed");
  }
  if (place.phone || place.email) {
    amenities.add("direct-contact");
  }
  if (place.wheelchair === "yes" || place.wheelchair === "limited") {
    amenities.add("wheelchair-access");
  }
  if (venueType === "bar" || venueType === "club") {
    amenities.add("bar-service");
    amenities.add("late-format");
  }
  if (venueType === "restaurant" || venueType === "cafe") {
    amenities.add("food-service");
    amenities.add("seated-format");
  }
  if (venueType === "coworking") {
    amenities.add("wifi");
    amenities.add("presentation-friendly");
  }
  if (venueType === "studio") {
    amenities.add("stage-ready");
    amenities.add("ticketed-format");
  }
  if (venueType === "outdoor") {
    amenities.add("group-activity");
    amenities.add("weather-aware");
  }
  if (text.includes("hostel")) {
    amenities.add("traveler-friendly");
  }
  if (text.includes("museum") || text.includes("gallery")) {
    amenities.add("quiet-format");
  }

  return [...amenities];
}

function derivePartnershipTier(place) {
  const strengthScore =
    (place.website ? 2 : 0) +
    (place.image?.kind === "photo" ? 2 : 0) +
    (place.phone || place.email ? 1 : 0) +
    (place.priority >= 100 ? 1 : 0);

  if (strengthScore >= 5) {
    return "premium";
  }

  if (strengthScore >= 3) {
    return "standard";
  }

  return "free";
}

function deriveRating(place) {
  return Number((4.1 + hashNumber(place.slug, 9) * 0.1).toFixed(1));
}

function deriveReviewCount(place) {
  return 8 + hashNumber(`${place.slug}-reviews`, 52);
}

function deriveEventCounts(place) {
  const eventsHosted = 2 + hashNumber(`${place.slug}-events`, 34);
  const totalAttendees = eventsHosted * (24 + hashNumber(`${place.slug}-crowd`, 46));

  return { eventsHosted, totalAttendees };
}

function pickHeroImage(place, imageCandidatesBySlug) {
  if (place.image?.localPath) {
    return place.image.localPath;
  }

  if (place.image?.remoteUrl) {
    return place.image.remoteUrl;
  }

  const candidate = imageCandidatesBySlug.get(place.slug);

  if (candidate?.localPath) {
    return candidate.localPath;
  }

  if (candidate?.thumbnailUrl) {
    return candidate.thumbnailUrl;
  }

  return `/place-images/reykjavik/generated/${place.slug}.svg`;
}

function buildOpeningHours(place) {
  if (!place.openingHours) {
    return {};
  }

  return {
    raw: place.openingHours,
    sourced: true,
  };
}

function buildHappyHour(place, venueType) {
  if (!["bar", "restaurant", "club", "cafe"].includes(venueType)) {
    return {};
  }

  return {
    label:
      venueType === "club"
        ? "Welcome list"
        : venueType === "cafe"
          ? "Meetup coffee pairing"
          : "Partner welcome deal",
    note: `Imported partner-ready perk for ${place.name}.`,
  };
}

function buildSocialLinks(place) {
  const links = {
    source: "openstreetmap",
  };

  if (place.wikidata) {
    links.wikidata = place.wikidata;
  }

  if (place.wikimediaCommons) {
    links.wikimedia_commons = place.wikimediaCommons;
  }

  return links;
}

function buildVenueDeal(place, venueId, venueType) {
  if (!["bar", "restaurant", "club", "cafe", "coworking", "studio"].includes(venueType)) {
    return null;
  }

  if (venueType === "bar" || venueType === "club") {
    return {
      venue_id: venueId,
      title: "Meetup arrival round",
      description: `Hosted welcome perk for check-ins at ${place.name}.`,
      deal_type: "welcome_drink",
      deal_tier: "gold",
      discount_value: "1 welcome round",
      is_active: true,
    };
  }

  if (venueType === "restaurant" || venueType === "cafe") {
    return {
      venue_id: venueId,
      title: "Group table package",
      description: `Reserved arrival package for community bookings at ${place.name}.`,
      deal_type: "group_package",
      deal_tier: "silver",
      discount_value: "10% group booking credit",
      is_active: true,
    };
  }

  if (venueType === "coworking") {
    return {
      venue_id: venueId,
      title: "After-hours workspace rate",
      description: `Community host rate for evening workshops at ${place.name}.`,
      deal_type: "fixed_price",
      deal_tier: "silver",
      discount_value: "12,500 ISK session rate",
      is_active: true,
    };
  }

  return {
    venue_id: venueId,
    title: "Curated room package",
    description: `Bookable partner format for ticketed or cultural events at ${place.name}.`,
    deal_type: "fixed_price",
    deal_tier: "bronze",
    discount_value: "Room package available",
    is_active: true,
  };
}

function buildAvailability(place, venueId, venueType) {
  const nightlife = [
    { day: 4, start: "19:00:00", end: "23:00:00", costType: "minimum_spend" },
    { day: 5, start: "17:00:00", end: "22:00:00", costType: "minimum_spend" },
  ];
  const food = [
    { day: 2, start: "18:00:00", end: "21:00:00", costType: "minimum_spend" },
    { day: 6, start: "11:00:00", end: "15:00:00", costType: "flat_fee" },
  ];
  const culture = [
    { day: 3, start: "18:00:00", end: "21:30:00", costType: "flat_fee" },
    { day: 6, start: "14:00:00", end: "18:00:00", costType: "flat_fee" },
  ];
  const work = [
    { day: 2, start: "17:30:00", end: "20:30:00", costType: "flat_fee" },
    { day: 4, start: "18:00:00", end: "21:00:00", costType: "flat_fee" },
  ];
  const outdoors = [
    { day: 6, start: "09:00:00", end: "12:00:00", costType: "negotiable" },
    { day: 0, start: "10:00:00", end: "13:00:00", costType: "negotiable" },
  ];

  const templates =
    venueType === "bar" || venueType === "club"
      ? nightlife
      : venueType === "restaurant" || venueType === "cafe"
        ? food
        : venueType === "coworking"
          ? work
          : venueType === "outdoor"
            ? outdoors
            : culture;

  return templates.map((slot, index) => ({
    venue_id: venueId,
    day_of_week: slot.day,
    start_time: slot.start,
    end_time: slot.end,
    cost_type: slot.costType,
    cost_amount:
      slot.costType === "minimum_spend"
        ? 25000 + index * 5000
        : slot.costType === "flat_fee"
          ? 18000 + index * 4000
          : null,
    notes: `Imported recurring partner window for ${place.name}.`,
    is_recurring: true,
    is_blocked: false,
  }));
}

function chunk(items, size) {
  const groups = [];

  for (let index = 0; index < items.length; index += size) {
    groups.push(items.slice(index, index + size));
  }

  return groups;
}

async function ensureSeedOwner(supabase) {
  let page = 1;
  let ownerUser = null;

  while (!ownerUser) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 200,
    });

    if (error) {
      throw error;
    }

    ownerUser = data.users.find((user) => user.email === DEFAULT_OWNER_EMAIL) ?? null;

    if (ownerUser || data.users.length < 200) {
      break;
    }

    page += 1;
  }

  if (!ownerUser) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: DEFAULT_OWNER_EMAIL,
      password: `${randomBytes(18).toString("base64url")}Aa1!`,
      email_confirm: true,
      user_metadata: {
        seeded: true,
        account_type: "venue",
      },
    });

    if (error) {
      throw error;
    }

    ownerUser = data.user;
  }

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: ownerUser.id,
      display_name: DEFAULT_OWNER_NAME,
      slug: DEFAULT_OWNER_SLUG,
      email: DEFAULT_OWNER_EMAIL,
      bio: "System-owned importer profile used to stage sourced Reykjavik venue inventory.",
      city: "Reykjavik",
      locale: "en",
      languages: ["en", "is"],
      account_type: "venue",
      is_verified: true,
      is_premium: true,
      premium_tier: "premium",
    },
    {
      onConflict: "id",
    },
  );

  if (profileError) {
    throw profileError;
  }

  return ownerUser.id;
}

async function upsertInBatches(supabase, table, rows, onConflict, select) {
  const results = [];

  for (const batch of chunk(rows, 100)) {
    const { data, error } = await supabase
      .from(table)
      .upsert(batch, { onConflict })
      .select(select);

    if (error) {
      throw error;
    }

    if (data) {
      results.push(...data);
    }
  }

  return results;
}

async function insertInBatches(supabase, table, rows) {
  for (const batch of chunk(rows, 100)) {
    const { error } = await supabase.from(table).insert(batch);

    if (error) {
      throw error;
    }
  }
}

async function deleteByVenueIds(supabase, table, venueIds) {
  for (const batch of chunk(venueIds, 100)) {
    const { error } = await supabase.from(table).delete().in("venue_id", batch);

    if (error) {
      throw error;
    }
  }
}

async function main() {
  const env = {
    ...loadEnvFile(),
    ...process.env,
  };
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase credentials. Expected NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  const places = readJson("reykjavik-places.json");
  const imageCandidates = readJson("reykjavik-image-candidates.json");
  const imageCandidatesBySlug = new Map(imageCandidates.map((candidate) => [candidate.placeSlug, candidate]));
  const ownerId = await ensureSeedOwner(supabase);
  const venuePlaces = places.filter((place) => !EXCLUDED_KINDS.has(place.rawKind));

  const venueRows = venuePlaces.map((place) => {
    const type = mapVenueType(place);
    const capacity = deriveCapacities(place, type);
    const heroPhotoUrl = pickHeroImage(place, imageCandidatesBySlug);
    const partnershipTier = derivePartnershipTier(place);
    const rating = deriveRating(place);
    const reviewCount = deriveReviewCount(place);
    const { eventsHosted, totalAttendees } = deriveEventCounts(place);

    return {
      owner_id: ownerId,
      name: place.name,
      slug: place.slug,
      legal_name: null,
      kennitala: null,
      type,
      description: `${place.summary} Imported from the Reykjavik venue intake so the team can curate and activate real local supply from the admin dashboard.`,
      address: place.address || `${place.area}, Reykjavik`,
      city: "Reykjavik",
      latitude: place.lat,
      longitude: place.lon,
      capacity_seated: capacity.seated,
      capacity_standing: capacity.standing,
      capacity_total: capacity.total,
      amenities: deriveAmenities(place, type),
      photos: [heroPhotoUrl],
      hero_photo_url: heroPhotoUrl,
      website: place.website || null,
      phone: place.phone || null,
      email: place.email || null,
      social_links: buildSocialLinks(place),
      opening_hours: buildOpeningHours(place),
      happy_hour: buildHappyHour(place, type),
      partnership_tier: partnershipTier,
      is_verified: Boolean(place.website || place.phone || place.email),
      status: "active",
      avg_rating: rating,
      review_count: reviewCount,
      events_hosted: eventsHosted,
      total_attendees: totalAttendees,
    };
  });

  const venueResults = await upsertInBatches(
    supabase,
    "venues",
    venueRows,
    "slug",
    "id, slug, type",
  );
  const venueIds = venueResults.map((venue) => venue.id);

  if (venueIds.length) {
    await deleteByVenueIds(supabase, "venue_deals", venueIds);
    await deleteByVenueIds(supabase, "venue_availability", venueIds);
  }

  const venueIdBySlug = new Map(venueResults.map((venue) => [venue.slug, venue.id]));
  const deals = [];
  const availability = [];

  for (const place of venuePlaces) {
    const venueId = venueIdBySlug.get(place.slug);

    if (!venueId) {
      continue;
    }

    const venueType = mapVenueType(place);
    const deal = buildVenueDeal(place, venueId, venueType);

    if (deal) {
      deals.push(deal);
    }

    availability.push(...buildAvailability(place, venueId, venueType));
  }

  if (deals.length) {
    await insertInBatches(supabase, "venue_deals", deals);
  }

  if (availability.length) {
    await insertInBatches(supabase, "venue_availability", availability);
  }

  console.log(
    JSON.stringify(
      {
        ownerEmail: DEFAULT_OWNER_EMAIL,
        venuesSeeded: venueRows.length,
        dealsSeeded: deals.length,
        availabilitySeeded: availability.length,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
