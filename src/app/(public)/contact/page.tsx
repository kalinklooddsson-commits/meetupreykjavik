import type { Metadata } from "next";
import { ContactScreen } from "@/components/public/public-pages";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with MeetupReykjavik — questions, partnerships, or feedback.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact",
    description:
      "Get in touch with MeetupReykjavik — questions, partnerships, or feedback.",
    url: "/contact",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact",
    description:
      "Get in touch with MeetupReykjavik — questions, partnerships, or feedback.",
  },
};

export default function ContactPage() {
  return <ContactScreen />;
}
