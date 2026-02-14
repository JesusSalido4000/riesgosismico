import React from 'react';
import { StepHeader } from '../components/StepHeader';

export const HistoryPage: React.FC<{ items: any[]; onOpen: (id: number) => void }> = ({ items, onOpen }) => (
  <div>
    <StepHeader title="4) Historial" />
    {items.length === 0 ? <p>Sin evaluaciones guardadas.</p> : (
      <ul>
        {items.map((item) => (
          <li key={item.id} style={{ marginBottom: 8 }}>
            <button onClick={() => onOpen(item.id)}>
              #{item.id} - {new Date(item.createdAt).toLocaleString()} - {item.address} - {item.score} ({item.category})
            </button>
          </li>
        ))}
      </ul>
    )}
  </div>
);
