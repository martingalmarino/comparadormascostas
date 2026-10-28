import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { blogFrontmatterSchema, categorySlug, type BlogCategory, type BlogFrontmatter } from "@/lib/blog-schema";
import { siteConfig } from "@/site.config";

const blogDir = path.join(process.cwd(), "content", "blog");
const reservedSlugs = new Set(["categoria", "rss.xml"]);
const pricePattern = /\$\s?\d|\bARS\s?\d|\d[\d.]*\s*pesos/i;

export type BlogPost = BlogFrontmatter & {
  slug: string;
  file: string;
  body: string;
  minutes: number;
};

let cache: { stamp: string; posts: BlogPost[] } | undefined;

function isoFromUnknown(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const year = value.getUTCFullYear();
    const month = String(value.getUTCMonth() + 1).padStart(2, "0");
    const day = String(value.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  return value;
}

function normalizeFrontmatter(data: unknown) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return data;
  const record = { ...(data as Record<string, unknown>) };
  record.date = isoFromUnknown(record.date);
  if ("updated" in record) record.updated = isoFromUnknown(record.updated);
  if (Array.isArray(record.sources)) {
    record.sources = record.sources.map((source) => {
      if (!source || typeof source !== "object" || Array.isArray(source)) return source;
      const item = { ...(source as Record<string, unknown>) };
      if ("accessed" in item) item.accessed = isoFromUnknown(item.accessed);
      return item;
    });
  }
  return record;
}

function issueText(path: PropertyKey[], code: string, message: string) {
  const field = path.length ? path.map(String).join(".") : "frontmatter";
  if (code === "invalid_type") return `${field}: falta`;
  return `${field}: ${message}`;
}

export function parseFrontmatter(file: string, data: unknown): BlogFrontmatter {
  const parsed = blogFrontmatterSchema.safeParse(normalizeFrontmatter(data));
  if (!parsed.success) {
    const detail = parsed.error.issues.map((issue) => issueText(issue.path, issue.code, issue.message)).join("; ");
    throw new Error(`content/blog/${file} inválido: ${detail}`);
  }
  return parsed.data;
}

export function readingMinutes(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  if (!words) return 1;
  return Math.max(1, Math.ceil(words / 200));
}

export function isPublic(post: Pick<BlogPost, "draft" | "date">, today: string) {
  return post.draft !== true && post.date <= today;
}

export function assertNoLoosePrice(file: string, body: string) {
  if (pricePattern.test(body) && !body.includes("/precios")) {
    throw new Error(`content/blog/${file}: menciona un precio. Enlazalo a /precios; no dejes un monto suelto.`);
  }
}

function isPostFile(file: string) {
  if (file.toLowerCase() === "readme.md") return false;
  return file.endsWith(".md") || file.endsWith(".mdx");
}

function loadFile(file: string): BlogPost {
  const slug = file.replace(/\.mdx?$/, "");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || reservedSlugs.has(slug)) {
    throw new Error(`content/blog/${file}: el slug «${slug}» no sirve como URL`);
  }
  let raw: string;
  try {
    raw = fs.readFileSync(path.join(blogDir, file), "utf8");
  } catch (error) {
    throw new Error(`content/blog/${file}: no se pudo leer (${error instanceof Error ? error.message : "error"})`);
  }
  let parsed: matter.GrayMatterFile<string>;
  try {
    parsed = matter(raw);
  } catch (error) {
    throw new Error(`content/blog/${file}: el frontmatter no es YAML válido (${error instanceof Error ? error.message : "error"})`);
  }
  if (!parsed.data || typeof parsed.data !== "object") {
    throw new Error(`content/blog/${file} inválido: frontmatter: falta`);
  }
  const frontmatter = parseFrontmatter(file, parsed.data);
  const body = parsed.content.replace(/^\n+/, "").replace(/\s+$/, "");
  assertNoLoosePrice(file, body);
  return { ...frontmatter, slug, file, body, minutes: readingMinutes(body) };
}

export function loadPosts() {
  if (!fs.existsSync(blogDir)) return [];
  const files = fs.readdirSync(blogDir).filter(isPostFile).sort();
  const stamp = files.map((file) => `${file}:${fs.statSync(path.join(blogDir, file)).mtimeMs}`).join("|");
  if (cache?.stamp === stamp) return cache.posts;
  const posts = files.map(loadFile);
  const slugs = new Set<string>();
  for (const post of posts) {
    if (slugs.has(post.slug)) throw new Error(`content/blog: slug duplicado ${post.slug}`);
    slugs.add(post.slug);
  }
  cache = { stamp, posts };
  return posts;
}

export function selectPosts(today: string, includeUnpublished: boolean) {
  return loadPosts()
    .filter((post) => includeUnpublished || isPublic(post, today))
    .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title, "es"));
}

