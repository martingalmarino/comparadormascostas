# Prompt para Cursor: blog de Cuidalo listo para Google Discover

Contexto: el blog ya está en main (content/blog/*.md, formato en content/blog/README.md). Quiero que las guías puedan salir en Google Discover. No cambies el diseño ni saques nada de lo que ya existe; solo agregá lo siguiente.

1. Campo de portada en el frontmatter
   - Agregá al schema zod un campo opcional `image` (ruta en /public, p. ej. "/blog/<slug>-portada.webp") y `image_alt` (string, obligatorio si hay image).
   - Las portadas viven en public/blog/. Tienen que ser 16:9 y tener al menos 1200 px de ancho. Si son más chicas, avisá en el build con un warning, sin romperlo.
   - Mostrala arriba del H1 en el artículo (con next/image, priority, sizes responsivos) y como miniatura en las cards de /blog. Si un post no tiene image, se ve como hoy.

2. Meta tags por artículo (generateMetadata)
   - openGraph: type "article", title, description, url canónica, images [{url absoluta, width 1200, height 675, alt}], publishedTime, modifiedTime (updated si existe), section = categoría.
   - twitter: card "summary_large_image" con la misma imagen.
   - Sin image propia, usar una og:image por defecto del sitio (si no existe, creá /public/og-default.png 1200x630 con el logo de Cuidalo sobre el fondo de marca).
   - robots: index, follow y `max-image-preview: large` (en Next: robots.googleBot.maxImagePreview = 'large'). Aplicalo a todo el sitio desde el layout raíz, no solo al blog. Los posts en draft siguen dando 404 como ahora.

3. JSON-LD Article
   - Agregá `image` (array con la URL absoluta de la portada, o la og por defecto).
   - `author`: si author es "Equipo Cuidalo", usar { "@type": "Organization", "name": "Cuidalo", "url": "https://www.cuidalo.com.ar" }. Si en el futuro hay un veterinario real, usar Person con su nombre.
   - `publisher`: Organization Cuidalo con `logo` (ImageObject con la URL absoluta del logo).
   - `datePublished`, `dateModified`, `mainEntityOfPage` con la canónica.

4. Feed RSS: incluí la portada en cada item (enclosure o media:content) cuando exista.

5. Actualizá content/blog/README.md con los campos nuevos y un ejemplo.

Implementación gradual: hacelo, pusheá a producción y verificá en el post de ejemplo que el HTML tenga og:image, max-image-preview:large y el JSON-LD con image. Pasame el resultado del Rich Results Test (https://search.google.com/test/rich-results) y pará ahí hasta que yo dé el OK.

6. Portadas que ya existen
   - Ya están en public/blog/: golpe-de-calor-en-perros-portada.webp y cuanto-cuesta-seguro-para-perros-portada.webp (1600x900, 16:9).
   - Agregales `image` e `image_alt` a esos dos posts en content/blog/ (alt descriptivo del contenido de la imagen). Empezá verificando con golpe-de-calor-en-perros, que ya está publicado.
