import { Router } from 'express';
import { z } from 'zod';
import { evaluateHazards } from '../services/hazardService';

const schema = z.object({ lat: z.number(), lon: z.number() });
const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const parsed = schema.parse(req.body);
    const data = await evaluateHazards(parsed.lat, parsed.lon);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

export default router;
