import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { formatDate } from "@/lib/format";
import { getGuides } from "@/lib/guides";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Guías de salud para mascotas",
  description: "Guías para entender obras sociales, seguros, carencias y perfiles de perros y gatos en Córdoba.",
  path: "/guias",
});

export default function GuiasPage() {
  const guides = getGuides();
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ name: "Guías", path: "/guias" }]} />
      <h1 className="mt-4 text-3xl font-bold text-gray-900">Guías</h1>
      <p className="mt-3 text-gray-600">Textos para leer antes de comparar. No reemplazan el condicionado de la marca ni un asesoramiento profesional.</p>
      <ul className="mt-8 space-y-4">
        {guides.map((guide) => (
          <li key={guide.slug} className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="text-xl font-bold text-gray-900">
              <Link href={`/guias/${guide.slug}`} className="hover:text-indigo-700">
                {guide.title}
              </Link>
            </h2>
            <p className="mt-2 text-sm text-gray-600">{guide.description}</p>
            <p className="mt-2 text-xs text-gray-500">Actualizado el {formatDate(guide.updated)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
