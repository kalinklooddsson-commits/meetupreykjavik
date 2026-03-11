import type { Metadata } from "next";
import { BlogIndexScreen } from "@/components/public/public-pages";

export const metadata: Metadata = {
  title: "Blog",
  description: "Thoughts on community design, local events, and building a better social layer for Reykjavik.",
};

export default function BlogPage() {
  return <BlogIndexScreen />;
}
