import type { IntentId, SlotId } from "@/lib/bot/types";

export type IntentDef = {
  id: IntentId;
  label: string;
  keywords: string[];
  slots: SlotId[];
  priority: number;
};

export const intents: IntentDef[] = [
  {
    id: "precio_aprox",
    label: "¿Cuánto sale un seguro para mi perro o gato?",
    keywords: ["cuanto sale", "cuanto cuesta", "que precio", "precios", "tarifa", "tarifas"],
    slots: ["especie", "provincia"],
    priority: 40,
  },
  {
    id: "mas_barato",
    label: "¿Cuál es el plan más barato en mi provincia?",
    keywords: ["mas barato", "mas economico", "menor precio", "plan mas barato"],
    slots: ["provincia"],
    priority: 80,
  },
  {
    id: "cobertura_marca",
    label: "¿Qué cubre el plan de una marca?",
    keywords: ["que cubre", "cobertura de", "coberturas de", "que incluye"],
    slots: ["marca"],
    priority: 70,
  },
  {
    id: "tipos",
    label: "Obra social vs seguro vs adicional de hogar",
    keywords: ["obra social", "adicional de hogar", "adicional del hogar", "vs seguro"],
    slots: [],
    priority: 50,
  },
  {
    id: "edad",
    label: "¿Hasta qué edad puedo asegurar?",
    keywords: ["hasta que edad", "que edad", "edad maxima", "puedo asegurar"],
    slots: [],
    priority: 50,
  },
  {
    id: "teleconsulta",
    label: "Planes con veterinario online 24h",
    keywords: ["veterinario online", "veterinaria online", "teleconsulta", "videollamada", "vet online", "guardia 24", "24 h", "24h"],
    slots: [],
    priority: 60,
  },
  {
    id: "rc",
    label: "Responsabilidad civil",
    keywords: ["responsabilidad civil", "rc"],
    slots: [],
    priority: 55,
  },
  {
    id: "carencia",
    label: "¿Hay carencia?",
    keywords: ["carencia", "carencias", "desde cuando cubre"],
    slots: [],
    priority: 50,
  },
  {
    id: "vende",
    label: "¿Cuidalo vende seguros?",
    keywords: ["vende seguros", "venden seguros", "cuidalo vende", "venden"],
    slots: [],
    priority: 90,
  },
  {
    id: "contacto_marca",
    label: "Quiero que me contacte una marca",
    keywords: ["me contacte", "me contacten", "que me llamen", "contactame"],
    slots: ["marca"],
    priority: 100,
  },
];

export function intentById(id: IntentId) {
  const intent = intents.find((item) => item.id === id);
  if (!intent) throw new Error(`Intent desconocido: ${id}`);
  return intent;
}
