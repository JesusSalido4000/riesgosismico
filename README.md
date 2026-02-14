# Riesgo Sísmico Ensenada

Aplicación educativa end-to-end para estimar riesgo sísmico demo en Ensenada.

## Stack
- Frontend: React + TypeScript + Vite + Leaflet
- Backend: Node.js + Express + TypeScript
- DB: SQLite + Prisma
- Geo: Turf + shapefile + geotiff

## Instalación
```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Web: `http://localhost:5173`  
API: `http://localhost:3001`

## Scripts
- `npm run dev`: corre server + web en paralelo.
- `npm run build`: build de ambos workspaces.
- `npm run start`: build y arranque en modo producción desde server.

## Migraciones Prisma
La BD SQLite se crea en `apps/server/dev.db`.

```bash
npm run prisma:migrate
```

## Reemplazar datos DEMO
Capas en `apps/server/geo`:
- `soil`
- `slope`
- `faults`

Prioridad de carga por capa:
1. `.tif`
2. `.shp`
3. `.geojson`

Solo copia `soil.shp` o `soil.tif` (y equivalentes para slope/faults) en esa carpeta y el loader los toma automáticamente.

## Ajuste de pesos
- Amenaza geoespacial: `apps/server/src/services/hazardService.ts`
- Vulnerabilidad estructural: `apps/server/src/services/vulnerabilityService.ts`

## Disclaimer
Estimación educativa. No sustituye dictamen estructural profesional.  
Datos DEMO: capas geológicas/fallas aproximadas para demostración.
