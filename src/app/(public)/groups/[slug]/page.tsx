import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GroupDetailScreen } from "@/components/public/public-pages";
import { fetchGroupBySlug, fetchEvents } from "@/lib/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const group = await fetchGroupBySlug(slug);

  if (!group) {
    return { title: "Group Not Found" };
  }

  const title = group.name;
  const description =
    group.summary ||
    `${group.name} — a ${group.category} group with ${group.members} members in Reykjavik`;
  const canonicalUrl = `/groups/${group.slug}`;

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
      images: group.banner
        ? [{ url: group.banner, alt: group.name }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: group.banner ? [group.banner] : undefined,
    },
  };
}

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [group, events] = await Promise.all([
    fetchGroupBySlug(slug),
    fetchEvents(),
  ]);

  if (!group) {
    notFound();
  }

  return <GroupDetailScreen group={group} events={events} />;
}
