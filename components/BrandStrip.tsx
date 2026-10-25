"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { useHomeZona } from "@/components/HomeZona";
import { logoSize } from "@/lib/logo";

export type MarcaHome = {
  slug: string;
  nombre: string;
  logo?: string;
  provincias: string[];
  nacional: boolean;
};

export function BrandStrip({ marcas }: { marcas: MarcaHome[] }) {
  const { zona } = useHomeZona();
  const visible = marcas.filter((marca) => !zona || marca.nacional || marca.provincias.includes(zona));

  return (
    <ul className="mt-8 grid grid-cols-3 items-center gap-x-4 gap-y-6 sm:grid-cols-4 lg:grid-cols-7">
      {visible.map((marca) => {
        const size = marca.logo ? logoSize(marca.logo) : undefined;
        return (
          <li key={marca.slug} className="flex justify-center">
            <Link href={`/planes/${marca.slug}`} className="group flex h-12 w-full items-center justify-center">
              <BrandLogo nombre={marca.nombre} logo={marca.logo} width={size?.width} height={size?.height} />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
