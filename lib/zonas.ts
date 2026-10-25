export const jurisdicciones = [
  { slug: "caba", label: "CABA" },
  { slug: "buenos-aires", label: "Buenos Aires" },
  { slug: "catamarca", label: "Catamarca" },
  { slug: "chaco", label: "Chaco" },
  { slug: "chubut", label: "Chubut" },
  { slug: "cordoba", label: "Córdoba" },
  { slug: "corrientes", label: "Corrientes" },
  { slug: "entre-rios", label: "Entre Ríos" },
  { slug: "formosa", label: "Formosa" },
  { slug: "jujuy", label: "Jujuy" },
  { slug: "la-pampa", label: "La Pampa" },
  { slug: "la-rioja", label: "La Rioja" },
  { slug: "mendoza", label: "Mendoza" },
  { slug: "misiones", label: "Misiones" },
  { slug: "neuquen", label: "Neuquén" },
  { slug: "rio-negro", label: "Río Negro" },
  { slug: "salta", label: "Salta" },
  { slug: "san-juan", label: "San Juan" },
  { slug: "san-luis", label: "San Luis" },
  { slug: "santa-cruz", label: "Santa Cruz" },
  { slug: "santa-fe", label: "Santa Fe" },
  { slug: "santiago-del-estero", label: "Santiago del Estero" },
  { slug: "tierra-del-fuego", label: "Tierra del Fuego" },
  { slug: "tucuman", label: "Tucumán" },
] as const;

export type JurisdiccionSlug = (typeof jurisdicciones)[number]["slug"];

export const PROVINCIA_TODAS = "todas" as const;

export const coberturaProvincias = [PROVINCIA_TODAS, ...jurisdicciones.map((item) => item.slug)] as const;

export function isJurisdiccion(slug: string): slug is JurisdiccionSlug {
  return jurisdicciones.some((item) => item.slug === slug);
}

export function jurisdiccionLabel(slug: string | undefined) {
  if (slug === PROVINCIA_TODAS) return "Todo el país";
  return jurisdicciones.find((item) => item.slug === slug)?.label;
}

export function provinciasConPlanes(plans: { zonas: { provincia: string }[] }[]) {
  const present = new Set<string>();
  for (const plan of plans) {
    for (const zona of plan.zonas) {
      if (isJurisdiccion(zona.provincia)) present.add(zona.provincia);
    }
  }
  return jurisdicciones
    .filter((item) => present.has(item.slug))
    .slice()
    .sort((a, b) => a.label.localeCompare(b.label, "es"));
}
