import React from 'react';

export const StepHeader: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ marginBottom: 16 }}>
    <h2>{title}</h2>
    <p style={{ color: '#555' }}>Estimación educativa. No sustituye dictamen estructural profesional.</p>
    <p style={{ color: '#8b4513', fontWeight: 600 }}>
      Datos DEMO: las capas geológicas y fallas son aproximaciones para demostración.
    </p>
  </div>
);
