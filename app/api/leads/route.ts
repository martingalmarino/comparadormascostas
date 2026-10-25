import { persistLead, notifyLead, type LeadRecord } from "@/lib/lead-store";
import { normalizeArWhatsapp } from "@/lib/phone";
import { getPlan } from "@/lib/plans";
import type { Plan } from "@/lib/plan-schema";
import { isKnownZone } from "@/lib/zones";
import { consentTextForBrand, consentTextForContact, siteConfig } from "@/site.config";

const hits = new Map<string, number[]>();

function allowed(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((time) => now - time < 60 * 60 * 1000);
  if (recent.length >= 5) {
    hits.set(ip, recent);
    return false;
  }
  recent.push(now);
  hits.set(ip, recent);
  return true;
}

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "desconocida";
}

function whatsappLink(plan: Plan) {
  if (plan.lead.modo !== "whatsapp" || !plan.lead.destino) return undefined;
  const national = normalizeArWhatsapp(plan.lead.destino);
  if (!national) return undefined;
  const text = encodeURIComponent(`Hola, vi ${plan.nombre} en ${siteConfig.siteName} y quiero que me contacten.`);
  return `https://wa.me/549${national}?text=${text}`;
}

function safeRedirect(plan: Plan) {
  if (plan.lead.modo !== "link" || !plan.lead.destino) return undefined;
  const destino = plan.lead.destino;
  if (destino.startsWith("/") && !destino.startsWith("//")) return destino;
  try {
    const url = new URL(destino);
    if (url.protocol === "https:") return url.toString();
  } catch {
    return undefined;
  }
  return undefined;
}

async function turnstileOk(token: string, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  const body = new URLSearchParams({ secret, response: token, remoteip: ip });
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body,
  });
  const payload = (await response.json()) as { success?: boolean };
  return Boolean(payload.success);
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  if (!allowed(ip)) {
    return Response.json({ ok: false, error: "Esperá un rato antes de enviar otra consulta." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ ok: false, error: "No pudimos leer el formulario." }, { status: 400 });
  }

  if (String(body.empresa_web ?? "").trim()) {
    return Response.json({ ok: true });
  }

  const nombre = String(body.nombre ?? "").trim();
  const whatsapp = normalizeArWhatsapp(String(body.whatsapp ?? ""));
  const email = String(body.email ?? "").trim();
  const especie = body.especie === "perro" || body.especie === "gato" ? body.especie : undefined;
  const edadMeses = Number(body.edadMeses);
  const zona = String(body.zona ?? "");
  const planId = String(body.planId ?? "").trim();
  const mensaje = String(body.mensaje ?? "").trim();
  const errors: string[] = [];

  if (nombre.length < 2 || nombre.length > 80) errors.push("Ingresá tu nombre.");
  if (!whatsapp) errors.push("El WhatsApp no parece un número de Argentina. Ejemplo: 351 1234567.");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("El email no es válido.");
  if (!especie) errors.push("Elegí si es perro o gato.");
  if (!Number.isFinite(edadMeses) || edadMeses < 0 || edadMeses > 360) errors.push("Ingresá la edad en meses.");
  if (!isKnownZone(zona)) errors.push("Elegí una zona de la lista.");
  if (mensaje.length > 1000) errors.push("El mensaje es demasiado largo.");
  if (body.consentimiento !== true) errors.push("Tenés que aceptar el tratamiento de tus datos para seguir.");

  const plan = planId ? getPlan(planId) : undefined;
  if (planId && !plan) errors.push("Ese plan no está en el comparador.");
  if (errors.length || !whatsapp || !especie) {
    return Response.json({ ok: false, error: errors[0] ?? "Revisá el formulario.", errors }, { status: 400 });
  }

  if (!(await turnstileOk(String(body.turnstileToken ?? ""), ip))) {
    return Response.json({ ok: false, error: "No pudimos verificar que no sos un robot." }, { status: 400 });
  }

  const now = new Date().toISOString();
  const marca = plan?.marca ?? "Consulta general";
  const record: LeadRecord = {
    id: crypto.randomUUID(),
    createdAt: now,
    nombre,
    whatsapp,
    email: email || undefined,
    especie,
    edadMeses,
    zona,
    planId: plan?.id,
    marca,
    mensaje: mensaje || undefined,
    consentText: plan ? consentTextForBrand(plan.marca) : consentTextForContact(),
    consentAt: now,
    ip,
    userAgent: request.headers.get("user-agent") ?? "",
  };

  const stored = await persistLead(record);
  if (!stored.saved) {
    return Response.json(
      { ok: false, error: `No pudimos guardar la consulta. Escribinos a ${siteConfig.contactEmail}.` },
      { status: 503 },
    );
  }

  await notifyLead(record).catch(() => false);

  return Response.json({
    ok: true,
    whatsappUrl: plan ? whatsappLink(plan) : undefined,
    redirectUrl: plan ? safeRedirect(plan) : undefined,
  });
}
