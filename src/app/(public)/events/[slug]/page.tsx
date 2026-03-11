import { notFound } from "next/navigation";
import { EventDetailScreen } from "@/components/public/public-pages";
import { getEventBySlug } from "@/lib/public-data";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  return <EventDetailScreen event={event} />;
}
