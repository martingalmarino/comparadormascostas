import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FAQ } from "@/components/FAQ";
import { requireEntry } from "@/lib/seo-copy";
import { pageMetadata } from "@/lib/seo";

const seo = requireEntry("/cordoba");

export const metadata = pageMetadata({ ...seo, noindex: !seo.index });

export default function CordobaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ name: "Córdoba", path: "/cordoba" }]} />
      <p className="mt-4 text-xs font-bold uppercase tracking-widest text-indigo-600">Actualizado el 24/10/2026</p>
      <h1 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">{seo.h1}</h1>
      <div className="prose-mc mt-4">
        <p>
          El comparador filtra por provincia. Si la fuente confirma Córdoba, el plan aparece al elegir esa provincia junto con los de cobertura nacional. Las ciudades o barrios, cuando la fuente los nombra, quedan en la ficha como dato informativo y no son un filtro.
        </p>
        <p>
          Si una marca no publica en qué provincia está, ese plan no entra cuando elegís Córdoba.
        </p>
      </div>
      <p className="mt-6">
        <Link href="/comparar?zona=cordoba" className="inline-flex rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 hover:border-indigo-200">
          Ver planes en Córdoba
        </Link>
      </p>
      <p className="mt-6 text-sm text-gray-600">
        Para saber qué preguntarle a una veterinaria antes de anotar a tu mascota, mirá{" "}
        <Link href="/cordoba/veterinarias-con-plan" className="font-semibold text-indigo-700 underline">
          veterinarias con plan
        </Link>
        .
      </p>
      <FAQ
        items={[
          {
            q: "¿El plan de Córdoba cubre Villa Carlos Paz?",
            a: "El filtro es la provincia. Si la ficha nombra una ciudad, es lo que publicó la fuente: confirmalo con la marca antes de anotar a tu mascota.",
          },
          {
            q: "¿Hay precios distintos por barrio?",
            a: "El relevamiento trae un precio por plan, no uno por barrio. Lo que cambia por barrio es la cartilla, y eso hay que confirmarlo con la marca.",
          },
        ]}
      />
    </div>
  );
}
