import { redirect } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { Filters } from "@/components/Filters";
import { JsonLd } from "@/components/JsonLd";
import { PlanCard } from "@/components/PlanCard";
import { PlanTable } from "@/components/PlanTable";
import { applyFilters, hasNarrowingFilters, parseFilters, serializeFilters, type RawSearch } from "@/lib/filters";
import { getPlans } from "@/lib/plans";
import { itemListJsonLd } from "@/lib/seo";
import { zoneLabel } from "@/lib/zones";

export function ComparadorFallback() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900">Comparar planes en Córdoba</h1>
      <p className="mt-3 text-gray-600">Cargando resultados…</p>
    </div>
  );
}

export async function Comparador({
  searchParams,
  today,
}: {
  searchParams: Promise<RawSearch>;
  today: string;
}) {
  const raw = await searchParams;
  const filters = parseFilters(raw);
  const clean = serializeFilters(filters);
  const allowed = ["especie", "meses", "zona", "tipo", "max", "cob", "ids", "orden"];
  const incoming = new URLSearchParams();
  for (const key of allowed) {
    const value = raw[key];
    const item = Array.isArray(value) ? value[0] : value;
    if (item) incoming.append(key, item);
  }
  const hasEmpty = Object.values(raw).some((value) => (Array.isArray(value) ? value[0] : value) === "");
  const hasUnknown = Object.keys(raw).some((key) => !allowed.includes(key));
  if (hasEmpty || hasUnknown || incoming.toString() !== clean) {
    redirect(clean ? `/comparar?${clean}` : "/comparar");
  }

  const plans = applyFilters(getPlans(), filters);
  const place = filters.zona ? zoneLabel(filters.zona) : "Córdoba";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Planes en {place}</h1>
      <p className="mt-2 max-w-3xl text-sm text-gray-600">
        Compará obras sociales, planes de salud y seguros para mascotas. Cada precio muestra la fecha y la fuente. Si dice EJEMPLO, no es una tarifa vigente.
      </p>
      <div className="mt-6 lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start lg:gap-8 xl:grid-cols-[16rem_minmax(0,1fr)_12rem]">
        <Filters filters={filters} total={plans.length} />
        <div className="min-w-0">
          {plans.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-10 text-center text-gray-600">
              Ningún plan de ejemplo coincide con esos filtros. Probá limpiarlos.
            </p>
          ) : (
            <>
              <div className="space-y-4 lg:hidden">
                {plans.map((plan, index) => (
                  <div key={plan.id} className="space-y-4">
                    <PlanCard plan={plan} today={today} />
                    {index === 1 ? <AdSlot variant="inline" /> : null}
                  </div>
                ))}
                {plans.length < 2 ? <AdSlot variant="inline" /> : null}
              </div>
              <div className="hidden lg:block">
                <PlanTable plans={plans} today={today} />
              </div>
            </>
          )}
        </div>
        <div className="hidden xl:block">
          <div className="sticky top-24">
            <AdSlot variant="sidebar" />
          </div>
        </div>
      </div>
      {hasNarrowingFilters(filters) ? null : <JsonLd data={itemListJsonLd(plans)} />}
    </div>
  );
}
