import type { Plan } from "@/lib/plan-schema";

export function ProsCons({ plan }: { plan: Plan }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800">Pros</h3>
        <ul className="mt-2 space-y-1 text-sm text-emerald-950">
          {plan.pros.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <section className="rounded-2xl border border-red-100 bg-red-50 p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-red-800">A tener en cuenta</h3>
        <ul className="mt-2 space-y-1 text-sm text-red-950">
          {plan.contras.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
