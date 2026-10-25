import { planTipos, type Especie, type Plan, type PlanTipo } from "@/lib/plan-schema";
import { coverageFilters, isKnownZone, zones } from "@/lib/zones";

export type SortKey = "precio" | "cobertura" | "actualizado";

export type Filters = {
  especie?: Especie;
  meses?: number;
  zona?: string;
  tipo?: PlanTipo;
  max?: number;
  cob: string[];
  ids: string[];
  orden: SortKey;
};

export type RawSearch = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = raw?.trim();
  return trimmed ? trimmed : undefined;
}

export function parseFilters(search: RawSearch): Filters {
  const especie = first(search.especie);
  const tipo = first(search.tipo);
  const meses = Number(first(search.meses));
  const max = Number(first(search.max));
  const orden = first(search.orden);
  const zona = first(search.zona);
  return {
    especie: especie === "perro" || especie === "gato" ? especie : undefined,
    meses: Number.isFinite(meses) && meses > 0 ? meses : undefined,
    zona: zona && isKnownZone(zona) ? zona : undefined,
    tipo: planTipos.includes(tipo as PlanTipo) ? (tipo as PlanTipo) : undefined,
    max: Number.isFinite(max) && max > 0 ? max : undefined,
    cob: (first(search.cob) ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter((item) => coverageFilters.some((filter) => filter.id === item)),
    ids: (first(search.ids) ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 3),
    orden: orden === "cobertura" || orden === "actualizado" ? orden : "precio",
  };
}

export function serializeFilters(filters: Filters) {
  const params = new URLSearchParams();
  if (filters.especie) params.set("especie", filters.especie);
  if (filters.meses) params.set("meses", String(filters.meses));
  if (filters.zona) params.set("zona", filters.zona);
  if (filters.tipo) params.set("tipo", filters.tipo);
  if (filters.max) params.set("max", String(filters.max));
  if (filters.cob.length) params.set("cob", filters.cob.join(","));
  if (filters.ids.length) params.set("ids", filters.ids.join(","));
  if (filters.orden !== "precio") params.set("orden", filters.orden);
  return params.toString();
}

export function hasNarrowingFilters(filters: Filters) {
  return Boolean(
    filters.especie ||
      filters.meses ||
      filters.zona ||
      filters.tipo ||
      filters.max ||
      filters.cob.length ||
      filters.ids.length ||
      filters.orden !== "precio",
  );
}

function ancestors(slug: string) {
  const found: string[] = [];
  let current = zones.find((zone) => zone.slug === slug);
  while (current?.parent) {
    found.push(current.parent);
    const parent: string = current.parent;
    current = zones.find((zone) => zone.slug === parent);
  }
  return found;
}

function descendants(slug: string) {
  const found: string[] = [];
  const walk = (parent: string) => {
    for (const zone of zones) {
      if (zone.parent === parent) {
        found.push(zone.slug);
        walk(zone.slug);
      }
    }
  };
  walk(slug);
  return found;
}

export function zoneMatches(planZonas: string[], zona: string) {
  if (planZonas.includes(zona)) return true;
  const parentSlugs = ancestors(zona);
  if (planZonas.some((item) => parentSlugs.includes(item))) return true;
  const childSlugs = descendants(zona);
  return planZonas.some((item) => childSlugs.includes(item));
}

function matchesAge(plan: Plan, meses: number) {
  if (plan.edad_min_meses != null && meses < plan.edad_min_meses) return false;
  if (plan.edad_max_anios != null && meses / 12 > plan.edad_max_anios) return false;
  return true;
}

function priceAsc(a: Plan, b: Plan) {
  if (a.precio == null && b.precio == null) return a.marca.localeCompare(b.marca, "es");
  if (a.precio == null) return 1;
  if (b.precio == null) return -1;
  return a.precio - b.precio;
}

export function applyFilters(plans: Plan[], filters: Filters) {
  const filtered = plans.filter((plan) => {
    if (filters.ids.length && !filters.ids.includes(plan.id)) return false;
    if (filters.especie && !plan.especies.includes(filters.especie)) return false;
    if (filters.tipo && plan.tipo !== filters.tipo) return false;
    if (filters.meses != null && !matchesAge(plan, filters.meses)) return false;
    if (filters.zona && !zoneMatches(plan.zonas, filters.zona)) return false;
    if (filters.max != null) {
      if (plan.precio == null || plan.estado === "sin_precio_publico" || plan.estado === "consultar") return false;
      if (plan.precio > filters.max) return false;
    }
    if (filters.cob.length) {
      const text = plan.coberturas.map((item) => `${item.item} ${item.valor}`).join(" \n ");
      for (const id of filters.cob) {
        const definition = coverageFilters.find((item) => item.id === id);
        if (definition && !definition.test.test(text)) return false;
      }
    }
    return true;
  });

  return filtered.sort((a, b) => {
    if (filters.orden === "cobertura") {
      const byCoverage = b.coberturas.length - a.coberturas.length;
      return byCoverage === 0 ? priceAsc(a, b) : byCoverage;
    }
    if (filters.orden === "actualizado") {
      return b.fecha_verificacion.localeCompare(a.fecha_verificacion);
    }
    return priceAsc(a, b);
  });
}

export function compararHref(filters: Partial<Filters> = {}) {
  const query = serializeFilters({
    cob: [],
    ids: [],
    orden: "precio",
    ...filters,
  });
  return query ? `/comparar?${query}` : "/comparar";
}
