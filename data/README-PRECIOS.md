# Precios de planes para mascotas — relevamiento 24/10/2026

La app lee `data/planes/<marca>.json`: 41 planes de 14 marcas, con montos en ARS por mes. El archivo único `planes.json` se migró a esa carpeta y se borró para que no queden dos fuentes.

**Estados:** 28 `verificado`, 8 `consultar` y 5 `requiere_revision`.

## Verificados hoy en el sitio oficial
- Companion: Plan 60, 80 y 100. Son precios "desde".
- OSMASC: Omega Premium.
- FielPet: Planes 1 a 5. El precio base es hasta los 10 años; los recargos por edad están en `notas`.
- Qualia: Planes 1 a 5.
- RUS: PetCare Simple, Esencial, Integral y Superior.
- Answer: precio de entrada.
- Pet Society: Individual y Familiar.
- Provincia Seguros: Esencial, Plus y Premium. El precio paquetizado está en `notas`.
- Iké: Emergencias, Cachorro, Adulto y Senior. Es una grilla nueva: los planes Esencial, Plus y Ultra ya no existen.

## Sin precio publicado (`consultar`)
- AVSIM: el precio depende de la zona y se elige en un mapa interactivo.
- Puppis One: se cotiza por teléfono o WhatsApp.
- Federación Patronal / MascotaLeal: se cotiza a través de un productor.
- BBVA: no tiene cotizador público y curl devuelve 403.

## Requiere revisión
- OSMASC Alfa: en la página aparecen $38.000 y $22.000. Parece un precio tachado más una promo; hay que confirmarlo.
- Petit Salud (4 planes): el sitio no muestra precios. Los montos son de InfoNegocios del 25/04/2025.

## Scraping
- **HTML estático (curl + parser):** Companion, OSMASC, FielPet, RUS, Answer, Pet Society, Iké y Qualia (solo el Plan 1).
- **Necesitan JS render (Playwright):** Provincia Seguros y Qualia (Planes 2 a 5).
- **Manual:** AVSIM, Puppis, MascotaLeal, BBVA y Petit Salud.
- **Recomendación:** correr un scraper semanal y alertar cuando cambie un precio más de ±30% o cuando falte el selector.
- **Ojo con RUS:** la página también lista planes de hogar.
