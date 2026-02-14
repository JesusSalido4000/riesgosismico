import cors from 'cors';
import express from 'express';
import path from 'node:path';
import hazardsRouter from './routes/hazards';
import vulnerabilityRouter from './routes/vulnerability';
import assessRouter from './routes/assess';
import assessmentsRouter from './routes/assessments';
import { errorHandler, notFoundHandler } from './utils/httpErrors';

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors({ origin: ['http://localhost:5173'] }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ success: true, data: { ok: true } }));
app.use('/api/hazards', hazardsRouter);
app.use('/api/vulnerability', vulnerabilityRouter);
app.use('/api/assess', assessRouter);
app.use('/api/assessments', assessmentsRouter);

const webDist = path.join(process.cwd(), '..', 'web', 'dist');
app.use(express.static(webDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(webDist, 'index.html'));
});

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
