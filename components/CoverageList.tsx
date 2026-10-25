import { Check } from "lucide-react";
import type { Plan } from "@/lib/plan-schema";

export function CoverageList({
  plan,
  limit,
  variant = "checks",
}: {
  plan: Plan;
  limit?: number;
  variant?: "checks" | "table";
}) {
  const items = typeof limit === "number" ? plan.coberturas.slice(0, limit) : plan.coberturas;

  if (variant === "table") {
    return (
      <table className="w-full text-sm">
        <caption className="sr-only">Coberturas incluidas de {plan.nombre}</caption>
        <tbody>
          {items.map((item, index) => (
            <tr key={`${item.item}-${index}`} className="border-b border-gray-100">
              <th scope="row" className="py-3 pr-3 text-left font-normal text-gray-600">
                {item.item}
              </th>
              {item.valor ? <td className="py-3 text-right font-semibold text-gray-900">{item.valor}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li key={`${item.item}-${index}`} className="flex items-start gap-2 text-sm text-gray-700">
          <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden="true" />
          <span>
            {item.item}
            {limit == null && item.valor ? <span className="text-gray-500"> · {item.valor}</span> : null}
          </span>
        </li>
      ))}
    </ul>
  );
}
