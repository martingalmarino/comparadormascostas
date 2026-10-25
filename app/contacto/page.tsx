import { Breadcrumbs } from "@/components/Breadcrumbs";
import { LeadForm } from "@/components/LeadForm";
import { requireEntry } from "@/lib/seo-copy";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/site.config";

const seo = requireEntry("/contacto");

export const metadata = pageMetadata({ ...seo, noindex: !seo.index });

export default function ContactoPage() {
  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2">
      <div>
        <Breadcrumbs items={[{ name: "Contacto", path: "/contacto" }]} />
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Contacto</h1>
        <p className="mt-3 text-gray-600">
          Este formulario nos escribe a nosotros, no a una marca. Si querés que te contacte una prestadora, entrá a su ficha. También podés escribir a {siteConfig.contactEmail}.
        </p>
      </div>
      <LeadForm marca="Consulta general" />
    </div>
  );
}
