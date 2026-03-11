import { CategoryDetailScreen } from "@/components/public/public-pages";

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <CategoryDetailScreen slug={slug} />;
}
