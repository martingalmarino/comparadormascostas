import assert from "node:assert/strict";
import test from "node:test";
import { precioPetcare } from "@/lib/price-update";
import { mostrarMonto } from "@/lib/plan-status";

const html = `
  <p>$ 12.100 /mes Plan Hogar Familiar</p>
  <p>$ 7.000 /mes Plan RUS PETCARE SIMPLE</p>
  <p>$ 15.000 /mes Plan RUS PETCARE ESENCIAL</p>
  <p>$ 25.000 /mes Plan RUS PETCARE INTEGRAL</p>
  <p>$ 35.000 /mes Plan RUS PETCARE SUPERIOR</p>
  <p>$ 31.536 /mes</p>
`;

function precioRus(planId: string) {
  const leido = precioPetcare(html, planId);
  assert.ok("price" in leido);
  return leido.price;
}

test("RUS lee el precio mensual de cada PetCare y no el del hogar", () => {
  assert.equal(precioRus("rus-seguros-petcare-simple"), 7000);
  assert.equal(precioRus("rus-seguros-petcare-esencial"), 15000);
  assert.equal(precioRus("rus-seguros-petcare-integral"), 25000);
  assert.equal(precioRus("rus-seguros-petcare-superior"), 35000);
});

test("el monto se oculta si no hay precio, está en revisión o pasaron más de 75 días", () => {
  const vigente = { estado: "verificado" as const, precio: 7000, fecha_verificacion: "2026-10-26" };
  assert.equal(mostrarMonto(vigente, "2026-10-26"), true);
  assert.equal(mostrarMonto({ ...vigente, precio: null }, "2026-10-26"), false);
  assert.equal(mostrarMonto({ ...vigente, estado: "requiere_revision" }, "2026-10-26"), false);
  assert.equal(mostrarMonto({ ...vigente, fecha_verificacion: "2026-09-01" }, "2026-10-26"), true);
  assert.equal(mostrarMonto({ ...vigente, fecha_verificacion: "2026-08-01" }, "2026-10-26"), false);
});
