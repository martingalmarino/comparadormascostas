import { esAdicionalHogar } from "@/lib/hogar-adicional";
import { formatArs } from "@/lib/format";
import { compararHref } from "@/lib/filters";
import { intentById } from "@/lib/bot/intents";
import { contactoTexto, sinDato, slotPregunta, tiposTexto, vendeTexto } from "@/lib/bot/static";
import type { BotAnswer, BotCard, BotCta, BotPlan, BotSlots, IntentId } from "@/lib/bot/types";
import { jurisdiccionLabel, isJurisdiccion, PROVINCIA_TODAS } from "@/lib/zonas";

const teleconsulta =
  /teleconsulta|videollamada|veterinari[oa].{0,40}(online|virtual)|(online|virtual).{0,40}veterinari|vet online|asistencia virtual|orientaci[oó]n vet|guardias?\s*24|24\s*h|24\/7/i;
const teleconsultaNotas =
  /teleconsulta|videollamada|veterinari[oa].{0,40}(online|virtual)|(online|virtual).{0,40}veterinari|vet online|asistencia virtual|orientaci[oó]n vet/i;
const responsabilidad = /responsabilidad civil|\brc\b/i;

function cubre(plan: BotPlan, provincia: string) {
  return plan.zonas.includes(PROVINCIA_TODAS) || plan.zonas.includes(provincia);
}

function acotar(plans: BotPlan[], slots: BotSlots) {
  return plans.filter((plan) => {
    if (slots.especie && !plan.especies.includes(slots.especie)) return false;
    if (slots.provincia && !cubre(plan, slots.provincia)) return false;
    if (slots.marca && plan.marcaSlug !== slots.marca) return false;
    return true;
  });
}

function mediana(sorted: number[]) {
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid];
  return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

function porPrecio(a: BotPlan, b: BotPlan) {
  const left = a.precioVigente && a.precio != null ? a.precio : Number.MAX_SAFE_INTEGER;
  const right = b.precioVigente && b.precio != null ? b.precio : Number.MAX_SAFE_INTEGER;
  if (left !== right) return left - right;
  return a.marca.localeCompare(b.marca, "es") || a.nombre.localeCompare(b.nombre, "es");
}

function fuenteDe(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return { host: url };
    return { host: parsed.host.replace(/^www\./, ""), href: parsed.toString() };
  } catch {
    return { host: url };
  }
}

function precioVisible(plan: BotPlan) {
  if (plan.precioVigente && plan.precio != null) return { precio: plan.precio };
  if (plan.precio == null || plan.estado === "consultar" || plan.estado === "sin_precio_publico") {
    return { precio: null, precioLabel: "Precio a consultar" };
  }
  return { precio: null, precioLabel: "Sin precio vigente" };
}

function toCard(plan: BotPlan, menor: boolean, cobertura: number): BotCard {
  const visible = precioVisible(plan);
  return {
    id: plan.id,
    marca: plan.marca,
    marcaSlug: plan.marcaSlug,
    nombre: plan.nombre,
    logo: plan.logo,
    precio: visible.precio,
    precioLabel: visible.precioLabel,
    coberturas: plan.coberturas.slice(0, cobertura),
    verHref: `/planes/${plan.marcaSlug}#${plan.id}`,
    compararHref: compararHref({ ids: [plan.id] }),
    menor,
    adicionalHogar: esAdicionalHogar(plan.marcaSlug),
  };
}

function notaDe(plans: BotPlan[]) {
  const priced = plans.find((plan) => plan.precioVigente && plan.precio != null);
  if (!priced) return undefined;
  const fuente = fuenteDe(priced.fuenteUrl);
  return { fecha: priced.fechaVerificacion, host: fuente.host, href: fuente.href };
}

function verPlanes(count: number, href: string): BotCta {
  const label = count <= 0 ? "Ver el comparador" : count === 1 ? "Ver el plan" : `Ver los ${count} planes`;
  return { label, href: href || "/comparar" };
}

function seguimientos(count: number, href: string): BotCta[] {
  return [verPlanes(count, href), { label: "Que me contacte una marca", action: "lead" }, { label: "Otra pregunta", action: "reset" }];
}

