import { NextRequest, NextResponse } from "next/server";

import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { publicEvents, publicGroups, publicVenues } from "@/lib/public-data";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const limit = Math.min(
    Math.max(Number(request.nextUrl.searchParams.get("limit") ?? 10) || 10, 1),
    30,
  );

  if (!q || q.length < 2) {
    return NextResponse.json({ events: [], groups: [], venues: [] });
  }

  if (!hasSupabaseEnv()) {
    return NextResponse.json(searchMockData(q, limit));
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(searchMockData(q, limit));
  }

  try {
    const pattern = `%${q}%`;

    const [eventsResult, groupsResult, venuesResult] = await Promise.all([
      supabase
        .from("events")
        .select("id, slug, title, starts_at, venues (name)")
        .eq("status", "published")
        .ilike("title", pattern)
        .order("starts_at", { ascending: true })
        .limit(limit),
      supabase
        .from("groups")
        .select("id, slug, name, member_count")
        .eq("status", "active")
        .ilike("name", pattern)
        .order("member_count", { ascending: false })
        .limit(limit),
      supabase
        .from("venues")
        .select("id, slug, name, type, avg_rating")
        .eq("status", "active")
        .ilike("name", pattern)
        .order("avg_rating", { ascending: false })
        .limit(limit),
    ]);

    return NextResponse.json({
      events: (eventsResult.data ?? []).map((e: Record<string, unknown>) => ({
        slug: e.slug,
        title: e.title,
        startsAt: e.starts_at,
        venue: (e.venues as Record<string, string> | null)?.name ?? null,
      })),
      groups: (groupsResult.data ?? []).map((g: Record<string, unknown>) => ({
        slug: g.slug,
        name: g.name,
        memberCount: g.member_count,
      })),
      venues: (venuesResult.data ?? []).map((v: Record<string, unknown>) => ({
        slug: v.slug,
        name: v.name,
        type: v.type,
        rating: v.avg_rating,
      })),
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(searchMockData(q, limit));
  }
}

function searchMockData(q: string, limit: number) {
  const lower = q.toLowerCase();
  return {
    events: publicEvents
      .filter((e) => e.title.toLowerCase().includes(lower))
      .slice(0, limit)
      .map((e) => ({
        slug: e.slug,
        title: e.title,
        startsAt: e.startsAt ?? null,
        venue: e.venueName ?? null,
      })),
    groups: publicGroups
      .filter((g) => g.name.toLowerCase().includes(lower))
      .slice(0, limit)
      .map((g) => ({
        slug: g.slug,
        name: g.name,
        memberCount: g.members ?? 0,
      })),
    venues: publicVenues
      .filter((v) => v.name.toLowerCase().includes(lower))
      .slice(0, limit)
      .map((v) => ({
        slug: v.slug,
        name: v.name,
        type: v.type ?? "",
        rating: v.rating ?? 0,
      })),
  };
}
