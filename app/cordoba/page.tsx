import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FAQ } from "@/components/FAQ";
import { requireEntry } from "@/lib/seo-copy";
import { pageMetadata } from "@/lib/seo";
import { zones } from "@/lib/zones";

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
          En Córdoba el mismo plan puede servir en Nueva Córdoba y no tener clínicas en Sierras Chicas, o al revés. Por eso el comparador filtra por zona y no mezcla Capital con el interior como si fuera la misma cartilla.
        </p>
        <p>
          Los barrios y ciudades de abajo son los que podés elegir en el buscador. Si la fuente dice que el plan cubre Córdoba, también aparece cuando filtrás un barrio de la Capital. Si no confirma presencia en la provincia, no entra en ese filtro.
        </p>
      </div>
      <ul className="mt-6 flex flex-wrap gap-2">
        {zones.map((zone) => (
          <li key={zone.slug}>
            <Link href={`/comparar?zona=${zone.slug}`} className="inline-flex rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 hover:border-indigo-200">
              {zone.label}
            </Link>
          </li>
        ))}
      </ul>
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
            q: "¿El plan de Capital cubre Villa Carlos Paz?",
            a: "Solo si la ficha incluye Gran Córdoba, Villa Carlos Paz o Sierras Chicas. Capital no alcanza para el valle de Punilla.",
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
