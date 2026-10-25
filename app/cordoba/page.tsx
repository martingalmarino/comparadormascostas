import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FAQ } from "@/components/FAQ";
import { pageMetadata } from "@/lib/seo";
import { zones } from "@/lib/zones";

export const metadata = pageMetadata({
  title: "Obra social para mascotas en Córdoba",
  description: "Cómo comparar planes de salud para mascotas en Córdoba Capital, Gran Córdoba, Sierras Chicas, Río Cuarto y Villa María.",
  path: "/cordoba",
});

export default function CordobaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ name: "Córdoba", path: "/cordoba" }]} />
      <p className="mt-4 text-xs font-bold uppercase tracking-widest text-indigo-600">Actualizado el 24/10/2026</p>
      <h1 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">Obra social para mascotas en Córdoba</h1>
      <div className="prose-mc mt-4">
        <p>
          En Córdoba el mismo plan puede servir en Nueva Córdoba y no tener clínicas en Sierras Chicas, o al revés. Por eso el comparador filtra por zona y no mezcla Capital con el interior como si fuera la misma cartilla.
        </p>
        <p>
          Los barrios y ciudades de abajo son los que podés elegir en el buscador. Si un plan de ejemplo dice que cubre Córdoba Capital, también aparece cuando filtrás un barrio de la ciudad. Si solo declara Villa María, no entra en una búsqueda de Nueva Córdoba.
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
            a: "En los ejemplos, el precio es uno por plan. Lo que cambia por barrio es la cartilla, y eso hay que confirmarlo con la marca.",
          },
        ]}
      />
    </div>
  );
}
