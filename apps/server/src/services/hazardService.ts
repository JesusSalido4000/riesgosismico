import * as turf from '@turf/turf';
import {
  FeatureCollection,
  loadFaultLayer,
  loadSlopeLayer,
  loadSoilLayer,
  readGeoJSON,
  readGeoTIFF,
  readShapefile
} from './geoLoader';
import { clamp } from '../utils/clamp';

type SoilData = {
  soilClass: string;
  hazardWeight: number;
  description: string;
  vs30Range: string;
};

type SlopeData = { slopeClass: string; hazardWeight: number };

type FaultData = { name: string; distanceKm: number; hazardWeight: number };

let cachedSoil: FeatureCollection | null = null;
let cachedSlope: FeatureCollection | null = null;
let cachedFaults: FeatureCollection | null = null;

const soilRasterToClass = (value: number): SoilData => {
  if (value < 0.2) return { soilClass: 'A', hazardWeight: 0.1, description: 'Roca dura', vs30Range: '>1500 m/s' };
  if (value < 0.4) return { soilClass: 'B', hazardWeight: 0.2, description: 'Roca', vs30Range: '760–1500 m/s' };
  if (value < 0.6) return { soilClass: 'C', hazardWeight: 0.4, description: 'Suelo denso o roca blanda', vs30Range: '360–760 m/s' };
  if (value < 0.8) return { soilClass: 'D', hazardWeight: 0.7, description: 'Suelo firme a blando', vs30Range: '180–360 m/s' };
  return { soilClass: 'E', hazardWeight: 0.9, description: 'Suelo muy blando (aluvión reciente)', vs30Range: '<180 m/s' };
};

const slopeRasterToClass = (value: number): SlopeData => {
  if (value < 0.33) return { slopeClass: 'low', hazardWeight: 0.2 };
  if (value < 0.66) return { slopeClass: 'med', hazardWeight: 0.5 };
  return { slopeClass: 'high', hazardWeight: 0.8 };
};

const getCollection = async (kind: 'soil' | 'slope' | 'faults'): Promise<FeatureCollection> => {
  if (kind === 'soil' && cachedSoil) return cachedSoil;
  if (kind === 'slope' && cachedSlope) return cachedSlope;
  if (kind === 'faults' && cachedFaults) return cachedFaults;

  const loader = kind === 'soil' ? loadSoilLayer : kind === 'slope' ? loadSlopeLayer : loadFaultLayer;
  const layer = await loader();
  const collection = layer.type === 'shp' ? await readShapefile(layer.path) : await readGeoJSON(layer.path);

  if (kind === 'soil') cachedSoil = collection;
  if (kind === 'slope') cachedSlope = collection;
  if (kind === 'faults') cachedFaults = collection;

  return collection;
};

const findPolygonValue = <T>(collection: FeatureCollection, lat: number, lon: number): T | null => {
  const point = turf.point([lon, lat]);
  const feature = collection.features.find((f) => turf.booleanPointInPolygon(point, f as turf.helpers.Feature<turf.helpers.Polygon | turf.helpers.MultiPolygon>));
  return feature ? (feature.properties as T) : null;
};

const findNearestFault = (collection: FeatureCollection, lat: number, lon: number): FaultData | null => {
  const point = turf.point([lon, lat]);
  let nearest: FaultData | null = null;

  for (const feature of collection.features) {
    const snapped = turf.nearestPointOnLine(feature as turf.helpers.Feature<turf.helpers.LineString>, point, { units: 'kilometers' });
    const distanceKm = Number(snapped.properties.dist ?? 999);
    if (!nearest || distanceKm < nearest.distanceKm) {
      nearest = {
        name: String(feature.properties.name ?? 'Falla sin nombre'),
        distanceKm: Number(distanceKm.toFixed(2)),
        hazardWeight: Number(clamp(1 - distanceKm / 20, 0, 1).toFixed(3))
      };
    }
  }

  return nearest;
};

export const evaluateHazards = async (lat: number, lon: number) => {
  const soilLayer = await loadSoilLayer();
  const slopeLayer = await loadSlopeLayer();

  let soil: SoilData | null;
  if (soilLayer.type === 'tif') {
    const tif = await readGeoTIFF(soilLayer.path);
    const sample = await tif.sample(lat, lon);
    soil = sample === null ? null : soilRasterToClass(sample);
  } else {
    soil = findPolygonValue<SoilData>(await getCollection('soil'), lat, lon);
  }

  let slope: SlopeData | null;
  if (slopeLayer.type === 'tif') {
    const tif = await readGeoTIFF(slopeLayer.path);
    const sample = await tif.sample(lat, lon);
    slope = sample === null ? null : slopeRasterToClass(sample);
  } else {
    slope = findPolygonValue<SlopeData>(await getCollection('slope'), lat, lon);
  }

  const faultLayer = await getCollection('faults');
  const nearestFault = findNearestFault(faultLayer, lat, lon);

  const soilWeight = soil?.hazardWeight ?? 0.3;
  const slopeWeight = slope?.hazardWeight ?? 0.3;
  const faultWeight = nearestFault?.hazardWeight ?? 0.3;

  const H = Number(clamp(0.45 * soilWeight + 0.25 * slopeWeight + 0.3 * faultWeight, 0, 1).toFixed(3));

  return {
    soil,
    slope,
    nearestFault,
    H,
    details: { soilWeight, slopeWeight, faultWeight }
  };
};
