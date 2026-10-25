import { intents } from "@/lib/bot/intents";
import type { BotEspecie, BotPlan, BotSlots, IntentId } from "@/lib/bot/types";
import { jurisdicciones } from "@/lib/zonas";

const stop = new Set([
  "seguro",
  "seguros",
  "banco",
  "plan",
  "planes",
  "mascotas",
  "mascota",
  "provincia",
  "nacional",
  "argentina",
  "salud",
  "para",
  "del",
  "los",
  "las",
  "una",
  "con",
  "pet",
  "online",
  ...jurisdicciones.flatMap((item) => normalizeBotText(item.label).split(" ")),
  ...jurisdicciones.flatMap((item) => item.slug.split("-")),
]);

export function normalizeBotText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function hasPhrase(text: string, phrase: string) {
  if (!phrase) return false;
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^| )${escaped}(?:$| )`).test(text);
}

function provinciaAliases() {
  const aliases: { phrase: string; slug: string }[] = [
    { phrase: "capital federal", slug: "caba" },
    { phrase: "ciudad autonoma de buenos aires", slug: "caba" },
    { phrase: "ciudad de buenos aires", slug: "caba" },
    { phrase: "bs as", slug: "buenos-aires" },
    { phrase: "bsas", slug: "buenos-aires" },
    { phrase: "gba", slug: "buenos-aires" },
  ];
  for (const item of jurisdicciones) {
    aliases.push({ phrase: normalizeBotText(item.label), slug: item.slug });
    aliases.push({ phrase: item.slug.replace(/-/g, " "), slug: item.slug });
  }
  return aliases.sort((a, b) => b.phrase.length - a.phrase.length);
}

function extractEspecie(text: string): BotEspecie | undefined {
  const perro = hasPhrase(text, "perro") || hasPhrase(text, "perros") || hasPhrase(text, "canino");
  const gato = hasPhrase(text, "gato") || hasPhrase(text, "gatos") || hasPhrase(text, "felino");
  if (perro && !gato) return "perro";
  if (gato && !perro) return "gato";
  return undefined;
}

function extractProvincia(text: string) {
  for (const alias of provinciaAliases()) {
    if (hasPhrase(text, alias.phrase)) return alias.slug;
  }
  return undefined;
}

function extractEdad(text: string) {
  const match = text.match(/\b(\d{1,2})\s*(anos|meses|mes)\b/);
  if (!match) return undefined;
  const amount = Number(match[1]);
  if (!Number.isFinite(amount) || amount <= 0) return undefined;
  if (match[2] === "anos") return amount <= 30 ? amount * 12 : undefined;
  return amount <= 360 ? amount : undefined;
}

function marcasDesde(plans: BotPlan[]) {
  const seen = new Set<string>();
  const marcas: { slug: string; nombre: string; phrases: string[] }[] = [];
  for (const plan of plans) {
    if (seen.has(plan.marcaSlug)) continue;
    seen.add(plan.marcaSlug);
    const nombre = normalizeBotText(plan.marca);
    const slug = plan.marcaSlug.replace(/-/g, " ");
    marcas.push({
      slug: plan.marcaSlug,
      nombre: plan.marca,
      phrases: [...new Set([nombre, slug].filter(Boolean))],
    });
  }
  return marcas.sort((a, b) => b.nombre.length - a.nombre.length);
}

function extractMarca(text: string, plans: BotPlan[]) {
  const marcas = marcasDesde(plans);
  for (const marca of marcas) {
    if (marca.phrases.some((phrase) => hasPhrase(text, phrase))) return marca.slug;
  }
  const owners = new Map<string, string>();
  for (const marca of marcas) {
    const tokens = new Set<string>();
    const slugPhrase = marca.slug.replace(/-/g, " ");
    for (const token of slugPhrase.split(" ")) {
      if (token.length >= 3 && !stop.has(token)) tokens.add(token);
    }
    for (const token of normalizeBotText(marca.nombre).split(" ")) {
      if (token.length >= 5 && !stop.has(token)) tokens.add(token);
    }
    for (const token of tokens) {
      const prev = owners.get(token);
      owners.set(token, prev && prev !== marca.slug ? "*" : marca.slug);
    }
  }
  let best: { slug: string; length: number } | undefined;
  for (const [token, slug] of owners) {
    if (slug === "*" || !hasPhrase(text, token)) continue;
    if (!best || token.length > best.length) best = { slug, length: token.length };
  }
  return best?.slug;
}

function scoreIntent(text: string, keywords: string[]) {
  let score = 0;
  for (const keyword of keywords) {
    if (keyword.length <= 3) {
      if (hasPhrase(text, keyword)) score += keyword.length;
      continue;
    }
    if (text.includes(keyword)) score += keyword.length;
  }
  return score;
}

export function matchText(text: string, plans: BotPlan[]): { intent: IntentId | null; slots: BotSlots } {
  const normalized = normalizeBotText(text);
  const slots: BotSlots = {};
  const especie = extractEspecie(normalized);
  const provincia = extractProvincia(normalized);
  const marca = extractMarca(normalized, plans);
  const edadMeses = extractEdad(normalized);
  if (especie) slots.especie = especie;
  if (provincia) slots.provincia = provincia;
  if (marca) slots.marca = marca;
  if (edadMeses) slots.edadMeses = edadMeses;

  const scored = intents
    .map((intent) => ({
      id: intent.id,
      priority: intent.priority,
      score: scoreIntent(normalized, [...intent.keywords, normalizeBotText(intent.label)]),
    }))
    .filter((item) => item.score > 0);

  const ids = new Set(scored.map((item) => item.id));
  const drop = new Set<IntentId>();
  if (ids.has("mas_barato") && ids.has("precio_aprox")) drop.add("precio_aprox");
  if (ids.has("contacto_marca") && ids.has("vende")) drop.add("vende");
  if (ids.has("cobertura_marca") && ids.has("precio_aprox")) drop.add("precio_aprox");

  scored.sort((a, b) => b.score - a.score || b.priority - a.priority);
  const winner = scored.find((item) => !drop.has(item.id));
  return { intent: winner?.id ?? null, slots };
}

export function mergeSlots(base: BotSlots, extra: BotSlots): BotSlots {
  return {
    especie: extra.especie ?? base.especie,
    provincia: extra.provincia ?? base.provincia,
    marca: extra.marca ?? base.marca,
    edadMeses: extra.edadMeses ?? base.edadMeses,
  };
}
