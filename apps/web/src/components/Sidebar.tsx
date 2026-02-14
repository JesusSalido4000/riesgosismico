import React from 'react';

const steps = ['Ubicación', 'Vivienda', 'Resultados', 'Historial'];

export const Sidebar: React.FC<{ step: number; onNavigate: (step: number) => void }> = ({ step, onNavigate }) => (
  <aside style={{ width: 220, borderRight: '1px solid #ddd', padding: 16 }}>
    <h1 style={{ fontSize: 20 }}>Riesgo Sísmico Ensenada</h1>
    {steps.map((name, idx) => (
      <button
        key={name}
        onClick={() => onNavigate(idx)}
        style={{
          display: 'block',
          width: '100%',
          marginBottom: 8,
          padding: 10,
          background: idx === step ? '#2a6df4' : '#f5f5f5',
          color: idx === step ? 'white' : '#222',
          border: '1px solid #ccc',
          textAlign: 'left',
          borderRadius: 6,
          cursor: 'pointer'
        }}
      >
        {idx + 1}. {name}
      </button>
    ))}
  </aside>
);
