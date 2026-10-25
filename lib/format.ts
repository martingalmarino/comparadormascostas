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

export function formatDate(iso: string) {
  const [year, month, day] = iso.slice(0, 10).split("-");
  if (!year || !month || !day) return iso;
  return `${day}/${month}/${year}`;
}

export function formatMonth(iso: string) {
  const [year, month] = iso.slice(0, 10).split("-");
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, 1));
  return new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric", timeZone: "UTC" }).format(date);
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
