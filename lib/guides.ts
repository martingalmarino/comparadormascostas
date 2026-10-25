import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

const guideSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  updated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  faq: z.array(z.object({ q: z.string(), a: z.string() })),
});

export type Guide = z.infer<typeof guideSchema> & { slug: string; body: string };

const guidesDir = path.join(process.cwd(), "content", "guias");

export function getGuides(): Guide[] {
  if (!fs.existsSync(guidesDir)) return [];
  return fs
    .readdirSync(guidesDir)
    .filter((file) => file.endsWith(".mdx"))
    .sort()
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(guidesDir, file), "utf8");
      const parsed = matter(raw);
      const meta = guideSchema.safeParse(parsed.data);
      if (!meta.success) {
        throw new Error(`content/guias/${file} inválido: ${meta.error.issues.map((issue) => issue.message).join("; ")}`);
      }
      return { slug, body: parsed.content, ...meta.data };
    });
}

export function getGuide(slug: string) {
  return getGuides().find((guide) => guide.slug === slug);
}
