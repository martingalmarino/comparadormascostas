# MascoCompara

Comparador independiente de obras sociales, planes de salud y seguros para mascotas en Córdoba, Argentina.

**El nombre "MascoCompara" es provisorio** y se centraliza en `site.config.ts` para cambiarlo fácilmente.

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

Datos reales relevados para el comparador:

- **`data/planes.json`** — **41 planes reales** de 14 marcas (Companion, OSMASC, FielPet, Qualia, RUS, Answer, Pet Society, Provincia Seguros, Iké, AVSIM, Puppis One, Federación Patronal/MascotaLeal, BBVA, Petit Salud) relevados el **24/10/2026**. Incluye precios verificados en ARS, coberturas, carencias, pros/contras y URLs de fuente.
- **`data/README-PRECIOS.md`** — Explicación del relevamiento: estados de verificación, fuentes, precios consultados manualmente, y notas sobre scraping.
- `data/scrapers.json` — Configuración de scrapers (existente).
- `data/planes/*.json` — Planes por marca en archivos individuales (existente).

### 🛠️ Precios y verificación

Los precios en `planes.json` están marcados con:
- `es_ejemplo: true` → mostrar badge "EJEMPLO" hasta verificarlos con fuente y fecha.
- `estado`: `"verificado"`, `"requiere_revision"`, `"consultar"` o `"sin_precio_publico"`.
- Si `fecha_verificacion` > 45 días → marcar como "desactualizado".

El workflow `.github/workflows/update-prices.yml` no publica cambios grandes automáticamente: los deja en `requiere_revision` y abre un pull request.

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