function falta(intent: IntentId, slots: BotSlots): BotAnswer | null {
  const pending = intentById(intent).slots.find((slot) => !slots[slot]);
  if (!pending) return null;
  const texto =
    pending === "marca" && intent === "contacto_marca"
      ? slotPregunta.marcaContacto
      : pending === "marca"
        ? slotPregunta.marca
        : slotPregunta[pending];
  return { texto, faltante: pending, ctas: [] };
}

function sinDatoRespuesta(count: number, href: string, extra?: string): BotAnswer {
  return {
    texto: extra ? `${sinDato}. ${extra}` : `${sinDato}.`,
    sinDato: true,
    ctas: [verPlanes(count, href), { label: "Otra pregunta", action: "reset" }],
  };
}

function hrefDe(slots: BotSlots) {
  return compararHref({ especie: slots.especie, zona: slots.provincia });
}

function especieFrase(especie: "perro" | "gato") {
  return especie === "perro" ? "perros" : "gatos";
}

function rango(plans: BotPlan[]) {
  const vigentes = plans.filter((plan) => plan.precioVigente && plan.precio != null).sort(porPrecio);
  if (!vigentes.length) return null;
  const precios = vigentes.map((plan) => plan.precio ?? 0);
  return {
    vigentes,
    min: precios[0],
    max: precios[precios.length - 1],
    mediana: mediana(precios),
    marcas: new Set(vigentes.map((plan) => plan.marcaSlug)).size,
  };
}

function precioAprox(slots: BotSlots, plans: BotPlan[]): BotAnswer {
  const scoped = acotar(plans, slots);
  const href = hrefDe(slots);
  const datos = rango(scoped);
  if (!datos || !slots.especie || !slots.provincia) {
    const extra = scoped.length ? "Hay fichas para esa búsqueda con precio a consultar." : undefined;
    return sinDatoRespuesta(scoped.length, href, extra);
  }
  const provincia = jurisdiccionLabel(slots.provincia) ?? slots.provincia;
  const mostrados = Math.min(3, datos.vigentes.length);
  const resumen =
    mostrados <= 1
      ? `Según ${datos.vigentes.length} plan verificado de ${datos.marcas} ${datos.marcas === 1 ? "marca" : "marcas"}. Este es el más barato:`
      : `Según ${datos.vigentes.length} planes verificados de ${datos.marcas} ${datos.marcas === 1 ? "marca" : "marcas"}. Estos son los ${mostrados} más baratos:`;
  return {
    texto: `Para ${especieFrase(slots.especie)} en ${provincia}, los planes publicados van de ${formatArs(datos.min)} a ${formatArs(datos.max)} por mes.`,
    frase: { especie: especieFrase(slots.especie), provincia, min: datos.min, max: datos.max },
    resumen,
    stats: { min: datos.min, mediana: datos.mediana, max: datos.max, planes: datos.vigentes.length, marcas: datos.marcas },
    cards: datos.vigentes.slice(0, 3).map((plan, index) => toCard(plan, index === 0, 2)),
    ranking: true,
    notaPrecio: notaDe(datos.vigentes),
    ctas: seguimientos(datos.vigentes.length, href),
  };
}

function masBarato(slots: BotSlots, plans: BotPlan[]): BotAnswer {
  const scoped = acotar(plans, slots);
  const href = hrefDe(slots);
  const datos = rango(scoped);
  if (!datos || !slots.provincia) {
    const extra = scoped.length ? "Hay fichas para esa búsqueda con precio a consultar." : undefined;
    return sinDatoRespuesta(scoped.length, href, extra);
  }
  const mejor = datos.vigentes[0];
  const provincia = jurisdiccionLabel(slots.provincia) ?? slots.provincia;
  const especie = slots.especie ? ` para ${especieFrase(slots.especie)}` : "";
  return {
    texto: `El plan más barato publicado${especie} en ${provincia} es ${mejor.nombre} de ${mejor.marca}, a ${formatArs(mejor.precio ?? datos.min)}/mes.`,
    cards: [toCard(mejor, true, 2)],
    ranking: true,
    notaPrecio: notaDe(datos.vigentes),
    ctas: seguimientos(datos.vigentes.length, href),
  };
}

