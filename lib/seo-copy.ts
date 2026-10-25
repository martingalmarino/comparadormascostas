import { formatArs, formatDate, formatMonthYear } from "@/lib/format";
import { getMarcas, getPlans, getPlansByMarca, hasVerifiedPrice, newestVerification, versusPairs } from "@/lib/plans";
import type { Plan } from "@/lib/plan-schema";
import { SITE } from "@/site.config";

export type SeoEntry = {
  path: string;
  title: string;
  absolute?: boolean;
  description: string;
  h1: string;
  index: boolean;
  lastModified: string;
};

const issues: string[] = [];

function pick(id: string, options: string[]) {
  const hit = options.find((text) => text.length >= 140 && text.length <= 155);
  if (hit) return hit;
  issues.push(`${id} desc [${options.map((text) => String(text.length)).join(", ")}] ${options[0]}`);
  return options[0] ?? "";
}

export function renderedTitle(entry: Pick<SeoEntry, "title" | "absolute">) {
  return entry.absolute ? entry.title : `${entry.title} | ${SITE.name}`;
}

function remember(entry: SeoEntry) {
  const title = renderedTitle(entry);
  if ([...title].length > 60) issues.push(`${entry.path} title ${[...title].length}: ${title}`);
  if (entry.description.length < 140 || entry.description.length > 155) {
    issues.push(`${entry.path} desc ${entry.description.length}: ${entry.description}`);
  }
  if (!entry.h1.trim()) issues.push(`${entry.path} sin h1`);
  if (entry.h1 === title) issues.push(`${entry.path} h1 igual al title`);
  return entry;
}

function verifiedPrices(plans: Plan[]) {
  return plans.filter((plan) => plan.estado === "verificado" && plan.precio != null && !plan.es_ejemplo);
}

function minPrice(plans: Plan[]) {
  const priced = verifiedPrices(plans);
  if (!priced.length) return null;
  return Math.min(...priced.map((plan) => plan.precio as number));
}

export function brandLabel(slug: string, marca: string) {
  if (slug === "federacion-patronal-via-mascotaleal") return "Federación Patronal";
  if (slug === "provincia-seguros-banco-provincia") return "Provincia Seguros";
  return marca;
}

function unpublishedDescription(label: string, count: number) {
  const noun = count === 1 ? "plan" : "planes";
  const withGratis = `${label}: ${count} ${noun} para perros y gatos. Qué cubre, carencias y edad máxima. Precio no publicado: te contamos cómo cotizar. Compará con otras marcas gratis.`;
  const without = withGratis.replace(" gratis.", ".");
  const short = `${label}: ${count} ${noun}. Qué cubre, carencias y edad máxima. Precio no publicado: te contamos cómo cotizar. Compará con otras marcas.`;
  const shortToday = short.replace(/marcas\.$/, "marcas hoy.");
  return pick(label, [withGratis, without, shortToday, short]);
}

function pricedDescription(label: string, count: number, price: string, fecha: string) {
  const noun = count === 1 ? "plan" : "planes";
  return pick(label, [
    `${label}: ${count} ${noun} desde ${price}/mes (precio verificado ${fecha}). Coberturas, carencias, edad máxima y fuente. Compará con otras marcas gratis.`,
    `${label}: ${count} ${noun} desde ${price}/mes (verificado ${fecha}). Coberturas, carencias, edad máxima y fuente. Compará con otras marcas gratis.`,
    `${label}: ${count} ${noun} desde ${price}/mes (precio verificado ${fecha}). Coberturas, carencias, edad máxima y fuente. Compará con otras marcas.`,
    `${label}: ${count} ${noun} desde ${price}/mes (verificado ${fecha}). Coberturas, carencias, edad máxima y fuente. Compará con otras marcas.`,
    `${label}: ${count} ${noun} desde ${price}/mes. Coberturas, carencias, edad máxima y fuente, con precio verificado el ${fecha}. Compará.`,
  ]);
}

export function brandEntry(slug: string): SeoEntry | undefined {
  const plans = getPlansByMarca(slug);
  if (!plans.length) return undefined;
  const label = brandLabel(slug, plans[0].marca);
  const fecha = formatDate(newestVerification(plans));
  const year = fecha.slice(-4);
  const price = minPrice(plans);
  const absolute = slug === "provincia-seguros-banco-provincia";
  const title = absolute ? `Seguro mascotas Banco Provincia: precios y planes ${year}` : `${label}: precios y planes ${year}`;
  let description: string;
  if (slug === "federacion-patronal-via-mascotaleal") {
    description = pick(slug, [
      "Federación Patronal (vía MascotaLeal): seguro para perros con RC de hasta $20M. Qué cubre y cómo cotizar, porque el precio no es público. Compará.",
    ]);
  } else if (price == null) {
    description = unpublishedDescription(label, plans.length);
  } else if (absolute) {
    description = pick(slug, [
      `Provincia Seguros: ${plans.length} planes desde ${formatArs(price)}/mes (verificado ${fecha}). Coberturas, carencias, edad máxima y fuente. Compará con otras marcas.`,
      pricedDescription(label, plans.length, formatArs(price), fecha),
    ]);
  } else {
    description = pricedDescription(label, plans.length, formatArs(price), fecha);
  }
  return remember({
    path: `/planes/${slug}`,
    title,
    absolute,
    description,
    h1: `${label}: planes, precios y coberturas`,
    index: true,
    lastModified: newestVerification(plans),
  });
}

