import { cacheLife } from "next/cache";
import { getReferenceDate } from "@/lib/dates";
import { rssXml } from "@/lib/blog";

async function body() {
  "use cache";
  cacheLife({ revalidate: 86400 });
  return rssXml(await getReferenceDate());
}

export async function GET() {
  return new Response(await body(), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
