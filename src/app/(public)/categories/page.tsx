import { CategoriesIndexScreen } from "@/components/public/public-pages";
import { fetchHomePageData } from "@/lib/home-fetchers";

export default async function CategoriesPage() {
  const { categoryCounts } = await fetchHomePageData();
  return <CategoriesIndexScreen categoryCounts={categoryCounts} />;
}
