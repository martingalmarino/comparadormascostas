import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { FAQ } from "@/components/FAQ";
import { JsonLd } from "@/components/JsonLd";
import { PlanCard } from "@/components/PlanCard";
import { SearchBox } from "@/components/SearchBox";
import { TrustBar } from "@/components/TrustBar";
import { getReferenceDate } from "@/lib/dates";
import { applyFilters } from "@/lib/filters";
import { formatDate } from "@/lib/format";
import { logoSize } from "@/lib/logo";
import { getMarcas, getPlans, newestVerification } from "@/lib/plans";
import { requireEntry } from "@/lib/seo-copy";
import { organizationJsonLd, pageMetadata, websiteJsonLd } from "@/lib/seo";
import { siteConfig } from "@/site.config";

const seo = requireEntry("/");

export const metadata = pageMetadata({ ...seo, noindex: !seo.index });

const steps = [
  ["1", "Cargás los datos", "Especie, edad y, si estás en Córdoba, la zona."],
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
    a: "Cada precio muestra fecha de verificación y fuente. Si dice Consultar precio, la marca no lo publicó. Si está en revisión o pasaron más de 45 días, no lo tomes como tarifa cerrada. El badge EJEMPLO queda solo para un dato que todavía no tiene fuente.",
  },
  {
    q: "¿Sirve en todo el país?",
    a: "El comparador es de Argentina. Córdoba es la primera ciudad con filtro de zona: Capital, Río Cuarto, Villa María y Sierras Chicas. Si la fuente no confirma una zona, el plan no entra cuando filtrás por ese lugar.",
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
          <p className="text-center text-xs font-bold uppercase tracking-widest text-indigo-600">Argentina</p>
          <h1 className="mx-auto mt-3 max-w-4xl text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Obra social para mascotas: compará <span className="text-indigo-600">planes y precios</span> en Argentina
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base text-gray-600 sm:text-lg">
            {siteConfig.siteName} ordena planes de salud y seguros para perros y gatos. Cada monto muestra la fecha y la fuente del relevamiento.
          </p>
          <div className="mx-auto mt-8 max-w-5xl">
            <SearchBox />
          </div>
          <p className="mt-4 text-center text-sm text-gray-500">Relevamiento cargado el {formatDate(updated)}.</p>
          <div className="mt-10">
            <TrustBar />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <h2 className="text-center text-xs font-bold uppercase tracking-widest text-gray-400">Comparamos estas marcas</h2>
        <ul className="mt-6 grid grid-cols-3 items-center gap-x-4 gap-y-6 sm:grid-cols-4 lg:grid-cols-7">
          {getMarcas().map((marca) => {
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
          <h2 className="text-2xl font-bold text-gray-900">Los de menor precio publicado</h2>
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
