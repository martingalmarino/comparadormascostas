import { PawPrint } from "lucide-react";
import Link from "next/link";
import { getMarcas } from "@/lib/plans";
import { siteConfig } from "@/site.config";

export function Footer({ year }: { year: string }) {
  const marcas = getMarcas();

  return (
    <footer className="border-t border-gray-200 bg-white pt-16 pb-28 lg:pb-8">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-indigo-600 p-1 text-white">
              <PawPrint className="size-4" aria-hidden="true" />
            </span>
            <span className="font-bold text-gray-900">{siteConfig.siteName}</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            Comparador independiente de obras sociales, planes de salud y seguros para mascotas en Argentina. Te derivamos a la marca: no vendemos seguros ni intermediamos en la contratación.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-900">Córdoba</h2>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            <li><Link className="hover:text-indigo-700" href="/cordoba">Obra social en Córdoba</Link></li>
            <li><Link className="hover:text-indigo-700" href="/cordoba/veterinarias-con-plan">Veterinarias y cartilla</Link></li>
            <li><Link className="hover:text-indigo-700" href="/precios">Precios del mes</Link></li>
            <li><Link className="hover:text-indigo-700" href="/seguro-para-perros">Seguro para perros</Link></li>
            <li><Link className="hover:text-indigo-700" href="/seguro-para-gatos">Seguro para gatos</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-900">Marcas</h2>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            {marcas.map((marca) => (
              <li key={marca.slug}>
                <Link className="hover:text-indigo-700" href={`/planes/${marca.slug}`}>{marca.nombre}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-900">Legal</h2>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            <li><Link className="hover:text-indigo-700" href="/como-comparamos">Cómo comparamos</Link></li>
            <li><Link className="hover:text-indigo-700" href="/privacidad">Política de privacidad</Link></li>
            <li><Link className="hover:text-indigo-700" href="/terminos">Términos y condiciones</Link></li>
            <li><Link className="hover:text-indigo-700" href="/contacto">Contacto</Link></li>
          </ul>
        </div>
      </div>
      <p className="mx-auto mt-12 max-w-7xl px-4 text-center text-[11px] uppercase tracking-widest text-gray-400 sm:px-6">
        © {year} {siteConfig.siteName}
        {siteConfig.showProvisionalBadge ? ` (${siteConfig.siteNameNote.toLowerCase()})` : ""} · Argentina
      </p>
    </footer>
  );
}
