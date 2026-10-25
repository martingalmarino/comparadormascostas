import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { appendPricePoint, seriesVisibles } from "@/lib/historial";
import { alternativasCercanas, enlaceCanal, loQueNoPublica } from "@/lib/marca-ficha";
import { marcaSchema } from "@/lib/marca-schema";
import { getPlans } from "@/lib/plans";

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

test("un campo null se suma a lo que no publica y WhatsApp ver web no es un teléfono", () => {
  const holavet = marcaSchema.parse(JSON.parse(readFileSync(path.join(root, "data", "marcas", "holavet.json"), "utf8")));
  assert.equal(holavet.empresa.cuit, null);
  assert.ok(loQueNoPublica(holavet).includes("CUIT"));
  const enlace = enlaceCanal("WhatsApp (ver web)", "https://www.avsim.com.ar/");
  assert.equal(enlace.href, "https://www.avsim.com.ar/");
  assert.equal(enlace.href?.startsWith("tel:"), false);
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
