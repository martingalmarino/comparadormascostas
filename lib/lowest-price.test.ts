import assert from "node:assert/strict";
import test from "node:test";
import { getLowestPricePlans } from "@/lib/lowest-price";
import type { Plan } from "@/lib/plan-schema";

const today = "2026-10-25";

function plan(partial: Partial<Plan> & Pick<Plan, "id" | "marca_slug" | "precio" | "estado" | "fecha_verificacion" | "tipo">): Plan {
  return {
    marca: partial.marca ?? partial.marca_slug,
    nombre: "Plan",
    especies: ["perro"],
    zonas: [{ provincia: "todas", ciudades: "toda" }],
    moneda: "ARS",
    es_ejemplo: false,
    fuente_url: "https://example.com/plan",
    coberturas: [{ item: "Consultas" }, { item: "Vacunas" }, { item: "Cirugías" }],
    carencias: [],
    pros: [],
    contras: [],
    lead: { modo: "link", destino: "https://example.com/plan" },
    logo: "/logos/marca.png",
    ...partial,
  };
}

test("elige un solo plan por marca, el de menor precio", () => {
  const plans = [
    plan({ id: "a-caro", marca_slug: "alfa", precio: 20000, estado: "verificado", fecha_verificacion: "2026-10-20", tipo: "seguro" }),
    plan({ id: "a-barato", marca_slug: "alfa", precio: 8000, estado: "verificado", fecha_verificacion: "2026-10-20", tipo: "seguro" }),
    plan({ id: "b", marca_slug: "beta", precio: 9000, estado: "verificado", fecha_verificacion: "2026-10-20", tipo: "obra_social" }),
  ];
  const result = getLowestPricePlans(plans, { today });
  assert.deepEqual(
    result.map((item) => item.id),
    ["a-barato", "b"],
  );
});

test("excluye precio a consultar del ranking de menor precio", () => {
  const plans = [
    plan({ id: "consulta", marca_slug: "consulta", precio: null, estado: "consultar", fecha_verificacion: "2026-10-24", tipo: "seguro" }),
    plan({ id: "ok", marca_slug: "ok", precio: 9000, estado: "verificado", fecha_verificacion: "2026-10-20", tipo: "seguro" }),
  ];
  const result = getLowestPricePlans(plans, { today });
  assert.deepEqual(
    result.map((item) => item.id),
    ["ok"],
  );
});

test("excluye planes vencidos y los que requieren revisión", () => {
  const plans = [
    plan({ id: "viejo", marca_slug: "viejo", precio: 1000, estado: "verificado", fecha_verificacion: "2026-01-01", tipo: "seguro" }),
    plan({ id: "revision", marca_slug: "revision", precio: 1500, estado: "requiere_revision", fecha_verificacion: "2026-10-20", tipo: "seguro" }),
    plan({ id: "ok", marca_slug: "ok", precio: 3000, estado: "verificado", fecha_verificacion: "2026-10-01", tipo: "seguro" }),
  ];
  const result = getLowestPricePlans(plans, { today });
  assert.deepEqual(
    result.map((item) => item.id),
    ["ok"],
  );
});

test("con provincia deja las marcas de esa zona y las nacionales", () => {
  const plans = [
    plan({ id: "nacional", marca_slug: "nacional", precio: 5000, estado: "verificado", fecha_verificacion: "2026-10-20", tipo: "seguro" }),
    plan({
      id: "cordoba",
      marca_slug: "cordoba",
      precio: 7000,
      estado: "verificado",
      fecha_verificacion: "2026-10-20",
      tipo: "obra_social",
      zonas: [{ provincia: "cordoba", ciudades: "toda" }],
    }),
    plan({
      id: "caba",
      marca_slug: "caba",
      precio: 2000,
      estado: "verificado",
      fecha_verificacion: "2026-10-20",
      tipo: "seguro",
      zonas: [{ provincia: "caba", ciudades: "toda" }],
    }),
  ];
  const result = getLowestPricePlans(plans, { today, provincia: "cordoba" });
  assert.deepEqual(
    result.map((item) => item.id),
    ["nacional", "cordoba"],
  );
});
