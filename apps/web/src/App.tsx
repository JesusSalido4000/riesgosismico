import { createContext, useContext, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MapPage from './pages/MapPage';
import FormPage from './pages/FormPage';
import ResultPage from './pages/ResultPage';
import HistoryPage from './pages/HistoryPage';
import type { VulnerabilityInput } from './api';

export interface AppState {
  lat: number;
  lon: number;
  address: string;
  inputs: VulnerabilityInput;
  result: any | null;
}

const defaultState: AppState = {
  lat: 31.8667,
  lon: -116.5964,
  address: 'Ensenada, Baja California, México',
  inputs: {
    añoConstruccion: 1995,
    material: 'masonry',
    niveles: 2,
    irregularidad: 'none',
    mantenimiento: 'regular',
    grietasPrevias: false
  },
  result: null
};

const AppContext = createContext<{ state: AppState; setState: (data: Partial<AppState>) => void } | null>(null);
export const useAppState = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('Missing app context');
  return ctx;
};

export default function App() {
  const [state, setStateRaw] = useState<AppState>(defaultState);
  const setState = (data: Partial<AppState>) => setStateRaw((prev) => ({ ...prev, ...data }));
  const value = useMemo(() => ({ state, setState }), [state]);
  const location = useLocation();

  return (
    <AppContext.Provider value={value}>
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
        <Sidebar currentPath={location.pathname} />
        <main style={{ padding: 20 }}>
          <p><strong>Estimación educativa. No sustituye dictamen estructural profesional.</strong></p>
          <p style={{ color: '#a85600' }}><strong>Datos DEMO: las capas geológicas y fallas son aproximaciones para demostración.</strong></p>
          <Routes>
            <Route path="/" element={<MapPage />} />
            <Route path="/form" element={<FormPage />} />
            <Route path="/result" element={<ResultPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </AppContext.Provider>
  );
}
