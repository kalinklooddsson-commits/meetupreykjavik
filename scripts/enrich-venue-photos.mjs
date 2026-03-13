#!/usr/bin/env node
/**
 * Fetch venue photos from Google Places and upload to Supabase Storage.
 *
 * For each venue:
 * 1. Search Google Places → get photo reference
 * 2. Download photo as JPEG (800px wide)
 * 3. Upload to Supabase Storage (venue-photos bucket)
 * 4. Update hero_photo_url in DB
 *
 * Usage:
 *   node scripts/enrich-venue-photos.mjs              # all venues with placeholder images
 *   node scripts/enrich-venue-photos.mjs --dry-run    # preview without writing
 *   node scripts/enrich-venue-photos.mjs --limit=10   # first N only
 *   node scripts/enrich-venue-photos.mjs --force      # overwrite existing real photos too
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
  } catch {}
}
loadEnv();

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GAPI_KEY = process.env.GOOGLE_PLACES_API_KEY;

if (!SB_KEY) { console.error("Missing SUPABASE_SERVICE_ROLE_KEY"); process.exit(1); }
if (!GAPI_KEY) { console.error("Missing GOOGLE_PLACES_API_KEY"); process.exit(1); }

const DRY_RUN = process.argv.includes("--dry-run");
const FORCE = process.argv.includes("--force");
const LIMIT = (() => {
  const arg = process.argv.find((a) => a.startsWith("--limit="));
  return arg ? parseInt(arg.split("=")[1], 10) : Infinity;
})();

const PHOTO_WIDTH = 800; // px — good balance of quality vs file size
const BUCKET = "venue-photos";
const GOOGLE_DELAY = 250; // ms between requests

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
    "venues?select=id,name,slug,type,latitude,longitude,hero_photo_url,photos&order=name&limit=700",
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

async function uploadToStorage(filePath, buffer) {
  if (DRY_RUN) {
    console.log(`  [DRY] Would upload ${buffer.length} bytes → ${BUCKET}/${filePath}`);
    return `${SB_URL}/storage/v1/object/public/${BUCKET}/${filePath}`;
  }

  const res = await fetch(`${SB_URL}/storage/v1/object/${BUCKET}/${filePath}`, {
    method: "POST",
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${SB_KEY}`,
      "Content-Type": "image/jpeg",
      "x-upsert": "true",
    },
    body: buffer,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Storage upload ${res.status}: ${text.slice(0, 200)}`);
  }

  return `${SB_URL}/storage/v1/object/public/${BUCKET}/${filePath}`;
}

// ── Google Places API ───────────────────────────────

async function searchPlacePhotos(venueName, lat, lng) {
  const body = {
    textQuery: `${venueName}, Reykjavik, Iceland`,
    maxResultCount: 1,
    languageCode: "en",
  };

  if (lat && lng) {
    body.locationBias = {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius: 500.0,
      },
    };
  }

  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GAPI_KEY,
      "X-Goog-FieldMask": "places.displayName,places.photos",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google ${res.status}: ${errText.slice(0, 150)}`);
  }

  const data = await res.json();
  if (!data.places || data.places.length === 0) return null;
  return data.places[0];
}

async function downloadPhoto(photoName) {
  const url = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${PHOTO_WIDTH}&key=${GAPI_KEY}`;
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`Photo download ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

// ── Helpers ─────────────────────────────────────────

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function normName(s) {
  return s.toLowerCase().replace(/[^a-záðéíóúýþæö0-9]/gi, "").replace(/\s+/g, "");
}

function namesMatch(venueName, googleName) {
  const a = normName(venueName);
  const b = normName(googleName);
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;
  const wordsA = venueName.toLowerCase().split(/\s+/).filter(w => w.length >= 4);
  const wordsB = googleName.toLowerCase().split(/\s+/).filter(w => w.length >= 4);
  for (const w of wordsA) {
    if (wordsB.some(wb => wb.includes(w) || w.includes(wb))) return true;
  }
  return false;
}

/** Check if venue still has a placeholder/generated image */
function hasPlaceholderImage(venue) {
  const url = venue.hero_photo_url ?? "";
  if (!url) return true;
  if (url.includes("/generated/")) return true;
  if (url.endsWith(".svg")) return true;
  if (url.includes("wikipedia.org")) return true;
  return false;
}

