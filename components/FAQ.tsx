import { JsonLd } from "@/components/JsonLd";
import { faqJsonLd } from "@/lib/seo";

export function FAQ({ items, title = "Preguntas frecuentes" }: { items: { q: string; a: string }[]; title?: string }) {
  if (!items.length) return null;
  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      <div className="mt-4 divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white">
        {items.map((item) => (
          <details key={item.q} className="group px-4 py-3">
            <summary className="cursor-pointer font-semibold text-gray-900">{item.q}</summary>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.a}</p>
          </details>
        ))}
      </div>
      <JsonLd data={faqJsonLd(items)} />
    </section>
  );
}
