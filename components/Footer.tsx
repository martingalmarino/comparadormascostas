import { PawPrint } from "lucide-react";
import Link from "next/link";
import { getPlans } from "@/lib/plans";
import { enlacesPorProvincia } from "@/lib/zones";
import { siteConfig } from "@/site.config";

const comparar = [
  { label: "Comparador", href: "/comparar" },
  { label: "Todas las marcas", href: "/comparar" },
  { label: "Precios del mes", href: "/precios" },
  { label: "Seguro para perros", href: "/seguro-para-perros" },
  { label: "Seguro para gatos", href: "/seguro-para-gatos" },
];

const cuidalo = [
  { label: "Blog", href: "/blog" },
  { label: "Sobre nosotros", href: "/sobre-nosotros" },
  { label: "Cómo comparamos", href: "/como-comparamos" },
  { label: "Contacto", href: "/contacto" },
];

const legal = [
  { label: "Política de privacidad", href: "/privacidad" },
  { label: "Términos y condiciones", href: "/terminos" },
];

function Columna({ titulo, enlaces }: { titulo: string; enlaces: { label: string; href: string }[] }) {
  if (!enlaces.length) return null;

  return (
    <div>
      <h2 className="text-sm font-bold text-gray-900">{titulo}</h2>
      <ul className="mt-3 space-y-2 text-sm text-gray-600">
        {enlaces.map((item) => (
          <li key={item.label}>
            <Link className="hover:text-indigo-700" href={item.href}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer({ year }: { year: string }) {
  const provincias = enlacesPorProvincia(getPlans());
  const sobreCuidalo = cuidalo.filter((item) => item.href);

  return (
    <footer className="border-t border-gray-200 bg-white pt-16 pb-28 lg:pb-8">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
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
        <div className="grid grid-cols-2 gap-8 md:col-span-2 lg:col-span-3 lg:grid-cols-4">
          <Columna titulo="Comparar" enlaces={comparar} />
          <Columna titulo="Por provincia" enlaces={[...provincias]} />
          <Columna titulo="Cuidalo" enlaces={sobreCuidalo} />
          <Columna titulo="Legal" enlaces={legal} />
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-7xl space-y-3 border-t border-gray-200 px-4 pt-6 text-xs leading-relaxed text-gray-500 sm:px-6">
        <p>
          {siteConfig.siteName} no vende seguros ni planes: te derivamos a cada marca. Los precios son referenciales, con fecha de verificación y fuente; confirmalos con la marca antes de contratar.
        </p>
        <p>
          Tratamos tus datos según la Ley 25.326 de Protección de Datos Personales.{" "}
          <Link className="underline underline-offset-2 hover:text-indigo-700" href="/privacidad">
            Ver Política de privacidad
          </Link>
        </p>
        <p>Las marcas y logos pertenecen a sus respectivos dueños y no implican asociación con {siteConfig.siteName}.</p>
      </div>
      <div className="mx-auto mt-6 flex max-w-7xl flex-col items-center gap-2 px-4 text-center text-xs text-gray-500 sm:px-6 lg:flex-row lg:justify-between lg:text-left">
        <p>
          © {year} {siteConfig.siteName}
          {siteConfig.showProvisionalBadge ? ` (${siteConfig.siteNameNote.toLowerCase()})` : ""} · Argentina
        </p>
        <p>
          Desarrollado por{" "}
          <a
            className="underline underline-offset-2 hover:text-indigo-700"
            href="mailto:m.galmarino@gmail.com"
          >
            Martín Galmarino
          </a>{" "}
          🤖
        </p>
      </div>
    </footer>
  );
}
