import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/pricing",
          "/docs",
          "/product",
          "/blog",
          "/terms",
          "/privacy",
        ],
        disallow: [
          "/dashboard/",
          "/dashboard/*",
          "/admin/",
          "/admin/*",
          "/api/",
          "/api/*",
          "/auth/",
        ],
      },
    ],
    sitemap: "https://osterdops.com/sitemap.xml",
    host: "https://osterdops.com",
  };
}
