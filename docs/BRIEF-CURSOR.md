# Brief para Cursor — MVP Fase 1: comparador de obras sociales y seguros para mascotas (Córdoba)

> Pegá este archivo como prompt inicial en Cursor. Adjuntá también `DESIGN-TOKENS.md`, `mobile.html`, `desktop.html` y los PNG de esta carpeta como referencia visual (dirección C aprobada).

## 1. Contexto
- Sitio **independiente** que compara obras sociales, planes de salud y seguros para mascotas con foco en **Córdoba, Argentina**. Español rioplatense (vos).
- Marca: **"MascoCompara" es un nombre PROVISORIO** → centralizalo en `site.config.ts` (`siteName`, `domain`) para cambiarlo en un solo lugar. Todavía no hay dominio.
- Monetización: **leads** (derivación a la marca, NO venta ni intermediación de seguros) + **Google AdSense** discreto.
- Diseño: dirección C "comparador con muchos datos", mobile-first. Respetá los tokens de `DESIGN-TOKENS.md` (índigo #4F46E5, IBM Plex Sans + IBM Plex Mono con cifras tabulares, radios 12px, bordes finos).

## 2. Stack
- **Next.js (App Router, TypeScript)**, SSG + ISR (`revalidate`), deploy en **Vercel**.
- **Tailwind CSS** con theme extendido desde los tokens; `next/font` para IBM Plex.
- **Sin CMS.** Contenido en el repo:
  - `data/planes/*.json` (un archivo por marca) validado con **zod**.
  - `content/guias/*.mdx` para guías.
- Analítica: Vercel Analytics + GA4 (con banner de consentimiento). Search Console.
- Leads: Route Handler `app/api/leads/route.ts` → guardar (Vercel KV/Upstash o Google Sheet vía API, configurable) + notificación por email (Resend). Opción de redirigir a WhatsApp de la marca.
- Más adelante (no ahora): gestor básico de datos.

## 3. Modelo de datos (`data/planes/<marca>.json`)
```ts
type Plan = {
  id: string;                 // "petit-salud-vital-plus"
  marca: string;              // "Petit Salud"
  marca_slug: string;         // "petit-salud"
  nombre: string;             // "Plan Vital Plus"
  tipo: "obra_social" | "plan_salud" | "seguro";
  especies: ("perro" | "gato")[];
  edad_min_meses?: number; edad_max_anios?: number;
  zonas: string[];            // ["cordoba-capital","gran-cordoba", ...]
  precio: number | null;      // ARS mensual; null si no se publica
  moneda: "ARS";
  es_ejemplo: boolean;        // true => mostrar badge "EJEMPLO"
  fecha_verificacion: string; // ISO "2026-10-20"
  fuente_url: string;         // página oficial donde se verificó
  estado: "verificado" | "requiere_revision" | "sin_precio_publico" | "desactualizado";
  coberturas: { item: string; valor: string }[];
  carencias: { item: string; dias: number }[];
  pros: string[]; contras: string[];
  badges?: ("mejor_precio" | "mas_cobertura" | "sin_carencia" | "internacional")[];
  lead: { modo: "form" | "whatsapp" | "link"; destino?: string };
};
```
Marcas iniciales (de la investigación): Petit Salud, AVSIM, IKE Mascotas, Companion, FielPet, OSMASC (+ resto del relevamiento hasta 12–15). **Cargar precios reales sólo con fuente y fecha; mientras tanto `es_ejemplo: true`.** Reglas de UI: si `estado !== "verificado"` mostrar aviso; si la fecha tiene más de 45 días → "desactualizado".

## 4. Páginas y URLs (Fase 1)
| URL | Keyword | Tipo |
|---|---|---|
| `/` | obra social para mascotas | Home con buscador + comparador resumido |
| `/comparar` | comparar obras sociales para mascotas | Comparador filtrable (filtros en query params) |
| `/seguro-para-perros` | seguro para perros | Pilar |
| `/seguro-para-gatos` | seguro para gatos | Pilar |
| `/precios` | seguro de mascotas precio | Precios del mes |
| `/planes/[marca]` | [marca] opiniones / precio | Ficha por competidor (con lead) |
| `/versus/[a]-vs-[b]` | companion vs fielpet | Comparación directa (generar pares top) |
| `/cordoba` | obra social para mascotas córdoba | Local |
| `/cordoba/veterinarias-con-plan` | plan de salud mascotas córdoba | Local |
| `/guias/obra-social-vs-seguro` | diferencia obra social y seguro | Guía |
| `/guias/seguro-perros-peligrosos` | seguro perros peligrosos | Guía legal |
| `/guias/perros-mayores` | seguro para perros mayores | Guía por perfil |
| `/guias/carencias-y-preexistencias` | carencia seguro mascotas | Guía |
| `/como-comparamos`, `/privacidad`, `/terminos`, `/contacto` | — | Confianza / legales |

## 5. Componentes
`Header` (logo + etiqueta "nombre provisorio" configurable), `Footer`, `SearchBox` (especie, edad, zona, tipo), `TrustBar` (precios verificados · fuentes citadas · independiente · no vendemos seguros), `FilterChips` (mobile, wrap, nunca truncar) / `FilterSidebar` (desktop), `ResultsCount` + `ClearFilters`, `SortSelect`, `PlanCard` (mobile) / `PlanTable` + `PlanRow` (desktop), `PriceTag` (precio mono + badge EJEMPLO + `VerifiedLine` con fecha y link a fuente + estado), `Badge`, `CoverageList`, `WaitingPeriods`, `ProsCons`, `LeadForm`, `StickyLeadCTA` (mobile), `AdSlot`, `CompareTray` (hasta 3 planes), `Breadcrumbs`, `FAQ`.

## 6. Comparador
- Filtros: **tipo de plan, especie, edad, rango de precio, zona** + coberturas clave. Estado en la URL (`/comparar?especie=perro&zona=nueva-cordoba&tipo=seguro&max=15000`) para compartir e indexar con cuidado (canonical a `/comparar`, `noindex` para combinaciones).
- Orden: menor precio (default), más cobertura, actualizado más reciente.
- Chip activo relleno índigo con ×; contador "N planes encontrados"; "Limpiar filtros".
- Mobile: cards; desktop: tabla + sidebar + columna AdSense.
- Todo precio visible muestra fecha de verificación y fuente; badge "EJEMPLO" si `es_ejemplo`. Planes sin precio público: "Precio no publicado · Consultar".

## 7. Formulario de leads
- Campos: nombre, WhatsApp (validación AR, ej. 351…), email opcional, especie, edad de la mascota, zona; honeypot + rate limit (y Turnstile opcional).
- **Consentimiento Ley 25.326 (Protección de Datos Personales)**: checkbox obligatorio, no premarcado: "Acepto que MascoCompara comparta mis datos con [Marca] para que me contacte, según la [Política de privacidad]." Incluir en la política: responsable, finalidad, destinatarios (la marca elegida), derechos de acceso, rectificación y supresión (art. 14–16), y la leyenda de la AAIP sobre el derecho de acceso gratuito. Registrar fecha, IP y texto aceptado.
- Aviso visible: **"Somos un comparador independiente. Te derivamos a la marca: no vendemos seguros ni intermediamos en la contratación."**
- CTA: "Quiero que me contacten" (no agresivo); sticky bottom en mobile y columna sticky en desktop.
- Validar con un abogado antes de lanzar.

## 8. AdSense
- `AdSlot` con label "Publicidad", fondo gray-50, alto reservado (evitar CLS), lazy load.
- Ubicaciones: 1 entre la card 2 y la 3 del comparador mobile, columna derecha del comparador desktop, pie de ficha y de guías. **Nunca** dentro del formulario de lead ni con apariencia de PlanCard.
- Cargar el script sólo con consentimiento; `ads.txt` en `/public`. Flag `NEXT_PUBLIC_ADS_ENABLED`.

## 9. SEO técnico
- `generateMetadata` por página (title, description, canonical, OpenGraph, `es_AR`).
- Schema JSON-LD: `Organization` + `WebSite` (home), `BreadcrumbList`, `FAQPage` (guías/fichas), `ItemList` (comparador), `Product` + `Offer` (fichas, con `priceCurrency: ARS` y `priceValidUntil`; **omitir Offer si `es_ejemplo` o sin precio verificado**).
- `app/sitemap.ts` (con `lastModified` = `fecha_verificacion`) y `app/robots.ts`.
- Core Web Vitals: imágenes `next/image`, fuentes con `next/font`, sin layout shift en AdSlots.
- Contenido local de Córdoba (barrios, veterinarias) y fecha "Actualizado el …" visible.

## 10. Job de actualización de precios
- **GitHub Action** programada (semanal, ej. lunes 09:00 ART) — preferible porque edita JSON del repo — o Vercel Cron → Route Handler protegido con `CRON_SECRET`.
- Script `scripts/update-prices.ts`: por marca, un scraper (Playwright o fetch + cheerio) con selector configurable en `data/scrapers.json`.
- Si el precio cambia ±X% o el scraper falla → **no publicar automático**: setear `estado: "requiere_revision"`, guardar `precio_detectado`, y abrir un **Pull Request** con el diff + resumen (o issue). Martin revisa y mergea → Vercel redeploya.
- Si coincide → actualizar `fecha_verificacion`.
- Respetar robots.txt / términos de cada sitio, frecuencia baja, User-Agent identificable.

## 11. Orden de sprints
0. **Setup** (½ semana): repo, Next.js + Tailwind + tokens, `site.config.ts`, layout, Header/Footer, deploy en Vercel.
1. **Datos + comparador** (1 semana): schema zod, JSON de 6 marcas (precios EJEMPLO), `/comparar` con filtros, orden, cards/tabla.
2. **Home + fichas** (1 semana): `/`, `/planes/[marca]`, PriceTag/VerifiedLine, ProsCons, carencias.
3. **Leads + legales** (½–1 semana): LeadForm, API, consentimiento Ley 25.326, `/privacidad`, `/terminos`, `/como-comparamos`.
4. **SEO** (1 semana): metadata, JSON-LD, sitemap/robots, `/cordoba`, pilares, `/precios`, `/versus`, 4 guías MDX.
5. **Automatización de precios** (½–1 semana): scrapers + GitHub Action + PRs "requiere revisión".
6. **AdSense + analítica + QA** (½ semana): AdSlots, consentimiento, GA4, Lighthouse ≥90 mobile, pruebas en celular.
7. **Carga de precios reales verificados** y lanzamiento; alta en Search Console.

## 12. Criterios de aceptación generales
- Ningún precio sin fecha y fuente; badge EJEMPLO mientras no sea real.
- Mobile 360–430px sin overflow horizontal; chips nunca truncados.
- Accesibilidad AA (contraste, labels, foco visible).
- Nombre de marca cambiable desde un solo archivo.
