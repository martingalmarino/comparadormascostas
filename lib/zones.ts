export const zones = [
  { slug: "cordoba-capital", label: "Córdoba Capital", parent: null },
  { slug: "nueva-cordoba", label: "Nueva Córdoba", parent: "cordoba-capital" },
  { slug: "general-paz", label: "General Paz", parent: "cordoba-capital" },
  { slug: "centro", label: "Centro", parent: "cordoba-capital" },
  { slug: "alberdi", label: "Alberdi", parent: "cordoba-capital" },
  { slug: "cerro-de-las-rosas", label: "Cerro de las Rosas", parent: "cordoba-capital" },
  { slug: "gran-cordoba", label: "Gran Córdoba", parent: null },
  { slug: "sierras-chicas", label: "Sierras Chicas", parent: "gran-cordoba" },
  { slug: "villa-carlos-paz", label: "Villa Carlos Paz", parent: "gran-cordoba" },
  { slug: "rio-cuarto", label: "Río Cuarto", parent: null },
  { slug: "villa-maria", label: "Villa María", parent: null },
] as const;

export type ZoneSlug = (typeof zones)[number]["slug"];

export const ageOptions = [
  { meses: 2, label: "2 meses" },
  { meses: 6, label: "6 meses" },
  { meses: 12, label: "1 año" },
  { meses: 36, label: "Adulto (3 años)" },
  { meses: 84, label: "Adulto (7 años)" },
  { meses: 120, label: "Mayor (10 años)" },
  { meses: 144, label: "Mayor (12 años)" },
] as const;

export const priceOptions = [
  { max: 15000, label: "Hasta $15.000" },
  { max: 30000, label: "Hasta $30.000" },
  { max: 50000, label: "Hasta $50.000" },
  { max: 80000, label: "Hasta $80.000" },
] as const;

export const tipoOptions = [
  { id: "obra_social", label: "Obra social" },
  { id: "plan_salud", label: "Plan de salud" },
  { id: "seguro", label: "Seguro" },
  { id: "plan_veterinaria", label: "Plan de veterinaria" },
  { id: "club_beneficios", label: "Club de beneficios" },
] as const;

export const coverageFilters = [
  { id: "vacunacion", label: "Vacunación", test: /vacun/i },
  { id: "cirugias", label: "Cirugías", test: /cirug/i },
  { id: "urgencias", label: "Urgencias 24 h", test: /urgenc|24\s*h/i },
  { id: "consultas", label: "Consultas", test: /consulta/i },
  { id: "internacional", label: "Internacional", test: /internacional/i },
] as const;

export const sortOptions = [
  { id: "precio", label: "Menor precio" },
  { id: "cobertura", label: "Más cobertura" },
  { id: "actualizado", label: "Más reciente" },
] as const;

export function zoneLabel(slug: string | undefined) {
  return zones.find((zone) => zone.slug === slug)?.label ?? slug;
}

export function isKnownZone(slug: string) {
  return zones.some((zone) => zone.slug === slug);
}
