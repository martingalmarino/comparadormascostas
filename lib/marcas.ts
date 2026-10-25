import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { seriesVisibles, type HistorialMarca } from "@/lib/historial";
import { marcaSchema, type Marca } from "@/lib/marca-schema";

let cache: Marca[] | null = null;

export function getMarcasFicha() {
  if (cache) return cache;
  const dir = path.join(process.cwd(), "data", "marcas");
  cache = readdirSync(dir)
    .filter((name) => name.endsWith(".json"))
    .sort()
    .map((name) => marcaSchema.parse(JSON.parse(readFileSync(path.join(dir, name), "utf8"))));
  return cache;
}

export function getMarca(slug: string) {
  return getMarcasFicha().find((marca) => marca.slug === slug);
}

export function readHistorial(slug: string): HistorialMarca {
  const file = path.join(process.cwd(), "data", "historial", `${slug}.json`);
  if (!existsSync(file)) return {};
  try {
    const parsed = JSON.parse(readFileSync(file, "utf8")) as HistorialMarca;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function historialVisible(slug: string) {
  return seriesVisibles(readHistorial(slug));
}
