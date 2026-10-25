import { formatArs, formatDate } from "@/lib/format";
import type { Marca } from "@/lib/marca-schema";
import type { Plan } from "@/lib/plan-schema";
import { precioVigente } from "@/lib/plan-status";
import { PROVINCIA_TODAS, jurisdiccionLabel } from "@/lib/zonas";

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

export function esFraseZona(texto: string) {
  return /^(nacional|todo el pa[ií]s)\.?$/i.test(texto.trim());
}

export function textoZona(plan: Plan) {
  const cubreTodas = plan.zonas.some((zona) => zona.provincia === PROVINCIA_TODAS);
  const resumenEsZona = plan.resumen ? esFraseZona(plan.resumen) : false;
  const detalleEsZona = plan.zona_detalle ? esFraseZona(plan.zona_detalle) : false;
  if (cubreTodas || resumenEsZona || detalleEsZona) {
    const frases = [plan.zona_detalle, plan.resumen].filter((texto): texto is string => Boolean(texto && esFraseZona(texto)));
    if (frases.some((texto) => /^todo el pa/i.test(texto.trim())) && !frases.some((texto) => /^nacional/i.test(texto.trim())) && !cubreTodas) {
      return "Todo el país.";
    }
    return "Nacional";
  }
  if (plan.zonas.length) {
    return `Disponible en ${plan.zonas.map((zona) => jurisdiccionLabel(zona.provincia) ?? zona.provincia).join(", ")}.`;
  }
  if (plan.zona_detalle) return plan.zona_detalle;
  return "La fuente no confirma en qué provincias está.";
}

export function resumenVisible(plan: Plan) {
  if (!plan.resumen || esFraseZona(plan.resumen)) return null;
  if (plan.zona_detalle && plan.resumen.trim() === plan.zona_detalle.trim()) return null;
  return plan.resumen;
}

export function textoEdad(plan: Plan) {
  const partes: string[] = [];
  if (plan.edad_min_meses != null) partes.push(`desde ${plan.edad_min_meses} meses`);
  if (plan.edad_max_anios != null) partes.push(`hasta ${plan.edad_max_anios} años`);
  return partes.join(" · ");
}

export function textoCarenciaMarca(valor: string) {
  return `Carencia publicada por la marca: ${valor}`;
}

export function textoInconsistencia(descripcion: string) {
  const abre = "“";
  const cierra = "”";
  const citas = [...descripcion.matchAll(/'([^']+)'/g)].map((item) => item[1].trim()).filter(Boolean);
  let izquierda = citas[0];
  let derecha = citas[1];
  if (izquierda && !derecha) {
    const resto = descripcion
      .split(/\bindican\b|\bfigura(?:\s+a)?\b/i)
      .pop()
      ?.replace(/[. ]+$/g, "")
      .replace(/^['"“”]+|['"“”]+$/g, "")
      .trim();
    if (resto && resto.toLocaleLowerCase("es") !== izquierda.toLocaleLowerCase("es") && !resto.includes(izquierda)) derecha = resto;
  }
  if (!izquierda || !derecha) {
    const montos = [...descripcion.matchAll(/\$\s?\d[\d.]*/g)].map((item) => item[0].replace(/\s/g, ""));
    if (montos.length >= 2) {
      izquierda = montos[0];
      derecha = montos[1];
    }
  }
  if (izquierda && derecha) {
    return `La web indica ${abre}${izquierda}${cierra} y también ${abre}${derecha}${cierra}. Confirmalo con la marca.`;
  }
  const limpio = descripcion.replace(/\.$/, "");
  return `La web indica ${abre}${limpio}${cierra}. Confirmalo con la marca.`;
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
    faqs.push({ q: `¿Qué carencia publica ${nombre}?`, a: textoCarenciaMarca(marca.carencias.valor) });
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
