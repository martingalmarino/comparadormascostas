import { Cat, Dog } from "lucide-react";
import { useState } from "react";
import type { BotPlan, BotSlots, SlotId } from "@/lib/bot/types";
import { jurisdicciones } from "@/lib/zonas";

const destacadas = new Set(["buenos-aires", "caba", "cordoba"]);
const selected = "inline-flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white";
const idle = "inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700";
const past = "inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-400";

function marcasDe(plans: BotPlan[]) {
  const map = new Map<string, string>();
  for (const plan of plans) map.set(plan.marcaSlug, plan.marca);
  return [...map.entries()]
    .map(([slug, nombre]) => ({ slug, nombre }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}

export function BotSlots({
  faltante,
  slots,
  plans,
  interactive,
  onSelect,
}: {
  faltante: SlotId;
  slots: BotSlots;
  plans: BotPlan[];
  interactive: boolean;
  onSelect: (slot: SlotId, value: string, label: string) => void;
}) {
  const [otras, setOtras] = useState(false);
  const tone = (on: boolean) => (on ? selected : interactive ? idle : past);

  if (faltante === "especie") {
    const opciones = [
      { value: "perro", label: "Perro", icon: Dog },
      { value: "gato", label: "Gato", icon: Cat },
    ] as const;
    return (
      <div className="flex gap-1.5">
        {opciones.map((opcion) => (
          <button key={opcion.value} type="button" className={tone(slots.especie === opcion.value)} onClick={() => interactive && onSelect("especie", opcion.value, opcion.label)}>
            <opcion.icon className="size-3.5" aria-hidden="true" />
            {opcion.label}
          </button>
        ))}
      </div>
    );
  }

  if (faltante === "provincia") {
    const orden = ["buenos-aires", "caba", "cordoba"];
    const principales = orden.flatMap((slug) => jurisdicciones.filter((item) => item.slug === slug));
    const resto = jurisdicciones.filter((item) => !destacadas.has(item.slug));
    const extra = resto.find((item) => item.slug === slots.provincia);
    return (
      <div className="flex flex-wrap gap-1.5">
        {principales.map((item) => (
          <button key={item.slug} type="button" className={tone(slots.provincia === item.slug)} onClick={() => interactive && onSelect("provincia", item.slug, item.label)}>
            {item.label}
          </button>
        ))}
        {extra && !otras ? (
          <button type="button" className={tone(true)}>
            {extra.label}
          </button>
        ) : null}
        {interactive && !otras ? (
          <button type="button" className={idle} onClick={() => setOtras(true)}>
            Otra…
          </button>
        ) : null}
        {otras
          ? resto.map((item) => (
              <button key={item.slug} type="button" className={tone(slots.provincia === item.slug)} onClick={() => interactive && onSelect("provincia", item.slug, item.label)}>
                {item.label}
              </button>
            ))
          : null}
      </div>
    );
  }

  return (
    <div className="flex max-h-36 flex-wrap gap-1.5 overflow-y-auto">
      {marcasDe(plans).map((marca) => (
        <button key={marca.slug} type="button" className={tone(slots.marca === marca.slug)} onClick={() => interactive && onSelect("marca", marca.slug, marca.nombre)}>
          {marca.nombre}
        </button>
      ))}
    </div>
  );
}
