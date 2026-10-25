import { siteConfig } from "@/site.config";
import type { Plan, PlanEstado } from "@/lib/plan-schema";

export function daysBetween(fromIso: string, toIso: string) {
  const from = Date.parse(`${fromIso.slice(0, 10)}T00:00:00Z`);
  const to = Date.parse(`${toIso.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(from) || Number.isNaN(to)) return 0;
  return Math.round((to - from) / 86_400_000);
}

export function displayEstado(plan: Pick<Plan, "estado" | "fecha_verificacion">, todayIso: string): PlanEstado {
  if (plan.estado === "consultar" || plan.estado === "sin_precio_publico" || plan.estado === "requiere_revision") {
    return plan.estado;
  }
  if (daysBetween(plan.fecha_verificacion, todayIso) > siteConfig.priceStaleDays) {
    return "desactualizado";
  }
  return plan.estado;
}

export const estadoAviso: Record<Exclude<PlanEstado, "verificado">, string> = {
  requiere_revision: "Este dato está en revisión. No lo tomes como un precio vigente.",
  consultar: "La marca no publica el precio. Hay que consultarlo.",
  sin_precio_publico: "La marca no publica el precio. Podés pedir que te contacten.",
  desactualizado: "La última verificación tiene más de 45 días. Puede estar desactualizado.",
};

export function planAvisos(plan: Pick<Plan, "estado" | "fecha_verificacion">, todayIso: string) {
  const avisos: string[] = [];
  if (plan.estado === "requiere_revision") avisos.push(estadoAviso.requiere_revision);
  if (plan.estado === "consultar") avisos.push(estadoAviso.consultar);
  if (plan.estado === "sin_precio_publico") avisos.push(estadoAviso.sin_precio_publico);
  const stale = daysBetween(plan.fecha_verificacion, todayIso) > siteConfig.priceStaleDays;
  if (stale && plan.estado !== "consultar" && plan.estado !== "sin_precio_publico") {
    avisos.push(estadoAviso.desactualizado);
  }
  return avisos;
}
