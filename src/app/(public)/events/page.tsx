import type { Metadata } from "next";
import { EventsIndexScreen } from "@/components/public/public-pages";

export const metadata: Metadata = {
  title: "Events",
  description: "Browse upcoming events in Reykjavik — socials, workshops, tastings, and outdoor adventures curated by real organizers.",
};

export default function EventsPage() {
  return <EventsIndexScreen />;
}
