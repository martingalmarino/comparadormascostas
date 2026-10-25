import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FAQ } from "@/components/FAQ";
import { Markdown } from "@/components/Markdown";
import { formatDate } from "@/lib/format";
import { getGuide, getGuides } from "@/lib/guides";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return getGuides().map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return { title: "Guía" };
  return pageMetadata({
    title: guide.title,
    description: guide.description,
    path: `/guias/${slug}`,
  });
}

async function GuideDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ name: "Guías", path: "/guias" }, { name: guide.title, path: `/guias/${guide.slug}` }]} />
      <p className="mt-4 text-xs font-bold uppercase tracking-widest text-indigo-600">Actualizado el {formatDate(guide.updated)}</p>
      <h1 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">{guide.title}</h1>
      <p className="mt-3 text-lg text-gray-600">{guide.description}</p>
      <div className="mt-6">
        <Markdown source={guide.body} />
      </div>
      <FAQ items={guide.faq} />
    </article>
  );
}

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="px-4 py-10 text-gray-600">Cargando guía…</div>}>
      <GuideDetail params={params} />
    </Suspense>
  );
}
