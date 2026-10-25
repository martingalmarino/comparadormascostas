import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";
import { z } from "zod";
import { planSchema, type Plan } from "./plan-schema";

const scraperSchema = z.object({
  userAgent: z.string().min(8),
  umbral_cambio: z.number().positive(),
  marcas: z.array(
    z.object({
      plan_id: z.string(),
      url: z.string(),
      enabled: z.boolean(),
      selector: z.string(),
      notas: z.string().optional(),
    }),
  ),
});

type Change = { planId: string; accion: string; detalle: string };

function parseArs(text: string) {
  const match = text.match(/(\d{1,3}(?:\.\d{3})+|\d+)(?:,\d{1,2})?/);
  if (!match) return null;
  const value = Number(match[1].replaceAll(".", ""));
  return Number.isFinite(value) ? value : null;
}

function parseRobots(robots: string) {
  const groups: { agents: string[]; allow: string[]; disallow: string[] }[] = [];
  let agents: string[] = [];
  let allow: string[] = [];
  let disallow: string[] = [];
  const flush = () => {
    if (!agents.length) return;
    groups.push({ agents, allow, disallow });
    agents = [];
    allow = [];
    disallow = [];
  };
  for (const line of robots.split(/\r?\n/)) {
    const clean = line.split("#")[0]?.trim() ?? "";
    if (!clean) {
      flush();
      continue;
    }
    const [rawKey, ...rest] = clean.split(":");
    const key = rawKey.trim().toLowerCase();
    const value = rest.join(":").trim();
    if (key === "user-agent") {
      if (allow.length || disallow.length) flush();
      agents.push(value.toLowerCase());
    } else if (key === "allow") allow.push(value);
    else if (key === "disallow") disallow.push(value);
  }
  flush();
  return groups;
}

function robotsAllow(robots: string, userAgent: string, pathname: string) {
  const groups = parseRobots(robots);
  const specific = groups.filter((group) => group.agents.some((agent) => agent !== "*" && userAgent.toLowerCase().includes(agent)));
  const applicable = specific.length ? specific : groups.filter((group) => group.agents.includes("*"));
  let allowed = true;
  let longest = -1;
  for (const group of applicable) {
    for (const rule of group.disallow) {
      if (rule && pathname.startsWith(rule) && rule.length > longest) {
        longest = rule.length;
        allowed = false;
      }
    }
    for (const rule of group.allow) {
      if (pathname.startsWith(rule) && rule.length >= longest) {
        longest = rule.length;
        allowed = true;
      }
    }
  }
  return allowed;
}

function loadPlans() {
  const dir = path.join(process.cwd(), "data", "planes");
  const files = new Map<string, { file: string; plans: Plan[] }>();
  for (const file of ["petit-salud.json", "avsim.json", "ike-mascotas.json", "companion.json", "fielpet.json", "osmasc.json"]) {
    const full = path.join(dir, file);
    const plans = planSchema.array().parse(JSON.parse(readFileSync(full, "utf8")));
    for (const plan of plans) files.set(plan.id, { file: full, plans });
  }
  return files;
}

async function readPrice(url: string, selector: string, userAgent: string) {
  const target = new URL(url);
  let robotsResponse: Response;
  try {
    robotsResponse = await fetch(new URL("/robots.txt", target.origin), {
      headers: { "User-Agent": userAgent },
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    return { error: "No se pudo leer robots.txt. No se consulta la página." };
  }
  if (robotsResponse.ok) {
    const robots = await robotsResponse.text();
    if (!robotsAllow(robots, userAgent, target.pathname)) {
      return { error: "robots.txt no permite esa ruta. No se consulta la página." };
    }
  }
  const response = await fetch(target, {
    headers: { "User-Agent": userAgent, Accept: "text/html" },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) return { error: `La página respondió ${response.status}.` };
  const html = await response.text();
  const node = cheerio.load(html)(selector).first().text();
  const price = parseArs(node);
  if (price == null) return { error: "No se pudo leer un precio en el selector." };
  return { price };
}

export async function runPriceUpdate() {
  const configPath = path.join(process.cwd(), "data", "scrapers.json");
  const config = scraperSchema.parse(JSON.parse(readFileSync(configPath, "utf8")));
  const plans = loadPlans();
  const today = new Date().toISOString().slice(0, 10);
  const changes: Change[] = [];
  const dirtyFiles = new Set<string>();

  for (const source of config.marcas) {
    if (!source.enabled || !source.url || !source.selector) {
      changes.push({ planId: source.plan_id, accion: "omitido", detalle: source.notas || "Scraper desactivado." });
      continue;
    }
    const holder = plans.get(source.plan_id);
    if (!holder) {
      changes.push({ planId: source.plan_id, accion: "error", detalle: "No existe ese plan." });
      continue;
    }
    const plan = holder.plans.find((item) => item.id === source.plan_id);
    if (!plan) continue;
    const result = await readPrice(source.url, source.selector, config.userAgent);
    if (result.error || result.price == null) {
      plan.estado = "requiere_revision";
      dirtyFiles.add(holder.file);
      changes.push({ planId: plan.id, accion: "requiere_revision", detalle: result.error ?? "Sin precio." });
      continue;
    }
    if (plan.precio == null) {
      plan.precio_detectado = result.price;
      plan.estado = "requiere_revision";
      dirtyFiles.add(holder.file);
      changes.push({ planId: plan.id, accion: "requiere_revision", detalle: `Detectado ${result.price}. No se publica porque no había precio.` });
      continue;
    }
    const delta = Math.abs(result.price - plan.precio) / plan.precio;
    if (delta > config.umbral_cambio) {
      plan.precio_detectado = result.price;
      plan.estado = "requiere_revision";
      dirtyFiles.add(holder.file);
      changes.push({
        planId: plan.id,
        accion: "requiere_revision",
        detalle: `Detectado ${result.price} contra ${plan.precio} (${Math.round(delta * 100)}%). El precio publicado no se cambia.`,
      });
      continue;
    }
    plan.fecha_verificacion = today;
    plan.precio_detectado = result.price;
    dirtyFiles.add(holder.file);
    changes.push({ planId: plan.id, accion: "fecha_actualizada", detalle: `Coincide dentro del ${config.umbral_cambio * 100}%. es_ejemplo no se modifica.` });
  }

  for (const file of dirtyFiles) {
    const entry = [...plans.values()].find((item) => item.file === file);
    if (!entry) continue;
    writeFileSync(file, `${JSON.stringify(entry.plans, null, 2)}\n`);
  }

  const summary = changes.map((change) => `- ${change.planId}: ${change.accion}. ${change.detalle}`).join("\n");
  const report = `# Actualización de precios\n\n${summary || "Sin tareas."}\n`;
  const outDir = path.join(process.cwd(), "scripts", "out");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(path.join(outDir, "reporte.md"), report);
  return { changed: dirtyFiles.size > 0, summary: report };
}
