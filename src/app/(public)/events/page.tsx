import type { Metadata } from "next";
import { fetchEvents, fetchGroups, fetchVenues } from "@/lib/data";
import { EventsIndexScreen } from "@/components/public/public-pages";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Browse upcoming events in Reykjavik — socials, workshops, tastings, and outdoor adventures curated by real organizers.",
};

export default async function EventsPage() {
  const [events, groups, venues] = await Promise.all([
    fetchEvents(),
    fetchGroups(),
    fetchVenues(),
  ]);

  return (
    <EventsIndexScreen
      events={events}
      groupCount={groups.length}
      venueCount={venues.length}
    />
  );
}
