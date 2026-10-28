import Image from "next/image";
import Link from "next/link";
import { BlogBody } from "@/components/BlogBody";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { LeadForm } from "@/components/LeadForm";
import { articleJsonLd, followLinks, formatBlogDate, loadPosts, type BlogPost } from "@/lib/blog";
import { categorySlug } from "@/lib/blog-schema";
import { PenLine } from "lucide-react";

function CompareInline() {
  return (
    <div className="my-8 flex flex-col gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-bold text-gray-900">¿Tu plan cubre esto?</p>
        <p className="mt-1 text-sm text-gray-600">Compará coberturas, carencias y topes. Cuidalo es un comparador: no vende seguros.</p>
      </div>
      <Link
        href="/comparar"
        className="inline-flex shrink-0 items-center justify-center rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
      >
        Compará planes
      </Link>
    </div>
  );
}

export function BlogArticle({ post, preview }: { post: BlogPost; preview: boolean }) {
  const links = followLinks(post, loadPosts());
  const published = formatBlogDate(post.date);
  const updated = post.updated ? formatBlogDate(post.updated) : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs
        items={[
          { name: "Blog", path: "/blog" },
          { name: post.category, path: `/blog/categoria/${categorySlug(post.category)}` },
          { name: post.title, path: `/blog/${post.slug}` },
        ]}
      />
      {preview ? (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Este archivo no está publicado{post.draft ? " (borrador)" : " (fecha futura)"}. En producción esta URL no se ve.
        </p>
      ) : null}
      <div className="mt-6 lg:grid lg:grid-cols-[220px_minmax(0,42rem)] lg:gap-12">
        <BlogBody post={post} />
        <article>
          {post.image && post.image_alt ? (
            <Image
              src={post.image}
              alt={post.image_alt}
              width={post.imageWidth ?? 1600}
              height={post.imageHeight ?? 900}
              priority
              sizes="(min-width: 1024px) 42rem, calc(100vw - 2rem)"
              className="mb-5 aspect-video w-full rounded-2xl object-cover"
            />
          ) : null}
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-indigo-600">{post.category}</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">{post.title}</h1>
          <div className="mt-4 flex items-center gap-3 border-y border-gray-200 py-3 text-sm text-gray-600">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
              <PenLine className="size-4" aria-hidden="true" />
            </span>
            <p>
              <span className="font-semibold text-gray-900">{post.author}</span>
              {post.reviewed_by ? (
                <>
                  {" "}
                  · Revisado por <span className="font-semibold text-gray-900">{post.reviewed_by}</span>
                </>
              ) : null}
              <br />
              Publicado {published}
              {updated ? ` · Actualizado ${updated}` : ""} · {post.minutes} min de lectura
            </p>
          </div>
          {post.direct_answer ? (
            <div className="mt-6 rounded-2xl border-2 border-indigo-600 bg-indigo-50 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-indigo-800">Respuesta directa</p>
              <p className="mt-2 leading-relaxed text-gray-800">{post.direct_answer}</p>
            </div>
          ) : null}
          {post.category === "Cuidados" ? (
            <p className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">Esto no reemplaza la consulta con tu veterinario.</p>
          ) : null}
          <BlogBody post={post} cta={<CompareInline />} mode="body" />
          <section id="segui-comparando" className="mt-12 scroll-mt-24">
            <h2 className="text-2xl font-bold text-gray-900">Seguí comparando</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {links.map((link) => (
                <Link key={link.href} href={link.href} className="rounded-xl border border-gray-200 bg-white p-3 hover:border-indigo-200">
                  <span className="block text-sm font-semibold text-gray-900">{link.label}</span>
                  <span className="mt-1 block text-xs font-normal text-gray-500">{link.href}</span>
                </Link>
              ))}
            </div>
          </section>
          <div className="mt-10">
            <LeadForm marca="Consulta general" />
          </div>
        </article>
      </div>
      <JsonLd data={articleJsonLd(post)} />
    </div>
  );
}
