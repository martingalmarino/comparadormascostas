import type { Plan } from "@/lib/plan-schema";
import { displayEstado, estadoAviso } from "@/lib/plan-status";

export function StatusNotice({ plan, today }: { plan: Plan; today: string }) {
  const estado = displayEstado(plan, today);
  if (estado === "verificado") return null;
  return (
    <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950" role="note">
      {estadoAviso[estado]}
    </p>
  );
}
