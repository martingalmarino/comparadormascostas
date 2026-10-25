import Link from "next/link";
import { FAQ } from "@/components/FAQ";
import { JsonLd } from "@/components/JsonLd";
import { PlanCard } from "@/components/PlanCard";
import { SearchBox } from "@/components/SearchBox";
import { TrustBar } from "@/components/TrustBar";
import { getReferenceDate } from "@/lib/dates";
import { applyFilters } from "@/lib/filters";
import { formatDate } from "@/lib/format";
import { getMarcas, getPlans, newestVerification } from "@/lib/plans";
import { organizationJsonLd, pageMetadata, websiteJsonLd } from "@/lib/seo";
import { siteConfig } from "@/site.config";

export const metadata = pageMetadata({
  title: "Obra social para mascotas en Córdoba",
  description:
    "Compará precios actualizados de obras sociales, planes de salud y seguros para perros y gatos en Córdoba. Independiente: no vendemos seguros.",
  path: "/",
});

const steps = [
  ["1", "Cargás los datos", "Especie, edad y zona de Córdoba."],
  ["2", "Comparás coberturas", "Precio, carencias, topes y qué deja afuera cada plan."],
  ["3", "Elegís sin presión", "Te derivamos a la marca. No cobramos comisión ni vendemos el seguro."],
];

const faqs = [
  {
    q: "¿Venden seguros para mascotas?",
    a: "No. MascoCompara es un comparador independiente. Si pedís que te contacten, derivamos tus datos a la marca que elegiste. No intermediamos en la contratación.",
  },
  {
    q: "¿Los precios son reales?",
    a: "Mientras veas el badge EJEMPLO, el monto es ilustrativo y no es una tarifa vigente. Cada precio muestra fecha de verificación y fuente. Si pasaron más de 45 días, lo marcamos como desactualizado.",
  },
  {
    q: "¿Sirve solo para Córdoba?",
    a: "El foco es Córdoba Capital, Gran Córdoba y algunas ciudades de la provincia. El filtro de zona muestra los planes de ejemplo que declaran cobertura en ese lugar.",
  },
];

export default async function HomePage() {
  const today = await getReferenceDate();
  const plans = getPlans();
  const preview = applyFilters(plans, { cob: [], ids: [], orden: "precio" }).slice(0, 3);
  const updated = newestVerification(plans);

  return (
    <>
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-indigo-600">Córdoba, Argentina</p>
          <h1 className="mx-auto mt-3 max-w-4xl text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Compará precios actualizados de <span className="text-indigo-600">obras sociales</span> para tu mascota en Córdoba
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base text-gray-600 sm:text-lg">
            {siteConfig.siteName} ordena planes de salud y seguros para perros y gatos. Los montos con badge EJEMPLO todavía no están verificados en el sitio de la marca.
          </p>
          <div className="mx-auto mt-8 max-w-5xl">
            <SearchBox />
          </div>
          <p className="mt-4 text-center text-sm text-gray-500">Datos de ejemplo cargados el {formatDate(updated)}.</p>
          <div className="mt-10">
            <TrustBar />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <h2 className="text-center text-xs font-bold uppercase tracking-widest text-gray-400">Comparamos estas marcas</h2>
        <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-gray-500">
          {getMarcas().map((marca) => (
            <li key={marca.slug}>
              <Link href={`/planes/${marca.slug}`} className="font-bold hover:text-indigo-700">
                {marca.nombre}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map(([number, title, text]) => (
            <div key={number} className="flex gap-4">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">{number}</div>
              <div>
                <h3 className="font-semibold text-gray-900">{title}</h3>
                <p className="mt-1 text-sm text-gray-600">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Los ejemplos de menor precio</h2>
          <Link href="/comparar" className="text-sm font-bold text-indigo-700 hover:underline">
            Ver todos
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {preview.map((plan) => (
            <PlanCard key={plan.id} plan={plan} today={today} />
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold">
          <Link className="rounded-full border border-gray-200 bg-white px-4 py-2 hover:border-indigo-200" href="/seguro-para-perros">Seguro para perros</Link>
          <Link className="rounded-full border border-gray-200 bg-white px-4 py-2 hover:border-indigo-200" href="/seguro-para-gatos">Seguro para gatos</Link>
          <Link className="rounded-full border border-gray-200 bg-white px-4 py-2 hover:border-indigo-200" href="/precios">Precios del mes</Link>
          <Link className="rounded-full border border-gray-200 bg-white px-4 py-2 hover:border-indigo-200" href="/cordoba">Córdoba</Link>
        </div>
        <FAQ items={faqs} />
      </section>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={websiteJsonLd()} />
    </>
  );
}
