import { Badge } from "@/components/Badge";
import { formatPrecioMes } from "@/lib/format";
import type { Plan } from "@/lib/plan-schema";
import { displayEstado } from "@/lib/plan-status";

export function PriceTag({
  plan,
  today,
  size = "md",
  tone = "ink",
  align = "end",
}: {
  plan: Plan;
  today: string;
  size?: "md" | "lg";
  tone?: "ink" | "primary";
  align?: "end" | "center";
}) {
  const estado = displayEstado(plan, today);
  const alignClass = align === "center" ? "text-center" : "text-right";
  const justifyClass = align === "center" ? "justify-center" : "justify-end";
  if (plan.precio == null || estado === "consultar" || estado === "sin_precio_publico") {
    return (
      <div className={alignClass}>
        <p className="text-sm font-semibold text-gray-800">Consultar precio</p>
        {plan.precio_texto_original ? <p className="mt-1 text-xs text-gray-500">{plan.precio_texto_original}</p> : null}
      </div>
    );
  }

  const sizeClass = size === "lg" ? "text-4xl" : "text-2xl";
  const color = tone === "primary" ? "text-indigo-600" : "text-gray-900";
  const vencido = estado === "desactualizado";

  return (
    <div className={alignClass}>
      {vencido ? <p className="text-sm font-semibold text-amber-800">Precio vencido</p> : null}
      <div className={`flex flex-wrap items-center gap-1.5 ${justifyClass}`}>
        <p className={`font-mono font-medium tabular-nums ${sizeClass} ${color}`}>
          <span className="sr-only">{plan.es_ejemplo ? "Precio mensual de ejemplo " : "Precio mensual "}</span>
          {formatPrecioMes(plan.precio)}
        </p>
        {plan.es_ejemplo ? <Badge kind="ejemplo" /> : null}
      </div>
    </div>
  );
}
