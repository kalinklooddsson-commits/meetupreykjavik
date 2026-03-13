#!/usr/bin/env node
/**
 * Venue data enrichment pipeline.
 *
 * Sources:
 * 1. Nominatim (OpenStreetMap) — reverse-geocode lat/lng → real street address
 * 2. ja.is (Icelandic yellow pages) — phone, website
 * 3. Generate proper descriptions from real data
 *
 * Usage:
 *   node scripts/enrich-venues.mjs              # enrich all venues
 *   node scripts/enrich-venues.mjs --dry-run    # preview without writing to DB
 *   node scripts/enrich-venues.mjs --limit=50   # only process first 50
 */

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://obzqxslzebtshnjpbnrk.supabase.co";
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SB_KEY) {
  // Try reading from .env.local
  const { readFileSync } = await import("node:fs");
  const { join } = await import("node:path");
  try {
    const envFile = readFileSync(join(process.cwd(), ".env.local"), "utf8");
    const match = envFile.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/);
    if (match) {
      process.env.SUPABASE_SERVICE_ROLE_KEY = match[1].trim();
    }
  } catch { /* ignore */ }
}

const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SERVICE_KEY) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const DRY_RUN = process.argv.includes("--dry-run");
const LIMIT = (() => {
  const arg = process.argv.find((a) => a.startsWith("--limit="));
  return arg ? parseInt(arg.split("=")[1], 10) : Infinity;
})();

const USER_AGENT = "meetupreykjavik-enricher/1.0 (baldvin@meetupreykjavik.is)";
const NOMINATIM_DELAY = 1100; // Nominatim requires max 1 req/sec
const JA_IS_DELAY = 800;

// ── Supabase helpers ──────────────────────────────────

async function sbFetch(path, options = {}) {
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: options.prefer ?? "return=minimal",
      ...options.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase ${path}: ${res.status} ${text}`);
  }
  return res;
}

async function getAllVenues() {
  const res = await sbFetch(
    "venues?select=id,name,slug,type,address,city,latitude,longitude,description,phone,email,website,amenities,capacity_total&order=name&limit=700",
    { prefer: "return=representation" }
  );
  return res.json();
}

async function updateVenue(id, updates) {
  if (DRY_RUN) {
    console.log(`  [DRY-RUN] Would update venue ${id}:`, JSON.stringify(updates).slice(0, 120));
    return;
  }
  await sbFetch(`venues?id=eq.${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}

// ── Nominatim reverse geocode ────────────────────────

async function reverseGeocode(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2&addressdetails=1&accept-language=en`;
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.address) return null;

  const a = data.address;
  const road = a.road ?? a.pedestrian ?? a.footway ?? "";
  const house = a.house_number ?? "";
  const postcode = a.postcode ?? "";
  const city = a.city ?? a.town ?? a.village ?? "Reykjavik";

  if (!road) return null;

  const parts = [road, house].filter(Boolean).join(" ");
  return `${parts}${postcode ? `, ${postcode}` : ""} ${city}`.trim();
}

// ── ja.is (Icelandic Yellow Pages) lookup ────────────

async function lookupJaIs(venueName) {
  const query = encodeURIComponent(venueName);
  const url = `https://ja.is/leita/?q=${query}`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html",
      },
    });
    if (!res.ok) return null;
    const html = await res.text();

    // Extract phone number
    const phoneMatch = html.match(/href="tel:(\+354[\d\s-]+)"/);
    const phone = phoneMatch ? phoneMatch[1].replace(/\s/g, "") : null;

    // Extract website
    const websiteMatch = html.match(/class="website"[^>]*href="(https?:\/\/[^"]+)"/);
    const website = websiteMatch ? websiteMatch[1] : null;

    // Extract address from result
    const addrMatch = html.match(/<span class="address"[^>]*>([^<]+)<\/span>/);
    const address = addrMatch ? addrMatch[1].trim() : null;

    return { phone, website, address };
  } catch {
    return null;
  }
}

// ── Description generator ────────────────────────────

