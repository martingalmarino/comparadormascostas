import { Breadcrumbs } from "@/components/Breadcrumbs";
import { LawyerBanner } from "@/components/LawyerBanner";
import { requireEntry } from "@/lib/seo-copy";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/site.config";

const seo = requireEntry("/terminos");

export const metadata = pageMetadata({ ...seo, noindex: !seo.index });

export default function TerminosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ name: "Términos", path: "/terminos" }]} />
      <h1 className="mt-4 text-3xl font-bold text-gray-900">Términos y condiciones</h1>
      <div className="mt-4">
        <LawyerBanner />
      </div>
      <div className="prose-mc mt-6">
        <p>Estos términos regulan el uso de {siteConfig.siteName}. Si no estás de acuerdo, no uses el sitio.</p>
        <h2>Qué es el sitio</h2>
        <p>
          Es un comparador independiente de información sobre obras sociales, planes de salud y seguros para mascotas en Argentina. No somos una aseguradora, no somos productores asesores de seguros y no intermediamos en la contratación. Un pedido de contacto solo deriva tus datos a la marca que elegiste.
        </p>
        <h2>Precios y contenidos</h2>
        <p>
          Mientras un precio lleve el badge EJEMPLO, es ilustrativo. Una ficha puede estar desactualizada si la verificación tiene más de {siteConfig.priceStaleDays} días. La decisión de contratar es tuya y de la marca. No garantizamos que una clínica esté en cartilla ni que una cobertura se aplique a tu mascota.
        </p>
        <h2>Contenido informativo</h2>
        <p>Las páginas de perros, gatos y metodología son informativas. No son asesoramiento legal, veterinario ni de seguros. Las normas sobre perros potencialmente peligrosos tenés que leerlas en la fuente oficial.</p>
        <h2>Uso aceptable</h2>
        <p>No uses los formularios para cargar datos de otra persona sin su consentimiento, ni para automatizar envíos. Podemos rechazar una consulta que parezca abusiva.</p>
        <h2>Propiedad</h2>
        <p>Los textos del sitio son de quien lo opera. Las marcas comparadas pertenecen a sus titulares y aparecen para identificar los planes.</p>
        <h2>Responsabilidad</h2>
        <p>
          En la medida que permita la ley argentina, no respondemos por decisiones tomadas solo con un precio de ejemplo ni por el trato que te dé la marca después de la derivación.
        </p>
        <h2>Ley aplicable</h2>
        <p>Estos términos se rigen por las leyes de la República Argentina. Los tribunales ordinarios de la ciudad de Córdoba son competentes, salvo norma imperativa en contrario.</p>
      </div>
    </div>
  );
}
