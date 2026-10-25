# MascoCompara

Comparador independiente de obras sociales, planes de salud y seguros para mascotas en Córdoba. El nombre es provisorio y se cambia en `site.config.ts`.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Los precios del repositorio son ejemplos (`es_ejemplo: true`) hasta verificarlos con fuente y fecha. El workflow `.github/workflows/update-prices.yml` no publica un cambio grande: lo deja en `requiere_revision` y abre un pull request.
