import type { Metadata } from "next";
import { fetchEvents, fetchGroups, fetchVenues } from "@/lib/data";
import { EventsIndexScreen } from "@/components/public/public-pages";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Browse upcoming events in Reykjavik — socials, workshops, tastings, and outdoor adventures curated by real organizers.",
  alternates: {
    canonical: "/events",
  },
  openGraph: {
    title: "Events",
    description:
      "Browse upcoming events in Reykjavik — socials, workshops, tastings, and outdoor adventures curated by real organizers.",
    url: "/events",
  },
  twitter: {
    card: "summary_large_image",
    title: "Events",
    description:
      "Browse upcoming events in Reykjavik — socials, workshops, tastings, and outdoor adventures.",
  },
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
        e.groupName.toLowerCase().includes(query) ||
        e.venueName.toLowerCase().includes(query) ||
        (e.summary?.toLowerCase().includes(query) ?? false),
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
    if (when === "starting-soon") {
      // Show today's events sorted by start time (soonest first)
      filteredEvents = filteredEvents
        .filter((e) => e.dateFilter === "Today" || e.dateFilter === "This Week")
        .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
        .slice(0, 6);
    } else {
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
