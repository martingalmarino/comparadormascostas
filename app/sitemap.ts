import type { MetadataRoute } from "next";
import { getGuides } from "@/lib/guides";
import { getMarcas, getPlansByMarca, newestVerification, versusPairs } from "@/lib/plans";
import { siteConfig } from "@/site.config";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    "/",
    "/comparar",
    "/seguro-para-perros",
    "/seguro-para-gatos",
    "/precios",
    "/cordoba",
    "/cordoba/veterinarias-con-plan",
    "/guias",
    "/como-comparamos",
    "/privacidad",
    "/terminos",
    "/contacto",
  ];

  const pages: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${siteConfig.domain}${path}`,
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));

  for (const marca of getMarcas()) {
    const plans = getPlansByMarca(marca.slug);
    pages.push({
      url: `${siteConfig.domain}/planes/${marca.slug}`,
      lastModified: newestVerification(plans),
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  for (const pair of versusPairs()) {
    pages.push({
      url: `${siteConfig.domain}/versus/${pair.slug}`,
      changeFrequency: "weekly",
      priority: 0.5,
    });
  }

  for (const guide of getGuides()) {
    pages.push({
      url: `${siteConfig.domain}/guias/${guide.slug}`,
      lastModified: guide.updated,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return pages;
}
