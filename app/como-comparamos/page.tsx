import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FAQ } from "@/components/FAQ";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/site.config";

export const metadata = pageMetadata({
  title: "Cómo comparamos",
  description: "Metodología de MascoCompara: fuentes, precios de ejemplo, regla de 45 días y qué no hacemos.",
  path: "/como-comparamos",
});

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ name: "Cómo comparamos", path: "/como-comparamos" }]} />
      <h1 className="mt-4 text-3xl font-bold text-gray-900">Cómo comparamos</h1>
      <div className="prose-mc mt-4" id="datos-de-ejemplo">
        <p>
          {siteConfig.siteName} es un sitio independiente. Ordenamos obras sociales, planes de salud y seguros para perros y gatos con foco en Córdoba. No vendemos seguros ni intermediamos en la contratación. Si dejás tus datos, se los compartimos a la marca que elegiste para que ella te contacte.
        </p>
        <h2>Qué entra en una ficha</h2>
        <p>
          Cada plan vive en un JSON del repositorio: precio en pesos, especie, edad, zona, coberturas, carencias, fecha de verificación y URL de la fuente. Si no hay precio público, la ficha dice “Precio no publicado · Consultar”. No completamos huecos con un promedio.
        </p>
        <h2>Datos de ejemplo</h2>
        <p>
          Hasta verificar un monto en la página oficial de la marca, <strong>es_ejemplo</strong> queda en verdadero y la interfaz muestra el badge EJEMPLO. La línea de fuente dice “dato de ejemplo” y apunta a esta sección. Esos números sirven para probar el comparador. No son tarifas vigentes.
        </p>
        <h2>Cuándo un dato se pone viejo</h2>
        <p>
          Si la fecha de verificación tiene más de 45 días, el plan se muestra como desactualizado aunque el archivo diga otra cosa. Si un dato está en revisión o la marca no publica el precio, también hay un aviso visible.
        </p>
        <h2>Actualización</h2>
        <p>
          Un workflow semanal puede leer selectores configurados en <strong>data/scrapers.json</strong>. Hoy están apagados. Si en el futuro un precio cambia por encima del umbral, o la lectura falla, no se publica solo: el plan pasa a “requiere revisión” y queda un pull request para mirar el diff. El script respeta el robots.txt del sitio, usa un user agent identificable y no borra el badge de ejemplo. Esa marca la saca una persona cuando la fuente está chequeada.
        </p>
        <h2>Orden del comparador</h2>
        <p>
          Por defecto ordenamos por menor precio y dejamos al final los planes sin precio. También se puede ordenar por cantidad de coberturas o por fecha más reciente. Los filtros viven en la URL para poder compartirlos. Esas combinaciones no se indexan: el canónico del listado es /comparar.
        </p>
      </div>
      <FAQ
        items={[
          {
            q: "¿Cobran comisión?",
            a: "El modelo previsto es el de leads: la marca puede pagar por un contacto, no por una venta intermediada. En la ficha lo decimos antes de pedir tus datos.",
          },
          {
            q: "¿Puedo citar un precio de ejemplo?",
            a: "No como tarifa real. Si lo citás, tenés que decir que es un ejemplo y mostrar la fecha.",
          },
        ]}
      />
    </div>
  );
}
