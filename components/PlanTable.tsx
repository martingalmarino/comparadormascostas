import Link from "next/link";
import { Badge } from "@/components/Badge";
import { BrandLogo } from "@/components/BrandLogo";
import { CompareToggle } from "@/components/compare";
import { HogarNotice } from "@/components/HogarNotice";
import { PriceTag } from "@/components/PriceTag";
import { StatusNotice } from "@/components/StatusNotice";
import { VerifiedLine } from "@/components/VerifiedLine";
import { logoSize } from "@/lib/logo";
import type { Plan } from "@/lib/plan-schema";
import { tipoOptions } from "@/lib/zones";

export function PlanTable({ plans, today }: { plans: Plan[]; today: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <table className="w-full table-fixed text-left">
        <caption className="sr-only">Planes filtrados</caption>
        <colgroup>
          <col className="w-[28%]" />
          <col />
          <col className="w-[9.5rem]" />
          <col className="w-[12.5rem]" />
        </colgroup>
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-4 text-xs font-bold uppercase text-gray-500">
              Prestadora / plan
            </th>
            <th scope="col" className="px-4 py-4 text-xs font-bold uppercase text-gray-500">
              Destacados
            </th>
            <th scope="col" className="px-3 py-4 text-center text-xs font-bold uppercase text-gray-500">
              Precio mensual
            </th>
            <th scope="col" className="px-3 py-4 text-xs font-bold uppercase text-gray-500">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {plans.map((plan) => (
            <tr key={plan.id} id={`${plan.id}-fila`} className="align-top hover:bg-gray-50">
              <td className="px-4 py-5">
                <div className="flex items-center gap-3">
                  <BrandLogo
                    nombre={plan.marca}
                    logo={plan.logo}
                    slug={plan.marca_slug}
                    fallback="nombre"
                    maxWidth="8.5rem"
                    {...(plan.logo ? logoSize(plan.logo) : { width: 160, height: 32 })}
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900">{plan.marca}</p>
                    <p className="text-sm text-gray-500">{plan.nombre}</p>
                    <HogarNotice slug={plan.marca_slug} />
                    <p className="mt-1 text-xs text-gray-400">{tipoOptions.find((item) => item.id === plan.tipo)?.label}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-5">
                {plan.badges?.length ? (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {plan.badges.map((badge) => (
                      <Badge key={badge} kind={badge} />
                    ))}
                  </div>
                ) : null}
                <VerifiedLine plan={plan} />
                <div className="mt-2">
                  <StatusNotice plan={plan} today={today} />
                </div>
              </td>
              <td className="px-3 py-5">
                <PriceTag plan={plan} today={today} align="center" />
              </td>
              <td className="px-3 py-5">
                <div className="flex items-center justify-end gap-2">
                  <CompareToggle id={plan.id} nombre={`${plan.marca} ${plan.nombre}`} />
                  <Link
                    href={`/planes/${plan.marca_slug}#${plan.id}`}
                    className="whitespace-nowrap rounded-lg bg-gray-100 px-3 py-2.5 text-sm font-bold text-gray-800 hover:bg-gray-200"
                  >
                    Ver detalle
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
