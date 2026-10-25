import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FichaV2 } from "@/components/FichaMarca/FichaV2";
import { descripcionFicha, tituloFicha } from "@/lib/ficha-meta";
import { formatMonthAbbr } from "@/lib/format";
import { appendPricePoint, seriesVisibles } from "@/lib/historial";
import { alternativasCercanas, enlaceCanal, faqsDeMarca, organizationMarcaJsonLd, textoInconsistencia, textoZona } from "@/lib/marca-ficha";
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
    const title = tituloFicha(slug, plans[0].marca, today);
    const description = descripcionFicha(plans[0].marca, plans, today);
    const mes = formatMonthAbbr(today);
    const meses = [mes, mes.replace(/\./g, "")];
    assert.match(title, /: seguro de mascotas(?:, precios(?: y planes)?)? \([a-z]{3}\.? \d{4}\) \| Cuidalo$/);
    assert.ok(meses.some((item) => title.includes(`(${item})`)), `${slug} no usa el mes de referencia: ${title}`);
    assert.ok(title.includes(today.slice(0, 4)), title);
    const niveles = [
      `${title.split(":")[0]}: seguro de mascotas, precios y planes`,
      `${title.split(":")[0]}: seguro de mascotas, precios`,
      `${title.split(":")[0]}: seguro de mascotas`,
    ];
    const nivel = niveles.findIndex((item) => title.startsWith(`${item} (`));
    assert.ok(nivel >= 0, title);
    for (let previo = 0; previo < nivel; previo += 1) {
      for (const item of meses) {
        const candidato = `${niveles[previo]} (${item}) | Cuidalo`;
        assert.ok([...candidato].length > 65, `${slug} podía usar «${candidato}»`);
      }
    }
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
    if (slug === "rus-seguros") {
      assert.equal(html.includes("Todo el país"), false, html);
      assert.equal(html.includes("1958"), false);
      for (const plan of plans) {
        const zona = textoZona(plan);
        assert.equal(zona, "Nacional");
        assert.equal(/nacional/i.test(zona) && /todo el pa/i.test(zona), false);
      }
    }
  }
  assert.match(tituloFicha("zurich", "Zurich", today), /Zurich: seguro de mascotas, precios y planes \(oct 2026\) \| Cuidalo/);
  assert.match(tituloFicha("mapfre", "MAPFRE", today), /MAPFRE: seguro de mascotas, precios y planes \(oct 2026\) \| Cuidalo/);
  assert.match(tituloFicha("galicia", "Galicia Seguros", today), /Galicia Seguros: seguro de mascotas, precios \(oct 2026\) \| Cuidalo/);
  assert.match(tituloFicha("macro", "Macro \(Life Seguros\)", today), /^Macro: seguro de mascotas, precios y planes \(oct\. 2026\) \| Cuidalo$/);
  assert.match(tituloFicha("hipotecario", "Banco Hipotecario", today), /^Hipotecario: seguro de mascotas, precios \(oct\. 2026\) \| Cuidalo$/);
  assert.match(
    tituloFicha("provincia-seguros-banco-provincia", "Provincia Seguros (Banco Provincia)", today),
    /^Provincia: seguro de mascotas, precios \(oct\. 2026\) \| Cuidalo$/,
  );
  const petit = tituloFicha("petit-salud", "Petit Salud", today);
  assert.match(petit, /\(oct\. 2026\)/);
  assert.equal(petit.includes("2025"), false);
  assert.equal(petit.includes("abr."), false);
  const rus = getPlansByMarca("rus-seguros");
  assert.equal(rus.find((plan) => plan.nombre === "PetCare Integral")?.edad_max_anios, 8);
  assert.equal(rus.find((plan) => plan.nombre === "PetCare Superior")?.edad_max_anios, 8);
});
