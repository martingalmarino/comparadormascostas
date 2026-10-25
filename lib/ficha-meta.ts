import { formatArs, formatDate, formatMonthAbbr } from "@/lib/format";
import { preciosVigentes } from "@/lib/marca-ficha";
import type { Plan } from "@/lib/plan-schema";
import { newestVerification } from "@/lib/plans";
import { brandLabel } from "@/lib/seo-copy";

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

export function tituloFicha(slug: string, nombre: string, plans: Plan[]) {
  const etiqueta = brandLabel(slug, nombre);
  const mes = formatMonthAbbr(newestVerification(plans));
  const conPlanes = `${etiqueta}: seguro de mascotas, precios y planes (${mes}) | Cuidalo`;
  if ([...conPlanes].length <= 65) return conPlanes;
  const conPrecio = `${etiqueta}: seguro de mascotas, precios (${mes}) | Cuidalo`;
  if ([...conPrecio].length <= 65) return conPrecio;
  return `${etiqueta}: seguro de mascotas (${mes}) | Cuidalo`;
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
