import type { Metadata } from "next";
import { fetchVenues } from "@/lib/data";
import { VenuesIndexScreen } from "@/components/public/public-pages";

export const metadata: Metadata = {
  title: "Venues",
  description:
    "Explore partner venues across Reykjavik — bars, cafés, restaurants, and coworking spaces that host community events.",
};

export default async function VenuesPage() {
  const venues = await fetchVenues();

  return <VenuesIndexScreen venues={venues} />;
}
