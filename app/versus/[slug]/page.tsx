import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PriceTag } from "@/components/PriceTag";
import { StatusNotice } from "@/components/StatusNotice";
import { getReferenceDate } from "@/lib/dates";
import { formatDate } from "@/lib/format";
import { resolveComparable, versusPairs } from "@/lib/plans";
import type { Plan } from "@/lib/plan-schema";
import { pageMetadata } from "@/lib/seo";
import { tipoOptions } from "@/lib/zones";

export function generateStaticParams() {
  return versusPairs().map((pair) => ({ slug: pair.slug }));
}

function names(slug: string) {
  const parts = slug.split("-vs-");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  return [parts[0], parts[1]] as const;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const parsed = names(slug);
  if (!parsed) return { title: "Comparación" };
  const [left, right] = parsed;
  const a = resolveComparable(left);
  const b = resolveComparable(right);
  if (!a || !b) return { title: "Comparación" };
  return pageMetadata({
    title: `${a.marca} vs ${b.marca}`,
    description: `Comparación de ejemplo entre ${a.marca} ${a.nombre} y ${b.marca} ${b.nombre}: precio, coberturas y carencias.`,
    path: `/versus/${[left, right].sort().join("-vs-")}`,
  });
}

function Cell({ plan, today }: { plan: Plan; today: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">{plan.marca}</p>
      <h2 className="text-xl font-bold text-gray-900">{plan.nombre}</h2>
      <p className="mt-1 text-sm text-gray-500">{tipoOptions.find((item) => item.id === plan.tipo)?.label}</p>
      <div className="mt-3">
        <PriceTag plan={plan} today={today} />
      </div>
      <p className="mt-2 text-xs text-gray-500">Verificado el {formatDate(plan.fecha_verificacion)}</p>
      <StatusNotice plan={plan} today={today} />
      <Link href={`/planes/${plan.marca_slug}#${plan.id}`} className="mt-4 inline-flex rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white">
        Ver ficha
      </Link>
    </div>
  );
}

async function VersusDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const parsed = names(slug);
  if (!parsed) notFound();
  const canonical = [...parsed].sort().join("-vs-");
  if (slug !== canonical) redirect(`/versus/${canonical}`);
  const left = resolveComparable(parsed[0]);
  const right = resolveComparable(parsed[1]);
  if (!left || !right || left.id === right.id) notFound();
  const today = await getReferenceDate();
  const coverageNames = [...new Set([...left.coberturas, ...right.coberturas].map((item) => item.item))];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Breadcrumbs
        items={[
          { name: "Comparador", path: "/comparar" },
          { name: `${left.marca} vs ${right.marca}`, path: `/versus/${canonical}` },
        ]}
      />
      <h1 className="mt-4 text-3xl font-bold text-gray-900 sm:text-4xl">
        {left.marca} vs {right.marca}
      </h1>
      <p className="mt-2 text-gray-600">
        Comparación directa de los planes de ejemplo {left.nombre} y {right.nombre}. No es una recomendación de contratación.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-5">
          <Cell plan={left} today={today} />
        </section>
        <section className="rounded-2xl border border-gray-200 bg-white p-5">
          <Cell plan={right} today={today} />
        </section>
      </div>
      <div className="mt-8 overflow-x-auto rounded-2xl border border-gray-200 bg-white">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <caption className="sr-only">Diferencias de cobertura</caption>
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Cobertura</th>
              <th className="px-4 py-3">{left.marca}</th>
              <th className="px-4 py-3">{right.marca}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {coverageNames.map((name) => (
              <tr key={name}>
                <th scope="row" className="px-4 py-3 font-medium text-gray-800">{name}</th>
                <td className="px-4 py-3 text-gray-600">{left.coberturas.find((item) => item.item === name)?.valor ?? "No figura"}</td>
                <td className="px-4 py-3 text-gray-600">{right.coberturas.find((item) => item.item === name)?.valor ?? "No figura"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="px-4 py-10 text-gray-600">Cargando comparación…</div>}>
      <VersusDetail params={params} />
    </Suspense>
  );
}
