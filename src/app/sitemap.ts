import type { MetadataRoute } from "next";
import { fetchEvents, fetchGroups, fetchVenues } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://meetupreykjavik.vercel.app";

  const staticPages = [
    "",
    "/events",
    "/groups",
    "/venues",
    "/about",
    "/pricing",
    "/blog",
    "/contact",
    "/faq",
    "/privacy",
    "/terms",
    "/for-venues",
    "/for-organizers",
    "/categories",
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const events = await fetchEvents({ limit: 100 });
  const eventPages = (Array.isArray(events) ? events : []).map((e: any) => ({
    url: `${baseUrl}/events/${e.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  const groups = await fetchGroups({ limit: 100 });
  const groupPages = (Array.isArray(groups) ? groups : []).map((g: any) => ({
    url: `${baseUrl}/groups/${g.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const venues = await fetchVenues({ limit: 100 });
  const venuePages = (Array.isArray(venues) ? venues : []).map((v: any) => ({
    url: `${baseUrl}/venues/${v.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...eventPages, ...groupPages, ...venuePages];
}
