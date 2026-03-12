import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MeetupReykjavik",
    short_name: "Meetup RVK",
    description:
      "Discover events, join groups, and explore venue partners across Reykjavik.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f0e8",
    theme_color: "#3730A3",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
