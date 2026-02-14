import React, { useState } from 'react';
import { searchAddress } from '../api';

export const AddressSearch: React.FC<{ onSelect: (lat: number, lon: number, address: string) => void }> = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ lat: string; lon: string; display_name: string }>>([]);

  const handleSearch = async () => {
    if (query.trim().length < 3) return;
    const found = await searchAddress(query);
    setResults(found);
  };

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar dirección" style={{ flex: 1, padding: 8 }} />
        <button onClick={handleSearch}>Buscar</button>
      </div>
      {results.map((item) => (
        <div key={`${item.lat}-${item.lon}`} style={{ marginTop: 8 }}>
          <button onClick={() => onSelect(Number(item.lat), Number(item.lon), item.display_name)} style={{ width: '100%', textAlign: 'left' }}>
            {item.display_name}
          </button>
        </div>
      ))}
    </div>
  );
};
