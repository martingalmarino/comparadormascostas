"use client";

import { GitCompare } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useMemo, useState, useSyncExternalStore } from "react";

export type CatalogItem = {
  id: string;
  marca: string;
  nombre: string;
  marca_slug: string;
};

type CompareContextValue = {
  ids: string[];
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  has: (id: string) => boolean;
};

const CompareContext = createContext<CompareContextValue | null>(null);
const storageKey = "mc_compare";
const emptySnap = "[]";
let compareSnap = emptySnap;
let compareReady = false;
const compareListeners = new Set<() => void>();

function readCompareSnap() {
  if (typeof window === "undefined") return emptySnap;
  if (!compareReady) {
    compareReady = true;
    const raw = window.localStorage.getItem(storageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as unknown;
        compareSnap = JSON.stringify(Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string").slice(0, 3) : []);
      } catch {
        window.localStorage.removeItem(storageKey);
        compareSnap = emptySnap;
      }
    }
  }
  return compareSnap;
}

function writeCompareSnap(ids: string[]) {
  compareSnap = JSON.stringify(ids.slice(0, 3));
  window.localStorage.setItem(storageKey, compareSnap);
  compareListeners.forEach((listener) => listener());
}

function parseSnap(snap: string) {
  try {
    const parsed = JSON.parse(snap) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function CompareProvider({
  catalog,
  children,
}: {
  catalog: CatalogItem[];
  children: React.ReactNode;
}) {
  const snap = useSyncExternalStore(
    (listener) => {
      compareListeners.add(listener);
      return () => compareListeners.delete(listener);
    },
    readCompareSnap,
    () => emptySnap,
  );
  const ids = parseSnap(snap);
  const [notice, setNotice] = useState("");

  const value = useMemo<CompareContextValue>(
    () => ({
      ids,
      has: (id) => ids.includes(id),
      remove: (id) => writeCompareSnap(ids.filter((item) => item !== id)),
      clear: () => writeCompareSnap([]),
      toggle: (id) => {
        setNotice("");
        if (ids.includes(id)) {
          writeCompareSnap(ids.filter((item) => item !== id));
          return;
        }
        if (ids.length >= 3) {
          setNotice("Podés comparar hasta 3 planes.");
          return;
        }
        writeCompareSnap([...ids, id]);
      },
    }),
    [ids],
  );

  return (
    <CompareContext.Provider value={value}>
      {children}
      <CompareTray catalog={catalog} notice={notice} />
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) throw new Error("useCompare tiene que usarse dentro de CompareProvider");
  return context;
}

export function CompareToggle({ id, nombre }: { id: string; nombre: string }) {
  const { has, toggle } = useCompare();
  const selected = has(id);
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={selected ? `Quitar ${nombre} de la comparación` : `Comparar ${nombre}`}
      onClick={() => toggle(id)}
      className={`flex size-11 shrink-0 items-center justify-center rounded-xl border ${selected ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
    >
      <GitCompare className="size-5" aria-hidden="true" />
    </button>
  );
}

function CompareTray({ catalog, notice }: { catalog: CatalogItem[]; notice: string }) {
  const { ids, remove, clear } = useCompare();
  const pathname = usePathname();
  const raised = pathname.startsWith("/planes/");
  const selected = ids
    .map((id) => catalog.find((item) => item.id === id))
    .filter((item): item is CatalogItem => Boolean(item));

  if (!selected.length && !notice) return null;

  const href =
    selected.length >= 2
      ? selected.length === 2
        ? `/versus/${[selected[0].id, selected[1].id].sort().join("-vs-")}`
        : `/comparar?ids=${selected.map((item) => item.id).join(",")}`
      : null;

  return (
    <div
      className={`fixed inset-x-0 z-30 border-t border-gray-200 bg-white px-4 py-3 shadow-lg lg:inset-x-auto lg:right-6 lg:bottom-6 lg:w-[28rem] lg:rounded-2xl lg:border ${raised ? "bottom-[4.75rem] lg:bottom-6" : "bottom-0"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-gray-900">Comparación ({selected.length}/3)</p>
          <ul className="mt-1 space-y-1">
            {selected.map((item) => (
              <li key={item.id} className="flex items-center gap-2 text-sm text-gray-600">
                <span>
                  {item.marca} · {item.nombre}
                </span>
                <button type="button" className="text-xs font-semibold text-indigo-700" onClick={() => remove(item.id)}>
                  Quitar
                </button>
              </li>
            ))}
          </ul>
          {notice ? (
            <p className="mt-1 text-sm text-amber-800" role="status">
              {notice}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          {href ? (
            <Link href={href} className="rounded-xl bg-indigo-600 px-3 py-2 text-center text-sm font-bold text-white hover:bg-indigo-700">
              Ver comparación
            </Link>
          ) : (
            <p className="max-w-32 text-xs text-gray-500">Elegí al menos 2 planes.</p>
          )}
          <button type="button" className="text-xs font-semibold text-gray-500" onClick={clear}>
            Limpiar
          </button>
        </div>
      </div>
    </div>
  );
}
