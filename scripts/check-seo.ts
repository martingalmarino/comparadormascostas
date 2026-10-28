import { spawnSync } from "node:child_process";
import { blogSitemapItems } from "@/lib/blog";
import { getSeoCatalog, indexableEntries, renderedTitle } from "@/lib/seo-copy";
import { siteConfig } from "@/site.config";

const failures: string[] = [];

function fail(message: string) {
  failures.push(message);
}

function textOf(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function assertCatalog() {
  const entries = getSeoCatalog();
  const titles = new Set<string>();
  const descriptions = new Set<string>();
  for (const entry of entries) {
    const title = renderedTitle(entry);
    if ([...title].length > 60) fail(`${entry.path} title ${[...title].length}: ${title}`);
    if (entry.description.length < 140 || entry.description.length > 155) {
      fail(`${entry.path} meta ${entry.description.length}`);
    }
    if (!entry.h1.trim() || entry.h1 === title) fail(`${entry.path} h1 inválido`);
    if (titles.has(title)) fail(`title duplicado: ${title}`);
    if (descriptions.has(entry.description)) fail(`meta duplicada: ${entry.path}`);
    titles.add(title);
    descriptions.add(entry.description);
  }
  const indexable = indexableEntries();
  const versusThin = entries.filter((entry) => entry.path.startsWith("/versus/") && !entry.index);
  if (indexable.some((entry) => entry.path.startsWith("/guias"))) fail("el sitemap incluye guías");
  if (versusThin.some((entry) => indexable.some((item) => item.path === entry.path))) {
    fail("un versus sin precio verificado quedó indexable");
  }
  console.log(`Catálogo: ${entries.length} páginas, ${indexable.length} en el sitemap, ${versusThin.length} versus en noindex.`);
}

function assertProductionUrl() {
  const probe = spawnSync("npx", ["tsx", "scripts/probe-site-url.ts"], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: { ...process.env, NEXT_PUBLIC_SITE_URL: "", VERCEL_PROJECT_PRODUCTION_URL: "comparadormascostas.vercel.app" },
  });
  if (probe.status !== 0) {
    fail(`fallback de VERCEL_PROJECT_PRODUCTION_URL: ${(probe.stderr || probe.stdout || "").trim()}`);
    return;
  }
  console.log(`URL de producción sin NEXT_PUBLIC_SITE_URL: ${probe.stdout.trim()}`);
}

async function assertRendered(base: string) {
  const origin = base.replace(/\/$/, "");
  const sitemapResponse = await fetch(`${origin}/sitemap.xml`);
  if (!sitemapResponse.ok) fail(`sitemap ${sitemapResponse.status}`);
  const sitemap = await sitemapResponse.text();
  const localhost = sitemap.match(/localhost/g)?.length ?? 0;
  if (siteConfig.domain.includes("localhost")) console.log("Sitemap de desarrollo: localhost es el dominio local.");
  else if (localhost !== 0) fail(`sitemap contiene localhost ${localhost} veces`);
  if (sitemap.includes("/guias")) fail("sitemap incluye /guias");

  const locs = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1] ?? "");
  const today = new Date().toISOString().slice(0, 10);
  const expected = new Set([
    ...indexableEntries().map((entry) => `${siteConfig.domain}${entry.path}`),
    ...blogSitemapItems(today).map((entry) => `${siteConfig.domain}${entry.path}`),
  ]);
  if (locs.length !== expected.size) fail(`sitemap ${locs.length} urls, catálogo ${expected.size}`);
  for (const loc of locs) {
    if (!expected.has(loc)) fail(`url inesperada en sitemap: ${loc}`);
  }

  const robots = await fetch(`${origin}/robots.txt`).then((response) => response.text());
  if (/^host:/im.test(robots)) fail("robots.txt todavía publica host");
  if (!origin.includes("localhost") && robots.includes("localhost")) fail("robots.txt contiene localhost");

  for (const entry of getSeoCatalog()) {
    const url = `${origin}${entry.path}`;
    const response = await fetch(url);
    if (!response.ok) {
      fail(`${entry.path} respondió ${response.status}`);
      continue;
    }
    const html = await response.text();
    const title = textOf(html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "");
    const rendered = renderedTitle(entry);
    if (title !== rendered) fail(`${entry.path} title «${title}» ≠ «${rendered}»`);
    const description = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/)?.[1] ?? html.match(/<meta[^>]*content="([^"]*)"[^>]*name="description"/)?.[1] ?? "";
    const decoded = textOf(description);
    if (decoded !== entry.description) fail(`${entry.path} meta distinta`);
    const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((match) => textOf(match[1] ?? ""));
    if (h1s.length !== 1) fail(`${entry.path} tiene ${h1s.length} h1`);
    else if (h1s[0] !== entry.h1) fail(`${entry.path} h1 «${h1s[0]}» ≠ «${entry.h1}»`);
    const canonical = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1] ?? html.match(/<link[^>]*href="([^"]+)"[^>]*rel="canonical"/)?.[1] ?? "";
    const expectedCanonical = `${siteConfig.domain}${entry.path === "/" ? "" : entry.path}`;
    if (canonical !== expectedCanonical && canonical !== `${siteConfig.domain}${entry.path}`) {
      fail(`${entry.path} canonical «${canonical}»`);
    }
    const robotsMeta = html.match(/<meta[^>]*name="robots"[^>]*content="([^"]+)"/)?.[1] ?? "";
    if (!entry.index && !/noindex/i.test(robotsMeta)) fail(`${entry.path} debería ser noindex`);
    if (entry.index && /noindex/i.test(robotsMeta)) fail(`${entry.path} quedó noindex`);
    const hasOpenGraph = /property="og:title"|name="og:title"/.test(html);
    const hasTwitter = /name="twitter:title"|property="twitter:title"/.test(html);
    if (!hasOpenGraph || !hasTwitter) fail(`${entry.path} sin OG o Twitter`);
  }
}

async function main() {
  assertCatalog();
  assertProductionUrl();
  const base = process.env.SEO_BASE_URL;
  if (base) await assertRendered(base);
  else console.log("Sin SEO_BASE_URL: no recorrí el HTML. Pasá la URL del build para esa parte.");
  if (failures.length) {
    console.error(failures.join("\n"));
    process.exit(1);
  }
  console.log("check-seo ok");
}

void main();
