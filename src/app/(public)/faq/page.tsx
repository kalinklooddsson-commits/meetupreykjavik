import type { Metadata } from "next";
import { FaqScreen } from "@/components/public/public-pages";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about MeetupReykjavik — pricing, venue partnerships, organizer tools, and more.",
};

export default function FaqPage() {
  return <FaqScreen />;
}
