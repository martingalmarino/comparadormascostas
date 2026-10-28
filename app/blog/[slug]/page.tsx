import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BlogArticle } from "@/components/BlogArticle";
import { articleImage, isPublic, loadPosts, selectPosts } from "@/lib/blog";
import { getReferenceDate } from "@/lib/dates";
import { publicRobots } from "@/lib/seo";
import { siteConfig } from "@/site.config";

export const instant = false;

export async function generateStaticParams() {
  const today = await getReferenceDate();
  const published = selectPosts(today, false);
  if (published.length) return published.map((post) => ({ slug: post.slug }));
  const fallback = loadPosts()[0];
  return [{ slug: fallback?.slug ?? "sin-guias" }];
}

async function publishedPost(slug: string, today: string) {
  "use cache";
  cacheLife({ revalidate: 86400 });
  const post = loadPosts().find((item) => item.slug === slug) ?? null;
  if (!post || !isPublic(post, today)) return null;
  return post;
}

async function resolvePost(slug: string, today: string) {
  if (process.env.NODE_ENV !== "production") return loadPosts().find((item) => item.slug === slug) ?? null;
  return publishedPost(slug, today);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const today = await getReferenceDate();
  const post = await resolvePost(slug, today);
  if (!post) return { title: "Guía no encontrada", robots: { index: false, follow: false } };
  const path = `/blog/${post.slug}`;
  const title = `${post.title} | ${siteConfig.siteName}`;
  const image = articleImage(post);
  return {
    title: { absolute: title },
    description: post.description,
    alternates: { canonical: path, types: { "application/rss+xml": "/blog/rss.xml" } },
    openGraph: {
      title,
      description: post.description,
      url: path,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      section: post.category,
      locale: "es_AR",
      siteName: siteConfig.siteName,
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description: post.description, images: [image] },
    robots: post.draft || post.date > today ? { index: false, follow: false } : publicRobots,
  };
}

async function Article({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const today = await getReferenceDate();
  const post = await resolvePost(slug, today);
  if (!post) notFound();
  if (!isPublic(post, today) && process.env.NODE_ENV === "production") notFound();
  return <BlogArticle post={post} preview={!isPublic(post, today)} />;
}

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<p className="mx-auto max-w-7xl px-4 py-10 text-gray-500 sm:px-6">Cargando guía…</p>}>
      <Article params={params} />
    </Suspense>
  );
}
