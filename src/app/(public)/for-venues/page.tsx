import type { Metadata } from "next";
import { ForVenuesScreen } from "@/components/public/public-pages";

export const metadata: Metadata = {
  title: "For Venues",
  description: "Become a MeetupReykjavik venue partner — booking tools, member deals, and community visibility for your space.",
};

export default function ForVenuesPage() {
  return <ForVenuesScreen />;
}
