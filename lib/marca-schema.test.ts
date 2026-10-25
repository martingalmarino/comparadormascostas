import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FichaV2 } from "@/components/FichaMarca/FichaV2";
import { descripcionFicha, tituloFicha } from "@/lib/ficha-meta";
import { appendPricePoint, seriesVisibles } from "@/lib/historial";
import { alternativasCercanas, enlaceCanal, faqsDeMarca, organizationMarcaJsonLd, textoInconsistencia } from "@/lib/marca-ficha";
import { marcaSchema } from "@/lib/marca-schema";
import { getMarca } from "@/lib/marcas";
import { getPlans, getPlansByMarca } from "@/lib/plans";
import { precioVigente } from "@/lib/plan-status";
import { faqJsonLd, productJsonLd } from "@/lib/seo";
import type { SeoEntry } from "@/lib/seo-copy";

const root = process.cwd();

test("las 28 fichas cumplen el esquema y cada slug existe en planes", () => {
  const dir = path.join(root, "data", "marcas");
  const files = readdirSync(dir).filter((name) => name.endsWith(".json")).sort();
  assert.equal(files.length, 28);
  for (const file of files) {
    const marca = marcaSchema.parse(JSON.parse(readFileSync(path.join(dir, file), "utf8")));
    const slug = file.replace(/\.json$/, "");
    assert.equal(marca.slug, slug);
    assert.equal(existsSync(path.join(root, "data", "planes", `${slug}.json`)), true);
  }
});

test("WhatsApp ver web no es un teléfono y lo que no publica vacío no se inventa", () => {
  const rus = marcaSchema.parse(JSON.parse(readFileSync(path.join(root, "data", "marcas", "rus-seguros.json"), "utf8")));
  assert.deepEqual(rus.no_publica, []);
  const enlace = enlaceCanal("WhatsApp (ver web)", "https://www.avsim.com.ar/");
  assert.equal(enlace.href, "https://www.avsim.com.ar/");
  assert.equal(enlace.href?.startsWith("tel:"), false);
  assert.match(textoInconsistencia(rus.inconsistencias[0].descripcion), /^La web indica “.+” y también “.+”\. Confirmalo con la marca\.$/);
});

test("el historial no duplica la misma fecha y precio y solo se muestra con 2 puntos", () => {
  const punto = { fecha: "2026-10-24", precio: 7000, fuente: "https://www.rus.com.ar/productos/mascotas/" };
  const uno = appendPricePoint(undefined, punto);
  assert.equal(appendPricePoint(uno, punto).length, 1);
  assert.equal(seriesVisibles({ "rus-seguros-petcare-simple": uno }).length, 0);
  const dos = appendPricePoint(uno, { ...punto, fecha: "2026-11-01" });
  assert.equal(seriesVisibles({ "rus-seguros-petcare-simple": dos }).length, 1);
});

test("las alternativas de rus salen de otras marcas y de precios vigentes", () => {
  const alternativas = alternativasCercanas(getPlans(), "rus-seguros", "2026-10-25");
  assert.equal(alternativas.length, 3);
  assert.ok(alternativas.every((plan) => plan.marca_slug !== "rus-seguros" && plan.estado === "verificado" && plan.precio != null));
});

test("cada ficha v2 tiene title, description y JSON-LD sin null", () => {
  const today = "2026-10-25";
  const slugs = readdirSync(path.join(root, "data", "marcas"))
    .filter((name) => name.endsWith(".json"))
    .map((name) => name.replace(/\.json$/, ""));
  assert.equal(slugs.length, 28);
  for (const slug of slugs) {
    const ficha = getMarca(slug);
    const plans = getPlansByMarca(slug);
    assert.ok(ficha);
    assert.ok(plans.length);
    const title = tituloFicha(slug, plans[0].marca, plans);
    const description = descripcionFicha(plans[0].marca, plans, today);
    assert.match(title, /: seguro de mascotas(?:, precios(?: y planes)?)? \([a-z]{3}\. \d{4}\) \| Cuidalo$/);
    assert.ok([...title].length <= 65, `${slug} title ${[...title].length}: ${title}`);
    assert.ok([...description].length >= 140 && [...description].length <= 160, `${slug} desc ${[...description].length}: ${description}`);
    assert.equal(/\bnull\b|\bundefined\b/.test(`${title} ${description}`), false);
    if (!plans.some((plan) => precioVigente(plan, today))) {
      assert.match(description, /^Precio a consultar\./);
      assert.equal(description.includes("Desde $"), false);
    }
    const faqs = faqsDeMarca(ficha, plans, today, plans[0].marca);
    const bloques = [
      faqJsonLd(faqs),
      organizationMarcaJsonLd(ficha, plans[0].marca),
      ...plans.map((plan) => productJsonLd(plan, today)),
    ];
    for (const bloque of bloques) {
      const serializado = JSON.stringify(bloque);
      JSON.parse(serializado);
      assert.equal(serializado.includes("undefined"), false, slug);
      assert.equal(/"null"/.test(serializado), false, slug);
    }
    for (const plan of plans) {
      const nodo = productJsonLd(plan, today) as { description?: string; offers?: unknown };
      assert.equal(nodo.description === "Nacional" || nodo.description === "Todo el país.", false);
      if (!precioVigente(plan, today)) assert.equal(nodo.offers, undefined);
    }
    const seo: SeoEntry = {
      path: `/planes/${slug}`,
      title,
      description,
      h1: `${plans[0].marca}: planes, precios y coberturas`,
      index: true,
      lastModified: today,
    };
    const html = renderToStaticMarkup(
      createElement(FichaV2, {
        marca: slug,
        ficha,
        plans,
        today,
        seo,
        related: [],
        faqsBase: [],
      }),
    );
    assert.equal(/\bnull\b|\bundefined\b/.test(html), false, slug);
    if (ficha.no_publica.length === 0) assert.equal(html.includes(`Lo que ${plans[0].marca} no publica`), false);
  }
  const rus = getPlansByMarca("rus-seguros");
  assert.equal(rus.find((plan) => plan.nombre === "PetCare Integral")?.edad_max_anios, 8);
  assert.equal(rus.find((plan) => plan.nombre === "PetCare Superior")?.edad_max_anios, 8);
});
