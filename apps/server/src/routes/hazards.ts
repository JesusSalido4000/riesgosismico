import { Router } from 'express';
import { z } from 'zod';
import { computeHazards } from '../services/hazardService.js';
import { sendError, sendSuccess } from '../utils/httpErrors.js';

const router = Router();
const schema = z.object({ lat: z.number(), lon: z.number() });

router.post('/', async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return sendError(res, parsed.error.message);
  try {
    const data = await computeHazards(parsed.data.lat, parsed.data.lon);
    return sendSuccess(res, data);
  } catch (error) {
    return sendError(res, `Error calculando amenazas: ${(error as Error).message}`, 500);
  }
});

export default router;
