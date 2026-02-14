import { prisma } from '../db/prisma.js';
import { clamp } from '../utils/clamp.js';
import { computeHazards } from './hazardService.js';
import { computeVulnerability, VulnerabilityInput } from './vulnerabilityService.js';

export const createAssessment = async (payload: { lat: number; lon: number; address: string; inputs: VulnerabilityInput }) => {
  const hazards = await computeHazards(payload.lat, payload.lon);
  const vulnerability = computeVulnerability(payload.inputs);
  const score = 100 * clamp(0.55 * hazards.H + 0.45 * vulnerability.V, 0, 1);
  const category = score < 35 ? 'Bajo' : score <= 70 ? 'Medio' : 'Alto';

  const saved = await prisma.assessment.create({
    data: {
      lat: payload.lat,
      lon: payload.lon,
      address: payload.address,
      inputsJson: JSON.stringify(payload.inputs),
      hazardsJson: JSON.stringify(hazards),
      vulnerabilityJson: JSON.stringify(vulnerability),
      score,
      category
    }
  });

  return {
    id: saved.id,
    score,
    category,
    hazards,
    vulnerability,
    explanation: {
      H: hazards.H,
      V: vulnerability.V,
      formula: 'R = 100 * clamp(0.55*H + 0.45*V, 0, 1)',
      weights: { hazard: 0.55, vulnerability: 0.45 }
    }
  };
};
