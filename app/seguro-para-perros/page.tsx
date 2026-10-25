import Link from "next/link";
import { SpeciesPlans } from "@/components/SpeciesPlans";
import { getReferenceDate } from "@/lib/dates";
import { faqsEspecie, respuestaDirecta } from "@/lib/geo";
import { requireEntry } from "@/lib/seo-copy";
import { pageMetadata } from "@/lib/seo";

const seo = requireEntry("/seguro-para-perros");

export const metadata = pageMetadata({ ...seo, noindex: !seo.index });

export default async function Page() {
  const today = await getReferenceDate();
  return (
    <SpeciesPlans
      especie="perro"
      today={today}
      heading={seo.h1}
      crumb="Seguro para perros"
      intro="Un seguro o una obra social para perros suele cubrir accidentes y, según el plan, consultas, vacunas o cirugías. Conviene cruzar el precio publicado con la edad tope, la carencia y si la clínica que usás está en la cartilla."
      answer={respuestaDirecta({ tipo: "especie", today, especie: "perro" })}
      faqs={faqsEspecie("perro", today)}
    >
      <section className="mt-12 max-w-3xl">
        <h2 className="text-2xl font-bold text-gray-900">Perros mayores</h2>
        <p className="mt-3 text-gray-600">
          El tope de edad lo publica cada marca. Si tu perro ya lo pasó, el comparador con la edad en meses deja afuera los planes que no lo cubren. Las carencias y las preexistencias no las completamos nosotros: si la ficha no trae días, pedí el condicionado antes de anotarlo.
        </p>
        <p className="mt-3">
          <Link href="/comparar?especie=perro&meses=120" className="font-bold text-indigo-700 hover:underline">
            Ver planes para un perro de 10 años
          </Link>
        </p>
      </section>
      <section className="mt-10 max-w-3xl">
        <h2 className="text-2xl font-bold text-gray-900">Responsabilidad civil y razas</h2>
        <p className="mt-3 text-gray-600">
          Algunos planes suman responsabilidad civil por daños a terceros. En la ficha de Federación Patronal el ítem de cobertura dice “RC $5M a $20M” y el precio no está publicado. Si tu perro es de una raza que la normativa de tu municipio trata como potencialmente peligrosa, confirmalo en la fuente oficial y en el condicionado de la marca. Esta página no reemplaza ese texto.
        </p>
      </section>
    </SpeciesPlans>
  );
}
