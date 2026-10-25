import type { BotAnswer, BotSlots, IntentId } from "@/lib/bot/types";

export type ChatMessage =
  | { id: string; role: "user"; text: string }
  | {
      id: string;
      role: "bot";
      text: string;
      answer?: BotAnswer;
      slots?: BotSlots;
      intent?: IntentId;
      interactive: boolean;
    };
