import React, { useState } from 'react';
import { createAssessment, getAssessment, listAssessments, reverseGeocodeInEnsenada, VulnerabilityInput } from './api';
import { ErrorBanner } from './components/ErrorBanner';
import { Sidebar } from './components/Sidebar';
import { Loading } from './components/Loading';
import { FormPage } from './pages/FormPage';
import { HistoryPage } from './pages/HistoryPage';
import { MapPage } from './pages/MapPage';
import { ResultPage } from './pages/ResultPage';

type AppResult = any;
type HistoryItem = any;

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
  const [lastValidLocation, setLastValidLocation] = useState({ lat: 31.8667, lon: -116.5964, address: 'Ensenada, Baja California, México' });
  const [focusKey, setFocusKey] = useState(0);
  const [locationError, setLocationError] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AppResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const loadHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listAssessments();
      setHistory(data as HistoryItem[]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressPick = (newLat: number, newLon: number, newAddress: string) => {
    setLocationError('');
    setLat(newLat);
    setLon(newLon);
    setAddress(newAddress);
    setLastValidLocation({ lat: newLat, lon: newLon, address: newAddress });
    setFocusKey((prev) => prev + 1);
  };

  const handleMapPinMove = async (newLat: number, newLon: number) => {
    setLocationLoading(true);
    setLocationError('');

    try {
      const reverse = await reverseGeocodeInEnsenada(newLat, newLon);
      setLat(reverse.lat);
      setLon(reverse.lon);
      setAddress(reverse.address);
      setLastValidLocation(reverse);
      setFocusKey((prev) => prev + 1);
    } catch (err) {
      setLocationError((err as Error).message || 'La ubicación debe estar dentro del Municipio de Ensenada.');
      setLat(lastValidLocation.lat);
      setLon(lastValidLocation.lon);
      setAddress(lastValidLocation.address);
      setFocusKey((prev) => prev + 1);
    } finally {
      setLocationLoading(false);
    }
  };

  const submitForm = async (inputs: VulnerabilityInput) => {
    setLoading(true);
    setError('');
    try {
      const data = await createAssessment({ lat, lon, address, inputs });
      setResult(data as AppResult);
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
      const data = await getAssessment(id) as any;
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
        {locationLoading && <p style={{ color: '#555' }}>Validando ubicación...</p>}
        {!loading && step === 0 && (
          <MapPage
            lat={lat}
            lon={lon}
            address={address}
            focusKey={focusKey}
            locationError={locationError}
            onPickAddress={handleAddressPick}
            onMapPinMove={(newLat, newLon) => void handleMapPinMove(newLat, newLon)}
            onAddressInput={setAddress}
            onNext={() => setStep(1)}
          />
        )}
        {!loading && step === 1 && <FormPage initial={defaultInput} onSubmit={submitForm} />}
        {!loading && step === 2 && <ResultPage result={result} />}
        {!loading && step === 3 && <HistoryPage items={history} onOpen={openHistoryDetail} />}
      </main>
    </div>
  );
};

export default App;
