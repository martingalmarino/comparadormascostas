import type { Metadata } from "next";
import { Suspense } from "react";
import { BlogListing } from "@/components/BlogListing";
import { blogIndexDescription } from "@/lib/blog";
import { siteConfig } from "@/site.config";

const title = "Guías para cuidar a tu mascota";

export const metadata: Metadata = {
  title,
  description: blogIndexDescription,
  alternates: {
    canonical: "/blog",
    types: { "application/rss+xml": "/blog/rss.xml" },
  },
  openGraph: {
    title: `${title} | ${siteConfig.siteName}`,
    description: blogIndexDescription,
    url: "/blog",
    type: "website",
    locale: "es_AR",
    siteName: siteConfig.siteName,
  },
};

export default function BlogPage() {
  return (
    <Suspense fallback={<p className="mx-auto max-w-7xl px-4 py-10 text-gray-500 sm:px-6">Cargando guías…</p>}>
      <BlogListing category={null} />
    </Suspense>
  );
}
