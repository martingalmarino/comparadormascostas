"use client";

import { track } from "@vercel/analytics";
import { ChevronDown, RotateCcw, SendHorizontal, X } from "lucide-react";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { BotAvatar, BotMark } from "@/components/CuidaloBot/BotMark";
import { BotThread } from "@/components/CuidaloBot/BotThread";
import type { ChatMessage } from "@/components/CuidaloBot/types";
import { useConsent } from "@/components/consent";
import { answerIntent } from "@/lib/bot/answers";
import { botEvent } from "@/lib/bot/event";
import { matchText, mergeSlots } from "@/lib/bot/match";
import { launcher, noEntendi, pie, placeholder, saludo, sinRespuesta, subtitulo } from "@/lib/bot/static";
import type { BotCta, BotPlan, BotResultado, BotSlots, IntentId, SlotId } from "@/lib/bot/types";

type Pending = { intent: IntentId; slots: BotSlots; faltante?: SlotId };

function resultadoDe(answer: { sinDato?: boolean; faltante?: SlotId }): BotResultado {
  if (answer.sinDato) return "sin_dato";
  if (answer.faltante) return "falta_slot";
  return "respuesta";
}

export function CuidaloBot({ plans }: { plans: BotPlan[] }) {
  const titleId = useId();
  const consent = useConsent();
  const panelRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const counter = useRef(1);
  const wasOpen = useRef(false);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [activeIntent, setActiveIntent] = useState<IntentId | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [stickTo, setStickTo] = useState<"end" | "chips">("end");
  const [messages, setMessages] = useState<ChatMessage[]>([{ id: "m0", role: "bot", text: saludo, interactive: false }]);

  function nextId() {
    counter.current += 1;
    return `m${counter.current}`;
  }

  function report(intent: IntentId | null, slots: BotSlots, resultado: BotResultado) {
    if (!consent?.analytics) return;
    try {
      track("cuidalobot", botEvent({ intent, slots, resultado }));
    } catch {
      /* La medición no puede frenar la respuesta. */
    }
  }

  function append(userText: string, bot: ChatMessage, slots: BotSlots) {
    setMessages((current) => [
      ...current.map((message) => {
        if (message.role !== "bot" || !message.interactive) return message;
        return { ...message, interactive: false, slots };
      }),
      { id: nextId(), role: "user", text: userText },
      bot,
    ]);
  }

  function ask(intent: IntentId, slots: BotSlots, userText: string, prefix?: string) {
    const answer = answerIntent(intent, slots, plans);
    const shown = prefix ? { ...answer, texto: `${prefix} ${answer.texto}` } : answer;
    setStickTo("end");
    setActiveIntent(intent);
    setPending(shown.faltante ? { intent, slots, faltante: shown.faltante } : null);
    append(userText, { id: nextId(), role: "bot", text: shown.texto, answer: shown, slots, intent, interactive: Boolean(shown.faltante) }, slots);
    report(intent, slots, resultadoDe(shown));
  }

  function reset() {
    setMessages([{ id: nextId(), role: "bot", text: saludo, interactive: false }]);
    setActiveIntent(null);
    setPending(null);
    setDraft("");
    setStickTo("end");
  }

  function onChip(intent: IntentId, label: string) {
    ask(intent, {}, label);
  }

  function onSlot(slot: SlotId, value: string, label: string) {
    if (!pending) return;
    const slots = { ...pending.slots, [slot]: value };
    ask(pending.intent, slots, label);
  }

  function onCta(message: Extract<ChatMessage, { role: "bot" }>, cta: BotCta) {
    if (cta.action === "reset") {
      reset();
      return;
    }
    if (cta.action === "lead") ask("contacto_marca", { marca: message.slots?.marca }, "Que me contacte una marca");
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    const found = matchText(text, plans);
    if (pending) {
      const slots = mergeSlots(pending.slots, found.slots);
      const filled = Boolean(pending.faltante && slots[pending.faltante] && !pending.slots[pending.faltante]);
      if (found.intent && found.intent !== pending.intent && !filled) {
        ask(found.intent, found.slots, text);
        return;
      }
      if (filled || found.intent === pending.intent) {
        ask(pending.intent, slots, text);
        return;
      }
      ask(pending.intent, pending.slots, text, noEntendi);
      return;
    }
    if (found.intent) {
      ask(found.intent, found.slots, text);
      return;
    }
    setStickTo("chips");
    setActiveIntent(null);
    setPending(null);
    append(text, { id: nextId(), role: "bot", text: sinRespuesta, interactive: false }, {});
    report(null, found.slots, "sin_respuesta");
  }

  useEffect(() => {
    if (!open) return;
    const root = panelRef.current;
    if (!root) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();

    function focusable() {
      if (!root) return [];
      return [...root.querySelectorAll<HTMLElement>("button, a[href], input, select, textarea")]
        .filter((node) => !node.hasAttribute("disabled") && node.tabIndex !== -1);
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (wasOpen.current && !open) launcherRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  const lastBot = [...messages].reverse().find((message) => message.role === "bot");

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        className={`fixed bottom-[100px] right-4 z-50 inline-flex items-center gap-2 rounded-full bg-slate-900 py-2 pl-2 pr-4 text-sm font-semibold text-white shadow-lg shadow-slate-900/25 lg:bottom-6 lg:right-6 ${open || consent === null ? "pointer-events-none invisible" : ""}`}
        tabIndex={open || consent === null ? -1 : 0}
        aria-hidden={open || consent === null}
        aria-expanded={open}
        aria-controls={titleId}
        onClick={() => setOpen(true)}
      >
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
          <BotMark size={21} />
        </span>
        {launcher}
      </button>
      {open ? (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="fixed inset-x-0 bottom-0 top-3 z-[70] flex flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-slate-50 shadow-2xl lg:inset-auto lg:bottom-6 lg:right-6 lg:h-[720px] lg:max-h-[calc(100dvh-3rem)] lg:w-[400px] lg:rounded-2xl"
        >
          <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
            <BotAvatar px={36} icon={23} />
            <div className="min-w-0 flex-1">
              <p id={titleId} className="text-sm font-semibold text-slate-900">
                CuidaloBot
              </p>
              <p className="flex items-center gap-1 text-[11px] text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {subtitulo}
              </p>
            </div>
            <button type="button" title="Volver a empezar" aria-label="Volver a empezar" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" onClick={reset}>
              <RotateCcw className="size-[18px]" aria-hidden="true" />
            </button>
            <button type="button" aria-label="Cerrar" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" onClick={() => setOpen(false)}>
              <ChevronDown className="size-5 lg:hidden" aria-hidden="true" />
              <X className="hidden size-5 lg:block" aria-hidden="true" />
            </button>
          </div>
          <BotThread messages={messages} plans={plans} activeIntent={activeIntent} stickTo={stickTo} onChip={onChip} onSlot={onSlot} onCta={onCta} />
          <p className="sr-only" aria-live="polite">
            {lastBot?.text}
          </p>
          <form onSubmit={onSubmit} className="border-t border-slate-200 bg-white px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5">
            <div className="flex items-center gap-2">
              <div className="flex flex-1 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                <input
                  ref={inputRef}
                  name="pregunta"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder={placeholder}
                  aria-label={placeholder}
                  autoComplete="off"
                  className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
              <button type="submit" aria-label="Enviar" className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <SendHorizontal className="size-[18px]" aria-hidden="true" />
              </button>
            </div>
            <p className="mt-1.5 text-center text-[10px] text-slate-400">{pie}</p>
          </form>
        </div>
      ) : null}
    </>
  );
}
