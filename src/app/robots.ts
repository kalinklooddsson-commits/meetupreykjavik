import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard/", "/organizer/", "/venue/", "/admin/"],
    },
    sitemap: "https://meetupreykjavik.vercel.app/sitemap.xml",
  };
}
