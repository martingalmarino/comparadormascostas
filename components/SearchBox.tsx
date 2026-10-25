"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { fieldClass, labelClass, primaryButtonClass } from "@/components/ui";
import { ageOptions, tipoOptions, zones } from "@/lib/zones";

export function SearchBox() {
  const router = useRouter();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    for (const key of ["especie", "meses", "zona", "tipo"]) {
      const value = String(data.get(key) ?? "").trim();
      if (value) params.set(key, value);
    }
    const query = params.toString();
    router.push(query ? `/comparar?${query}` : "/comparar");
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-xl shadow-gray-200/70 sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1fr)_auto] lg:items-end">
        <fieldset>
          <legend className={labelClass}>Especie</legend>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            {[
              ["perro", "Perro"],
              ["gato", "Gato"],
            ].map(([value, label]) => (
              <label key={value} className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-gray-200 px-3 py-3 text-sm font-semibold text-gray-700 has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50 has-[:checked]:text-indigo-800">
                <input className="sr-only" type="radio" name="especie" value={value} defaultChecked={value === "perro"} />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        <label>
          <span className={labelClass}>Edad</span>
          <select name="meses" className={fieldClass} defaultValue="">
            <option value="">Cualquier edad</option>
            {ageOptions.map((option) => (
              <option key={option.meses} value={option.meses}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className={labelClass}>Zona</span>
          <select name="zona" className={fieldClass} defaultValue="cordoba-capital">
            {zones.map((zone) => (
              <option key={zone.slug} value={zone.slug}>
                {zone.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className={labelClass}>Tipo de plan</span>
          <select name="tipo" className={fieldClass} defaultValue="">
            <option value="">Todos los planes</option>
            {tipoOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className={`${primaryButtonClass} w-full lg:w-auto lg:px-8`}>
          Ver precios
        </button>
      </div>
    </form>
  );
}
