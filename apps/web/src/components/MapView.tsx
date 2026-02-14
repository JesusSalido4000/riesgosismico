import L from 'leaflet';
import React, { useEffect } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const ClickHandler: React.FC<{ onMapClick: (lat: number, lon: number) => void }> = ({ onMapClick }) => {
  useMapEvents({ click: (e) => onMapClick(e.latlng.lat, e.latlng.lng) });
  return null;
};

const CenterUpdater: React.FC<{ lat: number; lon: number; focusKey: number }> = ({ lat, lon, focusKey }) => {
  const map = useMapEvents({});

  useEffect(() => {
    map.flyTo([lat, lon], 16, { animate: true, duration: 0.5 });
  }, [focusKey, lat, lon, map]);

  return null;
};

export const MapView: React.FC<{
  lat: number;
  lon: number;
  focusKey: number;
  onChange: (lat: number, lon: number) => void;
}> = ({ lat, lon, focusKey, onChange }) => (
  <MapContainer center={[31.8667, -116.5964]} zoom={12} style={{ height: 420, width: '100%' }}>
    <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    <ClickHandler onMapClick={onChange} />
    <CenterUpdater lat={lat} lon={lon} focusKey={focusKey} />
    <Marker
      icon={markerIcon}
      position={[lat, lon]}
      draggable
      eventHandlers={{
        dragend: (e) => {
          const p = (e.target as L.Marker).getLatLng();
          onChange(p.lat, p.lng);
        }
      }}
    />
  </MapContainer>
);
