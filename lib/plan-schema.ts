import { z } from "zod";

export const planSchema = z.object({
  id: z.string().min(1),
  marca: z.string().min(1),
  marca_slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  nombre: z.string().min(1),
  tipo: z.enum(["obra_social", "plan_salud", "seguro"]),
  especies: z.array(z.enum(["perro", "gato"])).min(1),
  edad_min_meses: z.number().int().nonnegative().optional(),
  edad_max_anios: z.number().int().positive().optional(),
  zonas: z.array(z.string().min(1)).min(1),
  precio: z.number().int().nonnegative().nullable(),
  moneda: z.literal("ARS"),
  es_ejemplo: z.boolean(),
  fecha_verificacion: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  fuente_url: z.string().min(1),
  estado: z.enum(["verificado", "requiere_revision", "sin_precio_publico", "desactualizado"]),
  coberturas: z.array(z.object({ item: z.string().min(1), valor: z.string().min(1) })).min(1),
  carencias: z.array(z.object({ item: z.string().min(1), dias: z.number().int().nonnegative() })),
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
export type Especie = "perro" | "gato";
