const siglas: Record<string, string> = {
  "petit-salud": "PS",
  avsim: "AV",
  "ike-mascotas": "IK",
  companion: "CO",
  fielpet: "FP",
  osmasc: "OM",
  "puppis-one": "PU",
  "pet-society": "PT",
  "qualia-seguros": "QU",
  "rus-seguros": "RU",
  "answer-seguros": "AN",
  "provincia-seguros-banco-provincia": "BP",
  "federacion-patronal-via-mascotaleal": "ML",
  "bbva-seguros": "BB",
};

const especieNombres: Record<string, string> = {
  perro: "Perro",
  gato: "Gato",
  conejo: "Conejo",
  ave: "Ave",
};

export function formatArs(value: number) {
  const formatted = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(value);
  return `$${formatted}`;
}

export function formatPrecioMes(value: number) {
  return `${formatArs(value)}/mes`;
}

export function formatDate(iso: string) {
  const [year, month, day] = iso.slice(0, 10).split("-");
  if (!year || !month || !day) return iso;
  return `${day}/${month}/${year}`;
}

const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

export function formatMonth(iso: string) {
  const [year, month] = iso.slice(0, 10).split("-");
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, 1));
  return new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric", timeZone: "UTC" }).format(date);
}

/** «octubre 2026», a partir de una fecha de verificación. No usa la fecha del sistema. */
export function formatMonthYear(iso: string) {
  const [year, month] = iso.slice(0, 10).split("-");
  const name = meses[Number(month) - 1];
  if (!year || !name) return iso;
  return `${name} ${year}`;
}

const mesesCortos = ["ene.", "feb.", "mar.", "abr.", "may.", "jun.", "jul.", "ago.", "sep.", "oct.", "nov.", "dic."];

/** «oct. 2026», a partir de una fecha de verificación. */
export function formatMonthAbbr(iso: string) {
  const [year, month] = iso.slice(0, 10).split("-");
  const name = mesesCortos[Number(month) - 1];
  if (!year || !name) return iso;
  return `${name} ${year}`;
}

export function marcaIniciales(marcaSlug: string, marca: string) {
  if (siglas[marcaSlug]) return siglas[marcaSlug];
  const parts = marca.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function especieLabel(especie: string | undefined) {
  if (!especie) return "Perro o gato";
  return especieNombres[especie] ?? especie;
}
