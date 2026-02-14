import React from 'react';
import { StepHeader } from '../components/StepHeader';

const recommendations: Record<string, string> = {
  Bajo: 'Mantén mantenimiento preventivo y revisión periódica.',
  Medio: 'Considera revisión estructural y reforzamiento si aplica.',
  Alto: 'Solicita dictamen estructural profesional urgente y evaluación detallada del sitio.'
};

export const ResultPage: React.FC<{ result: any | null }> = ({ result }) => {
  if (!result) return <p>No hay resultados aún.</p>;

  return (
    <div>
      <StepHeader title="3) Resultado" />
      <h3>Score final: {result.score} / 100 ({result.category})</h3>
      <p>H: {result.explanation.H} | V: {result.explanation.V}</p>
      <p>{result.explanation.formula}</p>
      <ul>
        <li>Suelo: {result.hazards.soil?.soilClass} (peso {result.hazards.details.soilWeight})</li>
        <li>Pendiente: {result.hazards.slope?.slopeClass} (peso {result.hazards.details.slopeWeight})</li>
        <li>Falla cercana: {result.hazards.nearestFault?.name} a {result.hazards.nearestFault?.distanceKm} km (peso {result.hazards.details.faultWeight})</li>
      </ul>
      <h4>Desglose vulnerabilidad</h4>
      <ul>
        {result.vulnerability.breakdown.map((item: any) => (
          <li key={item.factor}>{item.factor}: +{item.contribution} ({item.note})</li>
        ))}
      </ul>
      <p><strong>Recomendación:</strong> {recommendations[result.category] ?? recommendations.Medio}</p>
    </div>
  );
};
