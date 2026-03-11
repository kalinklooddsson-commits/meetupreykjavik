import { notFound } from "next/navigation";
import {
  SourcedVenueDetailScreen,
  VenueDetailScreen,
} from "@/components/public/public-pages";
import { getVenueBySlug } from "@/lib/public-data";
import { getSourcedPlaceBySlug } from "@/lib/reykjavik-source-data";

export default async function VenueDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const venue = getVenueBySlug(slug);
  const sourcedPlace = venue ? null : getSourcedPlaceBySlug(slug);

  if (!venue && !sourcedPlace) {
    notFound();
  }

  if (venue) {
    return <VenueDetailScreen venue={venue} />;
  }

  return <SourcedVenueDetailScreen place={sourcedPlace!} />;
}
