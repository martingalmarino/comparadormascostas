import type { Metadata } from "next";
import { siteConfig } from "@/site.config";
import type { Plan } from "@/lib/plan-schema";
import { tipoOptions } from "@/lib/zones";

export function pageMetadata({
  title,
  description,
  path,
  noindex = false,
}: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
}): Metadata {
  const url = `${siteConfig.domain}${path === "/" ? "" : path}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url,
      locale: "es_AR",
      siteName: siteConfig.siteName,
      type: "website",
    },
    robots: noindex ? { index: false, follow: true } : { index: true, follow: true },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.siteName,
    url: siteConfig.domain,
    description: siteConfig.description,
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Córdoba",
      addressCountry: "AR",
    },
    email: siteConfig.contactEmail,
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.siteName,
    url: siteConfig.domain,
    inLanguage: "es-AR",
    description: siteConfig.description,
  };
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function itemListJsonLd(plans: Plan[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Planes para mascotas en Córdoba",
    itemListElement: plans.map((plan, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: `${plan.marca} ${plan.nombre}`,
      url: `${siteConfig.domain}/planes/${plan.marca_slug}#${plan.id}`,
    })),
  };
}

export function productJsonLd(plan: Plan) {
  const tipo = tipoOptions.find((item) => item.id === plan.tipo)?.label ?? plan.tipo;
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${plan.marca} ${plan.nombre}`,
    description: plan.resumen || `${tipo} para mascotas de ${plan.marca}.`,
    brand: { "@type": "Brand", name: plan.marca },
    category: tipo,
    url: `${siteConfig.domain}/planes/${plan.marca_slug}#${plan.id}`,
  };
  const desde = plan.precio_texto_original?.toLowerCase().includes("desde") ?? false;
  const verified = plan.estado === "verificado" && !plan.es_ejemplo && plan.precio != null && !desde;
  if (verified) {
    const until = new Date(`${plan.fecha_verificacion}T00:00:00Z`);
    until.setUTCDate(until.getUTCDate() + 45);
    data.offers = {
      "@type": "Offer",
      priceCurrency: "ARS",
      price: plan.precio,
      url: plan.fuente_url.startsWith("http") ? plan.fuente_url : `${siteConfig.domain}${plan.fuente_url}`,
      priceValidUntil: until.toISOString().slice(0, 10),
      availability: "https://schema.org/InStock",
    };
  }
  return data;
}
