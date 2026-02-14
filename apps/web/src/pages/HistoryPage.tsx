import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAssessments } from '../api';
import StepHeader from '../components/StepHeader';

export default function HistoryPage() {
  const [items, setItems] = useState<Array<{ id: number; createdAt: string; address: string; score: number; category: string }>>([]);
  const navigate = useNavigate();
  useEffect(() => { getAssessments().then(setItems).catch(() => undefined); }, []);

  return (
    <div>
      <StepHeader title="Paso 4: Historial" />
      <ul>
        {items.map((i) => (
          <li key={i.id}>
            <button onClick={() => navigate(`/result?id=${i.id}`)}>
              #{i.id} - {new Date(i.createdAt).toLocaleString()} - {i.address} - {i.score.toFixed(1)} ({i.category})
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
