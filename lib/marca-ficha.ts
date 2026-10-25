import { formatArs, formatDate } from "@/lib/format";
import type { Marca } from "@/lib/marca-schema";
import type { Plan } from "@/lib/plan-schema";
import { precioVigente } from "@/lib/plan-status";
import { PROVINCIA_TODAS, jurisdiccionLabel } from "@/lib/zonas";

const etiquetasNulas: { id: string; label: string; vacio: (marca: Marca) => boolean }[] = [
  { id: "razon_social", label: "Razón social", vacio: (marca) => marca.empresa.razon_social == null || marca.empresa.razon_social.valor == null },
  { id: "cuit", label: "CUIT", vacio: (marca) => marca.empresa.cuit == null || marca.empresa.cuit.valor == null },
  { id: "ssn", label: "Número de inscripción en la SSN", vacio: (marca) => marca.empresa.ssn == null },
  { id: "contratar", label: "Cómo se contrata", vacio: (marca) => marca.como_se_usa.contratar == null },
  { id: "reintegro", label: "Cómo se pide el reintegro", vacio: (marca) => marca.como_se_usa.reintegro == null },
  { id: "siniestro", label: "Cómo se denuncia un siniestro", vacio: (marca) => marca.como_se_usa.siniestro == null },
  { id: "baja", label: "Cómo se da de baja", vacio: (marca) => marca.como_se_usa.baja == null },
  { id: "red_veterinaria", label: "Red de veterinarias", vacio: (marca) => marca.red_veterinaria == null },
  { id: "edad", label: "Edades de ingreso y permanencia", vacio: (marca) => marca.edad == null },
  { id: "carencias", label: "Carencias", vacio: (marca) => marca.carencias == null },
  { id: "otros_productos", label: "Otros productos", vacio: (marca) => marca.otros_productos == null },
];

const tipoEtiqueta: Record<string, string> = {
  aseguradora: "Aseguradora",
  aseguradora_via_productor: "Aseguradora",
  aseguradora_via_banco: "Aseguradora",
  agente_institorio: "Agente institorio",
  obra_social_mascotas: "Obra social",
  plan_reintegro: "Plan de reintegro",
  plan_asistencia: "Plan de asistencia",
  plan_salud: "Plan de salud",
  club_beneficios: "Club de beneficios",
  prepaga_veterinaria: "Prepaga veterinaria",
  sin_ficha_oficial: "Sin ficha oficial",
};

const canalEtiqueta: Record<string, string> = {
  contratacion: "Contratación",
  siniestros: "Siniestros",
  asistencia: "Asistencia",
  asistencia_ike: "Asistencia",
  atencion: "Atención",
  atencion_asegurado: "Atención al asegurado",
  whatsapp: "WhatsApp",
  whatsapp_reintegros: "WhatsApp reintegros",
  whatsapp_siniestros: "WhatsApp siniestros",
  email: "Email",
  email_reclamos: "Email de reclamos",
  email_siniestros: "Email de siniestros",
  telefono: "Teléfono",
  banco: "Banco",
  linea_unica: "Línea única",
  facturacion: "Facturación",
  consultas: "Consultas",
  ventas: "Ventas",
  aseguradora: "Aseguradora",
};

export function esAseguradora(tipo: string) {
  return tipo === "aseguradora" || tipo.startsWith("aseguradora_");
}

export function etiquetaTipo(tipo: string) {
  return tipoEtiqueta[tipo] ?? tipo.replaceAll("_", " ");
}

export function etiquetaCanal(tipo: string) {
  return canalEtiqueta[tipo] ?? tipo.replaceAll("_", " ");
}

