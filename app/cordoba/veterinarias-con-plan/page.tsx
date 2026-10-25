import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FAQ } from "@/components/FAQ";
import { requireEntry } from "@/lib/seo-copy";
import { pageMetadata } from "@/lib/seo";

const seo = requireEntry("/cordoba/veterinarias-con-plan");

export const metadata = pageMetadata({ ...seo, noindex: !seo.index });

export default function VeterinariasPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Breadcrumbs
        items={[
          { name: "Córdoba", path: "/cordoba" },
          { name: "Veterinarias con plan", path: "/cordoba/veterinarias-con-plan" },
        ]}
      />
      <p className="mt-4 text-xs font-bold uppercase tracking-widest text-indigo-600">Actualizado el 24/10/2026</p>
      <h1 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">{seo.h1}</h1>
      <div className="prose-mc mt-4">
        <p>
          Un plan barato no sirve si la guardia que usás en Cerro de las Rosas, Alberdi o el Centro no está adherida. Esta página no es un directorio de clínicas: el listado verificado lo publica cada marca y cambia seguido.
        </p>
        <p>Antes de pedir que te contacten, anotá estas preguntas:</p>
        <ul>
          <li>¿Mi veterinaria está en cartilla o el plan paga un reintegro si voy por fuera?</li>
          <li>¿La guardia de noche es la misma red que la consulta programada?</li>
          <li>¿Hay copago en Nueva Córdoba y otro en el interior?</li>
          <li>¿El plan cubre solo la consulta o también la medicación que sale de esa visita?</li>
        </ul>
        <p>
          Si la ficha dice “Precio a consultar”, no completamos el número. Pedile la cotización a la marca y comparala con el{" "}
          <Link href="/comparar">comparador</Link>.
        </p>
      </div>
      <FAQ
        items={[
          {
            q: "¿Van a publicar clínicas con nombre y dirección?",
            a: "Cuando tengamos una cartilla verificada con fecha y fuente, sí. Hasta entonces no inventamos veterinarias adheridas.",
          },
          {
            q: "¿Una clínica de barrio implica que el plan me cubre en toda la ciudad?",
            a: "No. El comparador filtra por provincia. Si la ficha nombra una ciudad, es un dato de la fuente: preguntale a la marca si tu veterinaria está en cartilla.",
          },
        ]}
      />
    </div>
  );
}
