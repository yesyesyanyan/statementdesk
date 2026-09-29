import type { MetadataRoute } from "next";
import { BANKS, FORMAT_PAGES, SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: SITE.url, lastModified: now, priority: 1 },
    { url: `${SITE.url}/banks`, lastModified: now, priority: 0.7 },
    { url: `${SITE.url}/pricing`, lastModified: now, priority: 0.5 },
    { url: `${SITE.url}/privacy`, lastModified: now, priority: 0.3 },
    ...FORMAT_PAGES.map((f) => ({ url: `${SITE.url}/convert/${f.slug}`, lastModified: now, priority: 0.9 })),
    ...BANKS.map((b) => ({ url: `${SITE.url}/banks/${b.slug}`, lastModified: now, priority: 0.8 })),
  ];
}
