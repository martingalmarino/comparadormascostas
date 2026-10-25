# SPEC — Ficha de marca enriquecida (/planes/[slug])
Verificado: 2026-10-25 · Bocetos: ficha-rus-desktop.png / ficha-rus-mobile.png (+ .html)

## 0. Principios (no negociables)
- **Nada inventado.** Todo dato de marca sale de `data/marcas/{slug}.json`; cada campo trae `fuente_url` + `fecha_verificacion`. Si es `null`, NO se renderiza y alimenta "Lo que no publica".
- **Prohibido mostrar:** pros/contras (aunque existan en `data/planes`), opiniones/reseñas/ratings, antecedentes regulatorios o sanciones SSN. Solo se muestra el N° de inscripción SSN con link a https://seguro2.ssn.gob.ar/sujetoshabilitados.
- **No se elimina nada de la página actual** (ver §2). Lo nuevo se suma.

## 1. Orden de secciones
1. Header global + Breadcrumbs (Inicio / Comparador / Marca) — existente
2. H1 "{Marca}: planes, precios y coberturas" — existente
3. Párrafo answer-first (generado desde datos: cantidad de planes, precio mínimo verificado y fecha) + chips (SSN, tipo, alcance) + facts (desde, planes, ingreso, vigencia, veterinario) — nuevo, solo con datos no-null
4. Tabs ancla (Planes · Empresa · Cómo se usa · Transparencia · Alternativas · FAQ)
5. Planes: tabla comparativa + tarjetas existentes (zona, especies, edades, precio, "Verificado el … · Fuente", coberturas, carencias) — existente + tabla nueva
6. La empresa (razón social, CUIT, SSN + link registro) — nuevo
7. Canales de contratación y atención — nuevo
8. Cómo se usa: contratar / reintegro / siniestro / baja — nuevo
9. Red de veterinarias — nuevo
10. Lo que no publica (lista `no_publica`) + Inconsistencias detectadas (texto neutral + URL) — nuevo
11. 3 alternativas calculadas (desde `data/planes`, precio verificado más cercano al mínimo de la marca, excluye la propia marca) — nuevo
12. Historial de precio — **solo si hay ≥2 puntos reales**; si no, la sección no existe en el DOM
13. Otros productos de la marca — nuevo
14. Preguntas frecuentes: FAQs de marca generadas desde datos + las 3 FAQs actuales — existente + nuevo
15. Comparar con otra marca (links /versus) — existente
16. Lead form "Quiero que me contacten" (sidebar en desktop, al final en mobile): Empresa, nombre, WhatsApp, email opcional, plan, perro/gato, edad (meses), zona, consentimiento + link a Política de privacidad — existente, SIN CAMBIOS de lógica
17. StickyLeadCTA mobile, CuidaloBot launcher, footer global — existentes, sin cambios

## 2. Checklist existente → dónde queda
| Existente | Dónde queda |
|---|---|
| Header/nav, menú mobile | igual |
| Breadcrumbs + JSON-LD BreadcrumbList | igual (posición 1) |
| H1 | igual, debajo de breadcrumbs |
| Tarjetas de plan (zona, especies, edades, precio, verificado+fuente, coberturas, carencias) | sección Planes, debajo de la tabla nueva |
| JSON-LD Product/Offer por plan, WebPage | igual |
| Comparar con otra marca (/versus) | después de FAQs |
| 3 FAQs actuales | dentro del bloque FAQ, después de las de marca |
| Lead form + consentimiento | sidebar sticky (desktop) / al final (mobile) |
| StickyLeadCTA mobile | igual |
| CuidaloBot | igual |
| Footer | igual |

## 3. Reglas de display / null
- Campo null → no se muestra la fila; se agrega a `no_publica`. Sección entera sin datos → se oculta (excepto "Lo que no publica").
- Debajo de cada sección nueva: "Fuente: {dominio} · consultado {dd/mm/aaaa}".
- Si `tipo_entidad` no es aseguradora (obra social, club, prepaga), "Lo que no publica" no debe sugerir infracción: texto "No figura en la web de la marca".
- Inconsistencias: tono neutral, "La web indica X y también Y. Confirmalo con la marca." + link.

## 4. Esquema `data/marcas/{slug}.json`
```ts
const Fuente = z.object({ fuente_url: z.string().url(), fecha_verificacion: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) });
const Campo = <T extends z.ZodTypeAny>(t: T) => Fuente.extend({ valor: t }).nullable();
export const marcaSchema = z.object({
  slug: z.string(), tipo_entidad: z.string(), fecha_verificacion: z.string(),
  empresa: z.object({ razon_social: Campo(z.string()), cuit: Campo(z.string().nullable()),
    ssn: Fuente.extend({ numero: z.string(), registro_url: z.string().url() }).nullable() }),
  canales: z.array(Fuente.extend({ tipo: z.string(), valor: z.string() })),
  como_se_usa: z.object({ contratar: Campo(z.string()), reintegro: Campo(z.string()), siniestro: Campo(z.string()), baja: Campo(z.string()) }),
  red_veterinaria: Campo(z.string()), edad: Campo(z.string()), carencias: Campo(z.string()),
  otros_productos: Campo(z.array(z.string())),
  inconsistencias: z.array(Fuente.extend({ descripcion: z.string() })),
  no_publica: z.array(z.string()),
}).strict();
```
Validar los 28 en build (`lib/marca-schema.ts` + test). Slug debe existir en `data/planes`.

## 5. Historial de precios (automático)
- `scripts/update-prices.ts`: tras verificar un precio, append `{fecha, precio, fuente}` a `data/historial/{slug}.json` (clave por plan: `{ [planId]: Punto[] }`). Solo precios con estado verificado; no duplicar misma fecha+precio.
- `.github/workflows/update-prices.yml` commitea también `data/historial/`.
- Render: solo si un plan tiene ≥2 puntos. Nunca barras de ejemplo.

## 6. JSON-LD y SEO
- Mantener BreadcrumbList, WebPage (dateModified = max fecha_verificacion), Product/Offer.
- Agregar FAQPage con exactamente las FAQs visibles.
- Agregar Organization (name, legalName = razon_social si no-null, url fuente, identifier SSN si existe). Sin aggregateRating/review.
- title: "{Marca} seguro de mascotas: planes, precios y cobertura ({mes} {año})"; meta description desde answer-first. Canonical sin cambios.

## 7. Implementación por fases
**Fase 1 — solo rus-seguros:** nuevo template detrás de flag (`FICHA_V2_SLUGS=['rus-seguros']` o chequeo de slug); resto de marcas con el template actual. `npm run lint && npm test && npm run build`, commit, push a producción. **FRENAR y esperar aprobación de Martin.**
**Fase 2 — solo con aprobación:** ampliar el flag a las 28 marcas, revisar 3–4 fichas con muchos null (omint-mascotas, fielpet, petit-salud), lint/test/build, commit, push.
