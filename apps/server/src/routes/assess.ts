import { Router } from 'express';
import { z } from 'zod';
import { createAssessment } from '../services/assessmentService.js';
import { vulnerabilitySchema } from './vulnerability.js';
import { sendError, sendSuccess } from '../utils/httpErrors.js';

const router = Router();
const schema = z.object({
  lat: z.number(),
  lon: z.number(),
  address: z.string().min(1),
  inputs: vulnerabilitySchema
});

router.post('/', async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return sendError(res, parsed.error.message);
  try {
    const result = await createAssessment(parsed.data);
    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, `Error creando evaluación: ${(error as Error).message}`, 500);
  }
});

export default router;
