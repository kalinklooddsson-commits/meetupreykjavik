import type { Metadata } from "next";
import { ContactScreen } from "@/components/public/public-pages";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with MeetupReykjavik — questions, partnerships, or feedback.",
};

export default function ContactPage() {
  return <ContactScreen />;
}
