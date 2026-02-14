export type LocationSelection = { lat: number; lon: number; address: string };

export type VulnerabilityInput = {
  añoConstruccion: number;
  material: 'concrete' | 'masonry' | 'steel' | 'wood' | 'mixed';
  niveles: number;
  irregularidad: 'none' | 'plan' | 'vertical' | 'both';
  mantenimiento: 'good' | 'regular' | 'poor';
  grietasPrevias: boolean;
};

export type NominatimAddress = {
  municipality?: string;
  city?: string;
  town?: string;
  village?: string;
  county?: string;
  state_district?: string;
  state?: string;
};

export type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
  address?: NominatimAddress;
};

const ENSENADA_VIEWBOX = {
  lonMin: -117.9,
  latMin: 30.7,
  lonMax: -115.3,
  latMax: 32.6
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

const getEnsenadaCandidate = (address: NominatimAddress): string => {
  const values = [
    address.municipality,
    address.city,
    address.town,
    address.village,
    address.county,
    address.state_district
  ]
    .filter((value): value is string => Boolean(value))
    .join(' ')
    .toLowerCase();

  return values;
};

export const isInEnsenada = (result: NominatimResult): boolean => {
  const address = result.address;
  if (!address) return false;

  const state = (address.state ?? '').toLowerCase();
  const hasBajaCalifornia = state.includes('baja california');
  const hasEnsenada = getEnsenadaCandidate(address).includes('ensenada');

  return hasBajaCalifornia && hasEnsenada;
};

export const createAssessment = (payload: {
  lat: number;
  lon: number;
  address: string;
  inputs: VulnerabilityInput;
}) => apiRequest<unknown>('/api/assess', { method: 'POST', body: JSON.stringify(payload) });

export const listAssessments = () => apiRequest<unknown[]>('/api/assessments');

export const getAssessment = (id: number) => apiRequest<unknown>(`/api/assessments/${id}`);

export const searchAddressInEnsenada = async (query: string, signal: AbortSignal): Promise<NominatimResult[]> => {
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    addressdetails: '1',
    limit: '5',
    countrycodes: 'mx',
    viewbox: `${ENSENADA_VIEWBOX.lonMin},${ENSENADA_VIEWBOX.latMin},${ENSENADA_VIEWBOX.lonMax},${ENSENADA_VIEWBOX.latMax}`,
    bounded: '1'
  });

  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    headers: { Accept: 'application/json' },
    signal
  });

  if (!response.ok) {
    throw new Error('No se pudo buscar dirección');
  }

  const data = (await response.json()) as NominatimResult[];
  return data.filter(isInEnsenada);
};

export const reverseGeocodeInEnsenada = async (
  lat: number,
  lon: number,
  signal?: AbortSignal
): Promise<LocationSelection> => {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    format: 'json',
    addressdetails: '1'
  });

  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
    headers: { Accept: 'application/json' },
    signal
  });

  if (!response.ok) {
    throw new Error('No se pudo validar la ubicación');
  }

  const data = (await response.json()) as NominatimResult;
  if (!isInEnsenada(data)) {
    throw new Error('La ubicación debe estar dentro del Municipio de Ensenada.');
  }

  return {
    lat,
    lon,
    address: data.display_name
  };
};
