# Prompt para Cursor: SEO on-page del comparador de planes para mascotas (Next.js App Router)

Pegá todo esto en Cursor.

---

Sos un dev senior de Next.js (App Router). Tenés que implementar el SEO on-page del sitio, que hoy es **nacional (Argentina)**. Córdoba pasa a ser solo la primera página local. La marca es provisoria: usá la constante `SITE.name` (hoy `"{MARCA}"`), nunca un texto fijo.

## 0. Bugs críticos encontrados en producción (24-25/10/2026)
Estos tres puntos hacen que Google no indexe bien el sitio:
- `https://comparadormascostas.vercel.app/sitemap.xml` lista todas las URLs con `http://localhost:3000`.
- `robots.txt` tiene `Host: http://localhost:3000` y `Sitemap: http://localhost:3000/sitemap.xml`.
- El `<link rel="canonical">` de la home apunta a `http://localhost:3000`.

**Causa probable:** la URL base sale de una env var que no está definida en Vercel. **Fix:** usar `site.config.ts` con fallback a `process.env.VERCEL_PROJECT_PRODUCTION_URL`.

## 1. site.config.ts
```ts
export const SITE = {
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? "{MARCA}",
  url: process.env.NEXT_PUBLIC_SITE_URL
    ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000"),
  locale: "es_AR",
};
```
En Vercel, setear `NEXT_PUBLIC_SITE_URL=https://comparadormascostas.vercel.app` (después, el dominio final).

## 2. app/layout.tsx
```ts
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `Obra social para mascotas: compará precios | ${SITE.name}`, template: `%s | ${SITE.name}` },
  description: "...meta de la home...",
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "es_AR", siteName: SITE.name },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};
```
- La tabla de abajo trae el title **completo**. En las rutas, pasá el title **sin** el sufijo `| {MARCA}` para que lo agregue el template.
- Si la tabla dice que va sin sufijo (`/precios` y la ficha de Banco Provincia), usá `title: { absolute: "..." }`.
- Usá `<html lang="es-AR">`.

## 3. Por ruta
- **Páginas estáticas:** `export const metadata` con `title`, `description`, `alternates.canonical` (ruta relativa) y `openGraph` (title, description, url).
- **Dinámicas** (`/planes/[marca]`, `/versus/[par]` y las nuevas ciudades): usar `generateMetadata` leyendo `data/planes.json`.
  - Variables:
    - `{marca}`, `{cantidad_planes}`
    - `{precio_desde}`: el mínimo de `precio_mensual_ars` con `estado` = `verificado`, formateado `es-AR`.
    - `{fecha}`: `fecha_verificacion` en formato DD/MM/AAAA.
    - `{año}`, `{mes_año}`: por ejemplo "octubre 2026", tomado de la fecha de verificación más reciente, **no** de `new Date()`.
  - Si una marca no tiene precio verificado, usá la meta alternativa ("Precio no publicado: te contamos cómo cotizar...").
- **Versus:**
  - `robots: { index: false, follow: true }` cuando alguna de las dos marcas no tiene precio verificado (son páginas pobres).
  - Sacar esos pares del sitemap.
- **El H1 de cada página es el de la tabla.** Tiene que haber un solo `<h1>` y no puede ser igual al title.
- Reemplazar en todos los textos visibles y metas las referencias "en Córdoba" por nacionales, salvo en `/cordoba*`.

## 4. Borrar las guías (decisión de Martin)
Hay que eliminar del todo:
- `/guias/carencias-y-preexistencias`
- `/guias/obra-social-vs-seguro`
- `/guias/perros-mayores`
- `/guias/seguro-perros-peligrosos`

Qué tocar:
- Borrar las rutas y su contenido (MDX o componentes).
- Quitar todos los links internos: nav, footer, cards de `/guias`, links contextuales en fichas y comparador. Buscalos con `rg "guias/"`.
- Quitarlas del sitemap.

Redirects 301 en `next.config` (`async redirects()`, con `permanent: true`):

| Origen | Destino |
|---|---|
| /guias/carencias-y-preexistencias | /como-comparamos |
| /guias/obra-social-vs-seguro | / |
| /guias/perros-mayores | /seguro-para-perros |
| /guias/seguro-perros-peligrosos | /seguro-para-perros (o /seguro-responsabilidad-civil-perros si se crea) |
| /guias (si queda vacía) | /comparar |

