import assert from "node:assert/strict";
import test from "node:test";
import { answerIntent } from "@/lib/bot/answers";
import { respuestaDirecta } from "@/lib/geo";
import { toBotPlans } from "@/lib/bot/catalog";
import { botEvent } from "@/lib/bot/event";
import { matchText } from "@/lib/bot/match";
import type { BotPlan } from "@/lib/bot/types";
import { coversZona } from "@/lib/filters";
import { getPlans } from "@/lib/plans";
import type { Plan } from "@/lib/plan-schema";
import { precioVigente } from "@/lib/plan-status";

const today = "2026-10-25";

function plan(partial: Partial<Plan> & Pick<Plan, "id" | "marca_slug" | "precio" | "estado" | "fecha_verificacion">): Plan {
  return {
    marca: partial.marca ?? partial.marca_slug,
    nombre: "Plan",
    tipo: "seguro",
    especies: ["perro"],
    zonas: [{ provincia: "todas", ciudades: "toda" }],
    moneda: "ARS",
    es_ejemplo: false,
    fuente_url: "https://example.com/plan",
    coberturas: [{ item: "Consultas" }],
    carencias: [],
    pros: [],
    contras: [],
    lead: { modo: "link", destino: "https://example.com/plan" },
    logo: "/logos/marca.png",
    ...partial,
  };
}

function bot(partial: Partial<BotPlan> & Pick<BotPlan, "id" | "precio">): BotPlan {
  return {
    marca: "Marca",
    marcaSlug: "marca",
    nombre: partial.id,
    tipo: "seguro",
    especies: ["perro", "gato"],
    zonas: ["todas"],
    precioVigente: true,
    estado: "verificado",
    fechaVerificacion: today,
    fuenteUrl: "https://example.com/plan",
    coberturas: [{ item: "Consultas" }],
    carencias: [],
    logo: null,
    ...partial,
  };
}

test("reconoce intent y slots sin quedarse con el texto libre", () => {
  const plans = toBotPlans(getPlans(), today);
  const precio = matchText("¿Cuánto sale un seguro para mi perro en Córdoba?", plans);
  assert.equal(precio.intent, "precio_aprox");
  assert.equal(precio.slots.especie, "perro");
  assert.equal(precio.slots.provincia, "cordoba");

  const barato = matchText("cuál es el plan más barato en CABA", plans);
  assert.equal(barato.intent, "mas_barato");
  assert.equal(barato.slots.provincia, "caba");

  const mapfre = matchText("qué cubre Mapfre", plans);
  assert.equal(mapfre.intent, "cobertura_marca");
  assert.equal(mapfre.slots.marca, "mapfre");

  assert.equal(matchText("hay carencia?", plans).intent, "carencia");
  assert.equal(matchText("¿Cuidalo vende seguros?", plans).intent, "vende");
  assert.equal(matchText("quiero que me contacte una marca", plans).intent, "contacto_marca");
  assert.equal(matchText("planes con veterinario online", plans).intent, "teleconsulta");
  assert.equal(matchText("responsabilidad civil", plans).intent, "rc");
  assert.equal(matchText("hasta qué edad puedo asegurar un gato de 8 años", plans).intent, "edad");
  assert.equal(matchText("hasta qué edad puedo asegurar un gato de 8 años", plans).slots.edadMeses, 96);
  assert.equal(matchText("obra social vs seguro", plans).intent, "tipos");
  assert.equal(matchText("hola, ¿cómo estás?", plans).intent, null);

  const evento = botEvent({ intent: null, slots: {}, resultado: "sin_respuesta" });
  assert.deepEqual(Object.keys(evento).sort(), ["especie", "intent", "marca", "provincia", "resultado"]);
  assert.equal(JSON.stringify(evento).includes("cómo estás"), false);
});

test("el rango usa solo precios vigentes que cubren la provincia", () => {
  const raw = getPlans();
  const plans = toBotPlans(raw, today);
  const answer = answerIntent("precio_aprox", { especie: "perro", provincia: "cordoba" }, plans);
  const expected = raw
    .filter((item) => item.especies.includes("perro") && coversZona(item, "cordoba") && precioVigente(item, today))
    .map((item) => item.precio ?? 0)
    .sort((a, b) => a - b);
  assert.ok(expected.length > 0);
  assert.equal(answer.stats?.min, expected[0]);
  assert.equal(answer.stats?.max, expected[expected.length - 1]);
  assert.equal(answer.stats?.planes, expected.length);
  assert.equal(answer.stats?.mediana, answer.stats && answer.stats.min <= answer.stats.mediana && answer.stats.mediana <= answer.stats.max ? answer.stats.mediana : -1);
  assert.equal(answer.cards?.[0]?.precio, expected[0]);
  assert.equal(answer.cards?.length, Math.min(3, expected.length));
  assert.ok(answer.cards?.every((card) => card.precio != null));
  assert.equal(answer.cards?.some((card) => card.marcaSlug === "la-caja"), false);
  assert.match(answer.texto, /por mes/);
  assert.ok(answer.notaPrecio?.fecha);
  assert.ok(answer.notaPrecio?.host);
});

