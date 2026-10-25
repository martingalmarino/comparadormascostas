import { z } from "zod";

export const planTipos = ["obra_social", "plan_salud", "seguro", "plan_veterinaria", "club_beneficios"] as const;
export const especies = ["perro", "gato", "conejo", "ave"] as const;

export const scrapingSchema = z.object({
  url: z.string(),
  metodo: z.enum(["html_estatico", "js_render", "manual"]),
  selector: z.string(),
});

export const planSchema = z.object({
  id: z.string().min(1),
  marca: z.string().min(1),
  marca_slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  logo: z.string().regex(/^\/logos\/[a-z0-9-]+\.(svg|png)$/).optional(),
  logo_fuente: z.string().url().optional(),
  nombre: z.string().min(1),
  tipo: z.enum(planTipos),
  especies: z.array(z.enum(especies)).min(1),
  edad_min_meses: z.number().int().nonnegative().optional(),
  edad_max_anios: z.number().int().positive().optional(),
  zonas: z.array(z.string().min(1)),
  zona_detalle: z.string().optional(),
  incluye_cordoba: z.boolean().nullable().optional(),
  precio: z.number().int().nonnegative().nullable(),
  precio_texto_original: z.string().optional(),
  moneda: z.literal("ARS"),
  es_ejemplo: z.boolean(),
  fecha_verificacion: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  fuente_url: z.string().min(1),
  estado: z.enum(["verificado", "requiere_revision", "consultar", "sin_precio_publico", "desactualizado"]),
  coberturas: z.array(z.object({ item: z.string().min(1), valor: z.string().min(1).optional() })).min(1),
  carencias: z.array(z.object({ item: z.string().min(1), dias: z.number().int().nonnegative() })),
  carencias_texto: z.string().optional(),
  notas: z.string().optional(),
  scraping: scrapingSchema.optional(),
  pros: z.array(z.string()),
  contras: z.array(z.string()),
  badges: z
    .array(z.enum(["mejor_precio", "mas_cobertura", "sin_carencia", "internacional"]))
    .optional(),
  lead: z.object({
    modo: z.enum(["form", "whatsapp", "link"]),
    destino: z.string().optional(),
  }),
  resumen: z.string().optional(),
  precio_detectado: z.number().int().nonnegative().nullable().optional(),
});

export type Plan = z.infer<typeof planSchema>;
export type PlanTipo = Plan["tipo"];
export type PlanEstado = Plan["estado"];
export type Especie = (typeof especies)[number];
