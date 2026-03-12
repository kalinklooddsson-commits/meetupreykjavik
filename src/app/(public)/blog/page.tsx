import type { Metadata } from "next";
import { BlogIndexScreen } from "@/components/public/public-pages";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Thoughts on community design, local events, and building a better social layer for Reykjavik.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Blog",
    description:
      "Thoughts on community design, local events, and building a better social layer for Reykjavik.",
    url: "/blog",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog",
    description:
      "Thoughts on community design, local events, and building a better social layer for Reykjavik.",
  },
};

export default function BlogPage() {
  return <BlogIndexScreen />;
}
