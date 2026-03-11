import type { Metadata } from "next";
import { PricingScreen } from "@/components/public/public-pages";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing for members, organizers, and venue partners. Free to browse, paid tools for serious hosts.",
};

export default function PricingPage() {
  return <PricingScreen />;
}
