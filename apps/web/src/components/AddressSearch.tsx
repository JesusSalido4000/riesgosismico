import { useState } from 'react';

interface NominatimResult { lat: string; lon: string; display_name: string; }

export default function AddressSearch({ onPick }: { onPick: (lat: number, lon: number, displayName: string) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);

  const search = async () => {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`);
    setResults(await res.json());
  };

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar dirección" />
      <button onClick={search}>Buscar</button>
      <ul>
        {results.map((r) => (
          <li key={`${r.lat}-${r.lon}`}>
            <button onClick={() => onPick(Number(r.lat), Number(r.lon), r.display_name)}>{r.display_name}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
