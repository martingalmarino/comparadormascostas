import { formatDate } from "@/lib/format";
import { hostFuente, textoCarenciaMarca } from "@/lib/marca-ficha";
import type { Plan } from "@/lib/plan-schema";

export function WaitingPeriods({
  plan,
  carenciaMarca,
}: {
  plan: Plan;
  carenciaMarca?: { valor: string; fuente_url: string; fecha_verificacion: string } | null;
}) {
  if (!plan.carencias.length && !plan.carencias_texto && carenciaMarca?.valor) {
    return (
      <div>
        <p className="text-sm text-gray-700">{textoCarenciaMarca(carenciaMarca.valor)}</p>
        <p className="mt-2 text-xs text-gray-500">
          Fuente:{" "}
          <a href={carenciaMarca.fuente_url} className="underline decoration-gray-300 underline-offset-2 hover:text-indigo-700" target="_blank" rel="noopener noreferrer">
            {hostFuente(carenciaMarca.fuente_url)}
          </a>{" "}
          · consultado {formatDate(carenciaMarca.fecha_verificacion)}
        </p>
      </div>
    );
  }
  if (!plan.carencias.length && !plan.carencias_texto) {
    return <p className="text-sm text-gray-600">La fuente no detalla carencias.</p>;
  }
  return (
    <div className="space-y-3">
      {plan.carencias.length ? (
        <ul className="space-y-3">
          {plan.carencias.map((item) => (
            <li key={item.item} className="flex items-center gap-3 text-sm text-gray-700">
              <span className="inline-flex w-20 shrink-0 justify-center rounded bg-gray-100 px-1.5 py-0.5 text-center font-mono text-[11px] font-medium tabular-nums text-gray-700">
                {item.dias === 0 ? "Inmediata" : `${item.dias} días`}
              </span>
              <span>{item.item}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {plan.carencias_texto ? <p className="text-sm text-gray-700">{plan.carencias_texto}</p> : null}
    </div>
  );
}
