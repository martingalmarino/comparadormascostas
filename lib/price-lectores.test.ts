import assert from "node:assert/strict";
import test from "node:test";
import { leerPrecioPublico } from "@/lib/price-update";

const html = `
  DESDE $6.135 /mes
  Plan 60 Desde $39.000 Plan 80 Desde $52.000 Plan 100 Desde $78.000
  Plan 60 (60%): $600 mil
  Plan 1 $19.047 Mensual COBERTURA ANUAL $500.000
  Plan 2 $26.216 Mensual
  Plan Emergencias Todas las edades Cobertura completa. $ 27.900 Ver cobertura
  Plan Cachorro Hasta 1 año. $ 56.900 Ver cobertura
  Plan Adulto De 1 a 7 años. $ 51.900 Ver cobertura
  Plan Senior Más de 7 años. $ 70.900 Ver cobertura
  PLAN OMEGA PREMIUM Consultas (tope $45.000) $75.000 X mes
  PLAN ALFA (tope $38.000) $38.000 X mes $22.000 X mes
  Plan Individual reintegro ARS 9.489 /mes
  Plan Familiar reintegro ARS 12.398 /mes
  Premio mensual $ Pesos 12.948 $ Pesos 15.454 $ Pesos 20.083 Premio mensual "Paquetizados" $ Pesos 11.005
  Básico $39.674.- Para padres de un hijo peludo
  Preferido. $47.609.- dos hijos peludos
  Full $52.899.- Para padres de tres hijos peludos
  Precio mensual $ $12.233 $15.728 $17.476
  Responsabilidad civil $2.800.000
  Responsabilidad civil $3.600.000
  Responsabilidad civil $4.000.000
`;

const qualia = `hogar:{installments:["$17.700","$35.400"]} mascotas:{coberturas:[],installments:["$9.700","$14.600","$19.400","$24.300","$29.100"]}`;

function precio(fuente: string, planId: string) {
  const leido = leerPrecioPublico(fuente, planId);
  assert.ok(leido && "price" in leido, planId);
  return leido;
}

test("lee el precio público de cada marca y no el de otra cobertura", () => {
  assert.equal(precio(html, "answer-seguros-seguro-de-mascotas").price, 6135);
  assert.match(precio(html, "answer-seguros-seguro-de-mascotas").texto, /Desde/);
  assert.equal(precio(html, "companion-plan-80").price, 52000);
  assert.equal(precio(html, "fielpet-plan-1").price, 19047);
  assert.equal(precio(html, "ike-mascotas-adulto").price, 51900);
  assert.equal(precio(html, "osmasc-plan-omega-premium").price, 75000);
  assert.equal(precio(html, "pet-society-plan-familiar").price, 12398);
  assert.equal(precio(html, "provincia-seguros-banco-provincia-plan-plus").price, 15454);
  assert.equal(precio(html, "holavet-3").price, 52899);
  assert.equal(precio(html, "hipotecario-mascotas-3").price, 17476);
  assert.equal(precio(qualia, "qualia-seguros-plan-5").price, 29100);
  assert.equal(precio(qualia, "qualia-seguros-plan-1").price, 9700);
});
