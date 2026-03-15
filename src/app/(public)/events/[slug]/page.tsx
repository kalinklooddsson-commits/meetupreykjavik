import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventDetailScreen } from "@/components/public/public-pages";
import { EventJsonLd } from "@/components/public/json-ld";
import { fetchEventBySlug, extractOgImageUrl } from "@/lib/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await fetchEventBySlug(slug);

  if (!event) {
    return { title: "Event Not Found" };
  }

  const title = event.title;
  const description =
    event.summary ||
    `${event.title} at ${event.venueName} — ${event.category} event in Reykjavik`;
  const canonicalUrl = `/events/${event.slug}`;
  const ogImage = extractOgImageUrl(event.art);

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
      type: "article",
      images: ogImage
        ? [{ url: ogImage, alt: event.title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await fetchEventBySlug(slug);

  if (!event) {
    notFound();
  }

  return (
    <>
      <EventJsonLd event={event} />
      <EventDetailScreen event={event} />
    </>
  );
}
