import { coversZona } from "@/lib/filters";
import { formatArs, formatDate, formatMonthYear } from "@/lib/format";
import { getMarcas, getPlans, newestVerification } from "@/lib/plans";
import type { Especie, Plan } from "@/lib/plan-schema";
import { daysBetween, precioCitado, precioVigente } from "@/lib/plan-status";
import { siteConfig } from "@/site.config";
import { jurisdiccionLabel, provinciasConPlanes, type JurisdiccionSlug } from "@/lib/zonas";

export const founder = {
  name: "Martín Galmarino",
  email: "m.galmarino@gmail.com",
} as const;

export function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function fitParagraph(required: string, optional: string[]) {
  let text = required.trim();
  if (countWords(text) > 60) {
    throw new Error(`Respuesta directa de ${countWords(text)} palabras: ${text}`);
  }
  for (const sentence of optional) {
    const next = `${text} ${sentence}`;
    if (countWords(next) <= 60) text = next;
  }
  const words = countWords(text);
  if (words < 40 || words > 60) {
    throw new Error(`Respuesta directa de ${words} palabras: ${text}`);
  }
  return text;
}

function cheapest(plans: Plan[], today: string) {
  return plans
    .filter((plan) => precioVigente(plan, today))
    .sort(
      (a, b) =>
        (a.precio as number) - (b.precio as number) ||
        a.marca.localeCompare(b.marca, "es") ||
        a.nombre.localeCompare(b.nombre, "es"),
    )[0];
}

function brandCount(plans: Plan[]) {
  return new Set(plans.map((plan) => plan.marca_slug)).size;
}

const extras = [
  "Cada monto está en pesos, es mensual y sale de la ficha de la marca.",
  `Si la verificación supera los ${siteConfig.priceStaleDays} días, el precio se muestra vencido.`,
  "Cuidalo no vende el seguro: deriva al usuario a la marca.",
];

export function respuestaDirecta(
  scope:
    | { tipo: "precios"; today: string }
    | { tipo: "especie"; today: string; especie: Especie }
    | { tipo: "marca"; today: string; slug: string }
    | { tipo: "provincia"; today: string; slug: string },
) {
  const all = getPlans();
  const plans =
    scope.tipo === "especie"
      ? all.filter((plan) => plan.especies.includes(scope.especie))
      : scope.tipo === "marca"
        ? all.filter((plan) => plan.marca_slug === scope.slug)
        : scope.tipo === "provincia"
          ? all.filter((plan) => coversZona(plan, scope.slug))
          : all;
  const updated = newestVerification(plans.length ? plans : all);
  const [mes, anio] = formatMonthYear(updated).split(" ");
  const donde =
    scope.tipo === "provincia"
      ? `en ${jurisdiccionLabel(scope.slug) ?? scope.slug}`
      : scope.tipo === "marca"
        ? `de ${plans[0]?.marca ?? "esta marca"}`
        : scope.tipo === "especie"
          ? `para ${scope.especie === "perro" ? "perros" : "gatos"} en Argentina`
          : "en Argentina";
  const cerrado = cheapest(plans, scope.today);
  const desde = plans
    .filter((plan) => plan.precio_tipo === "desde" && precioCitado(plan, scope.today))
    .sort(
      (a, b) =>
        (a.precio as number) - (b.precio as number) ||
        a.marca.localeCompare(b.marca, "es") ||
        a.nombre.localeCompare(b.nombre, "es"),
    )[0];
  const best = cerrado ?? desde;
  const n = plans.length;
  const m = brandCount(plans);
  const cierre =
    scope.tipo === "marca"
      ? `Comparamos ${n} ${n === 1 ? "plan" : "planes"} de esta marca.`
      : `Comparamos ${n} ${n === 1 ? "plan" : "planes"} de ${m} ${m === 1 ? "marca" : "marcas"}.`;
  const monto = best
    ? best.precio_tipo === "desde"
      ? `Desde ${formatArs(best.precio as number)}/mes`
      : `a ${formatArs(best.precio as number)}/mes`
    : "";
  const required = best
    ? `En ${mes} de ${anio}, el plan más económico publicado ${donde} es ${best.nombre} de ${best.marca} ${monto} (verificado ${formatDate(best.fecha_verificacion)}). ${cierre}`
    : `En ${mes} de ${anio} no hay un precio verificado dentro de los ${siteConfig.priceStaleDays} días ${donde}. ${cierre}`;
  return fitParagraph(required, extras);
}

function listar(nombres: string[]) {
  if (nombres.length <= 1) return nombres[0] ?? "ninguna marca";
  return `${nombres.slice(0, -1).join(", ")} y ${nombres.at(-1)}`;
}

