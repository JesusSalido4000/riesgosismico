import { Router } from 'express';
import { z } from 'zod';
import { createAssessment } from '../services/assessmentService';

const vulnerabilitySchema = z.object({
  añoConstruccion: z.number(),
  material: z.enum(['concrete', 'masonry', 'steel', 'wood', 'mixed']),
  niveles: z.number().int().min(1).max(10),
  irregularidad: z.enum(['none', 'plan', 'vertical', 'both']),
  mantenimiento: z.enum(['good', 'regular', 'poor']),
  grietasPrevias: z.boolean()
});

const schema = z.object({
  lat: z.number(),
  lon: z.number(),
  address: z.string().min(3),
  inputs: vulnerabilitySchema
});

const router = Router();
router.post('/', async (req, res, next) => {
  try {
    const parsed = schema.parse(req.body);
    const data = await createAssessment(parsed.lat, parsed.lon, parsed.address, parsed.inputs);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

export default router;
