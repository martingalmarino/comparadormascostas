# Design tokens — Dirección C "Comparador con muchos datos"
Extraídos de `mobile.html` y `desktop.html` (Superdesign, 24/10/2026). Marca: **MascoCompara (nombre provisorio)**.

## Colores
| Token | Valor | Tailwind | Uso |
|---|---|---|---|
| primary | #4F46E5 | indigo-600 | CTAs, chips activos, links, precio en ficha |
| primary-hover | #4338CA | indigo-700 | hover de CTAs |
| ink | #111827 / #0F172A | gray-900 / slate-900 | títulos, botón "Ver detalle" mobile, bloque lead oscuro |
| text | #374151 / #475569 | gray-700 / slate-600 | cuerpo |
| muted | #6B7280 / #9CA3AF | gray-500 / gray-400 | metadatos, "Verificado… · Fuente…" |
| border | #E5E7EB / #E2E8F0 | gray-200 / slate-200 | cards, tabla, inputs |
| surface | #FFFFFF | white | cards |
| bg-subtle | #F9FAFB / #F8FAFC / #F3F4F6 | gray-50 / slate-50 / gray-100 | fondos de sección, AdSense, botones secundarios |
| success | emerald-500 / emerald-700 sobre emerald-50 | | checks de cobertura, "Pros", badge "mejor precio" |
| danger | red-600/700 sobre red-50 | | "Contras / A tener en cuenta" |
| warning (badge EJEMPLO mobile) | amber-800 sobre amber-100 | | badge "EJEMPLO" |
| badge EJEMPLO desktop | blanco sobre gray-900 | | badge "EJEMPLO" (unificar: elegir uno) |
| accent badges | violet/purple-100 ("más cobertura"), amber-100 ("internacional"), blue-100 ("sin carencia") | | |

## Tipografía
- **Sans:** IBM Plex Sans 400/500/600/700 (Google Fonts) — todo el UI.
- **Mono/cifras:** IBM Plex Mono 500 (desktop) / JetBrains Mono 500 (mobile) → unificar en **IBM Plex Mono**, con `font-variant-numeric: tabular-nums` para precios y días de carencia.
- Escala (Tailwind): `text-xs` 12 (eyebrows uppercase tracking-wider, badges, metadatos), `text-sm` 14 (cuerpo mínimo mobile), `text-base` 16, `text-lg` 18, `text-xl` 20, `text-2xl` 24 (precios, títulos de ficha), hero mobile ~30 (`text-3xl`), hero desktop ~40 (`text-4xl/5xl` font-bold).

## Espaciado
Escala de 4px de Tailwind. Más usados: `gap-1/2/3/4/8`, `p-3/4/6`, `px-1.5 py-0.5` (badges), `px-3 py-2` (chips), `px-4 py-3` (botones), `px-6 py-6` (filas de tabla desktop / secciones). Contenedor desktop ~1200–1280px; columna de lead fija ~320px a la derecha.

## Radios
- `rounded` 4px → badges, celdas
- `rounded-lg` 8px → inputs, botones secundarios
- `rounded-xl` 12px → cards, botones primarios (el más usado)
- `rounded-2xl` 16px → bloques grandes (form de lead, panel de buscador)
- `rounded-full` → chips de filtro, toggles

## Sombras
`shadow` sutil en cards; `shadow-lg shadow-indigo-500/20` (aprox.) en CTA primario y caja de lead destacada. Bordes 1px como recurso principal, no sombras pesadas.

## Componentes clave
- **PriceTag:** cifra mono + badge `EJEMPLO` (mientras el precio no sea real) + línea "Verificado DD/MM/AAAA · Fuente: sitio oficial" con ícono calendario y link.
- **FilterChip:** default borde gray-200; activo relleno indigo-600/indigo-50 con ×; wrap en mobile (nunca truncado); "Limpiar filtros" + contador de resultados.
- **PlanCard (mobile) / PlanRow (desktop).**
- **AdSlot:** fondo gray-50, borde gray-200, label "PUBLICIDAD" xs uppercase gray-400; nunca con estilos de PlanCard.
- **LeadForm:** caja borde indigo, sticky desktop / botón sticky bottom en mobile, aviso "no vendemos seguros".
