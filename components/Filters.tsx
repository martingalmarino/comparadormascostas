"use client";

import { useRouter } from "next/navigation";
import { fieldClass, labelClass } from "@/components/ui";
import type { Filters as FilterState } from "@/lib/filters";
import { serializeFilters } from "@/lib/filters";
import { ageOptions, coverageFilters, priceOptions, provinciaLabel, provincias, sortOptions, tipoOptions, zoneLabel, zones } from "@/lib/zones";

export function Filters({ filters, total }: { filters: FilterState; total: number }) {
  const router = useRouter();

  function update(partial: Partial<FilterState>) {
    const next: FilterState = { ...filters, ...partial };
    const query = serializeFilters(next);
    router.push(query ? `/comparar?${query}` : "/comparar");
  }

  const chips: { key: string; label: string; clear: Partial<FilterState> }[] = [];
  if (filters.especie) chips.push({ key: "especie", label: filters.especie === "perro" ? "Perro" : "Gato", clear: { especie: undefined } });
  if (filters.meses) {
    const age = ageOptions.find((option) => option.meses === filters.meses);
    chips.push({ key: "meses", label: age?.label ?? `${filters.meses} meses`, clear: { meses: undefined } });
  }
  if (filters.provincia) chips.push({ key: "provincia", label: provinciaLabel(filters.provincia) ?? filters.provincia, clear: { provincia: undefined } });
  if (filters.zona) chips.push({ key: "zona", label: zoneLabel(filters.zona) ?? filters.zona, clear: { zona: undefined } });
  if (filters.tipo) {
    chips.push({
      key: "tipo",
      label: tipoOptions.find((option) => option.id === filters.tipo)?.label ?? filters.tipo,
      clear: { tipo: undefined },
    });
  }
  if (filters.max) chips.push({ key: "max", label: `Hasta $${filters.max.toLocaleString("es-AR")}`, clear: { max: undefined } });
  for (const id of filters.cob) {
    chips.push({
      key: id,
      label: coverageFilters.find((item) => item.id === id)?.label ?? id,
      clear: { cob: filters.cob.filter((item) => item !== id) },
    });
  }
  if (filters.ids.length) chips.push({ key: "ids", label: `Selección (${filters.ids.length})`, clear: { ids: [] } });

  const dirty = chips.length > 0 || filters.orden !== "precio";

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-gray-700" aria-live="polite">
          {total} {total === 1 ? "plan encontrado" : "planes encontrados"}
        </p>
        {dirty ? (
          <button type="button" className="text-sm font-bold text-indigo-700 hover:underline" onClick={() => router.push("/comparar")}>
            Limpiar filtros
          </button>
        ) : null}
      </div>

      <div className="mb-4 flex flex-wrap gap-2 lg:hidden">
        {sortOptions.map((option) => {
          const active = filters.orden === option.id;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={active}
              onClick={() => update({ orden: option.id })}
              className={`rounded-full px-3 py-2 text-sm font-semibold ${active ? "bg-indigo-600 text-white" : "border border-gray-200 bg-white text-gray-700"}`}
            >
              {option.label}
            </button>
          );
        })}
        {chips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={() => update(chip.clear)}
            className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-3 py-2 text-sm font-semibold text-white"
          >
            {chip.label}
            <span aria-hidden="true">×</span>
            <span className="sr-only">Quitar filtro {chip.label}</span>
          </button>
        ))}
      </div>

      <details className="mb-4 rounded-2xl border border-gray-200 bg-white lg:hidden">
        <summary className="cursor-pointer px-4 py-3 font-bold text-gray-900">Filtros</summary>
        <div className="border-t border-gray-100 p-4">
          <Fields filters={filters} update={update} />
        </div>
      </details>

      <aside className="sticky top-24 hidden rounded-2xl border border-gray-200 bg-white p-6 lg:block">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Filtros</h2>
          {dirty ? (
            <button type="button" className="text-xs font-semibold uppercase text-indigo-700 hover:underline" onClick={() => router.push("/comparar")}>
              Limpiar
            </button>
          ) : null}
        </div>
        <Fields filters={filters} update={update} />
      </aside>
    </div>
  );
}

function Fields({ filters, update }: { filters: FilterState; update: (partial: Partial<FilterState>) => void }) {
  return (
    <div className="space-y-5">
      <label className="block">
        <span className={labelClass}>Especie</span>
        <select className={fieldClass} value={filters.especie ?? ""} onChange={(event) => update({ especie: event.target.value === "perro" || event.target.value === "gato" ? event.target.value : undefined })}>
          <option value="">Perro y gato</option>
          <option value="perro">Perro</option>
          <option value="gato">Gato</option>
        </select>
      </label>
      <label className="block">
        <span className={labelClass}>Edad</span>
        <select className={fieldClass} value={filters.meses ?? ""} onChange={(event) => update({ meses: event.target.value ? Number(event.target.value) : undefined })}>
          <option value="">Cualquier edad</option>
          {ageOptions.map((option) => (
            <option key={option.meses} value={option.meses}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className={labelClass}>Disponible en mi zona</span>
        <select className={fieldClass} value={filters.provincia ?? ""} onChange={(event) => update({ provincia: event.target.value || undefined })}>
          <option value="">Todas las provincias</option>
          {provincias.map((provincia) => (
            <option key={provincia.slug} value={provincia.slug}>
              {provincia.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className={labelClass}>Zona de Córdoba</span>
        <select className={fieldClass} value={filters.zona ?? ""} onChange={(event) => update({ zona: event.target.value || undefined })}>
          <option value="">Todas las zonas</option>
          {zones.map((zone) => (
            <option key={zone.slug} value={zone.slug}>
              {zone.label}
            </option>
          ))}
        </select>
      </label>
      <fieldset>
        <legend className={labelClass}>Tipo de plan</legend>
        <div className="mt-2 space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="radio" name="tipo" checked={!filters.tipo} onChange={() => update({ tipo: undefined })} className="accent-indigo-600" />
            Todos
          </label>
          {tipoOptions.map((option) => (
            <label key={option.id} className="flex items-center gap-2 text-sm text-gray-700">
              <input type="radio" name="tipo" checked={filters.tipo === option.id} onChange={() => update({ tipo: option.id })} className="accent-indigo-600" />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="block">
        <span className={labelClass}>Rango de precio mensual</span>
        <select className={fieldClass} value={filters.max ?? ""} onChange={(event) => update({ max: event.target.value ? Number(event.target.value) : undefined })}>
          <option value="">Sin tope</option>
          {priceOptions.map((option) => (
            <option key={option.max} value={option.max}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="mt-1 block text-xs text-gray-500">Los planes sin precio publicado no entran en el tope.</span>
      </label>
      <fieldset>
        <legend className={labelClass}>Coberturas clave</legend>
        <div className="mt-2 space-y-2">
          {coverageFilters.map((item) => (
            <label key={item.id} className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                className="size-4 accent-indigo-600"
                checked={filters.cob.includes(item.id)}
                onChange={(event) => {
                  const cob = event.target.checked ? [...filters.cob, item.id] : filters.cob.filter((id) => id !== item.id);
                  update({ cob });
                }}
              />
              {item.label}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="hidden lg:block">
        <span className={labelClass}>Ordenar por</span>
        <select className={fieldClass} value={filters.orden} onChange={(event) => update({ orden: event.target.value as FilterState["orden"] })}>
          {sortOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
