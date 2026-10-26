import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { appendPricePoint, type HistorialMarca } from "./historial";
import { planSchema, type Plan } from "./plan-schema";
import { sinPrecioPublico } from "./plan-status";

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
export function precioPetcare(html: string, planId: string): { price: number } | { error: string } {
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

function plano(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ");
}

function entero(raw: string) {
  const price = Number(raw.replaceAll(".", ""));
  return Number.isInteger(price) && price > 0 ? price : null;
}

type Monto = { price: number; texto: string; tipo?: "fijo" | "desde"; nota?: string };
type Lectura = Monto | { error: string } | { vacio: true };

function esMonto(value: Lectura): value is Monto {
  return "price" in value;
}

function monto(raw: string | undefined, texto: string, error: string, tipo?: "fijo" | "desde"): Lectura {
  const price = raw ? entero(raw) : null;
  if (price == null) return { error };
  return tipo ? { price, texto, tipo } : { price, texto };
}

const companionPlan: Record<string, string> = {
  "companion-plan-60": "60",
  "companion-plan-80": "80",
  "companion-plan-100": "100",
};

const ikePlan: Record<string, string> = {
  "ike-mascotas-emergencias": "Emergencias",
  "ike-mascotas-cachorro": "Cachorro",
  "ike-mascotas-adulto": "Adulto",
  "ike-mascotas-senior": "Senior",
};

const provinciaPlan: Record<string, number> = {
  "provincia-seguros-banco-provincia-plan-esencial": 0,
  "provincia-seguros-banco-provincia-plan-plus": 1,
  "provincia-seguros-banco-provincia-plan-premium": 2,
};

const qualiaPlan: Record<string, number> = {
  "qualia-seguros-plan-1": 0,
  "qualia-seguros-plan-2": 1,
  "qualia-seguros-plan-3": 2,
  "qualia-seguros-plan-4": 3,
  "qualia-seguros-plan-5": 4,
};

const vetifyPlan: Record<string, string> = {
  "vetify-emergencias": "Emergencias",
  "vetify-classic": "Classic",
  "vetify-cachorros": "Cachorros",
};

const hipotecarioPlan: Record<string, number> = {
  "hipotecario-mascotas-1": 0,
  "hipotecario-mascotas-2": 1,
  "hipotecario-mascotas-3": 2,
};

/** Lee un precio que está escrito en el HTML o en el JS público de esa página. */
export function leerPrecioPublico(html: string, planId: string): Lectura | null {
  if (planId in rusPetcare) {
    const leido = precioPetcare(html, planId);
    if ("error" in leido) return { error: leido.error };
    return { price: leido.price, texto: textoPrecioMes(leido.price) };
  }
  if (planId in qualiaPlan) return precioQualia(html, planId);

  const text = plano(html);
  if (planId === "answer-seguros-seguro-de-mascotas") {
    const match = text.match(/DESDE\s*\$\s*([\d.]+)\s*\/\s*mes/i);
    return monto(match?.[1], match ? `Desde $${match[1]} /mes` : "", "No apareció el precio de Answer.", "desde");
  }
  if (planId in companionPlan) {
    const match = text.match(new RegExp(`Plan ${companionPlan[planId]} Desde \\$([\\d.]+)\\b`));
    return monto(match?.[1], match ? `Desde $${match[1]}` : "", `No apareció el precio de Companion Plan ${companionPlan[planId]}.`);
  }
  if (planId.startsWith("fielpet-plan-")) {
    const numero = planId.slice("fielpet-plan-".length);
    const match = text.match(new RegExp(`Plan ${numero} \\$([\\d.]+) Mensual`));
    return monto(match?.[1], match ? textoPrecioMes(entero(match[1]) ?? 0) : "", `No apareció el precio de Fielpet Plan ${numero}.`);
  }
  if (planId in ikePlan) {
    const nombre = ikePlan[planId];
    const match = text.match(new RegExp(`Plan ${nombre} .{0,700}?\\$\\s*([\\d.]+)\\s*Ver cobertura`));
    return monto(match?.[1], match ? textoPrecioMes(entero(match[1]) ?? 0) : "", `No apareció el precio de IKE ${nombre}.`);
  }
  if (planId === "osmasc-plan-omega-premium") {
    const previo = text.split("PLAN ALFA")[0] ?? "";
    const seccion = previo.split("PLAN OMEGA PREMIUM").at(-1) ?? "";
    const montos = [...seccion.matchAll(/\$([\d.]+) X mes/g)].map((item) => entero(item[1]));
    if (montos.length !== 1 || montos[0] == null) return { error: "OMEGA no tiene un único precio mensual." };
    return { price: montos[0], texto: textoPrecioMes(montos[0]) };
  }
  if (planId === "osmasc-plan-alfa") {
    const seccion = text.split("PLAN ALFA")[1] ?? "";
    const montos = [...new Set([...seccion.matchAll(/\$([\d.]+) X mes/g)].map((item) => entero(item[1])).filter((item) => item != null))];
    if (montos.length < 2) return { error: "ALFA no publicó dos precios mensuales." };
    const menor = Math.min(...montos);
    const mayor = Math.max(...montos);
    const hasta = `$${new Intl.NumberFormat("es-AR").format(mayor)}/mes`;
    return { price: menor, texto: `Desde ${textoPrecioMes(menor)}`, tipo: "desde", nota: `Según edad, hasta ${hasta}` };
  }
  if (planId in vetifyPlan) {
    const nombre = vetifyPlan[planId];
    const inicio = text.indexOf(nombre);
    if (inicio < 0) return { vacio: true };
    const desde = inicio + nombre.length;
    let fin = text.length;
    for (const otro of ["Emergencias", "Classic", "Premium", "Cachorros"]) {
      if (otro === nombre) continue;
      const en = text.indexOf(otro, desde);
      if (en >= 0 && en < fin) fin = en;
    }
    const bloque = text.slice(desde, fin);
    const precios = [...new Set([...bloque.matchAll(/\$\s*([\d.]+)\s*\/\s*mes/g)].map((item) => entero(item[1])).filter((item) => item != null))];
    if (!precios.length) return { vacio: true };
    if (precios.length === 1) return { price: precios[0], texto: textoPrecioMes(precios[0]) };
    const menor = Math.min(...precios);
    return { price: menor, texto: `Desde ${textoPrecioMes(menor)}`, tipo: "desde" };
  }
  if (planId === "pet-society-plan-individual" || planId === "pet-society-plan-familiar") {
    const nombre = planId.endsWith("familiar") ? "Familiar" : "Individual";
    const match = text.match(new RegExp(`Plan ${nombre} .{0,800}?ARS\\s*([\\d.]+)\\s*/\\s*mes`));
    return monto(match?.[1], match ? textoPrecioMes(entero(match[1]) ?? 0) : "", `No apareció el precio de Pet Society ${nombre}.`);
  }
  if (planId in provinciaPlan) {
    const match = text.match(/Premio mensual \$ Pesos ([\d.]+) \$ Pesos ([\d.]+) \$ Pesos ([\d.]+) Premio mensual/);
    const raw = match?.[provinciaPlan[planId] + 1];
    return monto(raw, raw ? textoPrecioMes(entero(raw) ?? 0) : "", "No apareció el premio mensual de Provincia, aparte del paquetizado.");
  }
  if (planId === "holavet-1" || planId === "holavet-2" || planId === "holavet-3") {
    const patrones: Record<string, RegExp> = {
      "holavet-1": /Básico \$([\d.]+)\.- Para padres de un hijo peludo/,
      "holavet-2": /Preferido\. \$([\d.]+)\.-/,
      "holavet-3": /Full \$([\d.]+)\.- Para padres de tres hijos peludos/,
    };
    const match = text.match(patrones[planId]);
    return monto(match?.[1], match ? textoPrecioMes(entero(match[1]) ?? 0) : "", "No apareció el precio de HolaVet.");
  }
  if (planId in hipotecarioPlan) {
    const match = text.match(/Precio mensual .{0,300}?\$\s*([\d.]+)\s+\$\s*([\d.]+)\s+\$\s*([\d.]+)/);
    const civiles = [...text.matchAll(/Responsabilidad civil \$([\d.]+)/g)].map((item) => entero(item[1]));
    const esperadas = [2_800_000, 3_600_000, 4_000_000];
    if (esperadas.some((suma, index) => civiles[index] !== suma)) {
      return { error: "El orden de la responsabilidad civil de Hipotecario no coincide con los tres precios." };
    }
    const raw = match?.[hipotecarioPlan[planId] + 1];
    return monto(raw, raw ? textoPrecioMes(entero(raw) ?? 0) : "", "No apareció el precio mensual de Hipotecario.");
  }
  return null;
}

export function precioQualia(fuente: string, planId: string): Lectura {
  const indice = qualiaPlan[planId];
  if (indice == null) return { error: "Ese plan de Qualia no tiene parser." };
  const match = fuente.match(/mascotas:\{[\s\S]{0,8000}?installments:\[([^\]]+)\]/);
  if (!match) return { error: "No aparecieron las cuotas del seguro de mascotas." };
  const precios = [...match[1].matchAll(/\$\s*([\d.]+)/g)].map((item) => entero(item[1]));
  if (precios.length !== 5 || precios.some((item) => item == null)) {
    return { error: "Qualia no publicó cinco cuotas de mascotas." };
  }
  const price = precios[indice];
  if (price == null) return { error: "Qualia no publicó esa cuota." };
  return { price, texto: textoPrecioMes(price) };
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

async function fuenteQualia(url: string, html: string, userAgent: string) {
  if (/mascotas:\{[\s\S]{0,8000}?installments:\[/.test(html)) return html;
  const srcs = [...html.matchAll(/src="([^"]*\/_next\/static\/[^"]+\.js)"/g)].map((item) => new URL(item[1], url).href);
  let hallado = "";
  let cursor = 0;
  async function worker() {
    while (cursor < srcs.length && !hallado) {
      const next = srcs[cursor];
      cursor += 1;
      try {
        const response = await fetch(next, { headers: { "User-Agent": userAgent }, signal: AbortSignal.timeout(15000) });
        if (!response.ok) continue;
        const js = await response.text();
        if (js.includes("mascotas:{") && js.includes("installments:")) hallado = js;
      } catch {
        continue;
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(6, srcs.length) }, () => worker()));
  return hallado;
}

async function textoVisible(url: string, userAgent: string) {
  const permiso = await fetchHtml(url, userAgent);
  if (permiso.error?.includes("robots")) return { error: permiso.error };
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ userAgent });
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.getByText(/\$\s*[\d.]+\s*\/\s*mes/).first().waitFor({ timeout: 20000 }).catch(() => undefined);
    return { text: await page.locator("body").innerText() };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo abrir la página." };
  } finally {
    await browser.close();
  }
}

async function readPrice(
  url: string,
  planId: string,
  metodo: "html_estatico" | "js_render" | undefined,
  userAgent: string,
  cache: Map<string, Promise<{ html?: string; error?: string }>>,
  qualia: Map<string, Promise<string>>,
  renders: Map<string, Promise<{ text?: string; error?: string }>>,
): Promise<Lectura> {
  if (metodo === "js_render") {
    let visto = renders.get(url);
    if (!visto) {
      visto = textoVisible(url, userAgent);
      renders.set(url, visto);
    }
    const pagina = await visto;
    if (pagina.error || !pagina.text) return { error: pagina.error ?? "La página no mostró texto." };
    const leido = leerPrecioPublico(pagina.text, planId);
    if (!leido) return { error: "Ese plan no tiene un lector de precio público." };
    return leido;
  }
  let pending = cache.get(url);
  if (!pending) {
    pending = fetchHtml(url, userAgent);
    cache.set(url, pending);
  }
  const page = await pending;
  if (page.error || !page.html) return { error: page.error ?? "Sin HTML." };
  let fuente = page.html;
  if (planId in qualiaPlan) {
    let extra = qualia.get(url);
    if (!extra) {
      extra = fuenteQualia(url, page.html, userAgent);
      qualia.set(url, extra);
    }
    fuente = await extra;
    if (!fuente) return { error: "El JavaScript público de Qualia no trajo las cuotas." };
  }
  const leido = leerPrecioPublico(fuente, planId);
  if (!leido) return { error: "Ese plan no tiene un lector de precio público." };
  return leido;
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
  const qualia = new Map<string, Promise<string>>();
  const renders = new Map<string, Promise<{ text?: string; error?: string }>>();

  for (const source of config.marcas) {
    if (source.plan_id.startsWith("petit-salud-")) {
      const holder = plans.get(source.plan_id);
      const plan = holder?.plans.find((item) => item.id === source.plan_id);
      if (!holder || !plan) {
        changes.push({ planId: source.plan_id, accion: "error", detalle: "No existe ese plan." });
        continue;
      }
      const ya =
        plan.precio == null &&
        plan.estado === "sin_precio_publico" &&
        plan.fuente_url === "https://petitsalud.com/" &&
        !plan.precio_texto_original &&
        !plan.precio_tipo &&
        !plan.nota_precio;
      if (!ya || plan.fecha_verificacion !== today) {
        plan.precio = null;
        delete plan.precio_texto_original;
        delete plan.precio_detectado;
        delete plan.precio_tipo;
        delete plan.nota_precio;
        plan.estado = "sin_precio_publico";
        plan.fecha_verificacion = today;
        plan.fuente_url = "https://petitsalud.com/";
        dirtyFiles.add(holder.file);
      }
      changes.push({ planId: plan.id, accion: "sin precio público", detalle: "El sitio oficial no publica el precio. Se renovó la fecha de revisión." });
      continue;
    }
    if (!source.enabled || !source.url || !source.selector) {
      const holder = plans.get(source.plan_id);
      const plan = holder?.plans.find((item) => item.id === source.plan_id);
      if (holder && plan && sinPrecioPublico(plan)) {
        if (plan.fecha_verificacion !== today) {
          plan.fecha_verificacion = today;
          dirtyFiles.add(holder.file);
        }
        changes.push({ planId: plan.id, accion: "sin precio público", detalle: "Sigue sin precio público. Se renovó la fecha de revisión." });
        continue;
      }
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
    const result = await readPrice(source.url, source.plan_id, source.metodo, config.userAgent, paginas, qualia, renders);
    if ("vacio" in result) {
      plan.precio = null;
      delete plan.precio_texto_original;
      delete plan.precio_detectado;
      delete plan.precio_tipo;
      delete plan.nota_precio;
      plan.estado = "sin_precio_publico";
      plan.fecha_verificacion = today;
      plan.fuente_url = source.url;
      dirtyFiles.add(holder.file);
      changes.push({ planId: plan.id, accion: "sin precio público", detalle: "La página pública no muestra un precio." });
      continue;
    }
    if (!esMonto(result)) {
      plan.estado = "requiere_revision";
      dirtyFiles.add(holder.file);
      changes.push({ planId: plan.id, accion: "requiere_revision", detalle: result.error });
      continue;
    }
    if (plan.precio != null) {
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
    }
    const anterior = plan.precio;
    anotarPrecioVerificado(historiales, plan, plan.fecha_verificacion);
    plan.precio = result.price;
    plan.precio_texto_original = result.texto ?? textoPrecioMes(result.price);
    if (result.tipo) plan.precio_tipo = result.tipo;
    else delete plan.precio_tipo;
    if (result.nota) plan.nota_precio = result.nota;
    else delete plan.nota_precio;
    plan.fecha_verificacion = today;
    plan.fuente_url = source.url;
    plan.estado = "verificado";
    delete plan.precio_detectado;
    anotarPrecioVerificado(historiales, plan, today);
    dirtyFiles.add(holder.file);
    changes.push({
      planId: plan.id,
      accion: anterior === result.price ? "sin_cambios" : "actualizado",
      detalle: anterior == null ? `Primera lectura ${result.price}.` : anterior === result.price ? `Mismo monto ${result.price}. Se renovó la fecha.` : `Pasó de ${anterior} a ${result.price}, dentro del margen.`,
    });
  }

  const cubiertos = new Set(config.marcas.map((source) => source.plan_id));
  for (const [planId, holder] of plans) {
    if (cubiertos.has(planId)) continue;
    const plan = holder.plans.find((item) => item.id === planId);
    if (!plan || !sinPrecioPublico(plan)) continue;
    if (plan.fecha_verificacion !== today) {
      plan.fecha_verificacion = today;
      dirtyFiles.add(holder.file);
    }
    changes.push({ planId, accion: "sin precio público", detalle: "Sigue sin precio público. Se renovó la fecha de revisión." });
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
