/**
 * El nombre visible sale de SITE.name (NEXT_PUBLIC_SITE_NAME o Cuidalo).
 * La URL pública es NEXT_PUBLIC_SITE_URL (dominio final: https://cuidalo.com.ar).
 * Si no está, en Vercel se usa VERCEL_PROJECT_PRODUCTION_URL para no caer en localhost.
 */
function publicSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (explicit) return explicit;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim().replace(/\/$/, "");
  if (vercel) return vercel.startsWith("http") ? vercel : `https://${vercel}`;
  return "http://localhost:3000";
}

export const SITE = {
  name: process.env.NEXT_PUBLIC_SITE_NAME?.trim() || "Cuidalo",
  url: publicSiteUrl(),
  locale: "es_AR",
} as const;

export const siteConfig = {
  siteName: SITE.name,
  siteNameNote: "Nombre provisorio",
  showProvisionalBadge: false,
  domain: SITE.url,
  description:
    "Compará obras sociales, prepagas y seguros para perros y gatos en Argentina. Precios con fecha y fuente de cada marca. Elegí tu plan en minutos, gratis.",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hola@example.com",
  priceStaleDays: 45,
  gaId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "",
  turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "",
} as const;

export function consentTextForBrand(marca: string) {
  return `Acepto que ${siteConfig.siteName} comparta mis datos con ${marca} para que me contacte, según la Política de privacidad.`;
}

export function consentTextForContact() {
  return `Acepto que ${siteConfig.siteName} use mis datos para responder esta consulta, según la Política de privacidad.`;
}
