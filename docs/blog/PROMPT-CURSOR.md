# Prompt para Cursor — Blog de Cuidalo

Pegá esto en Cursor:

```
Objetivo: crear la sección Blog de Cuidalo (/blog y /blog/<slug>) en este repo Next.js App Router + Tailwind, con el mismo look del sitio (IBM Plex, indigo, header y footer actuales). Los diseños de referencia están en docs/blog/ (01-blog-index-desktop.png, 02-blog-articulo-desktop.png, 03-blog-articulo-mobile.png y los HTML del zip).

REGLA CLAVE: los posts llegan como archivos markdown TERMINADOS, escritos por otro proceso. Publicar un post = commitear UN archivo nuevo en content/blog/<slug>.md (o .mdx) en main. Nunca tiene que hacer falta tocar código, rutas, sitemap, llms.txt ni RSS para sumar un post: todo se genera leyendo la carpeta.

1. Contenido y schema
- Carpeta content/blog/. Aceptá .md y .mdx. El slug es el nombre del archivo.
- Frontmatter validado con zod en lib/blog-schema.ts:
  title (string), description (string, ≤160), date (YYYY-MM-DD), updated (YYYY-MM-DD, opcional), category (enum: "Seguros" | "Cuidados"), keywords (string[]), direct_answer (string, opcional: si viene, se muestra arriba en el recuadro "Respuesta directa"), author (string), reviewed_by (string, opcional), faq ({q, a}[]), sources ({title, url, publisher?, accessed?}[] con al menos 1), related (string[] de rutas internas, opcional), draft (boolean, opcional).
- Si un archivo no valida, que el build falle con un mensaje claro que diga qué archivo y qué campo. No inventes valores por defecto para fuentes ni FAQ.
- Posts con draft: true o con date futura no se publican (así se pueden commitear por adelantado). Como el sitio es estático, que se revalide diariamente (revalidate = 86400 o equivalente) para que un post con fecha de hoy aparezca solo.
- Tiempo de lectura: calculado del texto (≈200 palabras/min). No va en el frontmatter.

2. Páginas
- /blog: listado de tarjetas (categoría, título, description, fecha, minutos de lectura), filtro por categoría (/blog?categoria=… o /blog/categoria/<slug>), orden por fecha desc. Al final, una card discreta "Compará planes" → /comparar.
- /blog/<slug>: breadcrumbs (Inicio › Blog › Categoría › Título), H1, autor + "Revisado por" (si hay) + publicado/actualizado + minutos, recuadro "Respuesta directa" (si hay direct_answer), índice (TOC) generado de los H2 (sticky a la izquierda en desktop, desplegable en mobile), cuerpo, FAQ desde faq[], sección "Fuentes" desde sources[] (links con rel="noopener" target="_blank"), "Seguí comparando" con /comparar, /precios, /seguro-para-perros o /seguro-para-gatos según categoría y los links de related, y al final el LeadForm existente (sin cambiarlo; el honeypot empresa_web sigue oculto).
- Componentes MDX/markdown: blockquote con estilo de "bloque citable" (borde indigo), y un aviso fijo "Esto no reemplaza la consulta con tu veterinario" en todos los posts de la categoría "Cuidados".
- CTA discreto "¿Tu plan cubre esto? Compará planes" en el cuerpo (una sola vez, después de la mitad) → /comparar. Cuidalo es comparador: nunca "cotizá con nosotros" ni "contratá acá".
- No mostrar precios hardcodeados en el blog: si un post menciona precios, que enlace a /precios.

3. SEO / AEO
- generateMetadata por post: title "{title} | Cuidalo", description, canonical, OpenGraph (article, publishedTime, modifiedTime).
- JSON-LD por post: Article (headline, description, datePublished, dateModified, author, publisher Cuidalo, mainEntityOfPage), FAQPage (desde faq[], solo si tiene items) y BreadcrumbList. En /blog: CollectionPage + BreadcrumbList. Reusá el componente JsonLd que ya existe.
- Sumá los posts publicados a app/sitemap.ts (lastModified = updated || date) y /blog.
- Sumá a app/llms.txt (y llms-full.txt si corresponde) una sección "Blog" con título, URL y description de cada post, generada desde la carpeta.
- RSS en /blog/rss.xml (título, link, description, pubDate), con <link rel="alternate" type="application/rss+xml"> en el layout del blog.

4. Navegación
- Link "Blog" en el header (desktop y menú mobile) y en el footer. No toques nada más del header, footer, home, comparador ni fichas.

5. Despliegue gradual
- Creá la sección con UN SOLO post real: content/blog/golpe-de-calor-en-perros.md con el título "Golpe de calor en perros: síntomas, qué hacer y cuándo ir a la guardia". Si todavía no tengo el texto final, dejalo con draft: true y probá en local/preview; no publiques texto de relleno en producción.
- Verificá: build OK, /blog, /blog/golpe-de-calor-en-perros, sitemap, llms.txt, /blog/rss.xml y que el JSON-LD valide (Rich Results Test).
- Pusheá a producción y FRENÁ. Esperá mi OK antes de sumar más posts o cambiar algo.
- Agregá un README corto en content/blog/README.md con el frontmatter de ejemplo, para que los próximos posts solo sean "copiar, completar y commitear".
```
