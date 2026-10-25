import { intents } from "@/lib/bot/intents";
import type { IntentId } from "@/lib/bot/types";

const idle = "rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700";
const active = "rounded-full border border-indigo-600 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700";

export function BotChips({ activeIntent, onChip }: { activeIntent: IntentId | null; onChip: (intent: IntentId, label: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {intents.map((intent) => (
        <button key={intent.id} type="button" className={activeIntent === intent.id ? active : idle} onClick={() => onChip(intent.id, intent.label)}>
          {intent.label}
        </button>
      ))}
    </div>
  );
}