export function faqsEspecie(especie: Especie, today: string) {
  const plans = getPlans().filter((plan) => plan.especies.includes(especie));
  const nombre = especie === "perro" ? "perros" : "gatos";
  const best = cheapest(plans, today);
  const marcas = brandCount(plans);
  const vencidos = plans.filter(
    (plan) => plan.precio != null && daysBetween(plan.fecha_verificacion, today) > siteConfig.priceStaleDays,
  ).length;
  const conEdad = plans.filter((plan) => plan.edad_max_anios != null);
  const topes = conEdad.map((plan) => plan.edad_max_anios as number);
  const conCarencia = plans.filter((plan) => plan.carencias.some((item) => item.dias > 0)).length;
  const sinPrecio = plans.filter((plan) => plan.precio == null).length;
  return [
    {
      q: `¿Cuál es el plan más económico publicado para ${nombre}?`,
      a: best
        ? `Entre los precios verificados hace ${siteConfig.priceStaleDays} días o menos, el más bajo es ${best.nombre} de ${best.marca} a ${formatArs(best.precio as number)}/mes, verificado el ${formatDate(best.fecha_verificacion)}.`
        : `En este relevamiento no hay un precio de ${nombre} verificado dentro de los últimos ${siteConfig.priceStaleDays} días.`,
    },
    {
      q: `¿Cuántos planes para ${nombre} hay en el comparador?`,
      a: `Hay ${plans.length} planes de ${marcas} marcas que declaran cobertura para ${nombre}. ${sinPrecio} no publican un monto y figuran como precio a consultar.`,
    },
    {
      q: "¿Qué precios están vencidos?",
      a: vencidos === 0
        ? `Ningún plan de ${nombre} supera los ${siteConfig.priceStaleDays} días de verificación. Esos montos no se publican como oferta vigente.`
        : `${vencidos} ${vencidos === 1 ? "plan tiene" : "planes tienen"} la verificación a más de ${siteConfig.priceStaleDays} días y se muestran como precio vencido. Ese monto no se publica como oferta vigente.`,
    },
    {
      q: "¿Hasta qué edad llegan los planes que publican un tope?",
      a: topes.length
        ? `Entre los que publican edad máxima, el tope va de ${Math.min(...topes)} a ${Math.max(...topes)} años. ${plans.length - conEdad.length} planes no traen ese dato en la fuente.`
        : "Ningún plan de esta página publica una edad máxima. No completamos ese hueco.",
    },
    {
      q: "¿Cuántos planes publican carencias en días?",
      a: `${conCarencia} planes traen al menos una carencia con días. Si la ficha no trae un número, no inventamos el plazo: hay que pedirle el condicionado a la marca.`,
    },
  ];
}

export function faqsProvincia(slug: string, today: string) {
  const label = jurisdiccionLabel(slug) ?? slug;
  const plans = getPlans().filter((plan) => coversZona(plan, slug));
  const named = plans.filter((plan) => plan.zonas.some((zona) => zona.provincia === slug));
  const namedBrands = [...new Set(named.map((plan) => plan.marca))].sort((a, b) => a.localeCompare(b, "es"));
  const best = cheapest(plans, today);
  const vencidos = plans.filter(
    (plan) => plan.precio != null && daysBetween(plan.fecha_verificacion, today) > siteConfig.priceStaleDays,
  ).length;
  const perros = plans.filter((plan) => plan.especies.includes("perro")).length;
  const gatos = plans.filter((plan) => plan.especies.includes("gato")).length;
  const updated = newestVerification(plans);
  return [
    {
      q: `¿Cuántos planes cubren ${label}?`,
      a: `La tabla tiene ${plans.length} planes de ${brandCount(plans)} marcas. ${named.length} nombran ${label} en la fuente y ${plans.length - named.length} entran por cobertura nacional.`,
    },
    {
      q: `¿Qué marcas nombran ${label}?`,
      a: namedBrands.length
        ? `La provincia figura en planes de ${listar(namedBrands)}. El resto de la tabla declara cobertura en todo el país.`
        : `Ninguna ficha nombra ${label}. Esta página no se publica si no hay al menos un plan que la cite.`,
    },
    {
      q: `¿Cuál es el precio más bajo vigente en ${label}?`,
      a: best
        ? `El más bajo entre los verificados dentro de los ${siteConfig.priceStaleDays} días es ${best.nombre} de ${best.marca} a ${formatArs(best.precio as number)}/mes, verificado el ${formatDate(best.fecha_verificacion)}.`
        : `No hay un precio verificado dentro de los últimos ${siteConfig.priceStaleDays} días entre los planes que cubren ${label}.`,
    },
    {
      q: "¿Hay precios vencidos en esta provincia?",
      a: vencidos === 0
        ? `Ningún plan de esta tabla supera los ${siteConfig.priceStaleDays} días de verificación. La fecha más nueva es el ${formatDate(updated)}.`
        : `${vencidos} ${vencidos === 1 ? "plan muestra" : "planes muestran"} precio vencido porque la verificación supera los ${siteConfig.priceStaleDays} días. La fecha más nueva de esta tabla es el ${formatDate(updated)}.`,
    },
    {
      q: "¿Hay planes para perros y para gatos?",
      a: `${perros} planes declaran perro y ${gatos} declaran gato. Un mismo plan puede contar en los dos si la fuente acepta las dos especies.`,
    },
  ];
}

