export interface VulnerabilityInput {
  añoConstruccion: number;
  material: 'concrete' | 'masonry' | 'steel' | 'wood' | 'mixed';
  niveles: number;
  irregularidad: 'none' | 'plan' | 'vertical' | 'both';
  mantenimiento: 'good' | 'regular' | 'poor';
  grietasPrevias: boolean;
}

const api = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
  const json = await response.json();
  if (!json.success) throw new Error(json.error);
  return json.data as T;
};

export const postHazards = (lat: number, lon: number) => api('/api/hazards', { method: 'POST', body: JSON.stringify({ lat, lon }) });
export const postAssess = (payload: { lat: number; lon: number; address: string; inputs: VulnerabilityInput }) => api('/api/assess', { method: 'POST', body: JSON.stringify(payload) });
export const getAssessments = () => api<Array<{ id: number; createdAt: string; address: string; score: number; category: string }>>('/api/assessments');
export const getAssessment = (id: string) => api<any>(`/api/assessments/${id}`);
