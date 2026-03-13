import { HomePage } from "@/components/home/home-page";
import { getHomePageData } from "@/lib/home-fetcher";

export default async function PublicHomePage() {
  const data = await getHomePageData();
  return <HomePage data={data} />;
}
