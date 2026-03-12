import type { Metadata } from "next";
import { FaqScreen } from "@/components/public/public-pages";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about MeetupReykjavik — pricing, venue partnerships, organizer tools, and more.",
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: "FAQ",
    description:
      "Frequently asked questions about MeetupReykjavik — pricing, venue partnerships, organizer tools, and more.",
    url: "/faq",
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ",
    description:
      "Frequently asked questions about MeetupReykjavik — pricing, venue partnerships, and more.",
  },
};

export default function FaqPage() {
  return <FaqScreen />;
}
