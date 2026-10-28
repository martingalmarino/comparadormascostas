import { z } from "zod";

export const blogCategories = ["Seguros", "Cuidados"] as const;

const isoDate = z.iso.date("usá YYYY-MM-DD");

const sourceSchema = z.object({
  title: z.string().min(1, "falta el título"),
  url: z.url("tiene que ser una URL"),
  publisher: z.string().min(1, "falta el medio").optional(),
  accessed: isoDate.optional(),
});

export const blogFrontmatterSchema = z
  .object({
    title: z.string().min(1, "falta el título"),
    description: z.string().min(1, "falta la bajada").max(160, "tiene más de 160 caracteres"),
    date: isoDate,
    updated: isoDate.optional(),
    category: z.enum(blogCategories, "tiene que ser Seguros o Cuidados"),
    keywords: z.array(z.string().min(1, "hay una keyword vacía")),
    direct_answer: z.string().min(1, "está vacía").optional(),
    author: z.string().min(1, "falta el autor"),
    reviewed_by: z.string().min(1, "está vacío").optional(),
    faq: z.array(
      z.object({
        q: z.string().min(1, "falta la pregunta"),
        a: z.string().min(1, "falta la respuesta"),
      }),
    ),
    sources: z.array(sourceSchema).min(1, "hace falta al menos una fuente"),
    related: z
      .array(z.string().refine((value) => value.startsWith("/") && !value.startsWith("//"), "tiene que ser una ruta interna"))
      .optional(),
    draft: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.updated && data.updated < data.date) {
      ctx.addIssue({ code: "custom", path: ["updated"], message: "no puede ser anterior a date" });
    }
  });

export type BlogFrontmatter = z.infer<typeof blogFrontmatterSchema>;
export type BlogCategory = (typeof blogCategories)[number];

export function categorySlug(category: BlogCategory) {
  return category === "Seguros" ? "seguros" : "cuidados";
}

export function categoryFromSlug(slug: string): BlogCategory | null {
  const value = slug.trim().toLowerCase();
  if (value === "seguros") return "Seguros";
  if (value === "cuidados") return "Cuidados";
  return null;
}
