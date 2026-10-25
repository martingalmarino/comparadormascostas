import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { siteConfig } from "@/site.config";

export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  const all = [{ name: "Inicio", path: "/" }, ...items];
  return (
    <>
      <nav aria-label="Miga de pan" className="text-sm text-gray-500">
        <ol className="flex flex-wrap items-center gap-1">
          {all.map((item, index) => {
            const last = index === all.length - 1;
            return (
              <li key={item.path} className="flex items-center gap-1">
                {index > 0 ? <span aria-hidden="true">/</span> : null}
                {last ? (
                  <span aria-current="page" className="text-gray-800">
                    {item.name}
                  </span>
                ) : (
                  <Link href={item.path} className="hover:text-indigo-700">
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: `${siteConfig.domain}${item.path}`,
          })),
        }}
      />
    </>
  );
}
