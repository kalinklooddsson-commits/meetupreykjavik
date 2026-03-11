import { notFound } from "next/navigation";
import { BlogDetailScreen } from "@/components/public/public-pages";
import { getBlogPostBySlug } from "@/lib/public-data";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return <BlogDetailScreen post={post} />;
}
