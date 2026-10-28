import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { blogIndexDescription, collectionJsonLd, formatBlogDate, isPublic, type BlogPost } from "@/lib/blog";
import { blogCategories, categorySlug, type BlogCategory } from "@/lib/blog-schema";

export function BlogIndexView({ posts, active, today }: { posts: BlogPost[]; active: BlogCategory | null; today: string }) {
  const publicPosts = posts.filter((post) => isPublic(post, today));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs
        items={active ? [{ name: "Blog", path: "/blog" }, { name: active, path: `/blog/categoria/${categorySlug(active)}` }] : [{ name: "Blog", path: "/blog" }]}
      />
      <header className="mx-auto mt-8 max-w-3xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600">Blog de Cuidalo</p>
        <h1 className="mt-3 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
          Guías para cuidar <span className="text-indigo-600">a tu mascota</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-gray-600">{blogIndexDescription}</p>
      </header>
      <div className="mt-8 flex flex-wrap gap-2" role="navigation" aria-label="Categorías">
        <Link
          href="/blog"
          aria-current={active ? undefined : "page"}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold ${active ? "border border-gray-200 text-gray-700 hover:border-indigo-200" : "bg-indigo-600 text-white"}`}
        >
          Todas
        </Link>
        {blogCategories.map((category) => {
          const on = active === category;
          return (
            <Link
              key={category}
              href={`/blog/categoria/${categorySlug(category)}`}
              aria-current={on ? "page" : undefined}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold ${on ? "bg-indigo-600 text-white" : "border border-gray-200 text-gray-700 hover:border-indigo-200"}`}
            >
              {category}
            </Link>
          );
        })}
      </div>
      {posts.length ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white hover:border-indigo-200"
            >
              {post.image && post.image_alt ? (
                <Image
                  src={post.image}
                  alt={post.image_alt}
                  width={post.imageWidth ?? 1600}
                  height={post.imageHeight ?? 900}
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="aspect-video w-full object-cover"
                />
              ) : null}
              <div className="flex flex-1 flex-col gap-2 p-5">
                <span className="text-xs font-bold uppercase tracking-[0.08em] text-indigo-600">{post.category}</span>
                <h2 className="text-lg font-bold leading-snug text-gray-900">{post.title}</h2>
                <p className="text-sm leading-relaxed text-gray-500">{post.description}</p>
                {post.draft ? (
                  <span className="w-fit rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">Borrador</span>
                ) : null}
                <p className="mt-auto pt-3 text-xs text-gray-500">
                  {formatBlogDate(post.date)} · {post.minutes} min de lectura
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-8 rounded-2xl border border-dashed border-indigo-200 bg-white px-4 py-8 text-center text-gray-600">
          {active ? `Todavía no hay guías de ${active.toLowerCase()}.` : "Todavía no hay guías publicadas."}
        </p>
      )}
      <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-bold text-gray-900">¿Buscás cobertura para tu mascota?</p>
          <p className="mt-1 text-sm text-gray-600">Compará planes con precio, fecha y fuente. No vendemos seguros.</p>
        </div>
        <Link
          href="/comparar"
          className="inline-flex shrink-0 items-center justify-center rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
        >
          Compará planes
        </Link>
      </div>
      <JsonLd data={collectionJsonLd(publicPosts, active ?? undefined)} />
    </div>
  );
}
