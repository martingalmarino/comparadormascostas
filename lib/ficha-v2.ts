export const FICHA_V2_SLUGS = ["rus-seguros"] as const;

export function fichaV2(slug: string) {
  return (FICHA_V2_SLUGS as readonly string[]).includes(slug);
}
