const adicionalHogar = new Set(["la-caja", "nacion-seguros", "sancor-seguros", "zurich"]);

export const avisoAdicionalHogar = "Solo como adicional del seguro de hogar";

export function esAdicionalHogar(slug: string) {
  return adicionalHogar.has(slug);
}
