import type { Plan } from "@/lib/plan-schema";

export function WaitingPeriods({ plan }: { plan: Plan }) {
  if (!plan.carencias.length) return null;
  return (
    <ul className="space-y-3">
      {plan.carencias.map((item) => (
        <li key={item.item} className="flex items-center gap-3 text-sm text-gray-700">
          <span className="inline-flex w-20 shrink-0 justify-center rounded bg-gray-100 px-1.5 py-0.5 text-center font-mono text-[11px] font-medium tabular-nums text-gray-700">
            {item.dias === 0 ? "Inmediata" : `${item.dias} días`}
          </span>
          <span>{item.item}</span>
        </li>
      ))}
    </ul>
  );
}
