"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { useHomeZona } from "@/components/HomeZona";
import { logoSize } from "@/lib/logo";

export type MarcaHome = {
  slug: string;
  nombre: string;
  logo?: string | null;
  provincias: string[];
  nacional: boolean;
};

const logosExtra = [
  { nombre: "Banco Hipotecario", logo: "/logos/hipotecario.svg", href: "https://www.hipotecario.com.ar/" },
  { nombre: "La Caja", logo: "/logos/la-caja.png", href: "https://seguros.lacaja.com.ar/" },
  { nombre: "MAPFRE", logo: "/logos/mapfre.png", href: "https://www.mapfre.com.ar/seguros-mascotas/" },
  { nombre: "Nación Seguros", logo: "/logos/nacion-seguros.png", href: "https://www.nacion-seguros.com.ar/" },
  { nombre: "Sancor Seguros", logo: "/logos/sancor-seguros.svg", href: "https://www.sancorseguros.com.ar/" },
  { nombre: "Zurich", logo: "/logos/zurich.svg", href: "https://www.zurich.com.ar/" },
];

export function BrandStrip({ marcas }: { marcas: MarcaHome[] }) {
  const { zona } = useHomeZona();
  const visible = marcas.filter((marca) => !zona || marca.nacional || marca.provincias.includes(zona));
  const extras = zona ? [] : logosExtra;

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
      {extras.map((marca) => {
        const size = logoSize(marca.logo);
        return (
          <li key={marca.logo} className="flex justify-center">
            <a href={marca.href} target="_blank" rel="noopener noreferrer" className="group flex h-12 w-full items-center justify-center">
              <BrandLogo nombre={marca.nombre} logo={marca.logo} width={size.width} height={size.height} />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
