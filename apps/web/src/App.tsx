import React, { useState } from 'react';
import { createAssessment, getAssessment, listAssessments, VulnerabilityInput } from './api';
import { ErrorBanner } from './components/ErrorBanner';
import { Sidebar } from './components/Sidebar';
import { Loading } from './components/Loading';
import { FormPage } from './pages/FormPage';
import { HistoryPage } from './pages/HistoryPage';
import { MapPage } from './pages/MapPage';
import { ResultPage } from './pages/ResultPage';

const defaultInput: VulnerabilityInput = {
  añoConstruccion: 1995,
  material: 'masonry',
  niveles: 2,
  irregularidad: 'none',
  mantenimiento: 'regular',
  grietasPrevias: false
};

const App: React.FC = () => {
  const [step, setStep] = useState(0);
  const [lat, setLat] = useState(31.8667);
  const [lon, setLon] = useState(-116.5964);
  const [address, setAddress] = useState('Ensenada, Baja California, México');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  const onLocationChange = (newLat: number, newLon: number, newAddress?: string) => {
    setLat(newLat);
    setLon(newLon);
    if (newAddress !== undefined) setAddress(newAddress);
  };

  const loadHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listAssessments();
      setHistory(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const submitForm = async (inputs: VulnerabilityInput) => {
    setLoading(true);
    setError('');
    try {
      const data = await createAssessment({ lat, lon, address, inputs });
      setResult(data);
      await loadHistory();
      setStep(2);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const openHistoryDetail = async (id: number) => {
    setLoading(true);
    setError('');
    try {
      const data = await getAssessment(id);
      setResult({
        id: data.id,
        score: data.score,
        category: data.category,
        hazards: data.hazards,
        vulnerability: data.vulnerability,
        explanation: {
          H: data.hazards.H,
          V: data.vulnerability.V,
          formula: 'R = 100 * clamp(0.55*H + 0.45*V, 0, 1)',
          weights: { hazard: 0.55, vulnerability: 0.45 }
        }
      });
      setStep(2);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <Sidebar step={step} onNavigate={(next) => {
        setStep(next);
        if (next === 3) {
          void loadHistory();
        }
      }} />
      <main style={{ flex: 1, padding: 16 }}>
        {error && <ErrorBanner message={error} />}
        {loading && <Loading />}
        {!loading && step === 0 && <MapPage lat={lat} lon={lon} address={address} onLocationChange={onLocationChange} onNext={() => setStep(1)} />}
        {!loading && step === 1 && <FormPage initial={defaultInput} onSubmit={submitForm} />}
        {!loading && step === 2 && <ResultPage result={result} />}
        {!loading && step === 3 && <HistoryPage items={history} onOpen={openHistoryDetail} />}
      </main>
    </div>
  );
};

export default App;
