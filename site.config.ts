/**
 * Marca provisoria. Cambiá `siteName` y el dominio acá: el resto del sitio los lee de este archivo.
 * Todavía no hay dominio propio: definí la URL pública en NEXT_PUBLIC_SITE_URL.
 */
const domain = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export const siteConfig = {
  siteName: "MascoCompara",
  siteNameNote: "Nombre provisorio",
  showProvisionalBadge: true,
  domain,
  description:
    "Comparador independiente de obras sociales, planes de salud y seguros para perros y gatos en Córdoba, Argentina. No vendemos seguros.",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hola@example.com",
  priceStaleDays: 45,
  adsEnabled: process.env.NEXT_PUBLIC_ADS_ENABLED === "true",
  gaId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "",
  adsenseClient: process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "",
  turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "",
} as const;

export function consentTextForBrand(marca: string) {
  return `Acepto que ${siteConfig.siteName} comparta mis datos con ${marca} para que me contacte, según la Política de privacidad.`;
}

export function consentTextForContact() {
  return `Acepto que ${siteConfig.siteName} use mis datos para responder esta consulta, según la Política de privacidad.`;
}
