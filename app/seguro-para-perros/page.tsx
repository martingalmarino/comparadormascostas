import { SpeciesPlans } from "@/components/SpeciesPlans";
import { getReferenceDate } from "@/lib/dates";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Seguro para perros en Córdoba",
  description: "Qué mirar en un seguro o plan de salud para perros en Córdoba: precio, carencias, edad máxima y cartilla veterinaria.",
  path: "/seguro-para-perros",
});

export default async function Page() {
  const today = await getReferenceDate();
  return (
    <SpeciesPlans
      especie="perro"
      today={today}
      intro="Un seguro para perros suele cubrir accidentes y, según el plan, consultas, vacunas o cirugías. En Córdoba conviene cruzar el precio publicado con la edad tope, la carencia y si la clínica de tu barrio está en la cartilla."
      faqs={[
        {
          q: "¿Cubre perros mayores?",
          a: "Depende del tope de edad que publique la fuente. En el relevamiento hay planes que cortan a los 8 o 9 años y otros que llegan más lejos. Mirá la guía de perros mayores.",
        },
        {
          q: "¿Hay carencia en los accidentes?",
          a: "Solo si la ficha lo trae de la fuente. Si no detalla días, pedí el condicionado a la marca antes de darlo por inmediato.",
        },
      ]}
    />
  );
}
