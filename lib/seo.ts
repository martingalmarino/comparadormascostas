import type { Metadata } from "next";
import { founder } from "@/lib/geo";
import type { Plan } from "@/lib/plan-schema";
import { precioVigente } from "@/lib/plan-status";
import { tipoOptions } from "@/lib/zones";
import { siteConfig } from "@/site.config";

export function pageMetadata({
  title,
  description,
  path,
  noindex = false,
  absolute = false,
}: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  absolute?: boolean;
}): Metadata {
  const rendered = absolute ? title : `${title} | ${siteConfig.siteName}`;
  const url = `${siteConfig.domain}${path === "/" ? "" : path}`;
  return {
    title: absolute ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: rendered,
      description,
      url,
      locale: "es_AR",
      siteName: siteConfig.siteName,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: rendered,
      description,
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
    logo: `${siteConfig.domain}/logo.svg`,
    founder: {
      "@type": "Person",
      name: founder.name,
      email: founder.email,
    },
    areaServed: {
      "@type": "Country",
      name: "Argentina",
    },
    ...(siteConfig.contactEmail ? { email: siteConfig.contactEmail } : {}),
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
    name: "Planes para mascotas en Argentina",
    itemListElement: plans.map((plan, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: `${plan.marca} ${plan.nombre}`,
      url: `${siteConfig.domain}/planes/${plan.marca_slug}#${plan.id}`,
    })),
  };
}

function esZona(texto: string) {
  return /^(nacional|todo el pa[ií]s)\.?$/i.test(texto.trim());
}

export function descripcionProducto(plan: Plan) {
  const coberturas = plan.coberturas.map((item) => item.item).filter(Boolean);
  if (coberturas.length) return coberturas.join(", ");
  if (plan.resumen && !esZona(plan.resumen)) return plan.resumen;
  const tipo = tipoOptions.find((item) => item.id === plan.tipo)?.label ?? plan.tipo;
  return `${tipo} para mascotas de ${plan.marca}.`;
}

export function productNode(plan: Plan, today: string) {
  const tipo = tipoOptions.find((item) => item.id === plan.tipo)?.label ?? plan.tipo;
  const url = `${siteConfig.domain}/planes/${plan.marca_slug}#${plan.id}`;
  const data: Record<string, unknown> = {
    "@type": "Product",
    name: `${plan.marca} ${plan.nombre}`,
    description: descripcionProducto(plan),
    brand: { "@type": "Brand", name: plan.marca },
    category: tipo,
    url,
  };
  if (precioVigente(plan, today)) {
    const until = new Date(`${plan.fecha_verificacion}T00:00:00Z`);
    until.setUTCDate(until.getUTCDate() + siteConfig.priceStaleDays);
    data.offers = {
      "@type": "Offer",
      priceCurrency: "ARS",
      price: plan.precio,
      url,
      priceValidUntil: until.toISOString().slice(0, 10),
      availability: "https://schema.org/InStock",
    };
  }
  return data;
}

export function productJsonLd(plan: Plan, today: string) {
  return { "@context": "https://schema.org", ...productNode(plan, today) };
}

export function offersItemListJsonLd(plans: Plan[], today: string, name: string, dateModified?: string) {
  const list = {
    "@type": "ItemList",
    name,
    itemListElement: plans.map((plan, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: productNode(plan, today),
    })),
  };
  if (!dateModified) return { "@context": "https://schema.org", ...list };
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name,
        dateModified,
        mainEntity: list,
      },
    ],
  };
}

export function webPageJsonLd({ url, name, dateModified }: { url: string; name: string; dateModified: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url,
    name,
    dateModified,
    publisher: {
      "@type": "Organization",
      name: siteConfig.siteName,
      url: siteConfig.domain,
    },
  };
}

export function aboutPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    url: `${siteConfig.domain}/como-comparamos`,
    name: "Cómo comparamos",
    author: {
      "@type": "Person",
      name: founder.name,
      email: founder.email,
    },
  };
}
