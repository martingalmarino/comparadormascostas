import { notFound } from "next/navigation";
import { ProvinciaView } from "@/components/ProvinciaView";
import { esProvinciaPublicada, provinciasPublicadas } from "@/lib/geo";
import { requireEntry } from "@/lib/seo-copy";
import { pageMetadata } from "@/lib/seo";
import { rutaProvincia } from "@/lib/zones";

export function generateStaticParams() {
  return provinciasPublicadas()
    .filter((item) => item.slug !== "cordoba")
    .map((item) => ({ provincia: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ provincia: string }> }) {
  const { provincia } = await params;
  if (!esProvinciaPublicada(provincia) || provincia === "cordoba") return { title: "Provincia" };
  const seo = requireEntry(rutaProvincia(provincia));
  return pageMetadata({ ...seo, noindex: !seo.index });
}

export default async function Page({ params }: { params: Promise<{ provincia: string }> }) {
  const { provincia } = await params;
  if (!esProvinciaPublicada(provincia) || provincia === "cordoba") notFound();
  return <ProvinciaView slug={provincia} />;
}
