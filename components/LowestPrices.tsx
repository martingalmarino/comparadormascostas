"use client";

import Link from "next/link";
import { PlanCard } from "@/components/PlanCard";
import { useHomeZona } from "@/components/HomeZona";
import { getLowestPricePlans } from "@/lib/lowest-price";
import type { Plan } from "@/lib/plan-schema";

export function LowestPrices({ plans, today }: { plans: Plan[]; today: string }) {
  const { zona } = useHomeZona();
  const selected = getLowestPricePlans(plans, { today, provincia: zona || undefined });
  if (selected.length === 0) return null;

  return (
    <div>
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Los de menor precio publicado</h2>
        <Link href="/comparar" className="text-sm font-bold text-indigo-700 hover:underline">
          Ver todos
        </Link>
      </div>
      <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-3 lg:overflow-visible">
        {selected.map((plan) => (
          <li key={plan.id} className="w-[85%] shrink-0 snap-start lg:w-auto lg:min-w-0">
            <PlanCard plan={plan} today={today} />
          </li>
        ))}
      </ul>
    </div>
  );
}
