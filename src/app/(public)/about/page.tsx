import type { Metadata } from "next";
import { AboutScreen } from "@/components/public/public-pages";

export const metadata: Metadata = {
  title: "About",
  description: "About MeetupReykjavik — a local platform for events, groups, and venue partnerships built specifically for Reykjavik.",
};

export default function AboutPage() {
  return <AboutScreen />;
}
