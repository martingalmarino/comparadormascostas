import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BlogListing } from "@/components/BlogListing";
import { blogCategories, categoryFromSlug, categorySlug, type BlogCategory } from "@/lib/blog-schema";
import { siteConfig } from "@/site.config";

export function generateStaticParams() {
  return blogCategories.map((category) => ({ slug: categorySlug(category) }));
}

function description(category: BlogCategory) {
  return `Guías de ${category.toLowerCase()} para cuidar perros y gatos, con fuentes citadas y fecha de actualización.`;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = categoryFromSlug(slug);
  if (!category) return { title: "Categoría no encontrada", robots: { index: false, follow: false } };
  const path = `/blog/categoria/${categorySlug(category)}`;
  const text = description(category);
  const title = `Guías de ${category.toLowerCase()}`;
  return {
    title,
    description: text,
    alternates: { canonical: path, types: { "application/rss+xml": "/blog/rss.xml" } },
    openGraph: {
      title: `${title} | ${siteConfig.siteName}`,
      description: text,
      url: path,
      type: "website",
      locale: "es_AR",
      siteName: siteConfig.siteName,
    },
  };
}

async function Category({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = categoryFromSlug(slug);
  if (!category) notFound();
  return <BlogListing category={category} />;
}

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<p className="mx-auto max-w-7xl px-4 py-10 text-gray-500 sm:px-6">Cargando guías…</p>}>
      <Category params={params} />
    </Suspense>
  );
}
