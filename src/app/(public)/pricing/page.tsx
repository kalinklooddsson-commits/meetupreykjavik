import type { Metadata } from "next";
import { PricingScreen } from "@/components/public/public-pages";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for members, organizers, and venue partners. Free to browse, paid tools for serious hosts.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "Pricing",
    description:
      "Simple, transparent pricing for members, organizers, and venue partners. Free to browse, paid tools for serious hosts.",
    url: "/pricing",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing",
    description:
      "Simple, transparent pricing for members, organizers, and venue partners.",
  },
};

export default function PricingPage() {
  return <PricingScreen />;
}
