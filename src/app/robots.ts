import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/worker/", "/account/", "/bookings/", "/auth", "/api/"],
      },
    ],
    sitemap: `${BRAND.siteUrl}/sitemap.xml`,
    host: BRAND.siteUrl,
  };
}
