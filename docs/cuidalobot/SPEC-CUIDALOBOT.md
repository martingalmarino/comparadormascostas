# CuidaloBot — especificación

Asistente determinístico de Cuidalo. SIN LLM, SIN APIs externas, sin texto generado libremente. Responde solo con datos de `data/planes/*.json` (vía `lib/plans.ts`) y textos fijos.

## Referencias visuales (fuente de verdad del diseño)
- `cuidalobot-mobile.png` / `cuidalobot-mobile.html` (390px: launcher cerrado, sheet con chips, respuesta)
- `cuidalobot-desktop.png` / `cuidalobot-desktop.html` (1440px: panel flotante 400×720 abajo a la derecha)
- Tokens: `docs/DESIGN-TOKENS.md` (dirección C). IBM Plex Sans + IBM Plex Mono (tabular-nums) para precios, indigo-600 acciones/mensajes del usuario, slate-900 launcher y "Ver plan", rounded-2xl panel, rounded-xl cards, checks emerald.
- Los datos del mock son ejemplo; los logos son placeholders (usar public/logos/).

## Arquitectura
- `lib/bot/intents.ts`: intents {id, label, keywords normalizadas, slots}.
- `lib/bot/match.ts`: matcher de texto libre por keywords + extracción de slots (especie, provincia desde lib/zones.ts, marca desde getMarcas(), edad). Sin match → mostrar chips base.
- `lib/bot/answers.ts`: una función pura por intent → {texto, stats?, planes?, ctas}. Si no hay datos: "No tengo ese dato todavía" + CTA /comparar.
- `lib/bot/static.ts`: textos fijos editables.
- `components/CuidaloBot/*` (client). Datos: resumen público de planes pasado como prop desde el server. Ninguna llamada de red.

## Intents base (chips)
1. precio_aprox — ¿Cuánto sale un seguro para mi perro o gato? (slots especie + provincia) → mín/mediana/máx $/mes, "Según N planes verificados de M marcas", top 3 cards.
2. mas_barato — ¿Cuál es el plan más barato en mi provincia?
3. cobertura_marca — ¿Qué cubre el plan de [marca]?
4. tipos — Obra social vs seguro vs adicional de hogar (fijo).
5. edad — ¿Hasta qué edad puedo asegurar a mi mascota?
6. teleconsulta — Planes con veterinario online / 24h.
7. rc — Planes con responsabilidad civil.
8. carencia — ¿Hay carencia? ¿Desde cuándo cubre?
9. vende — ¿Cuidalo vende seguros? → No, te derivamos a la marca.
10. contacto_marca — Quiero que me contacte una marca → abre formulario de lead existente (consentimiento Ley 25.326).

## Reglas de datos
- Solo planes con precio válido (no vencidos > priceStaleDays, no "requiere revisión"). Precio null = "Precio a consultar", fuera de rangos.
- Provincia: planes que la cubren + nacionales.
- Toda respuesta con precio: "Precio referencial · verificado DD/MM/AAAA · confirmalo con la marca · Fuente".
- Follow-ups: "Ver los N planes →" (/comparar con filtros), "Que me contacte una marca", "Otra pregunta".

## UI
- Launcher "Preguntale a CuidaloBot" abajo a la derecha; en mobile ~84px del borde, por encima del StickyLeadCTA.
- Mobile: bottom sheet full-height. Desktop: panel 400×720.
- Header: avatar SVG (escudo + huella), "Responde solo con datos publicados en Cuidalo", reiniciar ↺, cerrar.
- Slots como pills; la elegida queda indigo, el resto gris.
- Input: "Escribí: perro, gato, provincia, marca…". Pie: "Cuidalo no vende seguros. Respuestas automáticas con datos del sitio."
- Accesible: aria-live, foco atrapado, Esc cierra.

## Analytics
Evento por intent, slots y "sin respuesta". No guardar texto personal.
