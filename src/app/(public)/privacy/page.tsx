import type { Metadata } from "next";
import { PrivacyScreen } from "@/components/public/public-pages";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "MeetupReykjavik privacy policy — how we handle your data, cookies, and personal information.",
};

export default function PrivacyPage() {
  return <PrivacyScreen />;
}
