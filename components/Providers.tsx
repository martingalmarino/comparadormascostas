"use client";

import { CompareProvider, type CatalogItem } from "@/components/compare";
import { ConsentProvider } from "@/components/consent";

export function Providers({ catalog, children }: { catalog: CatalogItem[]; children: React.ReactNode }) {
  return (
    <ConsentProvider>
      <CompareProvider catalog={catalog}>{children}</CompareProvider>
    </ConsentProvider>
  );
}
