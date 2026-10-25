const sizes: Record<string, { width: number; height: number }> = {
  "/logos/answer-seguros.svg": { width: 135, height: 40 },
  "/logos/avsim.png": { width: 342, height: 107 },
  "/logos/bbva-seguros.svg": { width: 107, height: 32 },
  "/logos/companion.png": { width: 1077, height: 178 },
  "/logos/federacion-patronal-via-mascotaleal.png": { width: 1500, height: 249 },
  "/logos/ike-mascotas.svg": { width: 601, height: 241 },
  "/logos/osmasc.png": { width: 435, height: 113 },
  "/logos/pet-society.png": { width: 409, height: 79 },
  "/logos/provincia-seguros-banco-provincia.png": { width: 145, height: 48 },
  "/logos/puppis-one.svg": { width: 490, height: 200 },
  "/logos/fielpet.png": { width: 155, height: 58 },
  "/logos/qualia-seguros.png": { width: 141, height: 31 },
  "/logos/rus-seguros.svg": { width: 567, height: 165 },
  "/logos/holavet.png": { width: 2560, height: 554 },
  "/logos/vetify.png": { width: 435, height: 151 },
  "/logos/ospan.png": { width: 601, height: 601 },
  "/logos/omint-mascotas.svg": { width: 2000, height: 620 },
  "/logos/galicia.png": { width: 2581, height: 367 },
  "/logos/macro.png": { width: 1500, height: 335 },
  "/logos/naranja-x.png": { width: 240, height: 74 },
  "/logos/santander.png": { width: 332, height: 60 },
  "/logos/hipotecario.svg": { width: 218, height: 84 },
  "/logos/la-caja.png": { width: 251, height: 265 },
  "/logos/mapfre.png": { width: 258, height: 126 },
  "/logos/nacion-seguros.png": { width: 1000, height: 200 },
  "/logos/sancor-seguros.svg": { width: 960, height: 258 },
  "/logos/zurich.svg": { width: 604, height: 143 },
};

const compactLogos = new Set(["/logos/naranja-x.png", "/logos/santander.png"]);
const fixedHeightLogos = new Set([
  "/logos/hipotecario.svg",
  "/logos/la-caja.png",
  "/logos/mapfre.png",
  "/logos/nacion-seguros.png",
  "/logos/sancor-seguros.svg",
  "/logos/zurich.svg",
]);

export function logoMaxBox(src: string, natural: { width: number; height: number }) {
  if (fixedHeightLogos.has(src)) return { height: 28, maxWidthPx: undefined as number | undefined };
  if (!compactLogos.has(src)) return { height: 32, maxWidthPx: undefined as number | undefined };
  return { height: Math.min(28, natural.height), maxWidthPx: natural.width };
}

export function logoSize(src: string) {
  return sizes[src] ?? { width: 160, height: 40 };
}
