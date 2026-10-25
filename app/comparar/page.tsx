import { Suspense } from "react";
import { Comparador, ComparadorFallback } from "@/components/Comparador";
import { getReferenceDate } from "@/lib/dates";
import { hasNarrowingFilters, parseFilters, type RawSearch } from "@/lib/filters";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ searchParams }: { searchParams: Promise<RawSearch> }) {
  const filters = parseFilters(await searchParams);
  return pageMetadata({
    title: "Comparar obras sociales para mascotas",
    description:
      "Filtrá por especie, edad, zona y tipo de plan. Cada precio de mascota en Córdoba muestra fecha de verificación y fuente.",
    path: "/comparar",
    noindex: hasNarrowingFilters(filters),
  });
}

export default async function CompararPage({ searchParams }: { searchParams: Promise<RawSearch> }) {
  const today = await getReferenceDate();
  return (
    <Suspense fallback={<ComparadorFallback />}>
      <Comparador searchParams={searchParams} today={today} />
    </Suspense>
  );
}
