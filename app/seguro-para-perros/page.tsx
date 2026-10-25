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
      intro="Un seguro para perros suele cubrir accidentes y, según el plan, consultas, vacunas o cirugías. En Córdoba conviene cruzar el precio de ejemplo con la edad tope, la carencia y si la clínica de tu barrio está en la cartilla. Los montos de esta página son ilustrativos."
      faqs={[
        {
          q: "¿Cubre perros mayores?",
          a: "Depende del tope de edad del plan. En los ejemplos, algunos cortan a los 8 o 10 años y otros llegan más lejos. Mirá la guía de perros mayores.",
        },
        {
          q: "¿Hay carencia en los accidentes?",
          a: "En varios ejemplos el accidente es inmediato y la consulta o la cirugía esperan semanas. Confirmalo en el condicionado de la marca.",
        },
      ]}
    />
  );
}
