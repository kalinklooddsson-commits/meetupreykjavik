import type { Metadata } from "next";
import { CategoryDetailScreen } from "@/components/public/public-pages";
import { categories } from "@/lib/home-data";

function slugify(value: string) {
  return value.toLowerCase().replace(/æ/g, "ae").replace(/ð/g, "d").replace(/þ/g, "th").replace(/&/g, "and").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = categories.find((c) => slugify(c.name) === slug);
  const name = category?.name ?? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    title: `${name} — Events & Groups`,
    description: `Discover ${name.toLowerCase()} events, groups, and venues in Reykjavik. Find upcoming meetups and join the community.`,
    openGraph: {
      title: `${name} — Events & Groups in Reykjavik`,
      description: `Explore ${name.toLowerCase()} meetups and groups happening in Reykjavik.`,
    },
  };
}

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <CategoryDetailScreen slug={slug} />;
}
