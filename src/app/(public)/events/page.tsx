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
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const [events, groups, venues] = await Promise.all([
    fetchEvents(),
    fetchGroups(),
    fetchVenues(),
  ]);

  const filteredEvents = q
    ? events.filter((e) => {
        const query = q.toLowerCase();
        return (
          e.title.toLowerCase().includes(query) ||
          e.category.toLowerCase().includes(query) ||
          e.group.toLowerCase().includes(query) ||
          e.venue.toLowerCase().includes(query) ||
          (e.description?.toLowerCase().includes(query) ?? false)
        );
      })
    : events;

  return (
    <EventsIndexScreen
      events={filteredEvents}
      groupCount={groups.length}
      venueCount={venues.length}
      searchQuery={q}
    />
  );
}
