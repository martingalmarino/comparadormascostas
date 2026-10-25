import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

export type LeadRecord = {
  id: string;
  createdAt: string;
  nombre: string;
  whatsapp: string;
  email?: string;
  especie: "perro" | "gato";
  edadMeses: number;
  zona: string;
  planId?: string;
  marca: string;
  mensaje?: string;
  consentText: string;
  consentAt: string;
  ip: string;
  userAgent: string;
};

async function pushUpstash(record: LeadRecord) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return false;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(["LPUSH", "leads", JSON.stringify(record)]),
  });
  if (!response.ok) throw new Error(`Upstash respondió ${response.status}`);
  return true;
}

async function pushWebhook(record: LeadRecord) {
  const webhook = process.env.LEADS_WEBHOOK_URL;
  if (!webhook) return false;
  const response = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(record),
  });
  if (!response.ok) throw new Error(`El webhook respondió ${response.status}`);
  return true;
}

async function pushFile(record: LeadRecord) {
  const dir = path.join(process.cwd(), ".data");
  await mkdir(dir, { recursive: true });
  await appendFile(path.join(dir, "leads.jsonl"), `${JSON.stringify(record)}\n`, "utf8");
  return true;
}

export async function persistLead(record: LeadRecord) {
  const sinks = [pushUpstash, pushWebhook, pushFile];
  let saved = false;
  const errors: string[] = [];
  for (const sink of sinks) {
    try {
      if (await sink(record)) saved = true;
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "error al guardar");
    }
  }
  return { saved, errors };
}

export async function notifyLead(record: LeadRecord) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const to = process.env.LEADS_NOTIFY_EMAIL;
  if (!key || !from || !to) return false;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `Nuevo contacto: ${record.marca}`,
      text: [
        `Marca: ${record.marca}`,
        `Plan: ${record.planId ?? "sin plan"}`,
        `Nombre: ${record.nombre}`,
        `WhatsApp: ${record.whatsapp}`,
        `Email: ${record.email ?? "no informó"}`,
        `Mascota: ${record.especie}, ${record.edadMeses} meses, ${record.zona}`,
        `Mensaje: ${record.mensaje ?? ""}`,
        `Consentimiento: ${record.consentText}`,
        `Fecha: ${record.consentAt}`,
        `IP: ${record.ip}`,
      ].join("\n"),
    }),
  });
  return response.ok;
}
