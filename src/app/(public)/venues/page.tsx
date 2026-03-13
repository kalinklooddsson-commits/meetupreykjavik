import type { Metadata } from "next";
import { fetchVenues } from "@/lib/data";
import { VenuesIndexScreen } from "@/components/public/public-pages";
import { getSourcedPlaces } from "@/lib/reykjavik-source-data";

export const metadata: Metadata = {
  title: "Venues",
  description:
    "Explore partner venues across Reykjavik — bars, cafés, restaurants, and coworking spaces that host community events.",
  alternates: {
    canonical: "/venues",
  },
  openGraph: {
    title: "Venues",
    description:
      "Explore partner venues across Reykjavik — bars, cafés, restaurants, and coworking spaces that host community events.",
    url: "/venues",
  },
  twitter: {
    card: "summary_large_image",
    title: "Venues",
    description:
      "Explore partner venues across Reykjavik — bars, cafés, restaurants, and coworking spaces.",
  },
};

export default async function VenuesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; area?: string }>;
}) {
  const { q, type, area } = await searchParams;
  const venues = await fetchVenues();

  let filteredVenues = venues;
  if (q) {
    const query = q.toLowerCase();
    filteredVenues = filteredVenues.filter(
      (v) =>
        v.name.toLowerCase().includes(query) ||
        v.type.toLowerCase().includes(query) ||
        v.area.toLowerCase().includes(query) ||
        v.summary.toLowerCase().includes(query) ||
        v.amenities.some((a: string) => a.toLowerCase().includes(query)),
    );
  }
  if (type) {
    filteredVenues = filteredVenues.filter(
      (v) => v.type.toLowerCase() === type.toLowerCase(),
    );
  }
  if (area) {
    filteredVenues = filteredVenues.filter(
      (v) => v.area.toLowerCase() === area.toLowerCase(),
    );
  }

  return (
    <VenuesIndexScreen
      venues={filteredVenues}
      searchQuery={q}
      activeType={type}
      activeArea={area}
      featuredSourcedPlaces={getSourcedPlaces()}
    />
  );
}
