import { ArrowRight, CalendarCheck, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { HogarNotice } from "@/components/HogarNotice";
import { LeadForm } from "@/components/LeadForm";
import { formatArs, formatDate } from "@/lib/format";
import { logoMaxBox, logoSize } from "@/lib/logo";
import type { BotAnswer, BotCard, BotCta } from "@/lib/bot/types";

function CardLogo({ card }: { card: BotCard }) {
  if (!card.logo) {
    return <span className="text-[11px] font-bold tracking-tight text-slate-700">{card.marca}</span>;
  }
  const natural = logoSize(card.logo);
  const box = logoMaxBox(card.logo, natural);
  const height = Math.min(20, box.height);
  return (
    <Image
      src={card.logo}
      alt={`Logo de ${card.marca}`}
      width={natural.width}
      height={height}
      unoptimized={card.logo.endsWith(".svg") || box.maxWidthPx != null}
      className="w-auto object-contain"
      style={{ height: `${height}px`, width: "auto", maxWidth: box.maxWidthPx ?? 88 }}
    />
  );
}

function Cards({ cards, ranking }: { cards: BotCard[]; ranking: boolean }) {
  return (
    <>
      {cards.map((card, index) => (
        <article key={card.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              {ranking ? <span className="font-mono text-[11px] text-slate-400">{index + 1}</span> : null}
              <span className="inline-flex h-7 max-w-36 items-center rounded-md border border-slate-200 bg-slate-50 px-2">
                <CardLogo card={card} />
              </span>
              {card.menor ? <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">menor precio</span> : null}
            </div>
            <div className="shrink-0 text-right">
              {card.precio != null ? (
                <>
                  <span className="font-mono text-base font-semibold text-slate-900">{formatArs(card.precio)}</span>
                  <span className="text-xs text-slate-500">/mes</span>
                </>
              ) : (
                <span className="text-xs font-semibold text-slate-700">{card.precioLabel}</span>
              )}
            </div>
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {card.marca} · {card.nombre}
          </p>
          <HogarNotice slug={card.marcaSlug} />
          {card.coberturas.length ? (
            <ul className="mt-1.5 space-y-1 text-xs text-slate-600">
              {card.coberturas.map((item) => (
                <li key={`${card.id}-${item.item}`} className="flex items-start gap-1.5">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-500" aria-hidden="true" />
                  <span>
                    {item.item}
                    {item.valor ? ` · ${item.valor}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="mt-3 flex items-center gap-2">
            <Link href={card.verHref} className="flex-1 rounded-lg bg-slate-900 px-3 py-2 text-center text-xs font-semibold text-white">
              Ver plan
            </Link>
            <Link href={card.compararHref} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700">
              Comparar
            </Link>
          </div>
        </article>
      ))}
    </>
  );
}

function Ctas({ ctas, onCta }: { ctas: BotCta[]; onCta: (cta: BotCta) => void }) {
  if (!ctas.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {ctas.map((cta, index) => {
        const className =
          index === 0
            ? "inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700"
            : "rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700";
        if (cta.href) {
          return (
            <Link key={cta.label} href={cta.href} className={className}>
              {cta.label}
              {index === 0 ? <ArrowRight className="size-3.5" aria-hidden="true" /> : null}
            </Link>
          );
        }
        return (
          <button key={cta.label} type="button" className={className} onClick={() => onCta(cta)}>
            {cta.label}
          </button>
        );
      })}
    </div>
  );
}

export function BotAnswerBody({ answer, onCta }: { answer: BotAnswer; onCta: (cta: BotCta) => void }) {
  return (
    <div className="space-y-2">
      <div className="max-w-full rounded-2xl rounded-tl-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700">
        {answer.frase ? (
          <p>
            Para <b className="font-semibold text-slate-900">{answer.frase.especie}</b> en <b className="font-semibold text-slate-900">{answer.frase.provincia}</b>, los planes publicados van de{" "}
            <span className="font-mono font-semibold text-slate-900">{formatArs(answer.frase.min)}</span> a{" "}
            <span className="font-mono font-semibold text-slate-900">{formatArs(answer.frase.max)}</span> por mes.
          </p>
        ) : (
          <p className="whitespace-pre-line">{answer.texto}</p>
        )}
        {answer.stats ? (
          <div className="mt-2.5 grid grid-cols-3 divide-x divide-slate-200 rounded-lg bg-slate-50 py-2 text-center">
            {(
              [
                ["Mínimo", answer.stats.min],
                ["Mediana", answer.stats.mediana],
                ["Máximo", answer.stats.max],
              ] as const
            ).map(([label, value]) => (
              <div key={label}>
                <p className="text-[10px] uppercase tracking-wider text-slate-400">{label}</p>
                <p className="font-mono text-sm font-semibold text-slate-900">{formatArs(value)}</p>
              </div>
            ))}
          </div>
        ) : null}
        {answer.resumen ? <p className="mt-2 text-xs text-slate-500">{answer.resumen}</p> : null}
      </div>
      {answer.cards?.length ? <Cards cards={answer.cards} ranking={Boolean(answer.ranking)} /> : null}
      {answer.notaPrecio ? (
        <p className="flex items-start gap-1.5 px-1 text-[11px] leading-snug text-slate-500">
          <CalendarCheck className="mt-px size-3.5 shrink-0" aria-hidden="true" />
          <span>
            Precio referencial · verificado {formatDate(answer.notaPrecio.fecha)} · confirmalo con la marca · Fuente:{" "}
            {answer.notaPrecio.href ? (
              <a href={answer.notaPrecio.href} target="_blank" rel="noopener noreferrer" className="underline">
                {answer.notaPrecio.host}
              </a>
            ) : (
              answer.notaPrecio.host
            )}
          </span>
        </p>
      ) : null}
      {answer.lead ? <LeadForm marca={answer.lead.marca} planes={answer.lead.planes} defaultPlanId={answer.lead.defaultPlanId} /> : null}
      <Ctas ctas={answer.ctas} onCta={onCta} />
    </div>
  );
}