function cobertura(slots: BotSlots, plans: BotPlan[]): BotAnswer {
  const marca = plans.find((plan) => plan.marcaSlug === slots.marca);
  if (!marca) return sinDatoRespuesta(0, "/comparar");
  const propios = plans.filter((plan) => plan.marcaSlug === marca.marcaSlug).sort(porPrecio);
  const href = `/planes/${marca.marcaSlug}`;
  return {
    texto: `${marca.marca} publica ${propios.length === 1 ? "1 plan" : `${propios.length} planes`}. Esto es lo que figura en las fichas.`,
    cards: propios.slice(0, 3).map((plan) => toCard(plan, false, 3)),
    notaPrecio: notaDe(propios),
    ctas: seguimientos(propios.length, href),
  };
}

function nombres(plans: BotPlan[]) {
  const map = new Map<string, string>();
  for (const plan of plans) map.set(plan.marcaSlug, plan.marca);
  return [...map.values()].sort((a, b) => a.localeCompare(b, "es"));
}

function linea(titulo: string, lista: string[]) {
  if (!lista.length) return `${titulo}: no hay fichas publicadas.`;
  return `${titulo}: ${lista.join(", ")}.`;
}

function tipos(plans: BotPlan[]): BotAnswer {
  const hogar = plans.filter((plan) => esAdicionalHogar(plan.marcaSlug));
  const hogarSlugs = new Set(hogar.map((plan) => plan.marcaSlug));
  const obra = plans.filter((plan) => plan.tipo === "obra_social");
  const seguro = plans.filter((plan) => plan.tipo === "seguro" && !hogarSlugs.has(plan.marcaSlug));
  const otros = plans.filter(
    (plan) => plan.tipo !== "obra_social" && !(plan.tipo === "seguro" && !hogarSlugs.has(plan.marcaSlug)) && !hogarSlugs.has(plan.marcaSlug),
  );
  return {
    texto: [tiposTexto, linea("Obras sociales publicadas", nombres(obra)), linea("Seguros publicados", nombres(seguro)), linea("Adicional de hogar", nombres(hogar)), linea("Otros planes publicados", nombres(otros))].join("\n\n"),
    ctas: seguimientos(new Set(plans.map((plan) => plan.id)).size, "/comparar"),
  };
}

function textoCoberturas(plan: BotPlan) {
  return plan.coberturas.map((item) => `${item.item} ${item.valor ?? ""}`).join("\n");
}

function esTele(plan: BotPlan) {
  const coberturas = textoCoberturas(plan);
  return teleconsulta.test(coberturas) || teleconsultaNotas.test(plan.notas ?? "");
}

function listaCobertura(plans: BotPlan[], slots: BotSlots, texto: (count: number) => string, test: (plan: BotPlan) => boolean): BotAnswer {
  const scoped = acotar(plans, { especie: slots.especie, provincia: slots.provincia }).filter(test).sort(porPrecio);
  const href = hrefDe(slots);
  if (!scoped.length) return sinDatoRespuesta(0, href);
  return {
    texto: texto(scoped.length),
    cards: scoped.slice(0, 3).map((plan) => toCard(plan, false, 2)),
    notaPrecio: notaDe(scoped),
    ctas: seguimientos(scoped.length, href),
  };
}

function edad(slots: BotSlots, plans: BotPlan[]): BotAnswer {
  const scoped = acotar(plans, { especie: slots.especie, provincia: slots.provincia });
  const href = hrefDe(slots);
  const publican = scoped.filter((plan) => plan.edadMaxAnios != null);
  if (!publican.length) return sinDatoRespuesta(0, href);
  const topes = publican.map((plan) => plan.edadMaxAnios ?? 0);
  const min = Math.min(...topes);
  const max = Math.max(...topes);
  if (slots.edadMeses == null) {
    const sinTope = scoped.length - publican.length;
    const base = min === max ? `Entre los planes que publican edad máxima, el tope es de ${max} años.` : `Entre los planes que publican edad máxima, el tope va de ${min} a ${max} años.`;
    const resto = sinTope ? ` ${sinTope === 1 ? "1 plan no publica" : `${sinTope} planes no publican`} ese tope.` : "";
    return { texto: `${base}${resto}`, ctas: seguimientos(publican.length, href) };
  }
  const aceptan = publican.filter((plan) => {
    if (plan.edadMinMeses != null && slots.edadMeses != null && slots.edadMeses < plan.edadMinMeses) return false;
    return slots.edadMeses != null && slots.edadMeses / 12 <= (plan.edadMaxAnios ?? 0);
  });
  const etiqueta = slots.edadMeses % 12 === 0 ? `${slots.edadMeses / 12} años` : `${slots.edadMeses} meses`;
  if (!aceptan.length) {
    return {
      texto: `No tengo un plan que publique cobertura para ${etiqueta}. El tope más alto publicado es de ${max} años.`,
      ctas: seguimientos(publican.length, href),
    };
  }
  const cantidad = aceptan.length === 1 ? "1 plan publica" : `${aceptan.length} planes publican`;
  return {
    texto: `Para ${etiqueta}, ${cantidad} un rango de edad que la incluye. El tope publicado llega a ${max} años.`,
    ctas: seguimientos(aceptan.length, href),
  };
}

