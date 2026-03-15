#!/usr/bin/env node
/**
 * Fix Supabase data quality issues for soft launch.
 *
 * Runs the same SQL fixes described in the deployment checklist:
 * - Delete junk events (Untitled Event, Lebowski Trivia Night)
 * - Fix venue names, addresses, and types
 * - Fix event venue assignments
 * - Clear placeholder event descriptions
 *
 * Usage:
 *   node scripts/fix-supabase-data.mjs              # run fixes
 *   node scripts/fix-supabase-data.mjs --dry-run    # preview only
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

// ── Config ──────────────────────────────────────────

function loadEnv() {
  try {
    const envPath = join(process.cwd(), ".env.local");
    const lines = readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // .env.local may not exist
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DRY_RUN = process.argv.includes("--dry-run");

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

// Use fetch-based Supabase REST API calls (no npm dependency needed)
async function supabaseRpc(method, table, { filters = {}, body, select = "*" } = {}) {
  const url = new URL(`/rest/v1/${table}`, SUPABASE_URL);

  // Add filters as query params
  for (const [col, val] of Object.entries(filters)) {
    url.searchParams.set(col, val);
  }

  if (method === "GET") {
    url.searchParams.set("select", select);
  }

  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    Prefer: method === "PATCH" ? "return=minimal" : "return=representation",
  };

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${table}: ${res.status} ${text}`);
  }

  if (res.status === 204 || res.headers.get("content-length") === "0") return null;
  return res.json();
}

function log(emoji, msg) {
  console.log(`${DRY_RUN ? "[DRY RUN] " : ""}${emoji} ${msg}`);
}

// ── Fixes ──────────────────────────────────────────

async function deleteJunkEvents() {
  log("🗑️", "Deleting junk events (untitled-event, lebowski-trivia-night)...");

  const junkSlugs = ["untitled-event", "lebowski-trivia-night"];

  for (const slug of junkSlugs) {
    // Delete RSVPs first (FK constraint)
    if (!DRY_RUN) {
      // Get event ID
      const events = await supabaseRpc("GET", "events", {
        filters: { slug: `eq.${slug}` },
        select: "id",
      });

      if (events && events.length > 0) {
        const eventId = events[0].id;
        await supabaseRpc("DELETE", "rsvps", {
          filters: { event_id: `eq.${eventId}` },
        });
        await supabaseRpc("DELETE", "events", {
          filters: { slug: `eq.${slug}` },
        });
        log("✅", `  Deleted event: ${slug}`);
      } else {
        log("⏭️", `  Event not found: ${slug}`);
      }
    }
  }
}

async function fixEsjaTrailhead() {
  log("🏔️", "Fixing Esja Trailhead capitalization...");
  if (!DRY_RUN) {
    await supabaseRpc("PATCH", "venues", {
      filters: { name: "ilike.%esja trailhead%" },
      body: { name: "Esja Trailhead" },
    });
    await supabaseRpc("PATCH", "events", {
      filters: { venue_name: "ilike.%esja trailhead%" },
      body: { venue_name: "Esja Trailhead" },
    });
    log("✅", "  Fixed Esja Trailhead");
  }
}

async function fixStartupPitchNight() {
  log("📍", "Reassigning Startup Pitch Night from Hlemmur Square → Grandi Hub...");
  if (!DRY_RUN) {
    // Look up Grandi Hub's venue ID
    const venues = await supabaseRpc("GET", "venues", {
      filters: { slug: "eq.grandi-hub" },
      select: "id",
    });
    if (venues && venues.length > 0) {
      await supabaseRpc("PATCH", "events", {
        filters: { slug: "eq.startup-pitch-night" },
        body: { venue_id: venues[0].id, venue_name: "Grandi Hub" },
      });
      log("✅", "  Fixed Startup Pitch Night venue");
    } else {
      log("⚠️", "  Grandi Hub venue not found in DB — skipping");
    }
  }
}

async function fixGaukurinn() {
  log("🎸", 'Fixing Gamli Gaukurinn → Gaukurinn...');
  if (!DRY_RUN) {
    await supabaseRpc("PATCH", "venues", {
      filters: { name: "eq.Gamli Gaukurinn" },
      body: { name: "Gaukurinn" },
    });
    log("✅", "  Fixed Gaukurinn name");
  }
}

async function fixBryggjuhusid() {
  log("🍷", "Fixing Bryggjuhusid address...");
  if (!DRY_RUN) {
    // venues.type CHECK constraint allows: bar, restaurant, club, cafe, coworking, studio, outdoor, other
    await supabaseRpc("PATCH", "venues", {
      filters: { slug: "eq.bryggjuhusid" },
      body: {
        address: "Vesturgata 2, 101 Reykjavik",
        type: "bar",
      },
    });
    log("✅", "  Fixed Bryggjuhusid");
  }
}

async function fixSnaps() {
  log("🍽️", 'Fixing Snaps Bistro Bar → Snaps...');
  if (!DRY_RUN) {
    await supabaseRpc("PATCH", "venues", {
      filters: { name: "eq.Snaps Bistro Bar" },
      body: { name: "Snaps" },
    });
    await supabaseRpc("PATCH", "events", {
      filters: { venue_name: "eq.Snaps Bistro Bar" },
      body: { venue_name: "Snaps" },
    });
    log("✅", "  Fixed Snaps");
  }
}

async function fixPlaceholderDescriptions() {
  log("📝", "Clearing placeholder event descriptions...");

  const slugs = [
    "morning-yoga-flow",
    "saturday-hike-mt-esja",
    "harbor-jazz-social",
    "speed-friending-newcomers",
    "poetry-open-mic",
    "craft-beer-tasting-vesturgata",
    "language-exchange-thursday",
  ];

  if (!DRY_RUN) {
    for (const slug of slugs) {
      // Check if description contains placeholder text
      const events = await supabaseRpc("GET", "events", {
        filters: { slug: `eq.${slug}`, description: "like.*event in Reykjavik*" },
        select: "id,slug,description",
      });

      if (events && events.length > 0) {
        await supabaseRpc("PATCH", "events", {
          filters: { slug: `eq.${slug}` },
          body: { description: null },
        });
        log("✅", `  Cleared description for: ${slug}`);
      } else {
        log("⏭️", `  No placeholder description for: ${slug}`);
      }
    }
  }
}

async function verifyResults() {
  log("🔍", "Verifying results...");

  const events = await supabaseRpc("GET", "events", {
    select: "slug,venue_name",
  });
  console.log("\n  Events:");
  for (const e of (events || [])) {
    console.log(`    ${e.slug} → ${e.venue_name || "(no venue)"}`);
  }

  const venues = await supabaseRpc("GET", "venues", {
    filters: { slug: "in.(bryggjuhusid,esja-trailhead,gamli-gaukurinn,gaukurinn,snaps)" },
    select: "slug,name,address",
  });
  console.log("\n  Venues:");
  for (const v of (venues || [])) {
    console.log(`    ${v.slug} → ${v.name} (${v.address})`);
  }
}

// ── Main ──────────────────────────────────────────

async function main() {
  console.log(DRY_RUN ? "\n🧪 DRY RUN MODE\n" : "\n🚀 Running Supabase data fixes...\n");

  await deleteJunkEvents();
  await fixEsjaTrailhead();
  await fixStartupPitchNight();
  await fixGaukurinn();
  await fixBryggjuhusid();
  await fixSnaps();
  await fixPlaceholderDescriptions();
  await verifyResults();

  console.log("\n✨ Done!\n");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
