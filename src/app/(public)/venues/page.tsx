import type { Metadata } from "next";
import { VenuesIndexScreen } from "@/components/public/public-pages";

export const metadata: Metadata = {
  title: "Venues",
  description: "Explore partner venues across Reykjavik — bars, cafés, restaurants, and coworking spaces that host community events.",
};

export default function VenuesPage() {
  return <VenuesIndexScreen />;
}
