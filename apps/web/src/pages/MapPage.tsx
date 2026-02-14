import React from 'react';
import { AddressSearch } from '../components/AddressSearch';
import { MapView } from '../components/MapView';
import { StepHeader } from '../components/StepHeader';

export const MapPage: React.FC<{
  lat: number;
  lon: number;
  address: string;
  focusKey: number;
  locationError: string;
  onPickAddress: (lat: number, lon: number, address: string) => void;
  onMapPinMove: (lat: number, lon: number) => void;
  onAddressInput: (address: string) => void;
  onNext: () => void;
}> = ({ lat, lon, address, focusKey, locationError, onPickAddress, onMapPinMove, onAddressInput, onNext }) => (
  <div>
    <StepHeader title="1) Selecciona ubicación" />
    <AddressSearch onPick={onPickAddress} />
    <MapView lat={lat} lon={lon} focusKey={focusKey} onChange={onMapPinMove} />
    {locationError && <p style={{ color: '#7f0000' }}>{locationError}</p>}
    <p>Lat: {lat.toFixed(5)} | Lon: {lon.toFixed(5)}</p>
    <input
      value={address}
      onChange={(e) => onAddressInput(e.target.value)}
      placeholder="Dirección seleccionada"
      style={{ width: '100%', padding: 8, marginBottom: 12 }}
    />
    <button onClick={onNext} disabled={!address}>Confirmar ubicación</button>
  </div>
);