export function blogSitemapItems(today: string) {
  const posts = selectPosts(today, false);
  const latest = posts.reduce((max, post) => {
    const value = post.updated ?? post.date;
    return value > max ? value : max;
  }, today);
  return [
    { path: "/blog", lastModified: latest },
    ...posts.map((post) => ({ path: `/blog/${post.slug}`, lastModified: post.updated ?? post.date })),
  ];
}

export function blogLlmsLines(today: string) {
  const domain = siteConfig.domain;
  const posts = selectPosts(today, false);
  return [
    "## Blog",
    `- [Blog](${domain}/blog): guías con fuentes citadas y fecha de actualización.`,
    ...posts.map((post) => `- [${post.title}](${domain}/blog/${post.slug}): ${post.description}`),
  ];
}

function xml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

export function rssXml(today: string) {
  const posts = selectPosts(today, false);
  const items = posts
    .map((post) => {
      const link = `${siteConfig.domain}/blog/${post.slug}`;
      return `    <item>
      <title>${xml(post.title)}</title>
      <link>${xml(link)}</link>
      <guid>${xml(link)}</guid>
      <description>${xml(post.description)}</description>
      <pubDate>${new Date(`${post.date}T12:00:00.000Z`).toUTCString()}</pubDate>
    </item>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${xml(`Blog de ${siteConfig.siteName}`)}</title>
    <link>${xml(`${siteConfig.domain}/blog`)}</link>
    <description>${xml("Guías para cuidar a tu mascota, con fuentes citadas y fecha de actualización.")}</description>
    <language>es-ar</language>
${items}
  </channel>
</rss>
`;
}

const weekdays = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

export function formatBlogDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  const date = new Date(Date.UTC(year, month - 1, day));
  const weekday = weekdays[date.getUTCDay()] ?? "";
  return `${weekday} ${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
}

export function articleJsonLd(post: BlogPost) {
  const url = `${siteConfig.domain}/blog/${post.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    author: { "@type": "Person", name: post.author },
    publisher: {
      "@type": "Organization",
      name: siteConfig.siteName,
      url: siteConfig.domain,
      logo: { "@type": "ImageObject", url: `${siteConfig.domain}/logo.svg` },
    },
    mainEntityOfPage: url,
  };
}

export function collectionJsonLd(posts: BlogPost[], category?: BlogCategory) {
  const pathName = category ? `/blog/categoria/${categorySlug(category)}` : "/blog";
  const name = category ? `Guías de ${category.toLowerCase()}` : "Guías para cuidar a tu mascota";
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description: "Salud, viajes y cómo elegir un seguro o una obra social. Con fuentes citadas y fecha de actualización.",
    url: `${siteConfig.domain}${pathName}`,
    hasPart: posts.map((post) => ({
      "@type": "Article",
      headline: post.title,
      url: `${siteConfig.domain}/blog/${post.slug}`,
      datePublished: post.date,
    })),
  };
}

function labelFor(href: string, titles: Map<string, string>) {
  if (href === "/comparar") return "Comparador";
  if (href === "/precios") return "Precios del mes";
  if (href === "/seguro-para-perros") return "Seguro para perros";
  if (href === "/seguro-para-gatos") return "Seguro para gatos";
  const blog = /^\/blog\/([a-z0-9-]+)$/.exec(href);
  if (blog) return titles.get(blog[1] ?? "") ?? "Otra guía";
  const marca = /^\/planes\/([a-z0-9-]+)$/.exec(href);
  if (marca) return `Ficha de ${marca[1]?.replaceAll("-", " ")}`;
  return href;
}

export function followLinks(post: BlogPost, catalog: BlogPost[]) {
  const blob = `${post.slug} ${post.title} ${post.keywords.join(" ")} ${post.description}`.toLocaleLowerCase("es");
  const perro = blob.includes("perro");
  const gato = blob.includes("gato");
  const titles = new Map(catalog.map((item) => [item.slug, item.title]));
  const links: { href: string; label: string }[] = [
    { href: "/comparar", label: "Comparador" },
    { href: "/precios", label: "Precios del mes" },
  ];
  if (perro || !gato) links.push({ href: "/seguro-para-perros", label: "Seguro para perros" });
  if (gato || !perro) links.push({ href: "/seguro-para-gatos", label: "Seguro para gatos" });
  for (const href of post.related ?? []) {
    if (links.some((item) => item.href === href)) continue;
    links.push({ href, label: labelFor(href, titles) });
  }
  return links;
}

export const blogIndexDescription =
  "Salud, viajes y cómo elegir un seguro o una obra social. Con fuentes citadas y fecha de actualización.";
