import { notFound } from "next/navigation";
import { GroupDetailScreen } from "@/components/public/public-pages";
import { fetchGroupBySlug } from "@/lib/data";

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const group = await fetchGroupBySlug(slug);

  if (!group) {
    notFound();
  }

  return <GroupDetailScreen group={group} />;
}
