import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";
import { z } from "zod";
import { appendPricePoint, type HistorialMarca } from "./historial";
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
      metodo: z.enum(["html_estatico", "js_render"]).optional(),
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
  for (const file of readdirSync(dir).filter((name) => name.endsWith(".json")).sort()) {
    const full = path.join(dir, file);
    const plans = JSON.parse(readFileSync(full, "utf8")) as Plan[];
    planSchema.array().parse(plans);
    for (const plan of plans) files.set(plan.id, { file: full, plans });
  }
  return files;
}

const rusPetcare: Record<string, string> = {
  "rus-seguros-petcare-simple": "SIMPLE",
  "rus-seguros-petcare-esencial": "ESENCIAL",
  "rus-seguros-petcare-integral": "INTEGRAL",
  "rus-seguros-petcare-superior": "SUPERIOR",
};

/** El precio mensual está en la tabla, en la línea anterior a «Plan RUS PETCARE …». */
export function precioPetcare(html: string, planId: string) {
  const nombre = rusPetcare[planId];
  if (!nombre) return { error: "Ese plan de RUS no tiene parser." };
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  const match = text.match(new RegExp(String.raw`\$\s*([\d.]+)\s*/\s*mes\s*Plan RUS PETCARE ${nombre}\b`, "i"));
  if (!match) return { error: `No apareció el precio mensual de PetCare ${nombre}.` };
  const price = Number(match[1].replaceAll(".", ""));
  if (!Number.isInteger(price) || price <= 0) return { error: "El precio leído no es un entero." };
  return { price };
}

function textoPrecioMes(precio: number) {
  return `$ ${new Intl.NumberFormat("es-AR").format(precio)} /mes`;
}

async function fetchHtml(url: string, userAgent: string) {
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
  return { html: await response.text() };
}

async function readPrice(url: string, planId: string, selector: string, metodo: "html_estatico" | "js_render" | undefined, userAgent: string, cache: Map<string, Promise<{ html?: string; error?: string }>>) {
  if (metodo === "js_render") {
    return { error: "Esta página pide navegador. Playwright queda para una etapa posterior." };
  }
  let pending = cache.get(url);
  if (!pending) {
    pending = fetchHtml(url, userAgent);
    cache.set(url, pending);
  }
  const page = await pending;
  if (page.error || !page.html) return { error: page.error ?? "Sin HTML." };
  if (planId in rusPetcare) return precioPetcare(page.html, planId);
  const node = cheerio.load(page.html)(selector).first().text();
  const price = parseArs(node);
  if (price == null) return { error: "No se pudo leer un precio en el selector." };
  return { price };
}

function historialPath(slug: string) {
  return path.join(process.cwd(), "data", "historial", `${slug}.json`);
}

function loadHistorial(slug: string): HistorialMarca {
  const file = historialPath(slug);
  if (!existsSync(file)) return {};
  return JSON.parse(readFileSync(file, "utf8")) as HistorialMarca;
}

function anotarPrecioVerificado(libros: Map<string, { antes: string; data: HistorialMarca }>, plan: Plan, fecha: string) {
  if (plan.estado !== "verificado" || plan.precio == null || plan.es_ejemplo) return;
  let libro = libros.get(plan.marca_slug);
  if (!libro) {
    const data = loadHistorial(plan.marca_slug);
    libro = { antes: JSON.stringify(data), data };
    libros.set(plan.marca_slug, libro);
  }
  libro.data[plan.id] = appendPricePoint(libro.data[plan.id], {
    fecha,
    precio: plan.precio,
    fuente: plan.fuente_url,
  });
}

export async function runPriceUpdate() {
  const configPath = path.join(process.cwd(), "data", "scrapers.json");
  const config = scraperSchema.parse(JSON.parse(readFileSync(configPath, "utf8")));
  const plans = loadPlans();
  const today = new Date().toISOString().slice(0, 10);
  const changes: Change[] = [];
  const dirtyFiles = new Set<string>();
  const historiales = new Map<string, { antes: string; data: HistorialMarca }>();
  const paginas = new Map<string, Promise<{ html?: string; error?: string }>>();

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
    const result = await readPrice(source.url, source.plan_id, source.selector, source.metodo, config.userAgent, paginas);
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
    anotarPrecioVerificado(historiales, plan, plan.fecha_verificacion);
    plan.precio = result.price;
    plan.precio_texto_original = textoPrecioMes(result.price);
    plan.fecha_verificacion = today;
    plan.fuente_url = source.url;
    plan.estado = "verificado";
    delete plan.precio_detectado;
    anotarPrecioVerificado(historiales, plan, today);
    dirtyFiles.add(holder.file);
    changes.push({
      planId: plan.id,
      accion: "publicado",
      detalle: `Quedó en ${result.price}, dentro del ${Math.round(config.umbral_cambio * 100)}%.`,
    });
  }

  const errores: string[] = [];
  const archivosValidos = new Set<string>();
  for (const file of dirtyFiles) {
    const entry = [...plans.values()].find((item) => item.file === file);
    if (!entry) continue;
    const parsed = planSchema.array().safeParse(entry.plans);
    if (!parsed.success) {
      errores.push(`${path.basename(file)} no pasó el schema y no se escribió.`);
      continue;
    }
    archivosValidos.add(file);
    writeFileSync(file, `${JSON.stringify(entry.plans, null, 2)}\n`);
  }

  const historialDir = path.join(process.cwd(), "data", "historial");
  for (const [slug, libro] of historiales) {
    const file = [...archivosValidos].find((item) => item.endsWith(`${slug}.json`));
    if (!file) continue;
    const serializado = JSON.stringify(libro.data);
    if (serializado === libro.antes) continue;
    mkdirSync(historialDir, { recursive: true });
    writeFileSync(path.join(historialDir, `${slug}.json`), `${JSON.stringify(libro.data, null, 2)}\n`);
  }

  const revisiones = changes.filter((change) => change.accion === "requiere_revision" || change.accion === "error");
  const summary = changes.map((change) => `- ${change.planId}: ${change.accion}. ${change.detalle}`).join("\n");
  const report = `# Actualización de precios\n\n${summary || "Sin tareas."}\n${errores.length ? `\n## No se escribió\n${errores.map((item) => `- ${item}`).join("\n")}\n` : ""}`;
  const outDir = path.join(process.cwd(), "scripts", "out");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(path.join(outDir, "reporte.md"), report);
  writeFileSync(
    path.join(outDir, "resultado.json"),
    `${JSON.stringify({ revisiones: revisiones.map((item) => item.planId), errores }, null, 2)}\n`,
  );
  return { changed: archivosValidos.size > 0, summary: report, fallo: errores.length > 0 };
}
