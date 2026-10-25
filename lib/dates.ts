import { cacheLife } from "next/cache";

/** Fecha de referencia compartida. Se renueva cada día para la regla de los 45 días. */
export async function getReferenceDate() {
  "use cache";
  cacheLife("days");
  return new Date().toISOString().slice(0, 10);
}
