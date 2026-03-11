import { notFound } from "next/navigation";
import { GroupDetailScreen } from "@/components/public/public-pages";
import { getGroupBySlug } from "@/lib/public-data";

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const group = getGroupBySlug(slug);

  if (!group) {
    notFound();
  }

  return <GroupDetailScreen group={group} />;
}
