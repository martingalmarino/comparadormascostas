import { redirect } from "next/navigation";
import { Filters } from "@/components/Filters";
import { JsonLd } from "@/components/JsonLd";
import { PlanCard } from "@/components/PlanCard";
import { PlanTable } from "@/components/PlanTable";
import { applyFilters, hasNarrowingFilters, parseFilters, serializeFilters, type RawSearch } from "@/lib/filters";
import { getPlans } from "@/lib/plans";
import { itemListJsonLd } from "@/lib/seo";
import { jurisdiccionLabel, provinciasConPlanes } from "@/lib/zonas";

export function ComparadorFallback() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
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

  const catalog = getPlans();
  const plans = applyFilters(catalog, filters);
  const zonas = provinciasConPlanes(catalog);
  const place = filters.zona ? jurisdiccionLabel(filters.zona) : "";

  return (
    <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
      <p className="mt-2 max-w-3xl text-sm text-gray-600">
        {place ? `Resultados para ${place}. ` : ""}
        Compará obras sociales, planes de salud y seguros para mascotas. Cada precio muestra la fecha y la fuente. Si no hay monto publicado, la ficha dice Precio a consultar.
      </p>
      <div className="mt-6 lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start lg:gap-8">
        <Filters filters={filters} total={plans.length} zonas={zonas} />
        <div className="min-w-0">
          {plans.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-10 text-center text-gray-600">
              Ningún plan coincide con esos filtros. Probá limpiarlos.
            </p>
          ) : (
            <>
              <div className="space-y-4 lg:hidden">
                {plans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} today={today} />
                ))}
              </div>
              <div className="hidden lg:block">
                <PlanTable plans={plans} today={today} />
              </div>
            </>
          )}
        </div>
      </div>
      {hasNarrowingFilters(filters) ? null : <JsonLd data={itemListJsonLd(plans)} />}
    </div>
  );
}
