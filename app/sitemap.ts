import { cacheLife } from "next/cache";
import type { MetadataRoute } from "next";
import { blogSitemapItems } from "@/lib/blog";
import { getReferenceDate } from "@/lib/dates";
import { indexableEntries } from "@/lib/seo-copy";
import { siteConfig } from "@/site.config";

async function entries(): Promise<MetadataRoute.Sitemap> {
  "use cache";
  cacheLife({ revalidate: 86400 });
  const today = await getReferenceDate();
  const pages = indexableEntries().map((entry) => ({
    url: `${siteConfig.domain}${entry.path}`,
    lastModified: entry.lastModified,
    changeFrequency: "weekly" as const,
    priority: entry.path === "/" ? 1 : entry.path.startsWith("/planes/") ? 0.8 : entry.path.startsWith("/versus/") ? 0.5 : 0.7,
  }));
  const blog = blogSitemapItems(today).map((entry) => ({
    url: `${siteConfig.domain}${entry.path}`,
    lastModified: entry.lastModified,
    changeFrequency: "weekly" as const,
    priority: entry.path === "/blog" ? 0.6 : 0.5,
  }));
  return [...pages, ...blog];
}

export default async function sitemap() {
  return entries();
}
