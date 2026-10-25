import { cacheLife } from "next/cache";
import { getReferenceDate } from "@/lib/dates";
import { llmsFullTxt } from "@/lib/geo";

async function body() {
  "use cache";
  cacheLife({ revalidate: 86400 });
  return llmsFullTxt(await getReferenceDate());
}

export async function GET() {
  return new Response(await body(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
