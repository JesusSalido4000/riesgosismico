import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getAssessment } from '../api';
import StepHeader from '../components/StepHeader';
import { useAppState } from '../App';

export default function ResultPage() {
  const { state } = useAppState();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<any>(state.result);
  const { search } = useLocation();
  const id = new URLSearchParams(search).get('id');
  const { id: pathId } = useParams();

  useEffect(() => {
    const target = id ?? pathId;
    if (target) getAssessment(target).then(setDetail).catch(() => undefined);
  }, [id, pathId]);

  const r = detail;
  if (!r) return <p>No hay resultado aún.</p>;

  const recommendations = r.category === 'Bajo'
    ? 'Mantenimiento y revisión preventiva.'
    : r.category === 'Medio'
      ? 'Revisión estructural y reforzamiento si aplica.'
      : 'Dictamen estructural profesional urgente, evaluación detallada y considerar retrofit.';

  return (
    <div>
      <StepHeader title="Paso 3: Resultados" />
      <h2>Score: {r.score.toFixed(2)} / 100</h2>
      <h3>Categoría: {r.category}</h3>
      <p>H: {r.explanation?.H?.toFixed(3) ?? r.hazards?.H?.toFixed(3)} | V: {r.explanation?.V?.toFixed(3) ?? r.vulnerability?.V?.toFixed(3)}</p>
      <pre>{JSON.stringify(r.hazards, null, 2)}</pre>
      <pre>{JSON.stringify(r.vulnerability, null, 2)}</pre>
      <p><strong>Recomendación:</strong> {recommendations}</p>
      <button onClick={() => navigate('/history')}>Ver historial</button>
    </div>
  );
}
