import type { ReactNode } from "react";
import { FAQ } from "@/components/FAQ";
import type { BlogPost } from "@/lib/blog";
import { parseBlocks, splitForCta, type BlogBlock } from "@/lib/blog-body";

function BlockView({ block }: { block: BlogBlock }) {
  if (block.type === "h2" || block.type === "h3") {
    const className = block.type === "h2" ? "mt-8 scroll-mt-24 text-2xl font-bold text-gray-900" : "mt-6 scroll-mt-24 text-xl font-bold text-gray-900";
    const Tag = block.type;
    return <Tag id={block.id} className={className}>{block.text}</Tag>;
  }
  if (block.type === "p") {
    return <p className="mt-3 leading-relaxed text-gray-700" dangerouslySetInnerHTML={{ __html: block.html }} />;
  }
  if (block.type === "ul" || block.type === "ol") {
    const Tag = block.type;
    return (
      <Tag className={`mt-3 space-y-1 pl-5 leading-relaxed text-gray-700 ${block.type === "ul" ? "list-disc" : "list-decimal"}`}>
        {block.items.map((item, index) => (
          <li key={`${index}-${item}`} dangerouslySetInnerHTML={{ __html: item }} />
        ))}
      </Tag>
    );
  }
  if (block.type === "quote") {
    return (
      <blockquote className="my-4 rounded-r-xl border-l-4 border-indigo-600 bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-800">
        <p dangerouslySetInnerHTML={{ __html: block.html }} />
        {block.source ? <p className="mt-2 text-xs text-gray-500" dangerouslySetInnerHTML={{ __html: block.source }} /> : null}
      </blockquote>
    );
  }
  if (block.type === "code") {
    return <pre className="my-4 overflow-x-auto rounded-xl bg-gray-900 p-4 text-sm text-gray-100">{block.text}</pre>;
  }
  return null;
}

export function tocItems(post: BlogPost) {
  const headings = parseBlocks(post.body).flatMap((block) => (block.type === "h2" ? [{ id: block.id, text: block.text }] : []));
  if (post.faq.length) headings.push({ id: "preguntas-frecuentes", text: "Preguntas frecuentes" });
  headings.push({ id: "fuentes", text: "Fuentes" });
  headings.push({ id: "segui-comparando", text: "Seguí comparando" });
  return headings;
}

function Toc({ post }: { post: BlogPost }) {
  const items = tocItems(post);
  return (
    <div>
      <details className="rounded-xl border border-gray-200 bg-white px-4 py-3 lg:hidden">
        <summary className="cursor-pointer text-sm font-semibold text-gray-800">En esta guía ({items.length})</summary>
        <nav aria-label="En esta guía" className="mt-3 border-l-2 border-indigo-100 pl-3">
          {items.map((item) => (
            <a key={item.id} href={`#${item.id}`} className="block py-1.5 text-sm text-gray-600 hover:text-indigo-700">
              {item.text}
            </a>
          ))}
        </nav>
      </details>
      <nav aria-label="En esta guía" className="sticky top-24 hidden border-l-2 border-indigo-100 pl-4 lg:block">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-gray-500">En esta guía</p>
        {items.map((item) => (
          <a key={item.id} href={`#${item.id}`} className="mt-2 block text-sm text-gray-600 hover:text-indigo-700">
            {item.text}
          </a>
        ))}
      </nav>
    </div>
  );
}

export function BlogBody({ post, cta, mode = "toc" }: { post: BlogPost; cta?: ReactNode; mode?: "toc" | "body" }) {
  if (mode === "toc") return <Toc post={post} />;

  const blocks = parseBlocks(post.body);
  const { before, after } = splitForCta(blocks);

  return (
    <div className="blog-body">
      {before.map((block, index) => (
        <BlockView key={`${block.type}-${index}`} block={block} />
      ))}
      {cta}
      {after.map((block, index) => (
        <BlockView key={`${block.type}-b-${index}`} block={block} />
      ))}
      {post.faq.length ? (
        <div id="preguntas-frecuentes" className="scroll-mt-24">
          <FAQ items={post.faq} />
        </div>
      ) : null}
      <section id="fuentes" className="mt-12 scroll-mt-24">
        <h2 className="text-2xl font-bold text-gray-900">Fuentes</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-gray-700">
          {post.sources.map((source) => (
            <li key={`${source.url}-${source.title}`}>
              <a href={source.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-700 underline underline-offset-2">
                {source.title}
                {source.publisher ? ` · ${source.publisher}` : ""}
              </a>
              {source.accessed ? <span className="text-gray-500"> · consultado {source.accessed}</span> : null}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
