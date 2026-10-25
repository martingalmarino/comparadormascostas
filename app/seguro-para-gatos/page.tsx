import { SpeciesPlans } from "@/components/SpeciesPlans";
import { getReferenceDate } from "@/lib/dates";
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
      intro="No todos los planes de perro aceptan gatos. En esta página quedan los que declaran cobertura para gatos. Si el precio dice “Consultar precio”, la fuente no lo publicó y el número no lo inventamos."
      faqs={[
        {
          q: "¿La triple felina entra en la vacunación?",
          a: "Solo si la ficha lo dice. Leé el ítem de vacunación de cada plan: el texto es el que trajo la fuente.",
        },
        {
          q: "¿Puedo comparar un plan de gatos con uno de perros?",
          a: "Sí, desde el comparador, pero un plan marcado solo para perros no va a aparecer cuando filtres por gato.",
        },
      ]}
    />
  );
}
