import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DirectAnswer } from "@/components/DirectAnswer";
import { FAQ } from "@/components/FAQ";
import { FichaV2 } from "@/components/FichaMarca/FichaV2";
import { JsonLd } from "@/components/JsonLd";
import { LeadForm } from "@/components/LeadForm";
import { PlanArticles } from "@/components/PlanArticles";
import { StickyLeadCTA } from "@/components/StickyLeadCTA";
import { getReferenceDate } from "@/lib/dates";
import { fichaV2 } from "@/lib/ficha-v2";
import { formatMonthYear } from "@/lib/format";
import { respuestaDirecta } from "@/lib/geo";
import { logoSize } from "@/lib/logo";
import { getMarca } from "@/lib/marcas";
import { getMarcas, getPlansByMarca, newestVerification, versusPairs } from "@/lib/plans";
import { pageMetadata, webPageJsonLd } from "@/lib/seo";
import { brandEntry } from "@/lib/seo-copy";
import { siteConfig } from "@/site.config";
import { tipoOptions } from "@/lib/zones";

export function generateStaticParams() {
  return getMarcas().map((marca) => ({ marca: marca.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ marca: string }> }) {
  const { marca } = await params;
  const seo = brandEntry(marca);
  if (!seo) return { title: "Marca no encontrada" };
  if (!fichaV2(marca)) return pageMetadata({ ...seo, noindex: !seo.index });
  const today = await getReferenceDate();
  const plans = getPlansByMarca(marca);
  const mes = formatMonthYear(newestVerification(plans));
  return pageMetadata({
    title: `${plans[0].marca} seguro de mascotas: planes, precios y cobertura (${mes})`,
    description: respuestaDirecta({ tipo: "marca", today, slug: marca }),
    path: seo.path,
    noindex: !seo.index,
  });
}

function MarcaFallback() {
  return <div className="mx-auto max-w-7xl px-4 py-10 text-gray-600">Cargando ficha…</div>;
}

async function MarcaDetail({ params }: { params: Promise<{ marca: string }> }) {
  const { marca } = await params;
  const plans = getPlansByMarca(marca);
  if (!plans.length) notFound();
  const today = await getReferenceDate();
  const brand = plans[0].marca;
  const seo = brandEntry(marca);
  const related = versusPairs().filter((pair) => pair.a === marca || pair.b === marca).slice(0, 4);
  const faqs = [
    {
      q: `¿${brand} publica estos precios?`,
      a: "Cada precio muestra la fecha y el enlace a la fuente. Si dice “Precio a consultar”, no hay monto publicado. Si está en revisión o la fecha supera los 45 días, no lo tomes como tarifa cerrada.",
    },
    {
      q: "¿Qué pasa si pido que me contacten?",
      a: `${brand} recibe tus datos solo si marcás el consentimiento. ${siteConfig.siteName} no vende el plan ni intermedia la contratación.`,
    },
    {
      q: "¿Las carencias son las de la póliza?",
      a: "Mostramos el texto que trajo la fuente. Antes de contratar, pedile a la marca el condicionado vigente, sobre todo si tu mascota ya tiene un diagnóstico.",
    },
  ];

  if (fichaV2(marca) && seo) {
    const ficha = getMarca(marca);
    if (ficha) {
      return <FichaV2 marca={marca} ficha={ficha} plans={plans} today={today} seo={seo} related={related} faqsBase={faqs} />;
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ name: "Comparador", path: "/comparar" }, { name: brand, path: `/planes/${marca}` }]} />
      <DirectAnswer text={respuestaDirecta({ tipo: "marca", today, slug: marca })} />
      <JsonLd
        data={webPageJsonLd({
          url: `${siteConfig.domain}/planes/${marca}`,
          name: seo?.h1 ?? brand,
          dateModified: newestVerification(plans),
        })}
      />
      <div className="mt-6 overflow-hidden rounded-2xl bg-indigo-600 px-5 py-6 text-white sm:px-8">
        <Link href="/comparar" className="inline-flex items-center gap-2 text-sm text-indigo-100 hover:text-white">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Volver al comparador
        </Link>
        <p className="mt-4 text-xs font-bold uppercase tracking-widest text-indigo-200">
          {tipoOptions.find((item) => item.id === plans[0].tipo)?.label}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          {plans[0].logo ? (
            <span className="group inline-flex items-center rounded-xl bg-white px-3 py-2">
              <BrandLogo nombre={brand} logo={plans[0].logo} maxWidth="12rem" {...logoSize(plans[0].logo)} />
            </span>
          ) : null}
          <h1 className="text-3xl font-bold sm:text-4xl">{seo?.h1 ?? brand}</h1>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-indigo-100">{plans[0].resumen}</p>
      </div>

      <div className="mt-8 lg:grid lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-8">
          <PlanArticles plans={plans} today={today} showPros />
          {related.length ? (
            <section className="mt-10">
              <h2 className="text-xl font-bold text-gray-900">Comparar con otra marca</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {related.map((pair) => (
                  <li key={pair.slug}>
                    <Link href={`/versus/${pair.slug}`} className="inline-flex rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:border-indigo-200">
                      {pair.a} vs {pair.b}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          <FAQ items={faqs} />
        </div>
        <aside className="mt-8 lg:col-span-4 lg:mt-0">
          <div id="quiero-que-me-contacten" className="scroll-mt-24 lg:sticky lg:top-24">
            <LeadForm marca={brand} planes={plans.map((plan) => ({ id: plan.id, nombre: plan.nombre }))} defaultPlanId={plans[0].id} />
          </div>
        </aside>
      </div>
      <StickyLeadCTA />
    </div>
  );
}

export default function Page({ params }: { params: Promise<{ marca: string }> }) {
  return (
    <Suspense fallback={<MarcaFallback />}>
      <MarcaDetail params={params} />
    </Suspense>
  );
}
