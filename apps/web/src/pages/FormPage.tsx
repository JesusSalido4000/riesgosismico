import { useNavigate } from 'react-router-dom';
import { postAssess } from '../api';
import StepHeader from '../components/StepHeader';
import { useAppState } from '../App';
import { useState } from 'react';
import Loading from '../components/Loading';
import ErrorBanner from '../components/ErrorBanner';

export default function FormPage() {
  const { state, setState } = useAppState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const update = (key: string, value: string | number | boolean) => setState({ inputs: { ...state.inputs, [key]: value } as any });

  const submit = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await postAssess({ lat: state.lat, lon: state.lon, address: state.address, inputs: state.inputs });
      setState({ result });
      navigate('/result');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <StepHeader title="Paso 2: Datos de vivienda" />
      {error && <ErrorBanner message={error} />}
      <div style={{ display: 'grid', gap: 8, maxWidth: 420 }}>
        <label>Año construcción <input type="number" value={state.inputs.añoConstruccion} onChange={(e) => update('añoConstruccion', Number(e.target.value))} /></label>
        <label>Material <select value={state.inputs.material} onChange={(e) => update('material', e.target.value)}><option value="concrete">Concreto</option><option value="masonry">Mampostería</option><option value="steel">Acero</option><option value="wood">Madera</option><option value="mixed">Mixto</option></select></label>
        <label>Niveles <input type="number" min={1} max={10} value={state.inputs.niveles} onChange={(e) => update('niveles', Number(e.target.value))} /></label>
        <label>Irregularidad <select value={state.inputs.irregularidad} onChange={(e) => update('irregularidad', e.target.value)}><option value="none">Ninguna</option><option value="plan">Planta</option><option value="vertical">Vertical</option><option value="both">Ambas</option></select></label>
        <label>Mantenimiento <select value={state.inputs.mantenimiento} onChange={(e) => update('mantenimiento', e.target.value)}><option value="good">Bueno</option><option value="regular">Regular</option><option value="poor">Malo</option></select></label>
        <label><input type="checkbox" checked={state.inputs.grietasPrevias} onChange={(e) => update('grietasPrevias', e.target.checked)} /> Grietas previas</label>
      </div>
      {loading ? <Loading /> : <button onClick={submit}>Calcular y guardar</button>}
    </div>
  );
}
