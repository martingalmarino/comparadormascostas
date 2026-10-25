import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Badge } from "@/components/Badge";
import { BrandLogo } from "@/components/BrandLogo";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DirectAnswer } from "@/components/DirectAnswer";
import { CoverageList } from "@/components/CoverageList";
import { FAQ } from "@/components/FAQ";
import { JsonLd } from "@/components/JsonLd";
import { LeadForm } from "@/components/LeadForm";
import { PriceTag } from "@/components/PriceTag";
import { ProsCons } from "@/components/ProsCons";
import { StatusNotice } from "@/components/StatusNotice";
import { StickyLeadCTA } from "@/components/StickyLeadCTA";
import { VerifiedLine } from "@/components/VerifiedLine";
import { WaitingPeriods } from "@/components/WaitingPeriods";
import { getReferenceDate } from "@/lib/dates";
import { logoSize } from "@/lib/logo";
import { especieLabel } from "@/lib/format";
import { respuestaDirecta } from "@/lib/geo";
import { getMarcas, getPlansByMarca, newestVerification, versusPairs } from "@/lib/plans";
import { brandEntry } from "@/lib/seo-copy";
import { pageMetadata, productJsonLd, webPageJsonLd } from "@/lib/seo";
import { siteConfig } from "@/site.config";
import { tipoOptions } from "@/lib/zones";
import { PROVINCIA_TODAS, jurisdiccionLabel } from "@/lib/zonas";

export function generateStaticParams() {
  return getMarcas().map((marca) => ({ marca: marca.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ marca: string }> }) {
  const { marca } = await params;
  const seo = brandEntry(marca);
  if (!seo) return { title: "Marca no encontrada" };
  return pageMetadata({ ...seo, noindex: !seo.index });
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
      a: "Cada precio muestra la fecha y el enlace a la fuente. Si dice “Consultar precio”, no hay monto publicado. Si está en revisión o la fecha supera los 45 días, no lo tomes como tarifa cerrada.",
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
          <div className="space-y-10">
            {plans.map((plan) => (
              <article key={plan.id} id={plan.id} className="scroll-mt-24">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">{plan.marca}</p>
                    <h2 className="text-2xl font-bold text-gray-900">{plan.nombre}</h2>
                    {plan.resumen ? <p className="mt-1 text-sm text-gray-600">{plan.resumen}</p> : null}
                    <p className="mt-2 text-sm text-gray-600">
                      {plan.especies.map((especie) => especieLabel(especie)).join(", ")}
                      {plan.edad_min_meses != null ? ` · desde ${plan.edad_min_meses} meses` : ""}
                      {plan.edad_max_anios != null ? ` · hasta ${plan.edad_max_anios} años` : ""}
                    </p>
                    {plan.zonas.length === 0 ? (
                      <p className="mt-1 text-sm text-amber-800">La fuente no confirma en qué provincias está.</p>
                    ) : (
                      <p className="mt-1 text-sm text-gray-600">
                        {plan.zonas.some((zona) => zona.provincia === PROVINCIA_TODAS)
                          ? "Todo el país."
                          : `Disponible en ${plan.zonas.map((zona) => jurisdiccionLabel(zona.provincia) ?? zona.provincia).join(", ")}.`}
                      </p>
                    )}
                    {plan.zona_detalle ? <p className="mt-1 text-sm text-gray-600">{plan.zona_detalle}</p> : null}
                  </div>
                  <PriceTag plan={plan} today={today} size="lg" tone="primary" />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {plan.badges?.map((badge) => (
                    <Badge key={badge} kind={badge} />
                  ))}
                </div>
                <div className="mt-3">
                  <VerifiedLine plan={plan} />
                </div>
                <div className="mt-3">
                  <StatusNotice plan={plan} today={today} />
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <section className="rounded-2xl border border-gray-200 bg-white p-5">
                    <h3 className="flex items-center gap-2 font-bold text-emerald-700">
                      <Check className="size-4" aria-hidden="true" />
                      Coberturas incluidas
                    </h3>
                    <div className="mt-2">
                      <CoverageList plan={plan} variant="table" />
                    </div>
                  </section>
                  <section className="rounded-2xl border border-gray-200 bg-white p-5">
                    <h3 className="font-bold text-amber-700">Carencias</h3>
                    <div className="mt-4">
                      <WaitingPeriods plan={plan} />
                    </div>
                  </section>
                </div>
                {plan.notas ? <p className="mt-4 text-sm text-gray-700">{plan.notas}</p> : null}
                <div className="mt-4">
                  <ProsCons plan={plan} />
                </div>
                <JsonLd data={productJsonLd(plan, today)} />
              </article>
            ))}
          </div>
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
