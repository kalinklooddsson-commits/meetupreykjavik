import type { Metadata } from "next";
import { AboutScreen } from "@/components/public/public-pages";

export const metadata: Metadata = {
  title: "About",
  description:
    "About MeetupReykjavik — a local platform for events, groups, and venue partnerships built specifically for Reykjavik.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About",
    description:
      "About MeetupReykjavik — a local platform for events, groups, and venue partnerships built specifically for Reykjavik.",
    url: "/about",
  },
  twitter: {
    card: "summary_large_image",
    title: "About",
    description:
      "About MeetupReykjavik — a local platform for events, groups, and venue partnerships in Reykjavik.",
  },
};

export default function AboutPage() {
  return <AboutScreen />;
}
