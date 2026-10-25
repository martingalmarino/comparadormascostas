import { Badge } from "@/components/Badge";
import { formatArs } from "@/lib/format";
import type { Plan } from "@/lib/plan-schema";
import { displayEstado } from "@/lib/plan-status";

export function PriceTag({
  plan,
  today,
  size = "md",
  tone = "ink",
}: {
  plan: Plan;
  today: string;
  size?: "md" | "lg";
  tone?: "ink" | "primary";
}) {
  const estado = displayEstado(plan, today);
  if (plan.precio == null || estado === "sin_precio_publico") {
    return <p className="text-sm font-semibold text-gray-800">Precio no publicado · Consultar</p>;
  }

  const sizeClass = size === "lg" ? "text-4xl" : "text-2xl";
  const color = tone === "primary" ? "text-indigo-600" : "text-gray-900";

  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      <p className={`font-mono font-medium tabular-nums ${sizeClass} ${color}`}>
        <span className="sr-only">Precio mensual de ejemplo </span>
        {formatArs(plan.precio)}
      </p>
      {plan.es_ejemplo ? <Badge kind="ejemplo" /> : null}
    </div>
  );
}
