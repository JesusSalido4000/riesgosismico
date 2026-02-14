import express from 'express';
import cors from 'cors';
import path from 'node:path';
import hazardsRouter from './routes/hazards.js';
import vulnerabilityRouter from './routes/vulnerability.js';
import assessRouter from './routes/assess.js';
import assessmentsRouter from './routes/assessments.js';

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.use(cors({ origin: ['http://localhost:5173'] }));
app.use(express.json());

app.use('/api/hazards', hazardsRouter);
app.use('/api/vulnerability', vulnerabilityRouter);
app.use('/api/assess', assessRouter);
app.use('/api/assessments', assessmentsRouter);

const webDist = path.resolve(process.cwd(), 'apps/web/dist');
app.use(express.static(webDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(webDist, 'index.html'), (err) => {
    if (err) res.status(404).json({ success: false, error: 'Ruta no encontrada' });
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
