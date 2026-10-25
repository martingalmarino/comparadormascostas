"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IndependenceNote } from "@/components/IndependenceNote";
import { fieldClass, labelClass, primaryButtonClass } from "@/components/ui";
import { normalizeArWhatsapp } from "@/lib/phone";
import { consentTextForBrand, consentTextForContact, siteConfig } from "@/site.config";
import { zones } from "@/lib/zones";

type LeadPlan = { id: string; nombre: string };

export function LeadForm({
  marca,
  planes,
  defaultPlanId,
}: {
  marca: string;
  planes?: LeadPlan[];
  defaultPlanId?: string;
}) {
  const [errors, setErrors] = useState<string[]>([]);
  const [done, setDone] = useState("");
  const [pending, setPending] = useState(false);
  const consent = marca === "Consulta general" ? consentTextForContact() : consentTextForBrand(marca);

  useEffect(() => {
    if (!siteConfig.turnstileSiteKey || document.getElementById("turnstile")) return;
    const script = document.createElement("script");
    script.id = "turnstile";
    script.async = true;
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    document.body.appendChild(script);
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const whatsapp = String(data.get("whatsapp") ?? "");
    const nextErrors: string[] = [];
    if (String(data.get("nombre") ?? "").trim().length < 2) nextErrors.push("Ingresá tu nombre.");
    if (!normalizeArWhatsapp(whatsapp)) nextErrors.push("El WhatsApp no parece un número de Argentina. Ejemplo: 351 1234567.");
    if (!data.get("especie")) nextErrors.push("Elegí si es perro o gato.");
    if (!data.get("zona")) nextErrors.push("Elegí la zona.");
    const edad = Number(data.get("edadMeses"));
    if (!Number.isFinite(edad) || edad < 0 || edad > 360) nextErrors.push("Ingresá la edad en meses.");
    if (!data.get("consentimiento")) nextErrors.push("Tenés que aceptar el tratamiento de tus datos para seguir.");
    setErrors(nextErrors);
    if (nextErrors.length) return;

    const turnstile = form.querySelector<HTMLTextAreaElement>('[name="cf-turnstile-response"]');
    setPending(true);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: String(data.get("nombre") ?? ""),
          whatsapp,
          email: String(data.get("email") ?? ""),
          especie: String(data.get("especie") ?? ""),
          edadMeses: edad,
          zona: String(data.get("zona") ?? ""),
          planId: String(data.get("planId") ?? "") || undefined,
          mensaje: String(data.get("mensaje") ?? ""),
          consentimiento: true,
          empresa_web: String(data.get("empresa_web") ?? ""),
          turnstileToken: turnstile?.value ?? "",
        }),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string; whatsappUrl?: string; redirectUrl?: string };
      if (!response.ok || !payload.ok) {
        setErrors([payload.error || "No pudimos enviar la consulta."]);
        return;
      }
      if (payload.whatsappUrl) {
        window.location.href = payload.whatsappUrl;
        return;
      }
      if (payload.redirectUrl) {
        window.location.href = payload.redirectUrl;
        return;
      }
      setDone(`Listo. Guardamos tu pedido para ${marca}. Te derivamos a la marca: no vendemos el seguro.`);
      form.reset();
    } catch {
      setErrors(["No pudimos enviar la consulta. Probá de nuevo en unos minutos."]);
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border-2 border-indigo-600 bg-white p-6 shadow-lg shadow-indigo-500/10" role="status">
        <h2 className="text-xl font-bold text-gray-900">Quiero que me contacten</h2>
        <p className="mt-3 text-sm leading-relaxed text-gray-700">{done}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative rounded-2xl border-2 border-indigo-600 bg-white p-6 shadow-lg shadow-indigo-500/10" noValidate>
      <h2 className="text-xl font-bold text-gray-900">Quiero que me contacten</h2>
      <p className="mt-1 text-sm text-gray-500">
        {marca === "Consulta general" ? "Dejanos tus datos y te respondemos nosotros." : `Dejanos tus datos para que ${marca} te contacte.`}
      </p>
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label>
          Empresa
          <input name="empresa_web" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="mt-5 space-y-4">
        <label className="block">
          <span className={labelClass}>Tu nombre</span>
          <input name="nombre" autoComplete="name" required className={fieldClass} placeholder="Ej.: Ana Pérez" />
        </label>
        <label className="block">
          <span className={labelClass}>WhatsApp</span>
          <input name="whatsapp" type="tel" inputMode="tel" autoComplete="tel" required className={fieldClass} placeholder="Ej.: 351 1234567" />
        </label>
        <label className="block">
          <span className={labelClass}>Email (opcional)</span>
          <input name="email" type="email" autoComplete="email" className={fieldClass} placeholder="ana@email.com" />
        </label>
        {planes && planes.length > 1 ? (
          <label className="block">
            <span className={labelClass}>Plan</span>
            <select name="planId" defaultValue={defaultPlanId} className={fieldClass}>
              {planes.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.nombre}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <input type="hidden" name="planId" value={defaultPlanId ?? ""} />
        )}
        <fieldset>
          <legend className={labelClass}>Tu mascota</legend>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            {["perro", "gato"].map((value) => (
              <label key={value} className="flex cursor-pointer items-center justify-center rounded-xl border border-gray-200 px-3 py-3 text-sm font-semibold capitalize has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50">
                <input className="sr-only" type="radio" name="especie" value={value} required />
                {value}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="block">
          <span className={labelClass}>Edad de la mascota (meses)</span>
          <input name="edadMeses" type="number" min={0} max={360} required className={fieldClass} placeholder="Ej.: 24" />
        </label>
        <label className="block">
          <span className={labelClass}>Zona</span>
          <select name="zona" required className={fieldClass} defaultValue="">
            <option value="" disabled>
              Elegí una zona
            </option>
            {zones.map((zone) => (
              <option key={zone.slug} value={zone.slug}>
                {zone.label}
              </option>
            ))}
          </select>
        </label>
        {marca === "Consulta general" ? (
          <label className="block">
            <span className={labelClass}>Mensaje (opcional)</span>
            <textarea name="mensaje" rows={3} maxLength={1000} className={fieldClass} />
          </label>
        ) : null}
        <label className="flex items-start gap-3 text-sm leading-relaxed text-gray-700">
          <input name="consentimiento" type="checkbox" required className="mt-1 size-4 accent-indigo-600" />
          <span>
            {consent.replace("Política de privacidad.", "")}
            <Link href="/privacidad" className="font-semibold text-indigo-700 underline">
              Política de privacidad
            </Link>
            .
          </span>
        </label>
        {siteConfig.turnstileSiteKey ? <div className="cf-turnstile" data-sitekey={siteConfig.turnstileSiteKey} /> : null}
        {errors.length ? (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            <ul className="list-disc pl-4">
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        ) : null}
        <button type="submit" className={`${primaryButtonClass} w-full`} disabled={pending}>
          {pending ? "Enviando…" : "Quiero que me contacten"}
        </button>
        <IndependenceNote />
      </div>
    </form>
  );
}
