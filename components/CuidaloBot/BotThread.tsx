import { useEffect, useRef } from "react";
import { BotAnswerBody } from "@/components/CuidaloBot/BotCards";
import { BotChips } from "@/components/CuidaloBot/BotChips";
import { BotAvatar } from "@/components/CuidaloBot/BotMark";
import { BotSlots } from "@/components/CuidaloBot/BotSlots";
import type { ChatMessage } from "@/components/CuidaloBot/types";
import type { BotCta, BotPlan, IntentId, SlotId } from "@/lib/bot/types";

export function BotThread({
  messages,
  plans,
  activeIntent,
  stickTo,
  onChip,
  onSlot,
  onCta,
}: {
  messages: ChatMessage[];
  plans: BotPlan[];
  activeIntent: IntentId | null;
  stickTo: "end" | "chips";
  onChip: (intent: IntentId, label: string) => void;
  onSlot: (slot: SlotId, value: string, label: string) => void;
  onCta: (message: Extract<ChatMessage, { role: "bot" }>, cta: BotCta) => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const chips = useRef<HTMLDivElement>(null);
  const greeting = messages[0];
  const rest = messages.slice(1);

  useEffect(() => {
    if (stickTo === "chips") {
      chips.current?.scrollIntoView({ block: "nearest" });
      return;
    }
    const node = scroller.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, stickTo]);

  return (
    <div ref={scroller} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4" role="log" aria-live="polite" aria-relevant="additions">
      {greeting?.role === "bot" ? (
        <div className="flex gap-2">
          <BotAvatar px={26} icon={17} />
          <div className="max-w-[85%] rounded-2xl rounded-tl-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700">{greeting.text}</div>
        </div>
      ) : null}
      <div ref={chips} className="pl-8">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Preguntas frecuentes</p>
        <BotChips activeIntent={activeIntent} onChip={onChip} />
      </div>
      {rest.map((message) =>
        message.role === "user" ? (
          <div key={message.id} className="flex justify-end">
            <div className="max-w-[80%] rounded-2xl rounded-tr-md bg-indigo-600 px-3 py-2.5 text-sm text-white">{message.text}</div>
          </div>
        ) : (
          <div key={message.id} className="flex gap-2">
            <BotAvatar px={26} icon={17} />
            <div className="min-w-0 flex-1 space-y-2">
              {message.answer ? (
                <>
                  {message.answer.faltante ? (
                    <div className="rounded-2xl rounded-tl-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700">{message.answer.texto}</div>
                  ) : (
                    <BotAnswerBody answer={message.answer} onCta={(cta) => onCta(message, cta)} />
                  )}
                  {message.answer.faltante ? (
                    <BotSlots
                      faltante={message.answer.faltante}
                      slots={message.slots ?? {}}
                      plans={plans}
                      interactive={message.interactive}
                      onSelect={onSlot}
                    />
                  ) : null}
                </>
              ) : (
                <div className="max-w-[85%] rounded-2xl rounded-tl-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700">{message.text}</div>
              )}
            </div>
          </div>
        ),
      )}
    </div>
  );
}
