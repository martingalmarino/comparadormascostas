import type { MetadataRoute } from "next";
import { siteConfig } from "@/site.config";

const agents = [
  "*",
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: agents.map((userAgent) => ({
      userAgent,
      allow: "/",
      disallow: ["/api/", "/admin"],
    })),
    sitemap: `${siteConfig.domain}/sitemap.xml`,
  };
}