function versusTitle(a: string, b: string) {
  const suffix = ` | ${SITE.name}`;
  const detailed = `${a} vs ${b}: precios y coberturas`;
  if (detailed.length + suffix.length <= 60) return { title: detailed, absolute: false };
  const plain = `${a} vs ${b}`;
  if (plain.length + suffix.length <= 60) return { title: plain, absolute: false };
  const clipped = plain.length <= 60 ? plain : plain.slice(0, 60).trim();
  return { title: clipped, absolute: true };
}

function versusDescription(a: string, b: string) {
  return pick(`${a} vs ${b}`, [
    `¿${a} o ${b}? Compará precio desde, coberturas, carencias y edad máxima de cada plan, lado a lado y con fuente oficial. Mirá cuál te conviene.`,
    `¿${a} o ${b}? Compará precio, coberturas, carencias y edad máxima, con la fuente de cada dato. No vendemos ni intermediamos seguros.`,
    `Diferencias entre ${a} y ${b}: precio publicado, coberturas, carencias y edad máxima. Cada dato tiene fuente. No es una recomendación.`,
    `Diferencias entre ${a} y ${b}: precio, coberturas, carencias y edad máxima. Cada dato tiene fuente y fecha. No vendemos seguros.`,
    `Diferencias entre ${a} y ${b}: precio, coberturas, carencias y edad. Cada dato tiene fuente y fecha. No vendemos seguros.`,
  ]);
}

export function versusEntry(aSlug: string, bSlug: string): SeoEntry | undefined {
  const aPlans = getPlansByMarca(aSlug);
  const bPlans = getPlansByMarca(bSlug);
  if (!aPlans.length || !bPlans.length) return undefined;
  const a = brandLabel(aSlug, aPlans[0].marca);
  const b = brandLabel(bSlug, bPlans[0].marca);
  const [left, right] = [aSlug, bSlug].sort((x, y) => x.localeCompare(y));
  const title = versusTitle(a, b);
  return remember({
    path: `/versus/${left}-vs-${right}`,
    title: title.title,
    absolute: title.absolute,
    description: versusDescription(a, b),
    h1: `${a} vs ${b}: ¿cuál conviene?`,
    index: hasVerifiedPrice(aSlug) && hasVerifiedPrice(bSlug),
    lastModified: newestVerification([...aPlans, ...bPlans]),
  });
}

function speciesStats(especie: "perro" | "gato") {
  const plans = getPlans().filter((plan) => plan.especies.includes(especie));
  const price = minPrice(plans);
  return { count: plans.length, price: price == null ? null : formatArs(price) };
}

