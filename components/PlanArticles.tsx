import { Check } from "lucide-react";
import { Badge } from "@/components/Badge";
import { CoverageList } from "@/components/CoverageList";
import { HogarNotice } from "@/components/HogarNotice";
import { JsonLd } from "@/components/JsonLd";
import { PriceTag } from "@/components/PriceTag";
import { ProsCons } from "@/components/ProsCons";
import { StatusNotice } from "@/components/StatusNotice";
import { VerifiedLine } from "@/components/VerifiedLine";
import { WaitingPeriods } from "@/components/WaitingPeriods";
import { especieLabel } from "@/lib/format";
import { productJsonLd } from "@/lib/seo";
import type { Plan } from "@/lib/plan-schema";
import { PROVINCIA_TODAS, jurisdiccionLabel } from "@/lib/zonas";

export function PlanArticles({ plans, today, showPros }: { plans: Plan[]; today: string; showPros: boolean }) {
  return (
    <div className="space-y-10">
      {plans.map((plan) => (
        <article key={plan.id} id={plan.id} className="scroll-mt-24">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">{plan.marca}</p>
              <h2 className="text-2xl font-bold text-gray-900">{plan.nombre}</h2>
              <HogarNotice slug={plan.marca_slug} />
              {plan.resumen ? <p className="mt-1 text-sm text-gray-600">{plan.resumen}</p> : null}
              <p className="mt-2 text-sm text-gray-600">
                {plan.especies.map((especie) => especieLabel(especie)).join(", ")}
                {plan.edad_min_meses != null ? ` · desde ${plan.edad_min_meses} meses` : ""}
                {plan.edad_max_anios != null ? ` · hasta ${plan.edad_max_anios} años` : ""}
              </p>
              {plan.zonas.length === 0 ? (
                <p className="mt-1 text-sm text-amber-800">La fuente no confirma en qué provincias está.</p>
              ) : (
                <p className="mt-1 text-sm text-gray-600">
                  {plan.zonas.some((zona) => zona.provincia === PROVINCIA_TODAS)
                    ? "Todo el país."
                    : `Disponible en ${plan.zonas.map((zona) => jurisdiccionLabel(zona.provincia) ?? zona.provincia).join(", ")}.`}
                </p>
              )}
              {plan.zona_detalle ? <p className="mt-1 text-sm text-gray-600">{plan.zona_detalle}</p> : null}
            </div>
            <PriceTag plan={plan} today={today} size="lg" tone="primary" />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {plan.badges?.map((badge) => (
              <Badge key={badge} kind={badge} />
            ))}
          </div>
          <div className="mt-3">
            <VerifiedLine plan={plan} />
          </div>
          <div className="mt-3">
            <StatusNotice plan={plan} today={today} />
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <section className="rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="flex items-center gap-2 font-bold text-emerald-700">
                <Check className="size-4" aria-hidden="true" />
                Coberturas incluidas
              </h3>
              <div className="mt-2">
                <CoverageList plan={plan} variant="table" />
              </div>
            </section>
            <section className="rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="font-bold text-amber-700">Carencias</h3>
              <div className="mt-4">
                <WaitingPeriods plan={plan} />
              </div>
            </section>
          </div>
          {plan.notas ? <p className="mt-4 text-sm text-gray-700">{plan.notas}</p> : null}
          {showPros ? (
            <div className="mt-4">
              <ProsCons plan={plan} />
            </div>
          ) : null}
          {plan.estado !== "consultar" && plan.precio != null ? <JsonLd data={productJsonLd(plan, today)} /> : null}
        </article>
      ))}
    </div>
  );
}
