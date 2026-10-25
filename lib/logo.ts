const sizes: Record<string, { width: number; height: number }> = {
  "/logos/answer-seguros.svg": { width: 135, height: 40 },
  "/logos/avsim.png": { width: 342, height: 107 },
  "/logos/bbva-seguros.png": { width: 270, height: 270 },
  "/logos/companion.png": { width: 1077, height: 178 },
  "/logos/federacion-patronal-via-mascotaleal.png": { width: 1500, height: 249 },
  "/logos/ike-mascotas.svg": { width: 601, height: 241 },
  "/logos/osmasc.png": { width: 435, height: 113 },
  "/logos/pet-society.png": { width: 409, height: 79 },
  "/logos/provincia-seguros-banco-provincia.png": { width: 145, height: 48 },
  "/logos/puppis-one.svg": { width: 490, height: 200 },
  "/logos/qualia-seguros.png": { width: 577, height: 176 },
  "/logos/rus-seguros.svg": { width: 567, height: 165 },
};

export function logoSize(src: string) {
  return sizes[src] ?? { width: 160, height: 40 };
}
