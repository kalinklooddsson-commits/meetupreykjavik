import type { Metadata } from "next";
import { ForOrganizersScreen } from "@/components/public/public-pages";

export const metadata: Metadata = {
  title: "For Organizers",
  description:
    "Organize events in Reykjavik with real tools — group management, venue booking, ticketing, and analytics.",
  alternates: {
    canonical: "/for-organizers",
  },
  openGraph: {
    title: "For Organizers",
    description:
      "Organize events in Reykjavik with real tools — group management, venue booking, ticketing, and analytics.",
    url: "/for-organizers",
  },
  twitter: {
    card: "summary_large_image",
    title: "For Organizers",
    description:
      "Organize events in Reykjavik with real tools — group management, venue booking, and analytics.",
  },
};

export default function ForOrganizersPage() {
  return <ForOrganizersScreen />;
}
