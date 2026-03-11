import { notFound } from "next/navigation";
import { VenueDetailScreen } from "@/components/public/public-pages";
import { getVenueBySlug } from "@/lib/public-data";

export default async function VenueDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const venue = getVenueBySlug(slug);

  if (!venue) {
    notFound();
  }

  return <VenueDetailScreen venue={venue} />;
}
