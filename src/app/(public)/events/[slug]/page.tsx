import { notFound } from "next/navigation";
import { EventDetailScreen } from "@/components/public/public-pages";
import { fetchEventBySlug } from "@/lib/data";

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

  return <EventDetailScreen event={event} />;
}