export function provinciasPublicadas() {
  return provinciasConPlanes(getPlans());
}

export function esProvinciaPublicada(slug: string): slug is JurisdiccionSlug {
  return provinciasPublicadas().some((item) => item.slug === slug);
}

function masBarato(plans: Plan[]) {
  return [...plans].sort(
    (a, b) =>
      (a.precio as number) - (b.precio as number) ||
      b.fecha_verificacion.localeCompare(a.fecha_verificacion),
  )[0];
}

function precioLinea(plans: Plan[], today: string) {
  const fresh = plans.filter((plan) => precioVigente(plan, today));
  if (fresh.length) {
    const best = masBarato(fresh);
    return `desde ${formatArs(best.precio as number)}/mes, verificado ${formatDate(best.fecha_verificacion)}`;
  }
  const conDesde = plans.filter(
    (plan) =>
      plan.estado === "verificado" &&
      !plan.es_ejemplo &&
      plan.precio != null &&
      daysBetween(plan.fecha_verificacion, today) <= siteConfig.priceStaleDays,
  );
  if (conDesde.length) {
    const best = masBarato(conDesde);
    return `desde ${formatArs(best.precio as number)}/mes, verificado ${formatDate(best.fecha_verificacion)}`;
  }
  const conMonto = plans.filter((plan) => plan.precio != null);
  if (conMonto.length) {
    const best = masBarato(conMonto);
    return `precio vencido ${formatArs(best.precio as number)}/mes, verificado ${formatDate(best.fecha_verificacion)}`;
  }
  return `precio a consultar, verificado ${formatDate(newestVerification(plans))}`;
}

export function llmsTxt(today: string) {
  const domain = siteConfig.domain;
  const marcas = [...getMarcas()].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  const lineas = marcas.map((marca) => {
    const plans = getPlans().filter((plan) => plan.marca_slug === marca.slug);
    return `- [${marca.nombre}](${domain}/planes/${marca.slug}): ${precioLinea(plans, today)}`;
  });
  return [
    `# ${siteConfig.siteName}`,
    `> Comparador independiente de obras sociales, planes de salud y seguros para mascotas (perros y gatos) en Argentina. Precios referenciales con fecha de verificación y fuente oficial de cada marca. ${siteConfig.siteName} no vende seguros: deriva al usuario a la marca.`,
    "## Páginas principales",
    `- [Comparador de planes](${domain}/comparar): planes con precio mensual, coberturas y carencias.`,
    `- [Precios del mes](${domain}/precios)`,
    `- [Seguro para perros](${domain}/seguro-para-perros)`,
    `- [Seguro para gatos](${domain}/seguro-para-gatos)`,
    `- [Planes en Córdoba](${domain}/cordoba)`,
    `- [Cómo comparamos](${domain}/como-comparamos): metodología, fuentes y frecuencia de actualización.`,
    `- [Sobre nosotros](${domain}/sobre-nosotros)`,
    "## Marcas",
    ...lineas,
    "## Notas",
    "- Precios en pesos argentinos, mensuales y referenciales; confirmar con la marca.",
    `- Desarrollado por ${founder.name} (${founder.email}).`,
    "",
  ].join("\n");
}

function celda(value: string) {
  return value.replaceAll("|", "/").replace(/\s+/g, " ").trim();
}

function cobertura(plan: Plan) {
  return plan.coberturas
    .map((item) => (item.valor ? `${item.item}: ${item.valor}` : item.item))
    .join("; ");
}

function provinciasDe(plan: Plan) {
  if (!plan.zonas.length) return "sin provincia en la fuente";
  return plan.zonas.map((zona) => jurisdiccionLabel(zona.provincia) ?? zona.provincia).join(", ");
}

function precioTabla(plan: Plan, today: string) {
  if (plan.precio == null || plan.estado === "consultar") return "precio a consultar";
  const monto = `${formatArs(plan.precio)}/mes`;
  if (daysBetween(plan.fecha_verificacion, today) > siteConfig.priceStaleDays) return `precio vencido ${monto}`;
  return monto;
}

export function llmsFullTxt(today: string) {
  const plans = [...getPlans()].sort(
    (a, b) => a.marca.localeCompare(b.marca, "es") || a.nombre.localeCompare(b.nombre, "es"),
  );
  const filas = plans.map((plan) =>
    [
      celda(plan.marca),
      celda(plan.nombre),
      celda(precioTabla(plan, today)),
      celda(cobertura(plan)),
      celda(provinciasDe(plan)),
      celda(formatDate(plan.fecha_verificacion)),
      celda(plan.fuente_url),
    ].join(" | "),
  );
  return [
    `# ${siteConfig.siteName}: planes`,
    "",
    "| Marca | Plan | Precio | Cobertura | Provincia | Fecha de verificación | Fuente |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...filas.map((fila) => `| ${fila} |`),
    "",
  ].join("\n");
}
