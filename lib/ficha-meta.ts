import { formatArs, formatDate, formatMonthAbbr } from "@/lib/format";
import { preciosVigentes } from "@/lib/marca-ficha";
import type { Plan } from "@/lib/plan-schema";
import { brandLabel } from "@/lib/seo-copy";

const LIMITE_TITLE = 65;

function especies(plans: Plan[]) {
  const presentes = new Set(plans.flatMap((plan) => plan.especies));
  if (presentes.has("perro") && presentes.has("gato")) return "para perros y gatos";
  if (presentes.has("perro")) return "para perros";
  if (presentes.has("gato")) return "para gatos";
  return "";
}

function ajustar(texto: string) {
  const cierres = [" Cada dato tiene fecha y fuente.", " Cuidalo no vende el seguro.", " Pedilo a la marca."];
  let actual = texto.trim();
  for (const cierre of cierres) {
    if ([...actual].length >= 140) break;
    if ([...actual].length + [...cierre].length <= 160) actual += cierre;
  }
  return actual;
}

function titulo(etiqueta: string, detalle: string, mes: string) {
  return `${etiqueta}: seguro de mascotas${detalle} (${mes}) | Cuidalo`;
}

function cabe(texto: string) {
  return [...texto].length <= LIMITE_TITLE;
}

/** Nombre visible, sin el paréntesis que alarga el title (vía, Life, banco). */
function etiquetaTitle(slug: string, nombre: string) {
  return brandLabel(slug, nombre)
    .replace(/\s*\([^)]*\)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function etiquetasTitle(etiqueta: string) {
  const alternativas = [etiqueta.replace(/^Banco\s+/, ""), etiqueta.replace(/\s+Seguros$/, "")];
  const sinAmbos = etiqueta.replace(/^Banco\s+/, "").replace(/\s+Seguros$/, "");
  return [etiqueta, ...alternativas, sinAmbos].filter((item, index, todos) => item.length > 0 && todos.indexOf(item) === index);
}

/**
 * Prueba, en orden, la frase completa, sin " y planes" y sin ", precios".
 * Dentro de cada frase prueba el mes con punto y, si falta un carácter, sin punto.
 * Recién si "precios" no entra, acorta "Banco " o " Seguros".
 */
export function tituloFicha(slug: string, nombre: string, hoy: string) {
  const mes = formatMonthAbbr(hoy);
  const meses = [mes, mes.replace(/\./g, "")];
  const etiquetas = etiquetasTitle(etiquetaTitle(slug, nombre));
  const detalles = [", precios y planes", ", precios"];
  for (const [indice, detalle] of detalles.entries()) {
    const nombres = indice === 0 ? etiquetas.slice(0, 1) : etiquetas;
    for (const etiqueta of nombres) {
      for (const mesTitulo of meses) {
        const candidato = titulo(etiqueta, detalle, mesTitulo);
        if (cabe(candidato)) return candidato;
      }
    }
  }
  return titulo(etiquetas[0], "", meses[0]);
}

export function descripcionFicha(nombre: string, plans: Plan[], today: string) {
  const vigentes = preciosVigentes(plans, today);
  const cantidad = plans.length;
  const noun = cantidad === 1 ? "plan" : "planes";
  const para = especies(plans);
  const detalle = "coberturas, carencias, edades y cómo contratar";
  if (!vigentes.length) {
    return ajustar(`Precio a consultar. Coberturas, carencias, edades y cómo contratar ${nombre}.`);
  }
  const bajo = vigentes[0];
  const precio = formatArs(bajo.precio as number);
  const fecha = formatDate(bajo.fecha_verificacion);
  const medio = para ? `${cantidad} ${noun} de ${nombre} ${para}` : `${cantidad} ${noun} de ${nombre}`;
  let texto = `Desde ${precio}/mes (${bajo.nombre}, verificado ${fecha}). ${medio}: ${detalle}.`;
  if ([...texto].length > 160 && para) {
    texto = `Desde ${precio}/mes (${bajo.nombre}, verificado ${fecha}). ${cantidad} ${noun} de ${nombre}: ${detalle}.`;
  }
  if ([...texto].length > 160) {
    texto = `Desde ${precio}/mes (${bajo.nombre}, verificado ${fecha}). ${cantidad} ${noun} de ${nombre}.`;
  }
  return ajustar(texto);
}
