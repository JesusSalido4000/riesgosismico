import path from 'node:path';
import { point } from '@turf/helpers';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import pointToLineDistance from '@turf/point-to-line-distance';
import { clamp } from '../utils/clamp.js';
import { loadFaultLayer, loadSlopeLayer, loadSoilLayer, sampleRasterAtLatLon } from './geoLoader.js';

const geoDir = path.resolve(process.cwd(), 'apps/server/geo');

export interface HazardResult {
  soil: { soilClass: string; hazardWeight: number; description: string; vs30Range: string } | null;
  slope: { slopeClass: string; hazardWeight: number } | null;
  nearestFault: { name: string; distanceKm: number; hazardWeight: number } | null;
  H: number;
  details: { soilWeight: number; slopeWeight: number; faultWeight: number };
}

export const computeHazards = async (lat: number, lon: number): Promise<HazardResult> => {
  const pt = point([lon, lat]);
  const [soilFc, slopeFc, faultFc] = await Promise.all([loadSoilLayer(), loadSlopeLayer(), loadFaultLayer()]);

  const soilFeature = soilFc.features.find((f) => f.geometry && (f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon') && booleanPointInPolygon(pt, f as never));
  const slopeFeature = slopeFc.features.find((f) => f.geometry && (f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon') && booleanPointInPolygon(pt, f as never));

  let minFault: { name: string; distanceKm: number; hazardWeight: number } | null = null;
  for (const feature of faultFc.features) {
    if (!feature.geometry || feature.geometry.type !== 'LineString') continue;
    const distanceKm = pointToLineDistance(pt, feature as never, { units: 'kilometers' });
    const hazardWeight = clamp(1 - distanceKm / 20, 0, 1);
    if (!minFault || distanceKm < minFault.distanceKm) {
      minFault = {
        name: String(feature.properties?.name ?? 'Falla DEMO'),
        distanceKm: Number(distanceKm.toFixed(2)),
        hazardWeight
      };
    }
  }

  const soilWeight = Number(soilFeature?.properties?.hazardWeight ?? 0.5);
  let slopeWeight = Number(slopeFeature?.properties?.hazardWeight ?? 0.5);

  const slopeTifPath = path.join(geoDir, 'slope.tif');
  try {
    const rasterSample = await sampleRasterAtLatLon(slopeTifPath, lat, lon);
    if (rasterSample !== null) slopeWeight = rasterSample;
  } catch {
    // ignore tif fallback errors
  }

  const faultWeight = minFault?.hazardWeight ?? 0.5;
  const H = clamp(0.4 * soilWeight + 0.3 * slopeWeight + 0.3 * faultWeight, 0, 1);

  return {
    soil: soilFeature
      ? {
          soilClass: String(soilFeature.properties?.soilClass ?? 'C'),
          hazardWeight: soilWeight,
          description: String(soilFeature.properties?.description ?? 'Suelo demo'),
          vs30Range: String(soilFeature.properties?.vs30Range ?? '360–760 m/s')
        }
      : null,
    slope: slopeFeature
      ? {
          slopeClass: String(slopeFeature.properties?.slopeClass ?? 'med'),
          hazardWeight: slopeWeight
        }
      : null,
    nearestFault: minFault,
    H,
    details: {
      soilWeight,
      slopeWeight,
      faultWeight
    }
  };
};
