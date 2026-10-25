import { Breadcrumbs } from "@/components/Breadcrumbs";
import { LawyerBanner } from "@/components/LawyerBanner";
import { requireEntry } from "@/lib/seo-copy";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/site.config";

const seo = requireEntry("/privacidad");

export const metadata = pageMetadata({ ...seo, noindex: !seo.index });

export default function PrivacidadPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ name: "Privacidad", path: "/privacidad" }]} />
      <h1 className="mt-4 text-3xl font-bold text-gray-900">Política de privacidad</h1>
      <div className="mt-4">
        <LawyerBanner />
      </div>
      <div className="prose-mc mt-6">
        <p>Esta política aplica al sitio {siteConfig.siteName} ({siteConfig.domain}). Última actualización: 24 de octubre de 2026.</p>
        <h2>Responsable</h2>
        <p>
          El responsable del tratamiento de los datos que cargás en los formularios es quien opere {siteConfig.siteName}. Contacto: {siteConfig.contactEmail}. Antes del lanzamiento hay que completar la razón social, el domicilio en Argentina y el medio real de contacto.
        </p>
        <h2>Qué datos pedimos</h2>
        <ul>
          <li>Nombre.</li>
          <li>WhatsApp.</li>
          <li>Email, si lo completás.</li>
          <li>Especie, edad y zona de la mascota.</li>
          <li>El plan o la marca que elegiste, y un mensaje si escribís por contacto general.</li>
          <li>La fecha y la hora, la dirección IP y el texto del consentimiento que aceptaste.</li>
        </ul>
        <h2>Para qué los usamos</h2>
        <p>
          Si pedís que te contacten por un plan, la finalidad es derivar esa consulta a la marca elegida para que ella te responda. Si escribís por el formulario de contacto, la finalidad es responderte nosotros. No usamos esos datos para vender un seguro ni para decidir una contratación.
        </p>
        <h2>Destinatarios</h2>
        <p>
          El destinatario de un lead es la marca que elegiste en la ficha. No compartimos ese formulario con el resto de las marcas. También pueden intervenir los proveedores que alojan el sitio, el envío de email o la base donde se guarda el lead (por ejemplo Vercel, Resend o una planilla), solo para prestar ese servicio.
        </p>
        <h2>Conservación</h2>
        <p>Guardamos la consulta el tiempo necesario para derivarla y para atender un reclamo sobre ese consentimiento. Después se suprime o se anonimiza.</p>
        <h2>Derechos</h2>
        <p>
          Podés pedir acceso, rectificación y supresión de tus datos, y la actualización cuando corresponda, en los términos de los artículos 14, 15 y 16 de la Ley 25.326. Escribinos a {siteConfig.contactEmail}. El acceso es gratuito en los plazos de la ley.
        </p>
        <h2>Cookies, medición y publicidad</h2>
        <p>
          El sitio puede usar Vercel Analytics y, si lo aceptás en el banner, Google Analytics 4. Ese script no se carga hasta que aceptás. No hay bloques de publicidad en las páginas. Podés rechazar la medición y seguir usando el comparador.
        </p>
        <h2>Leyenda de la AAIP</h2>
        <p>
          El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos en forma gratuita a intervalos no inferiores a seis meses, salvo que se acredite un interés legítimo al efecto conforme lo establecido en el artículo 14, inciso 3 de la Ley Nº 25.326.
        </p>
        <p>
          La AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA, en su carácter de Órgano de Control de la Ley Nº 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes en materia de protección de datos personales.
        </p>
      </div>
    </div>
  );
}