const TYPE_DESCRIPTIONS = {
  bar: (name, area) =>
    `${name} is a bar in ${area || "Reykjavik"}, offering drinks and a social atmosphere for locals and visitors.`,
  restaurant: (name, area) =>
    `${name} is a restaurant in ${area || "Reykjavik"}, serving food in a welcoming setting.`,
  cafe: (name, area) =>
    `${name} is a cafe in ${area || "Reykjavik"}, serving coffee, light fare, and a relaxed daytime atmosphere.`,
  club: (name, area) =>
    `${name} is a nightclub in ${area || "Reykjavik"}, offering music, dancing, and nightlife.`,
  coworking: (name, area) =>
    `${name} is a coworking space in ${area || "Reykjavik"}, providing workspace and community for professionals.`,
  studio: (name, area) =>
    `${name} is a creative studio in ${area || "Reykjavik"}, hosting workshops, events, and artistic gatherings.`,
  outdoor: (name, area) =>
    `${name} is an outdoor venue in ${area || "Reykjavik"}, well-suited for open-air events and meetups.`,
  other: (name, area) =>
    `${name} is a venue in ${area || "Reykjavik"}, available for events and community gatherings.`,
};

function generateDescription(venue, enrichedAddress) {
  // Extract neighborhood/street from address
  const addr = enrichedAddress ?? venue.address;
  let area = "Reykjavik";
  if (addr && addr !== "Reykjavik, Reykjavik") {
    // Try to get the street name for locality
    const street = addr.split(",")[0]?.trim();
    if (street && street !== "Reykjavik") {
      area = street;
    }
  }

  const fn = TYPE_DESCRIPTIONS[venue.type] ?? TYPE_DESCRIPTIONS.other;
  return fn(venue.name, area);
}

// ── Main pipeline ────────────────────────────────────

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log(`\n🏗️  Venue enrichment pipeline`);
  console.log(`   Mode: ${DRY_RUN ? "DRY-RUN" : "LIVE"}`);
  console.log(`   Limit: ${LIMIT === Infinity ? "all" : LIMIT}\n`);

  // Step 1: Load all venues
  const venues = await getAllVenues();
  console.log(`📊 Loaded ${venues.length} venues from Supabase\n`);

  const toProcess = venues.slice(0, LIMIT);
  let enriched = 0;
  let addressFixed = 0;
  let phoneFound = 0;
  let websiteFound = 0;
  let descriptionFixed = 0;
  let errors = 0;

  for (let i = 0; i < toProcess.length; i++) {
    const venue = toProcess[i];
    const updates = {};
    const needsAddress = !venue.address || venue.address.includes("Reykjavik, Reykjavik");
    const needsPhone = !venue.phone;
    const needsWebsite = !venue.website;
    const needsDescription = !venue.description || venue.description.includes("Imported from");

    // Skip if nothing to do
    if (!needsAddress && !needsPhone && !needsWebsite && !needsDescription) {
      continue;
    }

    process.stdout.write(`[${i + 1}/${toProcess.length}] ${venue.name} ... `);

    try {
      // Nominatim for address
      if (needsAddress && venue.latitude && venue.longitude) {
        const addr = await reverseGeocode(venue.latitude, venue.longitude);
        if (addr) {
          updates.address = addr;
          addressFixed++;
        }
        await sleep(NOMINATIM_DELAY);
      }

      // ja.is is JS-rendered, skip for now — phone/website stay as-is

      // Generate description
      if (needsDescription) {
        updates.description = generateDescription(venue, updates.address ?? venue.address);
        descriptionFixed++;
      }

      // Write to DB if we have updates
      if (Object.keys(updates).length > 0) {
        await updateVenue(venue.id, updates);
        enriched++;
        console.log(`✓ ${Object.keys(updates).join(", ")}`);
      } else {
        console.log("— no new data found");
      }
    } catch (err) {
      errors++;
      console.log(`✗ ${err.message}`);
    }
  }

  console.log(`\n━━━ Results ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  Venues processed: ${toProcess.length}`);
  console.log(`  Enriched:         ${enriched}`);
  console.log(`  Addresses fixed:  ${addressFixed}`);
  console.log(`  Phones found:     ${phoneFound}`);
  console.log(`  Websites found:   ${websiteFound}`);
  console.log(`  Descriptions:     ${descriptionFixed}`);
  console.log(`  Errors:           ${errors}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
