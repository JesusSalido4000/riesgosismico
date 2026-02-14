import { Router } from 'express';
import { z } from 'zod';
import { getAssessmentById, listAssessments } from '../services/assessmentService';
import { HttpError } from '../utils/httpErrors';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const data = await listAssessments();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = z.coerce.number().int().parse(req.params.id);
    const data = await getAssessmentById(id);
    if (!data) {
      throw new HttpError(404, 'Evaluación no encontrada');
    }
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

export default router;
