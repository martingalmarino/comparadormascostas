import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DirectAnswer } from "@/components/DirectAnswer";
import { FAQ } from "@/components/FAQ";
import { JsonLd } from "@/components/JsonLd";
import { LeadForm } from "@/components/LeadForm";
import { PlanArticles } from "@/components/PlanArticles";
import { StickyLeadCTA } from "@/components/StickyLeadCTA";
import { etiquetaPrecio, formatArs, formatDate, formatPrecioMes } from "@/lib/format";
import {
  alcancePlanes,
  alternativasCercanas,
  enlaceCanal,
  esAseguradora,
  etiquetaCanal,
  etiquetaTipo,
  faqsDeMarca,
  hostFuente,
  ingresoComun,
  maxFechaVerificacion,
  organizationMarcaJsonLd,
  preciosVigentes,
  textoEdad,
  textoInconsistencia,
  vigenciaComun,
} from "@/lib/marca-ficha";
import type { Marca } from "@/lib/marca-schema";
import { historialVisible } from "@/lib/marcas";
import { logoSize } from "@/lib/logo";
import { getMarcas, getPlans } from "@/lib/plans";
import type { Plan } from "@/lib/plan-schema";
import { mostrarMonto } from "@/lib/plan-status";
import { respuestaDirecta } from "@/lib/geo";
import { webPageJsonLd } from "@/lib/seo";
import { siteConfig } from "@/site.config";
import type { SeoEntry } from "@/lib/seo-copy";

function Fuente({ url, fecha }: { url: string; fecha: string }) {
  return (
    <p className="mt-3 text-xs text-slate-500">
      Fuente:{" "}
      <a href={url} className="underline decoration-slate-300 underline-offset-2 hover:text-indigo-700" target="_blank" rel="noopener noreferrer">
        {hostFuente(url)}
      </a>{" "}
      · consultado {formatDate(fecha)}
    </p>
  );
}

function fuentesDe(campos: ({ fuente_url: string; fecha_verificacion: string } | null | undefined)[]) {
  const vistos = new Map<string, string>();
  for (const campo of campos) {
    if (!campo) continue;
    if (!vistos.has(campo.fuente_url)) vistos.set(campo.fuente_url, campo.fecha_verificacion);
  }
  return [...vistos.entries()].map(([url, fecha]) => ({ url, fecha }));
}

