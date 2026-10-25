import Link from "next/link";
import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DirectAnswer } from "@/components/DirectAnswer";
import { FAQ } from "@/components/FAQ";
import { JsonLd } from "@/components/JsonLd";
import { PriceTag } from "@/components/PriceTag";
import { UpdatedOn } from "@/components/UpdatedOn";
import { getReferenceDate } from "@/lib/dates";
import { coversZona } from "@/lib/filters";
import { faqsProvincia, respuestaDirecta } from "@/lib/geo";
import { formatDate } from "@/lib/format";
import { getPlans, newestVerification } from "@/lib/plans";
import { requireEntry } from "@/lib/seo-copy";
import { offersItemListJsonLd } from "@/lib/seo";
import { rutaProvincia } from "@/lib/zones";
import { jurisdiccionLabel, type JurisdiccionSlug } from "@/lib/zonas";

export async function ProvinciaView({ slug, extra }: { slug: JurisdiccionSlug; extra?: ReactNode }) {
  const today = await getReferenceDate();
  const path = rutaProvincia(slug);
  const seo = requireEntry(path);
  const label = jurisdiccionLabel(slug) ?? slug;
  const plans = getPlans()
    .filter((plan) => coversZona(plan, slug))
    .sort((a, b) => (a.precio ?? Number.MAX_SAFE_INTEGER) - (b.precio ?? Number.MAX_SAFE_INTEGER) || a.marca.localeCompare(b.marca, "es"));
  const updated = newestVerification(plans);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ name: label, path }]} />
      <UpdatedOn iso={updated} />
      <h1 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">{seo.h1}</h1>
      <DirectAnswer text={respuestaDirecta({ tipo: "provincia", today, slug })} />
      <p className="mt-4">
        <Link href={`/comparar?zona=${slug}`} className="font-bold text-indigo-700 hover:underline">
          Abrir el comparador en {label}
        </Link>
      </p>
      <div className="mt-8 overflow-x-auto rounded-2xl border border-gray-200 bg-white">
        <table className="w-full min-w-[52rem] text-left text-sm">
          <caption className="sr-only">Planes con cobertura en {label}</caption>
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th scope="col" className="px-4 py-3">Marca</th>
              <th scope="col" className="px-4 py-3">Plan</th>
              <th scope="col" className="px-4 py-3">Precio</th>
              <th scope="col" className="px-4 py-3">Cobertura</th>
              <th scope="col" className="px-4 py-3">Provincia en la fuente</th>
              <th scope="col" className="px-4 py-3">Verificación</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {plans.map((plan) => {
              const nombra = plan.zonas.some((zona) => zona.provincia === slug);
              return (
                <tr key={plan.id}>
                  <td className="px-4 py-4 font-semibold text-gray-900">
                    <Link href={`/planes/${plan.marca_slug}#${plan.id}`} className="hover:text-indigo-700">
                      {plan.marca}
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-gray-700">{plan.nombre}</td>
                  <td className="px-4 py-4">
                    <PriceTag plan={plan} today={today} />
                  </td>
                  <td className="px-4 py-4 text-gray-600">{plan.coberturas.map((item) => item.item).join(", ")}</td>
                  <td className="px-4 py-4 text-gray-600">{nombra ? label : "Todo el país"}</td>
                  <td className="px-4 py-4 text-gray-600">
                    <time dateTime={plan.fecha_verificacion.slice(0, 10)}>{formatDate(plan.fecha_verificacion)}</time>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {extra}
      <FAQ items={faqsProvincia(slug, today)} />
      <JsonLd data={offersItemListJsonLd(plans, today, seo.h1, updated)} />
    </div>
  );
}
