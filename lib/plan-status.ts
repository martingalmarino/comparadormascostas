import { siteConfig } from "@/site.config";
import type { Plan, PlanEstado } from "@/lib/plan-schema";

export function daysBetween(fromIso: string, toIso: string) {
  const from = Date.parse(`${fromIso.slice(0, 10)}T00:00:00Z`);
  const to = Date.parse(`${toIso.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(from) || Number.isNaN(to)) return 0;
  return Math.round((to - from) / 86_400_000);
}

export function displayEstado(plan: Pick<Plan, "estado" | "fecha_verificacion">, todayIso: string): PlanEstado {
  if (daysBetween(plan.fecha_verificacion, todayIso) > siteConfig.priceStaleDays) {
    return "desactualizado";
  }
  return plan.estado;
}

export const estadoAviso: Record<Exclude<PlanEstado, "verificado">, string> = {
  requiere_revision: "Este dato está en revisión. No lo tomes como un precio vigente.",
  sin_precio_publico: "La marca no publica el precio. Podés pedir que te contacten.",
  desactualizado: "La última verificación tiene más de 45 días. Puede estar desactualizado.",
};
