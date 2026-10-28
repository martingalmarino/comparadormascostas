# Posts del blog

Publicar un post es agregar `content/blog/<slug>.md` (o `.mdx`) y commitearlo en `main`. El slug es el nombre del archivo. No hace falta tocar código, el sitemap, `llms.txt` ni el RSS: salen de esta carpeta.

No se publica si tiene `draft: true` o si `date` es futura. El listado se revalida cada día, así que un post con la fecha de hoy aparece solo.

Categorías: `Seguros` o `Cuidados`. En Cuidados se muestra el aviso de que no reemplaza la consulta con el veterinario.

Las secciones del cuerpo van con `##`. De ahí sale el índice. No pongas precios en el texto: si hace falta mencionarlos, enlazá a `/precios`.

El filtro del índice es `/blog/categoria/seguros` y `/blog/categoria/cuidados`.

## Frontmatter

```yaml
---
title: "Título de la guía"
description: "Bajada de hasta 160 caracteres."
date: "2026-11-03"
updated: "2026-11-10"
category: "Cuidados"
keywords:
  - palabra
author: "Nombre"
reviewed_by: "Nombre, M.P."
direct_answer: "Dos o tres oraciones que responden la pregunta, con el dato atribuido."
faq:
  - q: "¿Pregunta?"
    a: "Respuesta corta."
sources:
  - title: "Título de la fuente"
    url: "https://ejemplo.org/pagina"
    publisher: "Organismo"
    accessed: "2026-11-03"
related:
  - /seguro-para-perros
draft: true
---

## Primera sección

Texto de la guía.
```

`sources` tiene que traer al menos una fuente. `faq` tiene que estar (puede ser `[]`). `direct_answer`, `updated`, `reviewed_by`, `related` y `draft` son opcionales.
