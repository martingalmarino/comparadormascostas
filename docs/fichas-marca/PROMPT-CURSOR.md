Leé docs/fichas-marca/SPEC-FICHA-MARCA.md y los bocetos docs/fichas-marca/ficha-rus-{desktop,mobile}.png. Los datos están en data/marcas/{slug}.json (28 marcas, ya verificados). No inventes ningún dato: lo que sea null no se muestra y va a "Lo que no publica".

FASE 1 (solo rus-seguros):
1. Creá lib/marca-schema.ts con el zod del SPEC §4 y un test que valide los 28 JSON y que cada slug exista en data/planes.
2. Implementá el template nuevo de /planes/[slug] según el orden del SPEC §1, activo SOLO para slugs en FICHA_V2_SLUGS = ['rus-seguros']; el resto sigue con el template actual.
3. Conservá TODO lo existente (checklist SPEC §2): breadcrumbs, H1, tarjetas de plan con verificado/fuente/coberturas/carencias, JSON-LD actual, /versus, 3 FAQs actuales, lead form con consentimiento (misma lógica y endpoint), StickyLeadCTA, CuidaloBot, footer.
4. NO renderices pros/contras, opiniones/ratings ni antecedentes/sanciones SSN. Solo N° SSN + link al registro.
5. Historial: modificá scripts/update-prices.ts para hacer append a data/historial/{slug}.json solo con precios verificados (y el workflow para commitearlo). El componente se renderiza solo con ≥2 puntos.
6. Agregá FAQPage y Organization JSON-LD (SPEC §6).
7. npm run lint && npm test && npm run build sin errores. Commit "ficha v2: rus-seguros", push a producción.
8. FRENÁ ACÁ. Pasame la URL de /planes/rus-seguros y esperá mi aprobación. No sigas con la Fase 2.

FASE 2 (solo cuando yo lo apruebe explícitamente):
9. Ampliá FICHA_V2_SLUGS a las 28 marcas (o quitá el flag), revisá omint-mascotas, fielpet y petit-salud (muchos null), lint/test/build, commit "ficha v2: todas las marcas", push.
