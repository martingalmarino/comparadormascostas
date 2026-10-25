import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { founder } from "@/lib/geo";
import { requireEntry } from "@/lib/seo-copy";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/site.config";

const seo = requireEntry("/sobre-nosotros");

export const metadata = pageMetadata({ ...seo, noindex: !seo.index });

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ name: "Sobre nosotros", path: "/sobre-nosotros" }]} />
      <h1 className="mt-4 text-3xl font-bold text-gray-900">{seo.h1}</h1>
      <div className="prose-mc mt-4">
        <p>
          {siteConfig.siteName} lo desarrolla {founder.name}. Es un comparador independiente de obras sociales, planes de salud y seguros para perros y gatos en Argentina. No vende seguros ni intermedia la contratación: si pedís contacto, te deriva a la marca que elegiste.
        </p>
        <h2>Independencia</h2>
        <p>
          Los precios, las coberturas y las zonas salen de la ficha de cada marca, con fecha de verificación y fuente. {siteConfig.siteName} no completa un monto que la marca no publicó. El orden por defecto del comparador es el menor precio publicado.
        </p>
        <h2>Cómo se financia</h2>
        <p>
          El sitio se financia con dos vías. La primera son los leads: si marcás el consentimiento, tus datos se comparten con la marca para que ella te contacte. La segunda es publicidad. Ninguna de las dos cambia el precio que ves ni esconde un plan.
        </p>
        <h2>Contacto</h2>
        <p>
          Para corregir un dato o escribirle a quien hace el sitio, usá{" "}
          <a href={`mailto:${founder.email}`}>{founder.email}</a>
          {siteConfig.contactEmail ? (
            <>
              {" "}
              o el correo público <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
            </>
          ) : null}
          . También está la página de <Link href="/contacto">contacto</Link> y la de{" "}
          <Link href="/como-comparamos">cómo comparamos</Link>.
        </p>
      </div>
    </div>
  );
}
