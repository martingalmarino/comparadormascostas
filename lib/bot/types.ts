export type BotEspecie = "perro" | "gato";

export type SlotId = "especie" | "provincia" | "marca";

export type IntentId =
  | "precio_aprox"
  | "mas_barato"
  | "cobertura_marca"
  | "tipos"
  | "edad"
  | "teleconsulta"
  | "rc"
  | "carencia"
  | "vende"
  | "contacto_marca";

export type BotSlots = {
  especie?: BotEspecie;
  provincia?: string;
  marca?: string;
  edadMeses?: number;
};

export type BotPlan = {
  id: string;
  marca: string;
  marcaSlug: string;
  nombre: string;
  tipo: string;
  especies: string[];
  edadMinMeses?: number;
  edadMaxAnios?: number;
  zonas: string[];
  precio: number | null;
  precioVigente: boolean;
  estado: string;
  fechaVerificacion: string;
  fuenteUrl: string;
  coberturas: { item: string; valor?: string }[];
  carencias: { item: string; dias: number }[];
  carenciasTexto?: string;
  notas?: string;
  logo: string | null;
};

export type BotCard = {
  id: string;
  marca: string;
  marcaSlug: string;
  nombre: string;
  logo: string | null;
  precio: number | null;
  precioLabel?: string;
  coberturas: { item: string; valor?: string }[];
  verHref: string;
  compararHref: string;
  menor: boolean;
  adicionalHogar: boolean;
};

export type BotCta = {
  label: string;
  href?: string;
  action?: "lead" | "reset";
};

export type BotAnswer = {
  texto: string;
  frase?: { especie: string; provincia: string; min: number; max: number };
  resumen?: string;
  faltante?: SlotId;
  stats?: { min: number; mediana: number; max: number; planes: number; marcas: number };
  cards?: BotCard[];
  ranking?: boolean;
  notaPrecio?: { fecha: string; host: string; href?: string };
  ctas: BotCta[];
  sinDato?: boolean;
  lead?: { marca: string; planes: { id: string; nombre: string }[]; defaultPlanId?: string };
};

export type BotResultado = "respuesta" | "sin_dato" | "falta_slot" | "sin_respuesta";

export type BotEvent = {
  intent: string;
  especie: string;
  provincia: string;
  marca: string;
  resultado: BotResultado;
};
