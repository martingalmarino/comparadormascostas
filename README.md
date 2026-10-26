# cuidalo

Comparador independiente de obras sociales, planes de salud y seguros para mascotas en Córdoba, Argentina.

El nombre **cuidalo** se centraliza en `site.config.ts`.

## Inicio rápido

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Estructura del proyecto

### 📁 Documentación (`/docs`)

Toda la documentación de partida para construir el proyecto:

- **`docs/BRIEF-CURSOR.md`** — Brief completo del MVP Fase 1: contexto, stack (Next.js App Router + Tailwind + Vercel), modelo de datos, páginas, componentes y sprints de desarrollo.
- **`docs/DESIGN-TOKENS.md`** — Tokens de diseño aprobados: paleta de colores (índigo #4F46E5), tipografías (IBM Plex Sans + Mono), espaciados, radios de borde (12px), sistema de sombras.
- **`docs/design/`** — Diseños finales mobile y desktop:
  - `mobile.html` / `desktop.html` — HTML de los diseños completos (dirección C "comparador con muchos datos").
  - `*.png` — Capturas de pantalla del diseño mobile y desktop (completas y por partes).

### 📊 Datos (`/data`)

La app lee una sola fuente: **`data/planes/*.json`**, un archivo por marca. Son los **41 planes** de **14 marcas** del relevamiento del **24/10/2026** (Companion, OSMASC, FielPet, Qualia, RUS, Answer, Pet Society, Provincia Seguros, Iké, AVSIM, Puppis One, Federación Patronal/MascotaLeal, BBVA y Petit Salud).

- **`data/README-PRECIOS.md`** — Cómo se relevó: estados, fuentes y qué se puede scrapear.
- **`data/scrapers.json`** — Pista de scraping por plan. Todos arrancan apagados.

### 🛠️ Precios y verificación

- `estado`: `"verificado"`, `"requiere_revision"` o `"consultar"`. Si el precio es `null`, la ficha dice “Consultar precio”.
- `es_ejemplo: true` muestra el badge EJEMPLO. La carga actual está en `false`: el número sale de la fuente citada.
- Si `fecha_verificacion` supera `siteConfig.priceStaleDays` (75), la interfaz deja de mostrar el monto.

El workflow `.github/workflows/update-prices.yml` publica en `main` solo los cambios dentro del margen. Si algo queda en `requiere_revision`, abre un issue.

## Tecnologías

- **Next.js** (App Router, TypeScript, SSG + ISR)
- **Tailwind CSS** con theme extendido desde tokens de diseño
- **Vercel** (deploy)
- **Zod** (validación de datos)
- Contenido en el repo (sin CMS): JSON para planes, MDX para guías

## Próximos pasos

Seguir los sprints del **BRIEF-CURSOR.md** para construir:
1. Setup inicial (Next.js + Tailwind + tokens)
2. Modelo de datos y validación con Zod
3. Componentes core (PlanCard, ComparisonTable, FilterBar)
4. Páginas principales (home, comparador, por marca, por tipo de mascota)
5. Lead generation y analytics
6. SEO y optimización
