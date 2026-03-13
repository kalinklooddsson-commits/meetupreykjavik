import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  SourcedVenueDetailScreen,
  VenueDetailScreen,
} from "@/components/public/public-pages";
import { VenueJsonLd } from "@/components/public/json-ld";
import { fetchVenueBySlug } from "@/lib/data";
import { getSourcedPlaceBySlug, getSourcedPlaces } from "@/lib/reykjavik-source-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const venue = await fetchVenueBySlug(slug);
  const sourcedPlace = venue ? null : getSourcedPlaceBySlug(slug);

  if (!venue && !sourcedPlace) {
    return { title: "Venue Not Found" };
  }

  if (venue) {
    const title = venue.name;
    const description =
      venue.summary ||
      `${venue.name} — a ${venue.type} in ${venue.area}, Reykjavik`;
    const canonicalUrl = `/venues/${venue.slug}`;

    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        type: "profile",
        images: venue.art
          ? [{ url: venue.art, alt: venue.name }]
          : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: venue.art ? [venue.art] : undefined,
      },
    };
  }

  // Sourced place
  const place = sourcedPlace!;
  const title = place.name;
  const description =
    place.summary ||
    `${place.name} — ${place.kindLabel} in ${place.area}, Reykjavik`;
  const canonicalUrl = `/venues/${place.slug}`;
  const imageUrl = place.image?.remoteUrl || place.image?.localPath;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "profile",
      images: imageUrl
        ? [{ url: imageUrl, alt: place.name }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function VenueDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const venue = await fetchVenueBySlug(slug);
  const sourcedPlace = venue ? null : getSourcedPlaceBySlug(slug);

  if (!venue && !sourcedPlace) {
    notFound();
  }

  if (venue) {
    return (
      <>
        <VenueJsonLd venue={venue} />
        <VenueDetailScreen venue={venue} />
      </>
    );
  }

  const relatedPlaces = getSourcedPlaces()
    .filter(
      (item) =>
        item.slug !== sourcedPlace!.slug &&
        (item.area === sourcedPlace!.area || item.laneKey === sourcedPlace!.laneKey),
    )
    .slice(0, 4);

  return <SourcedVenueDetailScreen place={sourcedPlace!} relatedPlaces={relatedPlaces} />;
}
