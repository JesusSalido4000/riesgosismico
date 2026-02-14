import { Link } from 'react-router-dom';

const steps = [
  { label: '1 Ubicación', to: '/' },
  { label: '2 Vivienda', to: '/form' },
  { label: '3 Resultados', to: '/result' },
  { label: '4 Historial', to: '/history' }
];

export default function Sidebar({ currentPath }: { currentPath: string }) {
  return (
    <aside style={{ background: '#173451', color: 'white', padding: 16 }}>
      <h2>Riesgo Sísmico Ensenada</h2>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {steps.map((s) => (
          <Link key={s.to} style={{ color: currentPath === s.to ? '#ffd166' : '#fff' }} to={s.to}>{s.label}</Link>
        ))}
      </nav>
    </aside>
  );
}