test("la mediana es el centro y un precio vencido o a consultar no entra", () => {
  const plans = [100, 200, 300, 400].map((precio, index) => bot({ id: `p${index}`, precio, marcaSlug: `m${index}`, marca: `Marca ${index}` }));
  const answer = answerIntent("precio_aprox", { especie: "perro", provincia: "caba" }, plans);
  assert.equal(answer.stats?.min, 100);
  assert.equal(answer.stats?.mediana, 250);
  assert.equal(answer.stats?.max, 400);

  const odd = answerIntent("precio_aprox", { especie: "gato", provincia: "mendoza" }, plans.slice(0, 3));
  assert.equal(odd.stats?.mediana, 200);

  const stale = toBotPlans(
    [
      plan({ id: "viejo", marca_slug: "viejo", precio: 1000, estado: "verificado", fecha_verificacion: "2020-01-01" }),
      plan({
        id: "desde",
        marca_slug: "desde",
        precio: 2000,
        estado: "verificado",
        fecha_verificacion: today,
        precio_texto_original: "Desde $2.000",
      }),
      plan({ id: "consulta", marca_slug: "consulta", precio: null, estado: "consultar", fecha_verificacion: today }),
      plan({ id: "revision", marca_slug: "revision", precio: 3000, estado: "requiere_revision", fecha_verificacion: today }),
    ],
    today,
  );
  assert.ok(stale.every((item) => !item.precioVigente));
  const vacio = answerIntent("precio_aprox", { especie: "perro", provincia: "caba" }, stale);
  assert.equal(vacio.sinDato, true);
  assert.match(vacio.texto, /No tengo ese dato todavía/);
  assert.equal(vacio.cards, undefined);
});

test("sin ficha de la marca no inventa cobertura y el contacto abre esa marca", () => {
  const plans = toBotPlans(getPlans(), today);
  const desconocida = answerIntent("cobertura_marca", { marca: "no-existe" }, plans);
  assert.equal(desconocida.sinDato, true);
  assert.match(desconocida.texto, /No tengo ese dato todavía/);
  assert.equal(desconocida.ctas[0]?.href, "/comparar");

  const caja = answerIntent("cobertura_marca", { marca: "la-caja" }, plans);
  assert.equal(caja.sinDato, undefined);
  assert.match(caja.texto, /La Caja no publica precios en su sitio oficial; consultá directamente con la marca\./);
  assert.doesNotMatch(caja.texto, /75 días/);
  assert.ok(caja.cards?.some((card) => card.precioLabel === "Precio a consultar"));
  assert.equal(caja.cards?.some((card) => card.precio != null), false);

  const lead = answerIntent("contacto_marca", { marca: "la-caja" }, plans);
  assert.equal(lead.lead?.marca, "La Caja");
  assert.ok(lead.lead && lead.lead.planes.length > 0);
});

test("el resumen de una marca sin precio público no usa la regla de 75 días", () => {
  const texto = respuestaDirecta({ tipo: "marca", today: "2026-10-26", slug: "zurich" });
  assert.match(texto, /Zurich no publica precios en su sitio oficial; consultá directamente con la marca\./);
  assert.doesNotMatch(texto, /75 días/);
  const bot = answerIntent("cobertura_marca", { marca: "zurich" }, toBotPlans(getPlans(), "2026-10-26"));
  assert.match(bot.texto, /Zurich no publica precios en su sitio oficial; consultá directamente con la marca\./);
});
test("el resumen de Answer cita el desde verificado", () => {
  const texto = respuestaDirecta({ tipo: "marca", today: "2026-10-26", slug: "answer-seguros" });
  assert.match(texto, /Desde \$6\.135\/mes \(verificado 26\/10\/2026\)/);
  assert.doesNotMatch(texto, /no hay un precio verificado/);
});

test("un precio desde verificado se cita como Desde y no como dato faltante", () => {
  const plans = toBotPlans(
    [
      plan({
        id: "answer",
        marca_slug: "answer-seguros",
        marca: "Answer Seguros",
        nombre: "Seguro de Mascotas",
        precio: 6135,
        estado: "verificado",
        fecha_verificacion: "2026-10-26",
        precio_tipo: "desde",
      }),
    ],
    "2026-10-26",
  );
  assert.equal(plans[0]?.precioVigente, false);
  assert.equal(plans[0]?.precioTipo, "desde");
  const precio = answerIntent("precio_aprox", { especie: "perro", provincia: "caba", marca: "answer-seguros" }, plans);
  assert.equal(precio.sinDato, undefined);
  assert.match(precio.texto, /Desde \$6\.135\/mes \(verificado 26\/10\/2026\)/);
  const ficha = answerIntent("cobertura_marca", { marca: "answer-seguros" }, plans);
  assert.match(ficha.texto, /Desde \$6\.135\/mes \(verificado 26\/10\/2026\)/);
  assert.equal(ficha.cards?.[0]?.precioLabel, "Desde $6.135/mes");
  assert.equal(ficha.cards?.[0]?.precio, null);
});

test("responsabilidad civil y teleconsulta salen de las coberturas publicadas", () => {
  const plans = toBotPlans(getPlans(), today);
  const rc = answerIntent("rc", {}, plans);
  assert.ok(rc.cards && rc.cards.length > 0);
  for (const card of rc.cards ?? []) {
    const plan = plans.find((item) => item.id === card.id);
    const texto = plan?.coberturas.map((item) => `${item.item} ${item.valor ?? ""}`).join(" ") ?? "";
    assert.match(texto, /responsabilidad civil|\brc\b/i);
  }
  const tele = answerIntent("teleconsulta", {}, plans);
  assert.equal(tele.sinDato, undefined);
  assert.match(tele.texto, /veterinario online o guardia 24 h/);
});
