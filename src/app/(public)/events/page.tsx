import type { Metadata } from "next";
import { fetchEvents, fetchGroups, fetchVenues } from "@/lib/data";
import { EventsIndexScreen } from "@/components/public/public-pages";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Browse upcoming events in Reykjavik — socials, workshops, tastings, and outdoor adventures curated by real organizers.",
};

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; when?: string }>;
}) {
  const { q, category, when } = await searchParams;
  const [events, groups, venues] = await Promise.all([
    fetchEvents(),
    fetchGroups(),
    fetchVenues(),
  ]);

  let filteredEvents = events;

  // Text search
  if (q) {
    const query = q.toLowerCase();
    filteredEvents = filteredEvents.filter(
      (e) =>
        e.title.toLowerCase().includes(query) ||
        e.category.toLowerCase().includes(query) ||
        e.group.toLowerCase().includes(query) ||
        e.venue.toLowerCase().includes(query) ||
        (e.description?.toLowerCase().includes(query) ?? false),
    );
  }

  // Category filter
  if (category) {
    filteredEvents = filteredEvents.filter(
      (e) => e.category.toLowerCase() === category.toLowerCase(),
    );
  }

  // Time filter (uses the dateFilter field on each event)
  if (when) {
    const timeMap: Record<string, string> = {
      today: "Today",
      "this-week": "This Week",
      weekend: "Weekend",
      month: "Month",
    };
    const mapped = timeMap[when];
    if (mapped) {
      filteredEvents = filteredEvents.filter((e) => e.dateFilter === mapped);
    }
  }

  return (
    <EventsIndexScreen
      events={filteredEvents}
      groupCount={groups.length}
      venueCount={venues.length}
      searchQuery={q}
      activeCategory={category}
      activeWhen={when}
    />
  );
}
