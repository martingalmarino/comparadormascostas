import type { ReactNode } from "react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DirectAnswer } from "@/components/DirectAnswer";
import { FAQ } from "@/components/FAQ";
import { JsonLd } from "@/components/JsonLd";
import { PlanCard } from "@/components/PlanCard";
import { applyFilters } from "@/lib/filters";
import { getPlans, newestVerification } from "@/lib/plans";
import { offersItemListJsonLd } from "@/lib/seo";
import type { Especie } from "@/lib/plan-schema";

export function SpeciesPlans({
  especie,
  today,
  heading,
  crumb,
  intro,
  answer,
  faqs,
  children,
}: {
  especie: Especie;
  today: string;
  heading: string;
  crumb: string;
  intro: string;
  answer: string;
  faqs: { q: string; a: string }[];
  children?: ReactNode;
}) {
  const plans = applyFilters(getPlans(), { especie, cob: [], ids: [], orden: "precio" });
  const path = especie === "perro" ? "/seguro-para-perros" : "/seguro-para-gatos";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ name: crumb, path }]} />
      <h1 className="mt-4 text-3xl font-bold text-gray-900 sm:text-4xl">{heading}</h1>
      <DirectAnswer text={answer} />
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
      <JsonLd data={offersItemListJsonLd(plans, today, heading, newestVerification(plans))} />
    </div>
  );
}
