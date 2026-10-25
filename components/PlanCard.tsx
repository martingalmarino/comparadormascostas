import Link from "next/link";
import { Badge } from "@/components/Badge";
import { CompareToggle } from "@/components/compare";
import { CoverageList } from "@/components/CoverageList";
import { PriceTag } from "@/components/PriceTag";
import { StatusNotice } from "@/components/StatusNotice";
import { VerifiedLine } from "@/components/VerifiedLine";
import type { Plan } from "@/lib/plan-schema";

export function PlanCard({ plan, today }: { plan: Plan; today: string }) {
  return (
    <article id={plan.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">{plan.marca}</p>
            <h3 className="text-lg font-bold text-gray-900">{plan.nombre}</h3>
          </div>
          <PriceTag plan={plan} today={today} />
        </div>
        {plan.badges?.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {plan.badges.map((badge) => (
              <Badge key={badge} kind={badge} />
            ))}
          </div>
        ) : null}
        <div className="mt-3 border-t border-gray-50 pt-3">
          <CoverageList plan={plan} limit={3} />
        </div>
        <div className="mt-3">
          <StatusNotice plan={plan} today={today} />
        </div>
        <div className="mt-4 flex gap-2">
          <Link href={`/planes/${plan.marca_slug}#${plan.id}`} className="flex-1 rounded-xl bg-gray-900 py-2.5 text-center text-sm font-bold text-white hover:bg-gray-800">
            Ver detalle
          </Link>
          <CompareToggle id={plan.id} nombre={`${plan.marca} ${plan.nombre}`} />
        </div>
      </div>
      <div className="border-t border-gray-100 bg-gray-50 px-4 py-2">
        <VerifiedLine plan={plan} />
      </div>
    </article>
  );
}
