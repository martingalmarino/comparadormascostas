import Link from "next/link";
import { ProvinciaView } from "@/components/ProvinciaView";
import { requireEntry } from "@/lib/seo-copy";
import { pageMetadata } from "@/lib/seo";

const seo = requireEntry("/cordoba");

export const metadata = pageMetadata({ ...seo, noindex: !seo.index });

export default function CordobaPage() {
  return (
    <ProvinciaView
      slug="cordoba"
      extra={
        <p className="mt-6 text-sm text-gray-600">
          Para saber qué preguntarle a una veterinaria antes de anotar a tu mascota, mirá{" "}
          <Link href="/cordoba/veterinarias-con-plan" className="font-semibold text-indigo-700 underline">
            veterinarias con plan
          </Link>
          .
        </p>
      }
    />
  );
}
