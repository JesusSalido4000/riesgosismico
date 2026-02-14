import fs from 'node:fs/promises';
import path from 'node:path';
import { fromFile } from 'geotiff';
import * as shapefile from 'shapefile';

type Properties = Record<string, unknown>;

export type GeoFeature = {
  type: 'Feature';
  geometry: GeoJSON.Geometry;
  properties: Properties;
};

export type FeatureCollection = {
  type: 'FeatureCollection';
  features: GeoFeature[];
};

const geoDir = path.join(process.cwd(), 'geo');

export const readGeoJSON = async (filePath: string): Promise<FeatureCollection> => {
  const text = await fs.readFile(filePath, 'utf-8');
  const data = JSON.parse(text) as FeatureCollection;
  if (data.type !== 'FeatureCollection') {
    throw new Error(`GeoJSON inválido: ${filePath}`);
  }
  return data;
};

export const readShapefile = async (filePath: string): Promise<FeatureCollection> => {
  const source = await shapefile.open(filePath);
  const features: GeoFeature[] = [];

  while (true) {
    const result = await source.read();
    if (result.done) break;
    if (result.value?.geometry) {
      features.push({
        type: 'Feature',
        geometry: result.value.geometry as GeoJSON.Geometry,
        properties: (result.value.properties ?? {}) as Properties
      });
    }
  }

  return { type: 'FeatureCollection', features };
};

export const sampleRasterAtLatLon = async (
  tifPath: string,
  lat: number,
  lon: number
): Promise<number | null> => {
  const tiff = await fromFile(tifPath);
  const image = await tiff.getImage();
  const [originX, originY] = image.getOrigin();
  const [resX, resY] = image.getResolution();
  const x = Math.floor((lon - originX) / resX);
  const y = Math.floor((lat - originY) / resY);

  if (x < 0 || y < 0 || x >= image.getWidth() || y >= image.getHeight()) {
    return null;
  }

  const rasters = await image.readRasters({ window: [x, y, x + 1, y + 1] });
  const value = Number(rasters[0][0]);
  if (!Number.isFinite(value)) return null;

  return value > 1 ? Math.max(0, Math.min(1, value / 255)) : Math.max(0, Math.min(1, value));
};

export const readGeoTIFF = async (filePath: string) => ({
  path: filePath,
  sample: (lat: number, lon: number) => sampleRasterAtLatLon(filePath, lat, lon)
});

const pickLayerPath = async (basename: string): Promise<{ type: 'tif' | 'shp' | 'geojson'; path: string }> => {
  const candidates: Array<{ type: 'tif' | 'shp' | 'geojson'; file: string }> = [
    { type: 'tif', file: `${basename}.tif` },
    { type: 'shp', file: `${basename}.shp` },
    { type: 'geojson', file: `${basename}.geojson` }
  ];

  for (const candidate of candidates) {
    const fullPath = path.join(geoDir, candidate.file);
    try {
      await fs.access(fullPath);
      return { type: candidate.type, path: fullPath };
    } catch {
      continue;
    }
  }

  throw new Error(`No se encontró ninguna capa para ${basename}`);
};

export const loadSoilLayer = async () => pickLayerPath('soil');
export const loadSlopeLayer = async () => pickLayerPath('slope');
export const loadFaultLayer = async () => pickLayerPath('faults');
