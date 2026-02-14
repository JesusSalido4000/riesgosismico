import { prisma } from '../db/prisma';
import { clamp } from '../utils/clamp';
import { evaluateHazards } from './hazardService';
import { evaluateVulnerability, VulnerabilityInput } from './vulnerabilityService';

export const createAssessment = async (lat: number, lon: number, address: string, inputs: VulnerabilityInput) => {
  const hazards = await evaluateHazards(lat, lon);
  const vulnerability = evaluateVulnerability(inputs);

  const score = Number((100 * clamp(0.55 * hazards.H + 0.45 * vulnerability.V, 0, 1)).toFixed(2));
  const category = score < 35 ? 'Bajo' : score <= 70 ? 'Medio' : 'Alto';

  const assessment = await prisma.assessment.create({
    data: {
      lat,
      lon,
      address,
      inputsJson: JSON.stringify(inputs),
      hazardsJson: JSON.stringify(hazards),
      vulnerabilityJson: JSON.stringify(vulnerability),
      score,
      category
    }
  });

  return {
    id: assessment.id,
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

export const listAssessments = async () => prisma.assessment.findMany({
  orderBy: { createdAt: 'desc' },
  select: { id: true, createdAt: true, address: true, score: true, category: true }
});

export const getAssessmentById = async (id: number) => {
  const item = await prisma.assessment.findUnique({ where: { id } });
  if (!item) return null;

  return {
    ...item,
    inputs: JSON.parse(item.inputsJson),
    hazards: JSON.parse(item.hazardsJson),
    vulnerability: JSON.parse(item.vulnerabilityJson)
  };
};
