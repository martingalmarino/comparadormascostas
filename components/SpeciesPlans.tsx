import type { ReactNode } from "react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FAQ } from "@/components/FAQ";
import { PlanCard } from "@/components/PlanCard";
import { applyFilters } from "@/lib/filters";
import { getPlans } from "@/lib/plans";
import type { Especie } from "@/lib/plan-schema";

export function SpeciesPlans({
  especie,
  today,
  heading,
  crumb,
  intro,
  faqs,
  children,
}: {
  especie: Especie;
  today: string;
  heading: string;
  crumb: string;
  intro: string;
  faqs: { q: string; a: string }[];
  children?: ReactNode;
}) {
  const plans = applyFilters(getPlans(), { especie, cob: [], ids: [], orden: "precio" });
  const path = especie === "perro" ? "/seguro-para-perros" : "/seguro-para-gatos";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ name: crumb, path }]} />
      <h1 className="mt-4 text-3xl font-bold text-gray-900 sm:text-4xl">{heading}</h1>
      <p className="mt-3 max-w-3xl text-gray-600">{intro}</p>
      <p className="mt-4">
        <Link href={`/comparar?especie=${especie}`} className="font-bold text-indigo-700 hover:underline">
          Abrir el comparador solo para {especie === "perro" ? "perros" : "gatos"}
        </Link>
      </p>
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} today={today} />
        ))}
      </div>
      {children}
      <FAQ items={faqs} />
    </div>
  );
}
