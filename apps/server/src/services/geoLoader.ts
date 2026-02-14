import fs from 'node:fs/promises';
import path from 'node:path';
import * as shapefile from 'shapefile';
import { fromFile } from 'geotiff';
import type { Feature, FeatureCollection, Geometry, LineString, Polygon, MultiPolygon } from 'geojson';

const geoDir = path.resolve(process.cwd(), 'apps/server/geo');

type AnyProps = Record<string, unknown>;
export type PolyFeature = Feature<Polygon | MultiPolygon, AnyProps>;
export type LineFeature = Feature<LineString, AnyProps>;

export interface RasterSampler {
  sampleAt: (lat: number, lon: number) => Promise<number | null>;
}

export const readGeoJSON = async (filePath: string): Promise<FeatureCollection<Geometry, AnyProps>> => {
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content) as FeatureCollection<Geometry, AnyProps>;
};

export const readShapefile = async (filePath: string): Promise<FeatureCollection<Geometry, AnyProps>> => {
  return shapefile.read(filePath) as Promise<FeatureCollection<Geometry, AnyProps>>;
};

export const readGeoTIFF = async (filePath: string): Promise<RasterSampler> => {
  const tiff = await fromFile(filePath);
  const image = await tiff.getImage();
  const rasters = await image.readRasters({ interleave: true });
  const [minX, minY, maxX, maxY] = image.getBoundingBox();
  const width = image.getWidth();
  const height = image.getHeight();

  return {
    sampleAt: async (lat: number, lon: number) => {
      if (lon < minX || lon > maxX || lat < minY || lat > maxY) return null;
      const x = Math.floor(((lon - minX) / (maxX - minX)) * (width - 1));
      const y = Math.floor(((maxY - lat) / (maxY - minY)) * (height - 1));
      const idx = y * width + x;
      const raw = Number(rasters[idx]);
      if (!Number.isFinite(raw)) return null;
      if (raw <= 1) return Math.max(0, raw);
      return Math.min(1, raw / 255);
    }
  };
};

const loadLayerByPriority = async (baseName: 'soil' | 'slope' | 'faults'): Promise<FeatureCollection<Geometry, AnyProps>> => {
  const tif = path.join(geoDir, `${baseName}.tif`);
  const shp = path.join(geoDir, `${baseName}.shp`);
  const geojson = path.join(geoDir, `${baseName}.geojson`);

  try {
    await fs.access(tif);
    // keep wrapper available; vector fallback still needed for map/class metadata
  } catch {
    // noop
  }

  try {
    await fs.access(shp);
    return await readShapefile(shp);
  } catch {
    return readGeoJSON(geojson);
  }
};

export const loadSoilLayer = (): Promise<FeatureCollection<Geometry, AnyProps>> => loadLayerByPriority('soil');
export const loadSlopeLayer = (): Promise<FeatureCollection<Geometry, AnyProps>> => loadLayerByPriority('slope');
export const loadFaultLayer = (): Promise<FeatureCollection<Geometry, AnyProps>> => loadLayerByPriority('faults');

export const sampleRasterAtLatLon = async (tifPath: string, lat: number, lon: number): Promise<number | null> => {
  const sampler = await readGeoTIFF(tifPath);
  return sampler.sampleAt(lat, lon);
};
