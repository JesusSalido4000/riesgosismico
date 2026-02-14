import React, { useEffect, useRef, useState } from 'react';
import { NominatimResult, searchAddressInEnsenada } from '../api';

export const AddressSearch: React.FC<{ onPick: (lat: number, lon: number, address: string) => void }> = ({ onPick }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      setError('');
      setLoading(false);
      abortRef.current?.abort();
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setError('');

      try {
        const found = await searchAddressInEnsenada(query, controller.signal);
        setResults(found);
        if (found.length === 0) {
          setError('No se encontraron resultados dentro del Municipio de Ensenada.');
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          return;
        }
        setResults([]);
        setError((err as Error).message || 'No se pudo buscar dirección.');
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar dirección en Ensenada"
          style={{ flex: 1, padding: 8 }}
        />
      </div>
      {loading && <p style={{ margin: '8px 0', color: '#555' }}>Buscando...</p>}
      {error && <p style={{ margin: '8px 0', color: '#7f0000' }}>{error}</p>}
      {results.map((item) => (
        <div key={`${item.lat}-${item.lon}-${item.display_name}`} style={{ marginTop: 8 }}>
          <button
            onClick={() => onPick(Number(item.lat), Number(item.lon), item.display_name)}
            style={{ width: '100%', textAlign: 'left' }}
          >
            {item.display_name}
          </button>
        </div>
      ))}
    </div>
  );
};
