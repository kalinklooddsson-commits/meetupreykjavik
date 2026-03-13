#!/usr/bin/env node
/**
 * Enrich venues with Google Places API (New).
 *
 * Fills in: phone, website, and optionally upgrades descriptions
 * with Google's editorial summaries.
 *
 * Usage:
 *   node scripts/enrich-google-places.mjs              # enrich all venues missing data
 *   node scripts/enrich-google-places.mjs --dry-run    # preview without writing
 *   node scripts/enrich-google-places.mjs --limit=10   # process first N
 *   node scripts/enrich-google-places.mjs --force-desc  # overwrite existing descriptions too
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

// ── Config ──────────────────────────────────────────

function loadEnv() {
  try {
    const envFile = readFileSync(join(process.cwd(), ".env.local"), "utf8");
    for (const line of envFile.split("\n")) {
      const m = line.match(/^([A-Z_]+)=(.+)/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
    }
  } catch { /* .env.local not found, rely on env */ }
}
loadEnv();

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GAPI_KEY = process.env.GOOGLE_PLACES_API_KEY;

if (!SB_KEY) { console.error("Missing SUPABASE_SERVICE_ROLE_KEY"); process.exit(1); }
if (!GAPI_KEY) { console.error("Missing GOOGLE_PLACES_API_KEY"); process.exit(1); }

const DRY_RUN = process.argv.includes("--dry-run");
const FORCE_DESC = process.argv.includes("--force-desc");
const LIMIT = (() => {
  const arg = process.argv.find((a) => a.startsWith("--limit="));
  return arg ? parseInt(arg.split("=")[1], 10) : Infinity;
})();

// Google rate limit: ~6000 QPM on paid plan, but be conservative
const GOOGLE_DELAY = 200; // ms between requests

// ── Supabase helpers ────────────────────────────────

async function sbFetch(path, options = {}) {
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${SB_KEY}`,
      "Content-Type": "application/json",
      Prefer: options.prefer ?? "return=minimal",
      ...options.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase ${res.status}: ${text.slice(0, 200)}`);
  }
  return res;
}

async function getAllVenues() {
  const res = await sbFetch(
    "venues?select=id,name,slug,type,address,city,latitude,longitude,description,phone,website&order=name&limit=700",
    { prefer: "return=representation" }
  );
  return res.json();
}

