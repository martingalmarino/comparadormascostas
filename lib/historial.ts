export type PuntoPrecio = {
  fecha: string;
  precio: number;
  fuente: string;
};

export type HistorialMarca = Record<string, PuntoPrecio[]>;

/** Agrega un precio verificado. No repite la misma fecha con el mismo monto. */
export function appendPricePoint(serie: PuntoPrecio[] | undefined, punto: PuntoPrecio) {
  const list = serie ? [...serie] : [];
  if (list.some((item) => item.fecha === punto.fecha && item.precio === punto.precio)) return list;
  list.push(punto);
  return list;
}

export function seriesVisibles(historial: HistorialMarca) {
  return Object.entries(historial)
    .map(([planId, puntos]) => ({ planId, puntos }))
    .filter((serie) => serie.puntos.length >= 2);
}
