import { avisoAdicionalHogar, esAdicionalHogar } from "@/lib/hogar-adicional";

export function HogarNotice({ slug }: { slug: string }) {
  if (!esAdicionalHogar(slug)) return null;
  return (
    <p className="mt-2 inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900">{avisoAdicionalHogar}</p>
  );
}
