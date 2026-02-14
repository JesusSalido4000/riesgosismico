import { Router } from 'express';
import { prisma } from '../db/prisma.js';
import { sendError, sendSuccess } from '../utils/httpErrors.js';

const router = Router();

router.get('/', async (_req, res) => {
  const data = await prisma.assessment.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, createdAt: true, address: true, score: true, category: true }
  });
  return sendSuccess(res, data);
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return sendError(res, 'ID inválido');
  const item = await prisma.assessment.findUnique({ where: { id } });
  if (!item) return sendError(res, 'Evaluación no encontrada', 404);
  return sendSuccess(res, {
    ...item,
    inputs: JSON.parse(item.inputsJson),
    hazards: JSON.parse(item.hazardsJson),
    vulnerability: JSON.parse(item.vulnerabilityJson)
  });
});

export default router;
