import type { BotEvent, BotResultado, BotSlots, IntentId } from "@/lib/bot/types";

export function botEvent(input: { intent: IntentId | null; slots: BotSlots; resultado: BotResultado }): BotEvent {
  return {
    intent: input.intent ?? "sin_respuesta",
    especie: input.slots.especie ?? "",
    provincia: input.slots.provincia ?? "",
    marca: input.slots.marca ?? "",
    resultado: input.resultado,
  };
}
