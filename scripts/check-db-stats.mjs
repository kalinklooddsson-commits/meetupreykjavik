#!/usr/bin/env node
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
const headers = { apikey: key, Authorization: `Bearer ${key}` };

const vRes = await fetch(`${url}/rest/v1/venues?status=eq.active&select=id`, { headers: { ...headers, Prefer: "count=exact" } });
console.log("Active venues content-range:", vRes.headers.get("content-range"));

const eRes = await fetch(`${url}/rest/v1/events?status=eq.published&select=slug,rsvp_count,venue_name`, { headers });
const events = await eRes.json();
let total = 0;
for (const e of events) {
  console.log(`  ${e.slug} → rsvp_count: ${e.rsvp_count}, venue: ${e.venue_name}`);
  total += (e.rsvp_count || 0);
}
console.log(`\nTotal rsvp_count from DB: ${total}`);
console.log(`DB events count: ${events.length}`);