export function getSeoCatalog(): SeoEntry[] {
  issues.length = 0;
  const plans = getPlans();
  const updated = newestVerification(plans);
  const mes = formatMonthYear(updated);
  const min = minPrice(plans);
  const perros = speciesStats("perro");
  const gatos = speciesStats("gato");

  const staticEntries: SeoEntry[] = [
    remember({
      path: "/",
      title: `Obra social para mascotas: compará precios | ${SITE.name}`,
      absolute: true,
      description: pick("home", [
        "Compará obras sociales, prepagas y seguros para perros y gatos en Argentina. Precios con fecha y fuente de cada marca. Elegí tu plan en minutos, gratis.",
      ]),
      h1: "Obra social para mascotas: compará planes y precios en Argentina",
      index: true,
      lastModified: updated,
    }),
    remember({
      path: "/comparar",
      title: "Comparador de seguros para mascotas",
      description: pick("comparar", [
        "Filtrá por especie, edad, zona y tipo de plan, y compará lado a lado obras sociales y seguros para tu perro o gato. Sin costo y sin vender seguros.",
      ]),
      h1: "Comparador de planes de salud y seguros para mascotas",
      index: true,
      lastModified: updated,
    }),
    remember({
      path: "/precios",
      title: `Cuánto sale una obra social para mascotas en ${mes}`,
      absolute: true,
      description: pick("precios", [
        min == null
          ? ""
          : `Precios de ${mes} de ${plans.length} planes para perros y gatos en Argentina, desde ${formatArs(min)}/mes. Cada valor tiene fecha y fuente. Mirá la tabla.`,
        min == null
          ? ""
          : `Precios de ${mes}: ${plans.length} planes para perros y gatos en Argentina, desde ${formatArs(min)}/mes. Cada valor tiene fecha y fuente. Mirá la tabla completa.`,
      ]),
      h1: `Precios de obras sociales y seguros para mascotas (${mes})`,
      index: true,
      lastModified: updated,
    }),
    remember({
      path: "/seguro-para-perros",
      title: "Seguro y obra social para perros en Argentina",
      description: pick("perros", [
        perros.price == null
          ? ""
          : `Planes para perros desde ${perros.price}/mes: consultas, cirugías, responsabilidad civil y edad máxima. Compará ${perros.count} opciones con fecha y fuente. Sin costo.`,
        perros.price == null
          ? ""
          : `Planes para perros desde ${perros.price}/mes: consultas, cirugías, responsabilidad civil y edad máxima. Compará ${perros.count} opciones con fecha y fuente.`,
      ]),
      h1: "Seguro y obra social para perros: planes y precios",
      index: true,
      lastModified: updated,
    }),
    remember({
      path: "/seguro-para-gatos",
      title: "Obra social y seguro para gatos en Argentina",
      description: pick("gatos", [
        gatos.price == null
          ? ""
          : `¿Hay obra social para gatos? Sí: compará ${gatos.count} planes desde ${gatos.price}/mes, con coberturas, carencias y fuente. Encontrá el tuyo sin costo y en Argentina.`,
        gatos.price == null
          ? ""
          : `¿Hay obra social para gatos? Sí: compará ${gatos.count} planes con precios desde ${gatos.price}/mes, coberturas y carencias. Encontrá el tuyo hoy mismo.`,
      ]),
      h1: "Obra social y seguro para gatos: planes y precios",
      index: true,
      lastModified: updated,
    }),
    remember({
      path: "/cordoba",
      title: "Obra social para mascotas en Córdoba",
      description: pick("cordoba", [
        "Planes para perros y gatos con cobertura en Córdoba Capital, Río Cuarto, Villa María y Sierras Chicas. Compará precios, red de veterinarias y carencias.",
      ]),
      h1: "Obra social para mascotas en Córdoba",
      index: true,
      lastModified: updated,
    }),
    remember({
      path: "/cordoba/veterinarias-con-plan",
      title: "Veterinarias con plan de salud en Córdoba",
      description: pick("veterinarias", [
        "Cómo saber si tu veterinaria de Córdoba atiende con algún plan para mascotas, qué preguntar antes de afiliarte y qué marcas trabajan por reintegro.",
      ]),
      h1: "Veterinarias con plan de salud para mascotas en Córdoba",
      index: true,
      lastModified: updated,
    }),
    remember({
      path: "/como-comparamos",
      title: "Cómo comparamos los planes para mascotas",
      description: pick("metodo", [
        "Nuestra metodología: fuentes oficiales, fecha de verificación de cada precio, regla de 45 días y por qué no vendemos seguros. Transparencia total.",
      ]),
      h1: "Cómo comparamos los planes de salud para mascotas",
      index: true,
      lastModified: updated,
    }),
    remember({
      path: "/contacto",
      title: "Contacto",
      description: pick("contacto", [
        "Escribinos por dudas sobre el comparador, para corregir un precio o para sumar tu marca. Respondemos en días hábiles. Aclaración: no vendemos seguros.",
      ]),
      h1: "Contacto",
      index: true,
      lastModified: updated,
    }),
    remember({
      path: "/privacidad",
      title: "Política de privacidad",
      description: pick("privacidad", [
        "Cómo tratamos tus datos personales según la Ley 25.326, para qué los usamos y cómo ejercer tus derechos de acceso, rectificación y supresión.",
      ]),
      h1: "Política de privacidad",
      index: true,
      lastModified: updated,
    }),
    remember({
      path: "/terminos",
      title: "Términos y condiciones",
      description: pick("terminos", [
        "Condiciones de uso del comparador de planes para mascotas. Informamos precios relevados de fuentes públicas; no vendemos ni intermediamos seguros.",
      ]),
      h1: "Términos y condiciones",
      index: true,
      lastModified: updated,
    }),
  ];

  const brands = getMarcas().map((marca) => brandEntry(marca.slug)).filter((entry): entry is SeoEntry => Boolean(entry));
  const versus = versusPairs()
    .map((pair) => versusEntry(pair.a, pair.b))
    .filter((entry): entry is SeoEntry => Boolean(entry));

  const entries = [...staticEntries, ...brands, ...versus];
  const titles = new Map<string, string>();
  const descriptions = new Map<string, string>();
  for (const entry of entries) {
    const title = renderedTitle(entry);
    const previousTitle = titles.get(title);
    if (previousTitle) issues.push(`title duplicado «${title}» en ${previousTitle} y ${entry.path}`);
    titles.set(title, entry.path);
    const previousDescription = descriptions.get(entry.description);
    if (previousDescription) issues.push(`meta duplicada en ${previousDescription} y ${entry.path}`);
    descriptions.set(entry.description, entry.path);
    if (/opiniones|el mejor/i.test(`${title} ${entry.description} ${entry.h1}`)) {
      issues.push(`${entry.path} promete opiniones o «el mejor»`);
    }
  }
  if (issues.length) throw new Error(`SEO fuera de rango:\n${issues.join("\n")}`);
  return entries;
}

export function entryByPath(path: string) {
  return getSeoCatalog().find((entry) => entry.path === path);
}

export function requireEntry(path: string) {
  const entry = entryByPath(path);
  if (!entry) throw new Error(`Sin ficha SEO para ${path}`);
  return entry;
}

export function indexableEntries() {
  return getSeoCatalog().filter((entry) => entry.index);
}
