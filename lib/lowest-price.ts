import { coversZona } from "@/lib/filters";
import { daysBetween } from "@/lib/plan-status";
import type { Plan } from "@/lib/plan-schema";

const LIMITE = 6;
const MAXIMO_POR_TIPO = 4;
const DIAS_VIGENTES = 60;

export type FamiliaPlan = "obra_social" | "seguro" | "reintegro";

export function familiaPlan(plan: Pick<Plan, "tipo">): FamiliaPlan {
  if (plan.tipo === "obra_social") return "obra_social";
  if (plan.tipo === "seguro") return "seguro";
  return "reintegro";
}

function datosCompletos(plan: Plan) {
  return Boolean(plan.logo && plan.fuente_url && plan.zonas.length > 0 && plan.coberturas.length >= 3);
}

function comparePlans(a: Plan, b: Plan) {
  const price = (a.precio ?? 0) - (b.precio ?? 0);
  if (price !== 0) return price;
  const quality = Number(datosCompletos(b)) - Number(datosCompletos(a));
  if (quality !== 0) return quality;
  return a.marca.localeCompare(b.marca, "es") || a.id.localeCompare(b.id);
}

function vigente(plan: Plan, today: string) {
  if (plan.precio == null || plan.es_ejemplo) return false;
  if (plan.estado === "requiere_revision" || plan.estado === "consultar" || plan.estado === "sin_precio_publico") return false;
  return daysBetween(plan.fecha_verificacion, today) <= DIAS_VIGENTES;
}

export function getLowestPricePlans(plans: Plan[], options: { today: string; provincia?: string }) {
  const pool = options.provincia ? plans.filter((plan) => coversZona(plan, options.provincia as string)) : plans;
  const porMarca = new Map<string, Plan>();
  for (const plan of pool) {
    if (!vigente(plan, options.today)) continue;
    const actual = porMarca.get(plan.marca_slug);
    if (!actual || comparePlans(plan, actual) < 0) porMarca.set(plan.marca_slug, plan);
  }

  const ordenados = [...porMarca.values()].sort(comparePlans);
  const familias = new Set(ordenados.map(familiaPlan));
  const elegidos: Plan[] = [];
  const conteo = new Map<FamiliaPlan, number>();
  for (const plan of ordenados) {
    if (elegidos.length >= LIMITE) break;
    const familia = familiaPlan(plan);
    const cantidad = conteo.get(familia) ?? 0;
    if (familias.size >= 2 && cantidad >= MAXIMO_POR_TIPO) continue;
    elegidos.push(plan);
    conteo.set(familia, cantidad + 1);
  }
  return elegidos;
}
