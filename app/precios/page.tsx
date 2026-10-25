import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DirectAnswer } from "@/components/DirectAnswer";
import { JsonLd } from "@/components/JsonLd";
import { PriceTag } from "@/components/PriceTag";
import { UpdatedOn } from "@/components/UpdatedOn";
import { StatusNotice } from "@/components/StatusNotice";
import { getReferenceDate } from "@/lib/dates";
import { formatDate } from "@/lib/format";
import { getPlans, newestVerification } from "@/lib/plans";
import { respuestaDirecta } from "@/lib/geo";
import { requireEntry } from "@/lib/seo-copy";
import { offersItemListJsonLd, pageMetadata } from "@/lib/seo";
import { tipoOptions } from "@/lib/zones";

const seo = requireEntry("/precios");

export const metadata = pageMetadata({ ...seo, noindex: !seo.index });

export default async function PreciosPage() {
  const today = await getReferenceDate();
  const plans = [...getPlans()].sort((a, b) => (a.precio ?? Number.MAX_SAFE_INTEGER) - (b.precio ?? Number.MAX_SAFE_INTEGER));
  const updated = newestVerification(plans);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ name: "Precios", path: "/precios" }]} />
      <UpdatedOn iso={updated} />
      <h1 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">{seo.h1}</h1>
      <DirectAnswer text={respuestaDirecta({ tipo: "precios", today })} />
      <p className="mt-3 max-w-3xl text-gray-600">
        Cada fila muestra la fecha de verificación. Consultar precio significa que la fuente no publicó un monto.
      </p>
      <div className="mt-8 overflow-x-auto rounded-2xl border border-gray-200 bg-white">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <caption className="sr-only">Precios relevados del mes</caption>
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th scope="col" className="px-4 py-3">Plan</th>
              <th scope="col" className="px-4 py-3">Tipo</th>
              <th scope="col" className="px-4 py-3">Precio mensual</th>
              <th scope="col" className="px-4 py-3">Verificación</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {plans.map((plan) => (
              <tr key={plan.id}>
                <td className="px-4 py-4">
                  <Link href={`/planes/${plan.marca_slug}#${plan.id}`} className="font-semibold text-gray-900 hover:text-indigo-700">
                    {plan.marca}
                  </Link>
                  <p className="text-gray-500">{plan.nombre}</p>
                </td>
                <td className="px-4 py-4 text-gray-600">{tipoOptions.find((item) => item.id === plan.tipo)?.label}</td>
                <td className="px-4 py-4">
                  <PriceTag plan={plan} today={today} />
                </td>
                <td className="px-4 py-4">
                  <p className="text-gray-600">
                    <time dateTime={plan.fecha_verificacion.slice(0, 10)}>{formatDate(plan.fecha_verificacion)}</time>
                  </p>
                  <StatusNotice plan={plan} today={today} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <JsonLd data={offersItemListJsonLd(plans, today, seo.h1, updated)} />
    </div>
  );
}
