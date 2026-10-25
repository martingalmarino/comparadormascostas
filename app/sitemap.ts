import type { MetadataRoute } from "next";
import { indexableEntries } from "@/lib/seo-copy";
import { siteConfig } from "@/site.config";

export default function sitemap(): MetadataRoute.Sitemap {
  return indexableEntries().map((entry) => ({
    url: `${siteConfig.domain}${entry.path}`,
    lastModified: entry.lastModified,
    changeFrequency: "weekly",
    priority: entry.path === "/" ? 1 : entry.path.startsWith("/planes/") ? 0.8 : entry.path.startsWith("/versus/") ? 0.5 : 0.7,
  }));
}
