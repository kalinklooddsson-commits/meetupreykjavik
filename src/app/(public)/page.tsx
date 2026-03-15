import type { Metadata } from "next";
import { fetchHomePageData } from "@/lib/home-fetchers";
import { HomePage } from "@/components/home/home-page";

export const metadata: Metadata = {
  title: "MeetupReykjavik — Events, Groups & Venues in Reykjavik",
  description:
    "Discover the best meetups, social events, and community groups in Reykjavik. Find venues, join groups, and connect with people in Iceland's capital.",
  openGraph: {
    title: "MeetupReykjavik — Events, Groups & Venues in Reykjavik",
    description:
      "Discover the best meetups, social events, and community groups in Reykjavik.",
    url: "/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MeetupReykjavik — Events, Groups & Venues in Reykjavik",
    description:
      "Discover the best meetups, social events, and community groups in Reykjavik.",
  },
};

export default async function PublicHomePage() {
  const data = await fetchHomePageData();

  return (
    <HomePage
      heroStats={data.heroStats}
      events={data.events}
      groups={data.groups}
      venues={data.venues}
      categoryCounts={data.categoryCounts}
    />
  );
}
