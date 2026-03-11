import type { Metadata } from "next";
import { TermsScreen } from "@/components/public/public-pages";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "MeetupReykjavik terms of service — rules for using the platform, organizer responsibilities, and venue agreements.",
};

export default function TermsPage() {
  return <TermsScreen />;
}
