import type { Plan } from "@/lib/plan-schema";

const styles = {
  ejemplo: "border border-amber-200 bg-amber-100 text-amber-800",
  mejor_precio: "bg-emerald-100 text-emerald-800",
  mas_cobertura: "bg-violet-100 text-violet-800",
  sin_carencia: "bg-blue-100 text-blue-800",
  internacional: "bg-amber-100 text-amber-800",
} as const;

const labels: Record<NonNullable<Plan["badges"]>[number], string> = {
  mejor_precio: "Mejor precio",
  mas_cobertura: "Más cobertura",
  sin_carencia: "Sin carencia",
  internacional: "Internacional",
};

export function Badge({
  kind,
  children,
}: {
  kind: keyof typeof styles;
  children?: string;
}) {
  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${styles[kind]}`}>
      {children ?? (kind === "ejemplo" ? "Ejemplo" : labels[kind as keyof typeof labels])}
    </span>
  );
}