// ── Main ────────────────────────────────────────────

async function main() {
  console.log(`\n📸 Venue photo enrichment`);
  console.log(`   Mode: ${DRY_RUN ? "DRY-RUN" : "LIVE"}`);
  console.log(`   Limit: ${LIMIT === Infinity ? "all" : LIMIT}`);
  console.log(`   Force overwrite: ${FORCE}\n`);

  const venues = await getAllVenues();
  console.log(`📊 Loaded ${venues.length} venues\n`);

  // Filter to venues needing photos
  const needsWork = venues.filter((v) => FORCE || hasPlaceholderImage(v));
  console.log(`🎯 ${needsWork.length} venues need real photos (${venues.length - needsWork.length} already have one)\n`);

  const toProcess = needsWork.slice(0, LIMIT);
  const stats = { processed: 0, uploaded: 0, notFound: 0, noPhoto: 0, nameMismatch: 0, errors: 0 };

  for (let i = 0; i < toProcess.length; i++) {
    const venue = toProcess[i];
    process.stdout.write(`[${i + 1}/${toProcess.length}] ${venue.name.padEnd(40).slice(0, 40)} `);

    try {
      // Step 1: Search Google Places for this venue
      const place = await searchPlacePhotos(venue.name, venue.latitude, venue.longitude);

      if (!place) {
        stats.notFound++;
        console.log("— not found");
        await sleep(GOOGLE_DELAY);
        continue;
      }

      // Name check
      const googleName = place.displayName?.text ?? "";
      if (!namesMatch(venue.name, googleName)) {
        stats.nameMismatch++;
        console.log(`— skipped ("${googleName}" ≠ ours)`);
        await sleep(GOOGLE_DELAY);
        continue;
      }

      // Step 2: Get photo reference
      if (!place.photos || place.photos.length === 0) {
        stats.noPhoto++;
        console.log("— no photos on Google");
        await sleep(GOOGLE_DELAY);
        continue;
      }

      const photoRef = place.photos[0].name;

      // Step 3: Download photo
      const photoBuffer = await downloadPhoto(photoRef);
      const filePath = `${venue.slug}.jpg`;

      // Step 4: Upload to Supabase Storage
      const publicUrl = await uploadToStorage(filePath, photoBuffer);

      // Step 5: Update venue record
      const updates = {
        hero_photo_url: publicUrl,
        photos: [publicUrl],
      };
      await updateVenue(venue.id, updates);

      stats.uploaded++;
      const sizeKB = Math.round(photoBuffer.length / 1024);
      console.log(`✓ ${sizeKB}KB → ${filePath}`);

      stats.processed++;
      await sleep(GOOGLE_DELAY);
    } catch (err) {
      stats.errors++;
      console.log(`✗ ${err.message.slice(0, 100)}`);
      if (err.message.includes("429") || err.message.includes("RESOURCE_EXHAUSTED")) {
        console.error("\n⚠️  Rate limited — re-run to continue.\n");
        break;
      }
      if (err.message.includes("403")) {
        console.error("\n⚠️  API key error (403) — check Google Cloud Console.\n");
        break;
      }
      await sleep(GOOGLE_DELAY * 3);
    }
  }

  console.log(`\n━━━ Results ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  Processed:      ${stats.processed}`);
  console.log(`  Photos uploaded: ${stats.uploaded}`);
  console.log(`  Not found:      ${stats.notFound}`);
  console.log(`  No photos:      ${stats.noPhoto}`);
  console.log(`  Name mismatch:  ${stats.nameMismatch}`);
  console.log(`  Errors:         ${stats.errors}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
