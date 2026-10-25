import type { Plan } from "@/lib/plan-schema";
import { planAvisos } from "@/lib/plan-status";

export function StatusNotice({ plan, today }: { plan: Plan; today: string }) {
  const avisos = planAvisos(plan, today);
  if (!avisos.length) return null;
  return (
    <div className="space-y-2">
      {avisos.map((aviso) => (
        <p key={aviso} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950" role="note">
          {aviso}
        </p>
      ))}
    </div>
  );
}
