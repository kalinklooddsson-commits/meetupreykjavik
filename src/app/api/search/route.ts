import { NextRequest, NextResponse } from "next/server";
import { fetchEvents, fetchGroups, fetchVenues } from "@/lib/data";

/**
 * GET /api/search?q=<query>
 *
 * Searches across events, groups, and venues by title/name.
 * Returns lightweight results matching the SearchResult type
 * consumed by the search overlay in site-header-client.tsx.
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim().toLowerCase();
  if (!q || q.length < 2) {
    return NextResponse.json({ events: [], groups: [], venues: [] });
  }

  // Fetch all data in parallel — these functions handle
  // Supabase vs mock fallback internally
  const [allEvents, allGroups, allVenues] = await Promise.all([
    fetchEvents(),
    fetchGroups(),
    fetchVenues(),
  ]);

  // Simple substring match across relevant fields
  const events = allEvents
    .filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.venueName.toLowerCase().includes(q) ||
        e.area.toLowerCase().includes(q),
    )
    .slice(0, 8)
    .map((e) => ({ slug: e.slug, title: e.title, starts_at: e.startsAt }));

  const groups = allGroups
    .filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q) ||
        g.summary.toLowerCase().includes(q),
    )
    .slice(0, 6)
    .map((g) => ({ slug: g.slug, name: g.name }));

  const venues = allVenues
    .filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.type.toLowerCase().includes(q) ||
        v.area.toLowerCase().includes(q),
    )
    .slice(0, 6)
    .map((v) => ({ slug: v.slug, name: v.name, type: v.type }));

  return NextResponse.json({ events, groups, venues });
}
