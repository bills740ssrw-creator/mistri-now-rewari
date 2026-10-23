import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${BRAND.siteUrl}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    {
      url: `${BRAND.siteUrl}/services`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BRAND.siteUrl}/how-it-works`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BRAND.siteUrl}/why-mistri-now`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BRAND.siteUrl}/support`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BRAND.siteUrl}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    { url: `${BRAND.siteUrl}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BRAND.siteUrl}/refund`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BRAND.siteUrl}/auth`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];
}
