import type { Metadata } from "next";
import { CategoriesIndexScreen } from "@/components/public/public-pages";
import { fetchHomePageData } from "@/lib/home-fetchers";

export const metadata: Metadata = {
  title: "Categories",
  description:
    "Browse events, groups, and venues in Reykjavik by category — nightlife, outdoors, tech, food, music, and more.",
};

export default async function CategoriesPage() {
  const { categoryCounts } = await fetchHomePageData();
  return <CategoriesIndexScreen categoryCounts={categoryCounts} />;
}
