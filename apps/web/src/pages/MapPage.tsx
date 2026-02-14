import React from 'react';
import { AddressSearch } from '../components/AddressSearch';
import { MapView } from '../components/MapView';
import { StepHeader } from '../components/StepHeader';

export const MapPage: React.FC<{
  lat: number;
  lon: number;
  address: string;
  onLocationChange: (lat: number, lon: number, address?: string) => void;
  onNext: () => void;
}> = ({ lat, lon, address, onLocationChange, onNext }) => (
  <div>
    <StepHeader title="1) Selecciona ubicación" />
    <AddressSearch onSelect={(newLat, newLon, newAddress) => onLocationChange(newLat, newLon, newAddress)} />
    <MapView lat={lat} lon={lon} onChange={(newLat, newLon) => onLocationChange(newLat, newLon)} />
    <p>Lat: {lat.toFixed(5)} | Lon: {lon.toFixed(5)}</p>
    <input
      value={address}
      onChange={(e) => onLocationChange(lat, lon, e.target.value)}
      placeholder="Dirección seleccionada"
      style={{ width: '100%', padding: 8, marginBottom: 12 }}
    />
    <button onClick={onNext} disabled={!address}>Confirmar ubicación</button>
  </div>
);
