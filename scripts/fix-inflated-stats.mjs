#!/usr/bin/env node
/**
 * Fix inflated stats in Supabase:
 * 1. Zero out fake rsvp_count values on all events (seed data artifacts)
 * 2. Report actual venue count
 */
import { readFileSync } from "node:fs";

try {
  const lines = readFileSync(".env.local", "utf-8").split("\n");
  for (const line of lines) {
    const eq = line.indexOf("=");
    if (eq > 0) {
      const k = line.slice(0, eq).trim();
      let v = line.slice(eq + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      if (!process.env[k]) process.env[k] = v;
    }
  }
} catch {}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };

// Zero out fake rsvp_count on all events
console.log("Zeroing out fake rsvp_count on all events...");
const res = await fetch(`${url}/rest/v1/events?rsvp_count=gt.0`, {
  method: "PATCH",
  headers: { ...headers, Prefer: "return=minimal" },
  body: JSON.stringify({ rsvp_count: 0 }),
});
console.log(`  PATCH status: ${res.status}`);

// Verify
const eRes = await fetch(`${url}/rest/v1/events?status=eq.published&select=slug,rsvp_count`, { headers });
const events = await eRes.json();
const total = events.reduce((s, e) => s + (e.rsvp_count || 0), 0);
console.log(`  Total rsvp_count after fix: ${total}`);

// Check venue count
const vRes = await fetch(`${url}/rest/v1/venues?status=eq.active&select=id`, { headers: { ...headers, Prefer: "count=exact" } });
console.log(`\nActive venues: ${vRes.headers.get("content-range")}`);
console.log("Note: 634 venues are seed data. The events page will show this count.");
console.log("Consider suspending non-real venues or adjusting the fetchVenues limit.");

console.log("\nDone!");
