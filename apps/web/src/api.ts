export type LocationSelection = { lat: number; lon: number; address: string };

export type VulnerabilityInput = {
  añoConstruccion: number;
  material: 'concrete' | 'masonry' | 'steel' | 'wood' | 'mixed';
  niveles: number;
  irregularidad: 'none' | 'plan' | 'vertical' | 'both';
  mantenimiento: 'good' | 'regular' | 'poor';
  grietasPrevias: boolean;
};

const apiRequest = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...init
  });
  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.error ?? 'Error en la solicitud');
  }
  return json.data as T;
};

export const createAssessment = (payload: {
  lat: number;
  lon: number;
  address: string;
  inputs: VulnerabilityInput;
}) => apiRequest<any>('/api/assess', { method: 'POST', body: JSON.stringify(payload) });

export const listAssessments = () => apiRequest<any[]>('/api/assessments');

export const getAssessment = (id: number) => apiRequest<any>(`/api/assessments/${id}`);

export const searchAddress = async (query: string) => {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`;
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('No se pudo buscar dirección');
  return (await response.json()) as Array<{ lat: string; lon: string; display_name: string }>;
};
