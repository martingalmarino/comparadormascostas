import { z } from "zod";

const fuenteSchema = z.object({
  fuente_url: z.string().url(),
  fecha_verificacion: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

function campo<T extends z.ZodType>(valor: T) {
  return fuenteSchema.extend({ valor }).nullable();
}

export const marcaSchema = z
  .object({
    slug: z.string(),
    tipo_entidad: z.string(),
    fecha_verificacion: z.string(),
    empresa: z.object({
      razon_social: campo(z.string()),
      cuit: campo(z.string().nullable()),
      ssn: fuenteSchema
        .extend({
          numero: z.string(),
          registro_url: z.string().url(),
        })
        .nullable(),
    }),
    canales: z.array(fuenteSchema.extend({ tipo: z.string(), valor: z.string() })),
    como_se_usa: z.object({
      contratar: campo(z.string()),
      reintegro: campo(z.string()),
      siniestro: campo(z.string()),
      baja: campo(z.string()),
    }),
    red_veterinaria: campo(z.string()),
    edad: campo(z.string()),
    carencias: campo(z.string()),
    otros_productos: campo(z.array(z.string())),
    inconsistencias: z.array(fuenteSchema.extend({ descripcion: z.string() })),
    no_publica: z.array(z.string()),
  })
  .strict();

export type Marca = z.infer<typeof marcaSchema>;
export type CampoFuente = { valor: unknown; fuente_url: string; fecha_verificacion: string };
