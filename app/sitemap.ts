import type { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://renttracker.nextgenui.in";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      lastModified: new Date("2026-05-01"),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: new Date("2026-05-01"),
      changeFrequency: "yearly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/tenant/login`,
      lastModified: new Date("2026-05-01"),
      changeFrequency: "yearly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/privacy-policy`,
      lastModified: new Date("2026-05-01"),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/license`,
      lastModified: new Date("2026-05-01"),
      changeFrequency: "never",
      priority: 0.3,
    },
  ];
}