Si `/guias` queda vacía, también borrala y quitala del nav.

## 5. app/sitemap.ts y app/robots.ts
- **sitemap.ts:**
  - URLs absolutas con `SITE.url`.
  - Incluir: home, `/comparar`, `/precios`, perros, gatos, `/cordoba`, `/cordoba/veterinarias-con-plan`, `/como-comparamos`, `/contacto`, legales, las 14 `/planes/*` y solo los `/versus/*` indexables.
  - **Sin guías.**
  - `lastModified` = `fecha_verificacion` más reciente.
- **robots.ts:** `rules: { userAgent: "*", allow: "/" }`, `sitemap: ${SITE.url}/sitemap.xml`. Sacar `Host`.

## 6. Tabla completa (el title incluye el sufijo; los caracteres se cuentan con {MARCA} = "PetCompara", 10 caracteres)
Las URLs "(nueva, opcional)" **no** se crean salvo que Martin lo pida. Se dejan para la próxima etapa.

| URL | Keyword principal | Secundarias | Title (car.) | Meta (car.) | H1 | Nota |
|---|---|---|---|---|---|---|
| `/` | obra social para mascotas | obra social para mascotas argentina; prepaga para mascotas; cual es la mejor obra social para mascotas | Obra social para mascotas: compará precios \| {MARCA} (55) | Compará obras sociales, prepagas y seguros para perros y gatos en Argentina. Precios con fecha y fuente de cada marca. Elegí tu plan en minutos, gratis. (152) | Obra social para mascotas: compará planes y precios en Argentina |  |
| `/comparar` | comparador seguro mascotas | comparador seguro salud mascotas; comparar obras sociales para mascotas; comparador seguro veterinario mascotas | Comparador de seguros para mascotas \| {MARCA} (48) | Filtrá por especie, edad, zona y tipo de plan, y compará lado a lado obras sociales y seguros para tu perro o gato. Sin costo y sin vender seguros. (147) | Comparador de planes de salud y seguros para mascotas |  |
| `/precios` | obra social para mascotas precio | cuanto sale una obra social para mascotas; prepaga para mascotas precio; seguro para perros precio | Cuánto sale una obra social para mascotas en {mes_año} (54) | Precios de {mes_año} de {cantidad_planes} planes para perros y gatos en Argentina, desde ${precio_min}/mes. Cada valor tiene fecha y fuente. Mirá la tabla. (155) | Precios de obras sociales y seguros para mascotas ({mes_año}) | Dinámica. Sin '\| {MARCA}' para no pasar de 60. |
| `/seguro-para-perros` | seguro para perros | obra social para perros; obra social para perros precio; seguro para perros mayores; seguro perros responsabilidad civil | Seguro y obra social para perros en Argentina \| {MARCA} (58) | Planes para perros desde ${precio_min_perro}/mes: consultas, cirugías, responsabilidad civil y edad máxima. Compará {cantidad_planes_perro} opciones. (149) | Seguro y obra social para perros: planes y precios | Absorbe la intención de la guía 'perros-mayores' y 'perros peligrosos' (sección dentro de la página). |
| `/seguro-para-gatos` | obra social para gatos | seguro para gatos; cuanto sale una obra social para gatos; hay obra social para gatos | Obra social y seguro para gatos en Argentina \| {MARCA} (57) | ¿Hay obra social para gatos? Sí: compará {cantidad_planes_gato} planes con precios desde ${precio_min_gato}/mes, coberturas y carencias. Encontrá el tuyo. (154) | Obra social y seguro para gatos: planes y precios |  |
| `/cordoba` | obra social para mascotas cordoba | obra social para mascotas en córdoba capital; obra social para perros córdoba; obra social para gatos cordoba; rio cuarto | Obra social para mascotas en Córdoba \| {MARCA} (49) | Planes para perros y gatos con cobertura en Córdoba Capital, Río Cuarto, Villa María y Sierras Chicas. Compará precios, red de veterinarias y carencias. (152) | Obra social para mascotas en Córdoba | Primera página local; plantilla para /[ciudad]. |
| `/cordoba/veterinarias-con-plan` | veterinarias con obra social mascotas cordoba | veterinarias que aceptan obra social mascotas; cartilla veterinaria córdoba | Veterinarias con plan de salud en Córdoba \| {MARCA} (54) | Cómo saber si tu veterinaria de Córdoba atiende con algún plan para mascotas, qué preguntar antes de afiliarte y qué marcas trabajan por reintegro. (147) | Veterinarias con plan de salud para mascotas en Córdoba | Keyword no apareció en autocomplete: prioridad baja. |
| `/como-comparamos` | cómo comparamos planes para mascotas | metodología comparador | Cómo comparamos los planes para mascotas \| {MARCA} (53) | Nuestra metodología: fuentes oficiales, fecha de verificación de cada precio, regla de 45 días y por qué no vendemos seguros. Transparencia total. (146) | Cómo comparamos los planes de salud para mascotas | E-E-A-T, no compite por keywords. |
| `/guias` | guía obra social para mascotas | obra social vs seguro mascotas; carencias | Guías de obra social y seguro para mascotas \| {MARCA} (56) | Guías claras para elegir cobertura para tu perro o gato: qué cubre cada tipo de plan, carencias, edad máxima y qué preguntar antes de contratar. (144) | Guías para elegir la cobertura de tu mascota | Mantener solo si queda con contenido; si queda vacía, noindex o 301 a /comparar. |
| `/contacto` | contacto |  | Contacto \| {MARCA} (21) | Escribinos por dudas sobre el comparador, para corregir un precio o para sumar tu marca. Respondemos en días hábiles. Aclaración: no vendemos seguros. (150) | Contacto | noindex opcional no; indexable sin keyword. |
| `/privacidad` | política de privacidad |  | Política de privacidad \| {MARCA} (35) | Cómo tratamos tus datos personales según la Ley 25.326, para qué los usamos y cómo ejercer tus derechos de acceso, rectificación y supresión. (141) | Política de privacidad |  |
| `/terminos` | términos y condiciones |  | Términos y condiciones \| {MARCA} (35) | Condiciones de uso del comparador de planes para mascotas. Informamos precios relevados de fuentes públicas; no vendemos ni intermediamos seguros. (146) | Términos y condiciones |  |
| `/planes/[marca] (plantilla)` | {marca} mascotas | {marca} opiniones; {marca} precio; {marca} planes; {marca} telefono | {marca}: precios y planes {año} \| {MARCA} (44) | {marca}: {cantidad_planes} planes desde ${precio_desde}/mes. Coberturas, carencias, edad máxima y fuente, con precio verificado el {fecha}. Compará. (148) | {marca}: planes, precios y coberturas | Si no hay precio: meta alternativa abajo. Ver variantes por marca. |
| `/versus/[a]-vs-[b] (plantilla)` | {marca_a} vs {marca_b} | {marca_a} o {marca_b}; diferencias | {marca_a} vs {marca_b}: precios y coberturas \| {MARCA} (57) | ¿{marca_a} o {marca_b}? Compará precio desde, coberturas, carencias y edad máxima de cada plan, lado a lado y con fuente oficial. Mirá cuál te conviene. (152) | {marca_a} vs {marca_b}: ¿cuál conviene? | Indexar solo pares con ambos precios verificados; resto noindex,follow (pares con consultar = thin). |
| `/obra-social-para-mascotas/[ciudad] (nueva, opcional)` | obra social para mascotas {ciudad} | obra social para perros {ciudad}; prepaga para mascotas {ciudad} | Obra social para mascotas en {ciudad} \| {MARCA} (50) | Planes para perros y gatos con cobertura en {ciudad}: {cantidad_planes} opciones desde ${precio_desde}/mes, red veterinaria y reintegros. Compará gratis. (153) | Obra social para mascotas en {ciudad} | Prioridad: CABA, Rosario, Mendoza, La Plata, Mar del Plata, Santa Fe, Tucumán, Salta, Neuquén, San Juan (todas en autocomplete). Mover /cordoba aquí o mantener /cordoba con canonical propio. |
| `/mejor-obra-social-para-mascotas (nueva, opcional)` | mejor obra social para mascotas | cual es la mejor obra social para mascotas en argentina; que seguro para perros es mejor | Mejor obra social para mascotas en {año} \| {MARCA} (53) | Ranking por perfil: más barata, más cobertura, mejor para cachorros y para perros mayores. Criterios públicos y precios verificados. Mirá cuál conviene. (152) | ¿Cuál es la mejor obra social para mascotas en Argentina? | Alta intención comercial; criterios explícitos para no 'prometer'. |
| `/seguro-responsabilidad-civil-perros (nueva, opcional)` | seguro de responsabilidad civil perros | seguro perros peligrosos; seguro obligatorio perros peligrosos; seguro rc perros | Seguro de responsabilidad civil para perros \| {MARCA} (56) | Qué cubre la responsabilidad civil para perros, montos de cada plan (de $1M a $20M) y qué marcas aceptan razas potencialmente peligrosas. Compará. (146) | Seguro de responsabilidad civil para perros | Reemplaza a la guía borrada seguro-perros-peligrosos (destino del 301). |
| `/planes/companion` | companion obra social mascotas | companion opiniones; companion precio; companion telefono | Companion: precios y planes 2026 \| {MARCA} (45) | Companion: 3 planes desde $39.000/mes (verificado 24/10/2026). Coberturas, carencias, edad máxima y fuente. Compará con otras marcas gratis. (140) | Companion: planes, precios y coberturas | Instancia de la plantilla |
| `/planes/fielpet` | fielpet seguro | fielpet opiniones; fielpet precio; fielpet telefono | FielPet: precios y planes 2026 \| {MARCA} (43) | FielPet: 5 planes desde $19.047/mes (precio verificado 24/10/2026). Coberturas, carencias, edad máxima y fuente. Compará con otras marcas gratis. (145) | FielPet: planes, precios y coberturas | Instancia de la plantilla |
| `/planes/osmasc` | osmasc obra social para mascotas | osmasc opiniones; osmasc precio; osmasc telefono | OSMASC: precios y planes 2026 \| {MARCA} (42) | OSMASC: 2 planes desde $22.000/mes (precio verificado 24/10/2026). Coberturas, carencias, edad máxima y fuente. Compará con otras marcas gratis. (144) | OSMASC: planes, precios y coberturas | Instancia de la plantilla |
| `/planes/ike-mascotas` | ike mascotas planes | ike opiniones; ike precio; ike telefono | Iké Mascotas: precios y planes 2026 \| {MARCA} (48) | Iké Mascotas: 4 planes desde $27.900/mes (verificado 24/10/2026). Coberturas, carencias, edad máxima y fuente. Compará con otras marcas gratis. (143) | Iké Mascotas: planes, precios y coberturas | Instancia de la plantilla |
| `/planes/rus-seguros` | rus seguro mascotas | rus opiniones; rus precio; rus telefono | RUS Seguros: precios y planes 2026 \| {MARCA} (47) | RUS Seguros: 4 planes desde $7.000/mes (verificado 24/10/2026). Coberturas, carencias, edad máxima y fuente. Compará con otras marcas gratis. (141) | RUS Seguros: planes, precios y coberturas | Instancia de la plantilla |
| `/planes/qualia-seguros` | qualia seguro mascotas | qualia opiniones; qualia precio; qualia telefono | Qualia Seguros: precios y planes 2026 \| {MARCA} (50) | Qualia Seguros: 5 planes desde $9.700/mes (precio verificado 24/10/2026). Coberturas, carencias, edad máxima y fuente. Compará con otras marcas. (144) | Qualia Seguros: planes, precios y coberturas | Instancia de la plantilla |
| `/planes/answer-seguros` | answer seguros mascotas | answer opiniones; answer precio; answer telefono | Answer Seguros: precios y planes 2026 \| {MARCA} (50) | Answer Seguros: 1 plan desde $6.135/mes (verificado 24/10/2026). Coberturas, carencias, edad máxima y fuente. Compará con otras marcas gratis. (142) | Answer Seguros: planes, precios y coberturas | Instancia de la plantilla |
| `/planes/pet-society` | pet society obra social | pet opiniones; pet precio; pet telefono | Pet Society: precios y planes 2026 \| {MARCA} (47) | Pet Society: 2 planes desde $9.489/mes (verificado 24/10/2026). Coberturas, carencias, edad máxima y fuente. Compará con otras marcas gratis. (141) | Pet Society: planes, precios y coberturas | Instancia de la plantilla |
| `/planes/provincia-seguros-banco-provincia` | seguro mascotas banco provincia | provincia opiniones; provincia precio; provincia telefono | Seguro mascotas Banco Provincia: precios y planes 2026 (54) | Provincia Seguros: 3 planes desde $11.005/mes (verificado 24/10/2026). Coberturas, carencias, edad máxima y fuente. Compará con otras marcas. (141) | Provincia Seguros: planes, precios y coberturas | Instancia de la plantilla |
| `/planes/avsim` | avsim obra social para mascotas | avsim opiniones; avsim precio; avsim telefono | AVSIM: precios y planes 2026 \| {MARCA} (41) | AVSIM: 4 planes para perros y gatos. Qué cubre, carencias y edad máxima. Precio no publicado: te contamos cómo cotizar. Compará con otras marcas gratis. (152) | AVSIM: planes, precios y coberturas | Instancia de la plantilla |
| `/planes/puppis-one` | puppis one precio | puppis opiniones; puppis precio; puppis telefono | Puppis One: precios y planes 2026 \| {MARCA} (46) | Puppis One: 2 planes para perros y gatos. Qué cubre, carencias y edad máxima. Precio no publicado: te contamos cómo cotizar. Compará con otras marcas. (150) | Puppis One: planes, precios y coberturas | Instancia de la plantilla |
| `/planes/federacion-patronal-via-mascotaleal` | seguro para mascotas federacion patronal | federacion opiniones; federacion precio; federacion telefono | Federación Patronal: precios y planes 2026 \| {MARCA} (55) | Federación Patronal (vía MascotaLeal): seguro para perros con RC de hasta $20M. Qué cubre y cómo cotizar, porque el precio no es público. Compará. (146) | Federación Patronal: planes, precios y coberturas | Instancia de la plantilla |
| `/planes/bbva-seguros` | seguro mascotas bbva | bbva opiniones; bbva precio; bbva telefono | BBVA Seguros: precios y planes 2026 \| {MARCA} (48) | BBVA Seguros: 1 plan para perros y gatos. Qué cubre, carencias y edad máxima. Precio no publicado: te contamos cómo cotizar. Compará con otras marcas. (150) | BBVA Seguros: planes, precios y coberturas | Instancia de la plantilla |
| `/planes/petit-salud` | petit salud mascotas | petit opiniones; petit precio; petit telefono | Petit Salud: precios y planes 2026 \| {MARCA} (47) | Petit Salud: 4 planes para perros y gatos. Qué cubre, carencias y edad máxima. Precio no publicado: te contamos cómo cotizar. Compará con otras marcas. (151) | Petit Salud: planes, precios y coberturas | Instancia de la plantilla |

