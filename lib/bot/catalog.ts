import { precioCitado, precioVigente } from "@/lib/plan-status";
import type { Plan } from "@/lib/plan-schema";
import type { BotPlan } from "@/lib/bot/types";

export function toBotPlans(plans: Plan[], today: string): BotPlan[] {
  return plans.map((plan) => ({
    id: plan.id,
    marca: plan.marca,
    marcaSlug: plan.marca_slug,
    nombre: plan.nombre,
    tipo: plan.tipo,
    especies: [...plan.especies],
    edadMinMeses: plan.edad_min_meses,
    edadMaxAnios: plan.edad_max_anios,
    zonas: plan.zonas.map((zona) => zona.provincia),
    precio: plan.precio,
    precioVigente: precioVigente(plan, today),
    precioTipo: plan.precio_tipo === "desde" && precioCitado(plan, today) ? "desde" : undefined,
    estado: plan.estado,
    fechaVerificacion: plan.fecha_verificacion,
    fuenteUrl: plan.fuente_url,
    coberturas: plan.coberturas.map((item) => ({ item: item.item, valor: item.valor })),
    carencias: plan.carencias.map((item) => ({ item: item.item, dias: item.dias })),
    carenciasTexto: plan.carencias_texto,
    notas: plan.notas,
    logo: plan.logo ?? null,
  }));
}
