import { Suspense } from "react";
import { Comparador, ComparadorFallback } from "@/components/Comparador";
import { UpdatedOn } from "@/components/UpdatedOn";
import { getReferenceDate } from "@/lib/dates";
import { getPlans, newestVerification } from "@/lib/plans";
import { hasNarrowingFilters, parseFilters, type RawSearch } from "@/lib/filters";
import { requireEntry } from "@/lib/seo-copy";
import { pageMetadata } from "@/lib/seo";

const seo = requireEntry("/comparar");

export async function generateMetadata({ searchParams }: { searchParams: Promise<RawSearch> }) {
  const filters = parseFilters(await searchParams);
  return pageMetadata({ ...seo, noindex: hasNarrowingFilters(filters) });
}

export default async function CompararPage({ searchParams }: { searchParams: Promise<RawSearch> }) {
  const today = await getReferenceDate();
  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{seo.h1}</h1>
        <UpdatedOn iso={newestVerification(getPlans())} />
      </div>
      <Suspense fallback={<ComparadorFallback />}>
        <Comparador searchParams={searchParams} today={today} />
      </Suspense>
    </>
  );
}
