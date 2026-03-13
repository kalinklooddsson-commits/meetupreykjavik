import { fetchHomePageData } from "@/lib/home-fetchers";
import { HomePage } from "@/components/home/home-page";

export default async function PublicHomePage() {
  const data = await fetchHomePageData();

  return (
    <HomePage
      heroStats={data.heroStats}
      events={data.events}
      groups={data.groups}
      venues={data.venues}
    />
  );
}
