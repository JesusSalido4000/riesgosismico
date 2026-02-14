# Riesgo Sísmico Ensenada

Aplicación web educativa para estimar riesgo sísmico de vivienda en Ensenada con mapa interactivo, búsqueda de dirección, cálculo de riesgo, almacenamiento en SQLite e historial.

## Requisitos
- Node.js 20+
- npm 10+

## Instalación y ejecución
```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

- Web: http://localhost:5173
- API: http://localhost:4000

## Build y ejecución en modo producción
```bash
npm run build
npm run start
```

## Migraciones Prisma
```bash
npm run prisma:migrate
```
Esto crea/actualiza `apps/server/dev.db` usando `prisma/schema.prisma`.

## Reemplazar datos DEMO geoespaciales
Carpeta de capas: `apps/server/geo/`

Orden de prioridad de carga por capa (`soil`, `slope`, `faults`):
1. `*.tif`
2. `*.shp`
3. `*.geojson`

Ejemplo: para reemplazar suelos, copia `soil.tif` o `soil.shp` al folder `apps/server/geo` y se usará automáticamente.

## Ajustar pesos y fórmula
- Amenaza (`H`): `apps/server/src/services/hazardService.ts`
- Vulnerabilidad (`V`): `apps/server/src/services/vulnerabilityService.ts`
- Score final: `apps/server/src/services/assessmentService.ts`

## API principal
- `POST /api/hazards`
- `POST /api/vulnerability`
- `POST /api/assess`
- `GET /api/assessments`
- `GET /api/assessments/:id`

## Disclaimer
Estimación educativa. No sustituye dictamen estructural profesional.
Los datos DEMO (geología, pendientes y fallas) son aproximaciones para demostración.
