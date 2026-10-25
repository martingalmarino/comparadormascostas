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

/** Páginas de provincia publicadas. Un href vacío no se enlaza: Buenos Aires entra cuando exista la ruta. */
export const paginasProvincia = [
  { label: "Córdoba", href: "/cordoba" },
  { label: "Veterinarias con plan en Córdoba", href: "/cordoba/veterinarias-con-plan" },
  { label: "Buenos Aires", href: "" },
] as const;

export function enlacesPorProvincia() {
  return paginasProvincia.filter((item) => item.href);
}

export const sortOptions = [
  { id: "precio", label: "Menor precio" },
  { id: "cobertura", label: "Más cobertura" },
  { id: "actualizado", label: "Más reciente" },
] as const;