function carencia(slots: BotSlots, plans: BotPlan[]): BotAnswer {
  const scoped = acotar(plans, { especie: slots.especie, provincia: slots.provincia });
  const href = hrefDe(slots);
  const dias = scoped.flatMap((plan) => plan.carencias.map((item) => item.dias));
  const conTexto = scoped.filter((plan) => plan.carenciasTexto && plan.carencias.length === 0);
  if (!dias.length && !conTexto.length) return sinDatoRespuesta(0, href);
  const partes: string[] = [];
  if (dias.length) {
    const min = Math.min(...dias);
    const max = Math.max(...dias);
    partes.push(min === max ? `Los plazos de carencia publicados son de ${min} días.` : `Los plazos de carencia publicados van de ${min} a ${max} días.`);
  }
  if (conTexto.length) {
    partes.push(conTexto.length === 1 ? "1 ficha trae un texto de carencias sin un número de días." : `${conTexto.length} fichas traen un texto de carencias sin un número de días.`);
  }
  const sin = scoped.filter((plan) => plan.carencias.length === 0 && !plan.carenciasTexto).length;
  if (sin) partes.push(sin === 1 ? "1 ficha no trae ese dato." : `${sin} fichas no traen ese dato.`);
  return { texto: partes.join(" "), ctas: seguimientos(scoped.length, href) };
}

function contacto(slots: BotSlots, plans: BotPlan[]): BotAnswer {
  const propios = plans.filter((plan) => plan.marcaSlug === slots.marca).sort(porPrecio);
  const marca = propios[0];
  if (!marca) return sinDatoRespuesta(0, "/comparar");
  const priced = propios.find((plan) => plan.precioVigente && plan.precio != null);
  return {
    texto: contactoTexto(marca.marca),
    lead: {
      marca: marca.marca,
      planes: propios.map((plan) => ({ id: plan.id, nombre: plan.nombre })),
      defaultPlanId: priced?.id ?? marca.id,
    },
    ctas: [{ label: "Otra pregunta", action: "reset" }],
  };
}

export function answerIntent(intent: IntentId, slots: BotSlots, plans: BotPlan[]): BotAnswer {
  const pending = falta(intent, slots);
  if (pending) return pending;
  if (slots.provincia && !isJurisdiccion(slots.provincia)) return sinDatoRespuesta(0, "/comparar");

  if (intent === "precio_aprox") return precioAprox(slots, plans);
  if (intent === "mas_barato") return masBarato(slots, plans);
  if (intent === "cobertura_marca") return cobertura(slots, plans);
  if (intent === "tipos") return tipos(plans);
  if (intent === "edad") return edad(slots, plans);
  if (intent === "teleconsulta") {
    return listaCobertura(plans, slots, (count) => `${count === 1 ? "1 plan publica" : `${count} planes publican`} veterinario online o guardia 24 h.`, esTele);
  }
  if (intent === "rc") {
    return listaCobertura(plans, slots, (count) => `${count === 1 ? "1 plan publica" : `${count} planes publican`} responsabilidad civil.`, (plan) => responsabilidad.test(textoCoberturas(plan)));
  }
  if (intent === "carencia") return carencia(slots, plans);
  if (intent === "vende") {
    return {
      texto: vendeTexto,
      ctas: [
        { label: "Que me contacte una marca", action: "lead" },
        { label: "Ver el comparador", href: "/comparar" },
        { label: "Otra pregunta", action: "reset" },
      ],
    };
  }
  return contacto(slots, plans);
}