async function updateVenue(id, updates) {
  if (DRY_RUN) {
    console.log(`  [DRY] Would update: ${JSON.stringify(updates).slice(0, 150)}`);
    return;
  }
  await sbFetch(`venues?id=eq.${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}

// ── Google Places API (New) ─────────────────────────

async function searchPlace(venueName, lat, lng) {
  const body = {
    textQuery: `${venueName}, Reykjavik, Iceland`,
    maxResultCount: 1,
    languageCode: "en",
  };

  // If we have coordinates, bias the search within 500m
  if (lat && lng) {
    body.locationBias = {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius: 500.0,
      },
    };
  }

  const fieldMask = [
    "places.displayName",
    "places.formattedAddress",
    "places.nationalPhoneNumber",
    "places.internationalPhoneNumber",
    "places.websiteUri",
    "places.editorialSummary",
    "places.types",
    "places.googleMapsUri",
  ].join(",");

  const res = await fetch(
    `https://places.googleapis.com/v1/places:searchText`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GAPI_KEY,
        "X-Goog-FieldMask": fieldMask,
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google Places ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  if (!data.places || data.places.length === 0) return null;
  return data.places[0];
}

// ── Helpers ─────────────────────────────────────────

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Normalize a name for fuzzy comparison */
function normName(s) {
  return s
    .toLowerCase()
    .replace(/[^a-záðéíóúýþæö0-9]/gi, "")  // keep Icelandic chars
    .replace(/\s+/g, "");
}

/**
 * Check if the Google result plausibly matches our venue.
 * Returns true if names share a significant common substring.
 */
function namesMatch(venueName, googleName) {
  const a = normName(venueName);
  const b = normName(googleName);
  // Exact match after normalization
  if (a === b) return true;
  // One contains the other
  if (a.includes(b) || b.includes(a)) return true;
  // Share a word of 4+ chars
  const wordsA = venueName.toLowerCase().split(/\s+/).filter(w => w.length >= 4);
  const wordsB = googleName.toLowerCase().split(/\s+/).filter(w => w.length >= 4);
  for (const w of wordsA) {
    if (wordsB.some(wb => wb.includes(w) || w.includes(wb))) return true;
  }
  return false;
}

/** Check if a venue's description looks auto-generated / low quality */
function isWeakDescription(desc) {
  if (!desc) return true;
  if (desc.includes("Imported from")) return true;
  // Our template-generated descriptions are formulaic: "X is a bar in Y..."
  if (/^.+ is a (bar|restaurant|cafe|club|venue|nightclub|coworking|studio|outdoor venue) in /.test(desc)) return true;
  return false;
}

/** Clean up Google editorial text */
function cleanEditorial(text, venueName) {
  if (!text) return null;
  // Google sometimes returns very short or useless text
  if (text.length < 20) return null;
  return text;
}

// ── Main ────────────────────────────────────────────

async function main() {
  console.log(`\n🔍 Google Places enrichment`);
  console.log(`   Mode: ${DRY_RUN ? "DRY-RUN" : "LIVE"}`);
  console.log(`   Limit: ${LIMIT === Infinity ? "all" : LIMIT}`);
  console.log(`   Force descriptions: ${FORCE_DESC}\n`);

  const venues = await getAllVenues();
  console.log(`📊 Loaded ${venues.length} venues\n`);

  // Filter to venues that actually need enrichment
  const needsWork = venues.filter((v) => {
    const missingPhone = !v.phone;
    const missingWebsite = !v.website;
    const weakDesc = FORCE_DESC ? isWeakDescription(v.description) : false;
    return missingPhone || missingWebsite || weakDesc;
  });

  console.log(`🎯 ${needsWork.length} venues need enrichment (${venues.length - needsWork.length} already complete)\n`);

  const toProcess = needsWork.slice(0, LIMIT);
  const stats = { processed: 0, enriched: 0, phones: 0, websites: 0, descriptions: 0, notFound: 0, errors: 0 };

  for (let i = 0; i < toProcess.length; i++) {
    const venue = toProcess[i];
    process.stdout.write(`[${i + 1}/${toProcess.length}] ${venue.name.padEnd(40).slice(0, 40)} `);

    try {
      const place = await searchPlace(venue.name, venue.latitude, venue.longitude);

      if (!place) {
        stats.notFound++;
        console.log("— not found on Google");
        await sleep(GOOGLE_DELAY);
        continue;
      }

      const googleName = place.displayName?.text ?? "";
      if (!namesMatch(venue.name, googleName)) {
        stats.notFound++;
        console.log(`— skipped (Google: "${googleName}" ≠ ours)`);
        await sleep(GOOGLE_DELAY);
        continue;
      }

      const updates = {};

      // Phone
      if (!venue.phone) {
        const phone = place.internationalPhoneNumber ?? place.nationalPhoneNumber;
        if (phone) {
          updates.phone = phone.replace(/\s/g, "");
          stats.phones++;
        }
      }

      // Website
      if (!venue.website) {
        if (place.websiteUri) {
          updates.website = place.websiteUri;
          stats.websites++;
        }
      }

      // Description — only upgrade if explicitly asked or current is weak
      if (FORCE_DESC && isWeakDescription(venue.description)) {
        const editorial = place.editorialSummary?.text;
        const cleaned = cleanEditorial(editorial, venue.name);
        if (cleaned) {
          updates.description = cleaned;
          stats.descriptions++;
        }
      }

      if (Object.keys(updates).length > 0) {
        await updateVenue(venue.id, updates);
        stats.enriched++;
        const fields = Object.keys(updates).join(", ");
        console.log(`✓ ${fields}`);
      } else {
        console.log("— no new data from Google");
      }

      stats.processed++;
      await sleep(GOOGLE_DELAY);
    } catch (err) {
      stats.errors++;
      console.log(`✗ ${err.message.slice(0, 100)}`);
      // If we hit quota, stop
      if (err.message.includes("429") || err.message.includes("RESOURCE_EXHAUSTED")) {
        console.error("\n⚠️  Rate limited — stopping. Re-run to continue from where we left off.\n");
        break;
      }
      await sleep(GOOGLE_DELAY * 3);
    }
  }

  console.log(`\n━━━ Results ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  Processed:    ${stats.processed}`);
  console.log(`  Enriched:     ${stats.enriched}`);
  console.log(`  Phones added: ${stats.phones}`);
  console.log(`  Websites added: ${stats.websites}`);
  console.log(`  Descriptions: ${stats.descriptions}`);
  console.log(`  Not found:    ${stats.notFound}`);
  console.log(`  Errors:       ${stats.errors}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