export function hostFuente(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** "WhatsApp (ver web)" apunta a la fuente, no a un teléfono. */
export function enlaceCanal(valor: string, fuenteUrl: string) {
  const texto = valor.trim();
  if (/whatsapp\s*\(ver web\)/i.test(texto)) return { href: fuenteUrl, externo: true };
  if (/^https?:\/\//i.test(texto)) return { href: texto, externo: true };
  if (texto.includes("@") && !texto.includes(" ")) return { href: `mailto:${texto}`, externo: false };
  const digitos = texto.replace(/\D/g, "");
  if (/^[\d\s()+.-]{6,}$/.test(texto) && digitos.length >= 6 && digitos.length <= 15) {
    return { href: `tel:${digitos}`, externo: false };
  }
  return { href: undefined, externo: false };
}

export function loQueNoPublica(marca: Marca) {
  const vistos = new Set(marca.no_publica.map((item) => item.toLocaleLowerCase("es")));
  const extra = etiquetasNulas.filter((item) => item.vacio(marca) && !vistos.has(item.label.toLocaleLowerCase("es"))).map((item) => item.label);
  return [...marca.no_publica, ...extra];
}

export function preciosVigentes(plans: Plan[], today: string) {
  return plans
    .filter((plan) => precioVigente(plan, today))
    .sort((a, b) => (a.precio as number) - (b.precio as number) || a.nombre.localeCompare(b.nombre, "es"));
}

export function alcancePlanes(plans: Plan[]) {
  if (plans.some((plan) => plan.zonas.some((zona) => zona.provincia === PROVINCIA_TODAS))) return "Nacional";
  const labels = [...new Set(plans.flatMap((plan) => plan.zonas.map((zona) => jurisdiccionLabel(zona.provincia) ?? zona.provincia)))];
  return labels.length ? labels.join(", ") : null;
}

export function ingresoComun(plans: Plan[]) {
  const valores = plans.map((plan) => plan.edad_min_meses).filter((value): value is number => value != null);
  if (!valores.length || valores.some((value) => value !== valores[0])) return null;
  return valores[0];
}

export function vigenciaComun(plans: Plan[]) {
  const valores = plans.map((plan) => plan.edad_max_anios).filter((value): value is number => value != null);
  if (!valores.length || valores.some((value) => value !== valores[0])) return null;
  return valores[0];
}

export function alternativasCercanas(todos: Plan[], slug: string, today: string) {
  const propios = preciosVigentes(
    todos.filter((plan) => plan.marca_slug === slug),
    today,
  );
  if (!propios.length) return [];
  const minimo = propios[0].precio as number;
  const porMarca = new Map<string, { plan: Plan; distancia: number }>();
  for (const plan of todos) {
    if (plan.marca_slug === slug || !precioVigente(plan, today)) continue;
    const distancia = Math.abs((plan.precio as number) - minimo);
    const previo = porMarca.get(plan.marca_slug);
    if (!previo || distancia < previo.distancia || (distancia === previo.distancia && (plan.precio as number) < (previo.plan.precio as number))) {
      porMarca.set(plan.marca_slug, { plan, distancia });
    }
  }
  return [...porMarca.values()]
    .sort((a, b) => a.distancia - b.distancia || (a.plan.precio as number) - (b.plan.precio as number) || a.plan.marca.localeCompare(b.plan.marca, "es"))
    .slice(0, 3)
    .map((item) => item.plan);
}

export function faqsDeMarca(marca: Marca, plans: Plan[], today: string, nombre: string) {
  const faqs: { q: string; a: string }[] = [];
  const vigentes = preciosVigentes(plans, today);
  if (vigentes.length) {
    const bajo = vigentes[0];
    const alto = vigentes[vigentes.length - 1];
    const rango =
      bajo.id === alto.id
        ? `${bajo.nombre} a ${formatArs(bajo.precio as number)}/mes, verificado el ${formatDate(bajo.fecha_verificacion)}.`
        : `van de ${formatArs(bajo.precio as number)}/mes (${bajo.nombre}, verificado el ${formatDate(bajo.fecha_verificacion)}) a ${formatArs(alto.precio as number)}/mes (${alto.nombre}, verificado el ${formatDate(alto.fecha_verificacion)}).`;
    faqs.push({
      q: `¿Cuánto salen los planes de ${nombre}?`,
      a: `Entre los precios verificados, ${rango}`,
    });
  }
  if (marca.edad?.valor) {
    faqs.push({ q: `¿Qué edad publica ${nombre}?`, a: marca.edad.valor });
  }
  if (marca.como_se_usa.contratar?.valor) {
    faqs.push({ q: `¿Cómo se contrata ${nombre}?`, a: marca.como_se_usa.contratar.valor });
  }
  if (marca.carencias?.valor) {
    faqs.push({ q: `¿Qué carencia publica ${nombre}?`, a: marca.carencias.valor });
  }
  if (marca.empresa.cuit?.valor) {
    faqs.push({ q: `¿Cuál es el CUIT de ${nombre}?`, a: `El CUIT publicado es ${marca.empresa.cuit.valor}.` });
  }
  if (marca.empresa.ssn) {
    faqs.push({
      q: `¿Cuál es la inscripción SSN de ${nombre}?`,
      a: `El número de inscripción publicado es ${marca.empresa.ssn.numero}.`,
    });
  }
  return faqs;
}

export function organizationMarcaJsonLd(marca: Marca, nombre: string) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: nombre,
  };
  if (marca.empresa.razon_social?.valor) {
    data.legalName = marca.empresa.razon_social.valor;
    data.url = marca.empresa.razon_social.fuente_url;
  }
  if (marca.empresa.ssn) {
    data.identifier = {
      "@type": "PropertyValue",
      propertyID: "SSN",
      value: marca.empresa.ssn.numero,
      url: marca.empresa.ssn.registro_url,
    };
  }
  return data;
}

export function maxFechaVerificacion(marca: Marca, plans: Plan[]) {
  const fechas = [marca.fecha_verificacion, ...plans.map((plan) => plan.fecha_verificacion)];
  const walk = (value: unknown) => {
    if (!value || typeof value !== "object") return;
    if ("fecha_verificacion" in value && typeof (value as { fecha_verificacion?: unknown }).fecha_verificacion === "string") {
      fechas.push((value as { fecha_verificacion: string }).fecha_verificacion);
    }
    for (const child of Object.values(value as Record<string, unknown>)) walk(child);
  };
  walk(marca);
  return fechas.reduce((max, fecha) => (fecha > max ? fecha : max));
}
