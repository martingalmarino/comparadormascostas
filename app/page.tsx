import Link from "next/link";
import { BrandStrip } from "@/components/BrandStrip";
import { FAQ } from "@/components/FAQ";
import { HomeZonaProvider } from "@/components/HomeZona";
import { JsonLd } from "@/components/JsonLd";
import { LowestPrices } from "@/components/LowestPrices";
import { SearchBox } from "@/components/SearchBox";
import { TrustBar } from "@/components/TrustBar";
import { getReferenceDate } from "@/lib/dates";
import { formatDate } from "@/lib/format";
import { getMarcasHome, getPlans, newestVerification } from "@/lib/plans";
import { provinciasConPlanes } from "@/lib/zonas";
import { requireEntry } from "@/lib/seo-copy";
import { organizationJsonLd, pageMetadata, websiteJsonLd } from "@/lib/seo";
import { siteConfig } from "@/site.config";

const seo = requireEntry("/");

export const metadata = pageMetadata({ ...seo, noindex: !seo.index });

const steps = [
  ["1", "Cargás los datos", "Especie, edad y tu zona."],
  ["2", "Comparás coberturas", "Precio, carencias, topes y qué deja afuera cada plan."],
  ["3", "Elegís sin presión", "Te derivamos a la marca. No cobramos comisión ni vendemos el seguro."],
];

const faqs = [
  {
    q: "¿Venden seguros para mascotas?",
    a: `No. ${siteConfig.siteName} es un comparador independiente. Si pedís que te contacten, derivamos tus datos a la marca que elegiste. No intermediamos en la contratación.`,
  },
  {
    q: "¿Los precios son reales?",
    a: `Cada precio muestra fecha de verificación y fuente. Si dice Precio a consultar, la marca no lo publicó. Si está en revisión o pasaron más de ${siteConfig.priceStaleDays} días, no lo tomes como tarifa cerrada. El badge EJEMPLO queda solo para un dato que todavía no tiene fuente.`,
  },
  {
    q: "¿Sirve en todo el país?",
    a: "Sí. El comparador cubre Argentina. Elegí tu zona para ver los planes que la fuente confirma ahí. Si una marca no publica la zona, ese plan no entra cuando filtrás por lugar.",
  },
];

export default async function HomePage() {
  const today = await getReferenceDate();
  const plans = getPlans();
  const zonas = provinciasConPlanes(plans);
  const updated = newestVerification(plans);

  return (
    <HomeZonaProvider>
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-indigo-600">Argentina</p>
          <h1 className="mx-auto mt-3 max-w-4xl text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Obra social para mascotas: compará <span className="text-indigo-600">planes y precios</span> en Argentina
          </h1>
          <div className="mx-auto mt-8 max-w-5xl">
            <SearchBox zonas={zonas} />
          </div>
          <p className="mt-4 text-center text-sm text-gray-500">Relevamiento cargado el {formatDate(updated)}.</p>
          <div className="mt-10">
            <TrustBar />
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-center text-xs font-bold uppercase tracking-widest text-gray-400">Comparamos estas marcas</h2>
          <BrandStrip marcas={getMarcasHome()} />
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6" aria-hidden="true">
        <div className="h-px bg-gray-200" />
      </div>

      <section className="bg-white py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-center text-xs font-bold uppercase tracking-widest text-gray-400">Cómo funciona</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm text-gray-600">Tres pasos para comparar planes, sin que te vendan el seguro.</p>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
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
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <LowestPrices plans={plans} today={today} />
        <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold">
          <Link className="rounded-full border border-gray-200 bg-white px-4 py-2 hover:border-indigo-200" href="/seguro-para-perros">Seguro para perros</Link>
          <Link className="rounded-full border border-gray-200 bg-white px-4 py-2 hover:border-indigo-200" href="/seguro-para-gatos">Seguro para gatos</Link>
          <Link className="rounded-full border border-gray-200 bg-white px-4 py-2 hover:border-indigo-200" href="/precios">Precios del mes</Link>
        </div>
        <FAQ items={faqs} />
      </section>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={websiteJsonLd()} />
    </HomeZonaProvider>
  );
}