function Bloque({ id, titulo, children }: { id: string; titulo: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">{titulo}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function FichaV2({
  marca,
  ficha,
  plans,
  today,
  seo,
  related,
  faqsBase,
}: {
  marca: string;
  ficha: Marca;
  plans: Plan[];
  today: string;
  seo: SeoEntry;
  related: { slug: string; a: string; b: string }[];
  faqsBase: { q: string; a: string }[];
}) {
  const nombre = plans[0]?.marca ?? marca;
  const vigentes = preciosVigentes(plans, today);
  const minimo = vigentes[0];
  const alcance = alcancePlanes(plans);
  const ingreso = ingresoComun(plans);
  const vigencia = vigenciaComun(plans);
  const faltantes = ficha.no_publica;
  const nombres = new Map(getMarcas().map((item) => [item.slug, item.nombre]));
  const alternativas = alternativasCercanas(getPlans(), marca, today);
  const historial = historialVisible(marca)
    .map((serie) => ({ ...serie, plan: plans.find((plan) => plan.id === serie.planId) }))
    .filter((serie) => serie.plan);
  const faqs = [...faqsDeMarca(ficha, plans, today, nombre), ...faqsBase];
  const tabs = [
    { id: "planes", label: "Planes" },
    ficha.empresa.razon_social || ficha.empresa.cuit?.valor || ficha.empresa.ssn ? { id: "empresa", label: "Empresa" } : null,
    ficha.canales.length ? { id: "canales", label: "Canales" } : null,
    [ficha.como_se_usa.contratar, ficha.como_se_usa.reintegro, ficha.como_se_usa.siniestro, ficha.como_se_usa.baja].some(Boolean)
      ? { id: "como-se-usa", label: "Cómo se usa" }
      : null,
    faltantes.length || ficha.inconsistencias.length ? { id: "transparencia", label: "Transparencia" } : null,
    alternativas.length ? { id: "alternativas", label: "Alternativas" } : null,
    { id: "faq", label: "FAQ" },
  ].filter((tab): tab is { id: string; label: string } => Boolean(tab));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ name: "Comparador", path: "/comparar" }, { name: nombre, path: `/planes/${marca}` }]} />
      <JsonLd
        data={webPageJsonLd({
          url: `${siteConfig.domain}/planes/${marca}`,
          name: seo.h1,
          dateModified: maxFechaVerificacion(ficha, plans),
        })}
      />
      <JsonLd data={organizationMarcaJsonLd(ficha, nombre)} />
      <div className="mt-6">
        <Link href="/comparar" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-700">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Volver al comparador
        </Link>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          {plans[0]?.logo ? (
            <span className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2">
              <BrandLogo nombre={nombre} logo={plans[0].logo} maxWidth="9rem" {...logoSize(plans[0].logo)} />
            </span>
          ) : null}
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">{seo.h1}</h1>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {ficha.empresa.ssn ? (
            <a
              href={ficha.empresa.ssn.registro_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700"
            >
              SSN N° {ficha.empresa.ssn.numero}
            </a>
          ) : null}
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{etiquetaTipo(ficha.tipo_entidad)}</span>
          {alcance ? <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{alcance}</span> : null}
        </div>
        <DirectAnswer text={respuestaDirecta({ tipo: "marca", today, slug: marca })} />
        <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {minimo ? (
            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Desde</dt>
              <dd className="font-mono text-sm font-semibold text-slate-900">{formatPrecioMes(minimo.precio as number)}</dd>
            </div>
          ) : null}
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Planes</dt>
            <dd className="text-sm font-semibold text-slate-900">{plans.length}</dd>
          </div>
          {ingreso != null ? (
            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Ingreso</dt>
              <dd className="text-sm font-semibold text-slate-900">{ingreso} meses</dd>
            </div>
          ) : null}
          {vigencia != null ? (
            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Vigencia</dt>
              <dd className="text-sm font-semibold text-slate-900">{vigencia} años</dd>
            </div>
          ) : null}
          {ficha.red_veterinaria ? (
            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 sm:col-span-2">
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Veterinario</dt>
              <dd className="text-sm font-semibold text-slate-900">{ficha.red_veterinaria.valor}</dd>
            </div>
          ) : null}
        </dl>
        {ficha.edad ? <p className="mt-3 text-sm text-slate-600">Edad publicada: {ficha.edad.valor}</p> : null}
      </div>

      <nav aria-label="Secciones de la ficha" className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <a key={tab.id} href={`#${tab.id}`} className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-indigo-200 hover:text-indigo-700">
            {tab.label}
          </a>
        ))}
      </nav>

      <div className="mt-8 lg:grid lg:grid-cols-12 lg:gap-10">
        <div className="space-y-8 lg:col-span-8">
          <Bloque id="planes" titulo={`Planes de ${nombre}`}>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-2 pr-3 font-semibold">Plan</th>
                    <th className="py-2 pr-3 font-semibold">Edad</th>
                    <th className="py-2 pr-3 font-semibold">Coberturas</th>
                    <th className="py-2 text-right font-semibold">Precio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {plans.map((plan) => {
                    const esMenor = minimo?.id === plan.id;
                    return (
                      <tr key={plan.id}>
                        <td className="py-3 pr-3 font-semibold text-slate-900">
                          {plan.nombre}
                          {esMenor ? <span className="ml-2 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-emerald-700">menor precio</span> : null}
                        </td>
                        <td className="py-3 pr-3 text-slate-600">{textoEdad(plan)}</td>
                        <td className="py-3 pr-3 text-slate-600">
                          {plan.coberturas.slice(0, 3).map((item) => item.item).join(" · ") || "Sin detalle"}
                          <a href={`#${plan.id}`} className="mt-1 block text-xs font-semibold text-indigo-700">
                            Ver coberturas
                          </a>
                        </td>
                        <td className="py-3 text-right font-mono font-semibold text-slate-900">
                          {mostrarMonto(plan, today) ? (
                            <>
                              {etiquetaPrecio(plan.precio as number, plan.precio_tipo)}
                              {plan.nota_precio ? <span className="mt-1 block font-sans text-xs font-normal text-slate-500">{plan.nota_precio}</span> : null}
                            </>
                          ) : (
                            "Consultar precio"
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-8">
              <PlanArticles plans={plans} today={today} showPros={false} carenciaMarca={ficha.carencias} />
            </div>
            {fuentesDe(plans.map((plan) => ({ fuente_url: plan.fuente_url, fecha_verificacion: plan.fecha_verificacion }))).map((fuente) => (
              <Fuente key={fuente.url} url={fuente.url} fecha={fuente.fecha} />
            ))}
          </Bloque>

          {ficha.empresa.razon_social || ficha.empresa.cuit?.valor || ficha.empresa.ssn ? (
            <Bloque id="empresa" titulo="La empresa">
              <dl className="grid gap-4 sm:grid-cols-2">
                {ficha.empresa.razon_social?.valor ? (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Razón social</dt>
                    <dd className="mt-1 text-sm text-slate-800">{ficha.empresa.razon_social.valor}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tipo</dt>
                  <dd className="mt-1 text-sm text-slate-800">{etiquetaTipo(ficha.tipo_entidad)}</dd>
                </div>
                {ficha.empresa.cuit?.valor ? (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">CUIT</dt>
                    <dd className="mt-1 font-mono text-sm text-slate-800">{ficha.empresa.cuit.valor}</dd>
                  </div>
                ) : null}
                {ficha.empresa.ssn ? (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">SSN</dt>
                    <dd className="mt-1 text-sm text-slate-800">
                      N° {ficha.empresa.ssn.numero}{" "}
                      <a href={ficha.empresa.ssn.registro_url} target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-700 underline">
                        Ver registro
                      </a>
                    </dd>
                  </div>
                ) : null}
              </dl>
              {fuentesDe([ficha.empresa.razon_social, ficha.empresa.cuit, ficha.empresa.ssn]).map((fuente) => (
                <Fuente key={fuente.url} url={fuente.url} fecha={fuente.fecha} />
              ))}
            </Bloque>
          ) : null}

          {ficha.canales.length ? (
            <Bloque id="canales" titulo="Canales de contratación y atención">
              <ul className="grid gap-3 sm:grid-cols-2">
                {ficha.canales.map((canal) => {
                  const enlace = enlaceCanal(canal.valor, canal.fuente_url);
                  return (
                    <li key={`${canal.tipo}-${canal.valor}`} className="rounded-xl border border-slate-200 px-3 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{etiquetaCanal(canal.tipo)}</p>
                      {enlace.href ? (
                        <a href={enlace.href} className="mt-1 block text-sm font-semibold text-indigo-700" {...(enlace.externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                          {canal.valor}
                        </a>
                      ) : (
                        <p className="mt-1 text-sm font-semibold text-slate-800">{canal.valor}</p>
                      )}
                    </li>
                  );
                })}
              </ul>
              {fuentesDe(ficha.canales).map((fuente) => (
                <Fuente key={fuente.url} url={fuente.url} fecha={fuente.fecha} />
              ))}
            </Bloque>
          ) : null}

          {[ficha.como_se_usa.contratar, ficha.como_se_usa.reintegro, ficha.como_se_usa.siniestro, ficha.como_se_usa.baja].some(Boolean) ? (
            <Bloque id="como-se-usa" titulo="Cómo se usa">
              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    ["Contratar", ficha.como_se_usa.contratar],
                    ["Reintegro", ficha.como_se_usa.reintegro],
                    ["Siniestro", ficha.como_se_usa.siniestro],
                    ["Baja", ficha.como_se_usa.baja],
                  ] as const
                ).map(([titulo, campo]) =>
                  campo ? (
                    <div key={titulo} className="rounded-xl border border-slate-200 px-3 py-3">
                      <h3 className="text-sm font-semibold text-slate-900">{titulo}</h3>
                      <p className="mt-1 text-sm text-slate-600">{campo.valor}</p>
                    </div>
                  ) : null,
                )}
              </div>
              {fuentesDe([ficha.como_se_usa.contratar, ficha.como_se_usa.reintegro, ficha.como_se_usa.siniestro, ficha.como_se_usa.baja]).map((fuente) => (
                <Fuente key={fuente.url} url={fuente.url} fecha={fuente.fecha} />
              ))}
            </Bloque>
          ) : null}

          {ficha.red_veterinaria ? (
            <Bloque id="red" titulo="Red de veterinarias">
              <p className="text-sm text-slate-700">{ficha.red_veterinaria.valor}</p>
              <Fuente url={ficha.red_veterinaria.fuente_url} fecha={ficha.red_veterinaria.fecha_verificacion} />
            </Bloque>
          ) : null}

          {faltantes.length || ficha.inconsistencias.length ? (
            <Bloque id="transparencia" titulo={faltantes.length ? `Lo que ${nombre} no publica` : "Inconsistencias detectadas"}>
              {faltantes.length ? (
                <>
                  {esAseguradora(ficha.tipo_entidad) ? null : <p className="text-sm text-slate-600">No figura en la web de la marca.</p>}
                  <ul className={`list-disc space-y-1 pl-5 text-sm text-slate-700 ${esAseguradora(ficha.tipo_entidad) ? "" : "mt-2"}`}>
                    {faltantes.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </>
              ) : null}
              {ficha.inconsistencias.length ? (
                <div className={faltantes.length ? "mt-4" : ""}>
                  {faltantes.length ? <h3 className="text-sm font-semibold text-slate-900">Inconsistencias detectadas</h3> : null}
                  <ul className="mt-2 space-y-3">
                    {ficha.inconsistencias.map((item) => (
                      <li key={item.descripcion} className="text-sm text-slate-700">
                        {textoInconsistencia(item.descripcion)}{" "}
                        <a href={item.fuente_url} target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-700 underline">
                          {hostFuente(item.fuente_url)}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </Bloque>
          ) : null}

          {alternativas.length && minimo ? (
            <Bloque id="alternativas" titulo="Alternativas con precio parecido">
              <p className="text-sm text-slate-600">Precio verificado más cercano a {formatArs(minimo.precio as number)}/mes, de otras marcas.</p>
              <ul className="mt-3 divide-y divide-slate-100">
                {alternativas.map((plan) => (
                  <li key={plan.id} className="flex items-center justify-between gap-3 py-3">
                    <div>
                      <Link href={`/planes/${plan.marca_slug}#${plan.id}`} className="font-semibold text-slate-900 hover:text-indigo-700">
                        {plan.marca}
                      </Link>
                      <p className="text-sm text-slate-500">
                        {plan.nombre} · verificado {formatDate(plan.fecha_verificacion)}
                      </p>
                    </div>
                    <p className="font-mono text-sm font-semibold text-slate-900">{formatPrecioMes(plan.precio as number)}</p>
                  </li>
                ))}
              </ul>
            </Bloque>
          ) : null}

          {historial.length ? (
            <Bloque id="historial" titulo="Historial de precio">
              <div className="space-y-4">
                {historial.map((serie) => {
                  const maximo = Math.max(...serie.puntos.map((punto) => punto.precio));
                  return (
                    <div key={serie.planId}>
                      <h3 className="text-sm font-semibold text-slate-900">{serie.plan?.nombre}</h3>
                      <ul className="mt-2 flex items-end gap-3">
                        {serie.puntos.map((punto) => (
                          <li key={`${punto.fecha}-${punto.precio}`} className="flex flex-col items-center gap-1">
                            <span className="font-mono text-xs font-semibold text-slate-800">{formatArs(punto.precio)}</span>
                            <span className="w-8 rounded-t bg-indigo-600" style={{ height: `${Math.max(12, Math.round((punto.precio / maximo) * 72))}px` }} />
                            <span className="text-[10px] text-slate-500">{formatDate(punto.fecha)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </Bloque>
          ) : null}

          {ficha.otros_productos?.valor.length ? (
            <Bloque id="otros" titulo={`Otros productos de ${nombre}`}>
              <ul className="flex flex-wrap gap-2">
                {ficha.otros_productos.valor.map((producto) => (
                  <li key={producto} className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-700">
                    {producto}
                  </li>
                ))}
              </ul>
              <Fuente url={ficha.otros_productos.fuente_url} fecha={ficha.otros_productos.fecha_verificacion} />
            </Bloque>
          ) : null}

          <div id="faq" className="scroll-mt-24">
            <FAQ items={faqs} />
          </div>

          {related.length ? (
            <section>
              <h2 className="text-xl font-bold text-gray-900">Comparar con otra marca</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {related.map((pair) => (
                  <li key={pair.slug}>
                    <Link href={`/versus/${pair.slug}`} className="inline-flex rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:border-indigo-200">
                      {nombres.get(pair.a) ?? pair.a} vs {nombres.get(pair.b) ?? pair.b}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
        <aside className="mt-8 lg:col-span-4 lg:mt-0">
          <div id="quiero-que-me-contacten" className="scroll-mt-24 lg:sticky lg:top-24">
            <LeadForm marca={nombre} planes={plans.map((plan) => ({ id: plan.id, nombre: plan.nombre }))} defaultPlanId={plans[0]?.id} />
          </div>
        </aside>
      </div>
      <StickyLeadCTA />
    </div>
  );
}
