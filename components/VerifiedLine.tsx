import { CalendarCheck } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { Plan } from "@/lib/plan-schema";

export function VerifiedLine({ plan }: { plan: Plan }) {
  const external = plan.fuente_url.startsWith("http");
  let sourceLabel = "fuente";
  if (plan.es_ejemplo) sourceLabel = "dato de ejemplo";
  else if (external) {
    try {
      sourceLabel = new URL(plan.fuente_url).hostname.replace(/^www\./, "");
    } catch {
      sourceLabel = "fuente";
    }
  }
  return (
    <p className="flex items-start gap-1.5 text-xs text-gray-500">
      <CalendarCheck className="mt-0.5 size-3.5 shrink-0 text-indigo-500" aria-hidden="true" />
      <span className="min-w-0 break-words">
        Precio verificado el {formatDate(plan.fecha_verificacion)}
        {" · "}
        Fuente:{" "}
        <a
          href={plan.fuente_url}
          className="underline decoration-gray-300 underline-offset-2 hover:text-indigo-700"
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {sourceLabel}
        </a>
      </span>
    </p>
  );
}
