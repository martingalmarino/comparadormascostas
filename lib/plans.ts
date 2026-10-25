import fs from "node:fs";
import path from "node:path";
import { planSchema, type Plan } from "@/lib/plan-schema";

const plansDir = path.join(process.cwd(), "data", "planes");

let cache: { stamp: string; plans: Plan[] } | undefined;

function loadPlans() {
  const files = fs
    .readdirSync(plansDir)
    .filter((file) => file.endsWith(".json"))
    .sort();
  const stamp = files
    .map((file) => `${file}:${fs.statSync(path.join(plansDir, file)).mtimeMs}`)
    .join("|");
  if (cache?.stamp === stamp) return cache.plans;

  const plans = files.flatMap((file) => {
    const raw = JSON.parse(fs.readFileSync(path.join(plansDir, file), "utf8")) as unknown;
    const parsed = planSchema.array().safeParse(raw);
    if (!parsed.success) {
      const detail = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
      throw new Error(`data/planes/${file} inválido: ${detail}`);
    }
    const expectedSlug = file.replace(/\.json$/, "");
    for (const plan of parsed.data) {
      if (plan.marca_slug !== expectedSlug) {
        throw new Error(`${plan.id} está en ${file} pero su marca_slug es ${plan.marca_slug}`);
      }
      if ((plan.estado === "sin_precio_publico" || plan.estado === "consultar") && plan.precio !== null) {
        throw new Error(`${plan.id}: ${plan.estado} exige precio null`);
      }
    }
    return parsed.data;
  });

  const ids = new Set<string>();
  for (const plan of plans) {
    if (ids.has(plan.id)) throw new Error(`Plan duplicado: ${plan.id}`);
    ids.add(plan.id);
  }

  cache = { stamp, plans };
  return plans;
}

export function getPlans() {
  return loadPlans();
}

export function getPlan(id: string) {
  return getPlans().find((plan) => plan.id === id);
}

export function getMarcas() {
  const seen = new Set<string>();
  const marcas: { slug: string; nombre: string }[] = [];
  for (const plan of getPlans()) {
    if (seen.has(plan.marca_slug)) continue;
    seen.add(plan.marca_slug);
    marcas.push({
      slug: plan.marca_slug,
      nombre: plan.marca,
      logo: plan.logo,
      logoFuente: plan.logo_fuente,
    });
  }
  return marcas;
}

export function getPlansByMarca(slug: string) {
  return getPlans().filter((plan) => plan.marca_slug === slug);
}

export function flagship(plans: Plan[]) {
  const priced = plans.filter((plan) => plan.precio != null && plan.estado !== "sin_precio_publico" && plan.estado !== "consultar");
  const pool = priced.length ? priced : plans;
  return [...pool].sort((a, b) => (a.precio ?? Number.MAX_SAFE_INTEGER) - (b.precio ?? Number.MAX_SAFE_INTEGER))[0];
}

export function resolveComparable(key: string) {
  const byId = getPlan(key);
  if (byId) return byId;
  const ofBrand = getPlansByMarca(key);
  if (!ofBrand.length) return undefined;
  return flagship(ofBrand);
}

export function versusPairs() {
  const slugs = getMarcas()
    .map((marca) => marca.slug)
    .sort((a, b) => a.localeCompare(b));
  const pairs: { slug: string; a: string; b: string }[] = [];
  for (let i = 0; i < slugs.length; i += 1) {
    for (let j = i + 1; j < slugs.length; j += 1) {
      pairs.push({ a: slugs[i], b: slugs[j], slug: `${slugs[i]}-vs-${slugs[j]}` });
    }
  }
  return pairs;
}

export function newestVerification(plans: Plan[]) {
  return plans.reduce((max, plan) => (plan.fecha_verificacion > max ? plan.fecha_verificacion : max), "1970-01-01");
}
