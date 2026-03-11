import type { Route } from "next";

export const siteConfig = {
  name: "MeetupReykjavik",
  location: "Reykjavik, Iceland",
  description:
    "Discover events. Meet people. Support local venues. Free to join, built for Reykjavik.",
  url: "https://meetupreykjavik.com",
} as const;

export const publicNavigation = [
  { href: "/events", label: "Events" },
  { href: "/groups", label: "Groups" },
  { href: "/venues", label: "Venues" },
] as const satisfies ReadonlyArray<{ href: Route; label: string }>;

export const footerColumns = [
  {
    title: "Explore",
    links: [
      { href: "/events", label: "Events" },
      { href: "/groups", label: "Groups" },
      { href: "/venues", label: "Venues" },
      { href: "/pricing", label: "Categories" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/pricing", label: "Pricing" },
      { href: "/blog", label: "Blog" },
      { href: "/venues", label: "For Venues" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/privacy", label: "Terms" },
      { href: "/privacy", label: "Contact" },
    ],
  },
] as const satisfies ReadonlyArray<{
  title: string;
  links: ReadonlyArray<{ href: Route; label: string }>;
}>;
