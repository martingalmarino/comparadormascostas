import { SpeciesPlans } from "@/components/SpeciesPlans";
import { getReferenceDate } from "@/lib/dates";
import { faqsEspecie, respuestaDirecta } from "@/lib/geo";
import { requireEntry } from "@/lib/seo-copy";
import { pageMetadata } from "@/lib/seo";

const seo = requireEntry("/seguro-para-gatos");

export const metadata = pageMetadata({ ...seo, noindex: !seo.index });

export default async function Page() {
  const today = await getReferenceDate();
  return (
    <SpeciesPlans
      especie="gato"
      today={today}
      heading={seo.h1}
      crumb="Seguro para gatos"
      intro="No todos los planes de perro aceptan gatos. En esta página quedan los que declaran cobertura para gatos. Si el precio dice “Precio a consultar”, la fuente no lo publicó y el número no lo inventamos."
      answer={respuestaDirecta({ tipo: "especie", today, especie: "gato" })}
      faqs={faqsEspecie("gato", today)}
    />
  );
}