## 7. Criterios de aceptación
1. **Largos:** todos los `<title>` renderizados tienen ≤ 60 caracteres y todas las meta description están entre 140 y 155. Agregá `scripts/check-seo.ts`, que recorra el sitemap del build y falle si no se cumple, si hay titles o metas duplicados, o si falta el `<h1>` o hay más de uno.
2. **Sin localhost en producción:** `sitemap.xml`, `robots.txt` y los canonical usan el dominio de producción. `curl -s $URL/sitemap.xml | grep -c localhost` tiene que dar 0.
3. **Canonical propio:** cada página tiene un canonical absoluto apuntando a sí misma.
4. **Guías borradas:**
   - Las 4 guías devuelven 308/301 al destino indicado: `curl -sI` y revisar el `location`.
   - `rg "guias/"` en `src` da 0 resultados.
   - El sitemap no las incluye.
5. **Social:** OG y Twitter tienen title y description en cada página.
6. **Versus:** los pares sin precio verificado tienen `noindex,follow` y no están en el sitemap.
7. **Build:** `next build` sin errores ni warnings de metadata. Lighthouse SEO = 100 en home, una ficha y `/precios`.
8. **Sin promesas falsas:** no aparecen "opiniones" ni "el mejor" si la página no tiene ese contenido.
