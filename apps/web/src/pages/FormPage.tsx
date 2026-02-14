import React, { useState } from 'react';
import { VulnerabilityInput } from '../api';
import { StepHeader } from '../components/StepHeader';

export const FormPage: React.FC<{
  initial: VulnerabilityInput;
  onSubmit: (value: VulnerabilityInput) => void;
}> = ({ initial, onSubmit }) => {
  const [form, setForm] = useState<VulnerabilityInput>(initial);

  return (
    <div>
      <StepHeader title="2) Datos de vivienda" />
      <div style={{ display: 'grid', gap: 8, maxWidth: 500 }}>
        <label>Año de construcción <input type="number" value={form.añoConstruccion} onChange={(e) => setForm({ ...form, añoConstruccion: Number(e.target.value) })} /></label>
        <label>Material
          <select value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value as VulnerabilityInput['material'] })}>
            <option value="concrete">Concreto</option><option value="masonry">Mampostería</option><option value="steel">Acero</option><option value="wood">Madera</option><option value="mixed">Mixto</option>
          </select>
        </label>
        <label>Niveles <input type="number" min={1} max={10} value={form.niveles} onChange={(e) => setForm({ ...form, niveles: Number(e.target.value) })} /></label>
        <label>Irregularidad
          <select value={form.irregularidad} onChange={(e) => setForm({ ...form, irregularidad: e.target.value as VulnerabilityInput['irregularidad'] })}>
            <option value="none">Ninguna</option><option value="plan">En planta</option><option value="vertical">Vertical</option><option value="both">Ambas</option>
          </select>
        </label>
        <label>Mantenimiento
          <select value={form.mantenimiento} onChange={(e) => setForm({ ...form, mantenimiento: e.target.value as VulnerabilityInput['mantenimiento'] })}>
            <option value="good">Bueno</option><option value="regular">Regular</option><option value="poor">Malo</option>
          </select>
        </label>
        <label><input type="checkbox" checked={form.grietasPrevias} onChange={(e) => setForm({ ...form, grietasPrevias: e.target.checked })} /> Grietas previas</label>
      </div>
      <button style={{ marginTop: 12 }} onClick={() => onSubmit(form)}>Calcular riesgo</button>
    </div>
  );
};
