import { useNavigate } from 'react-router-dom';
import AddressSearch from '../components/AddressSearch';
import MapView from '../components/MapView';
import StepHeader from '../components/StepHeader';
import { useAppState } from '../App';

export default function MapPage() {
  const { state, setState } = useAppState();
  const navigate = useNavigate();

  return (
    <div>
      <StepHeader title="Paso 1: Selecciona ubicación" />
      <AddressSearch onPick={(lat, lon, displayName) => setState({ lat, lon, address: displayName })} />
      <MapView lat={state.lat} lon={state.lon} onSelect={(lat, lon) => setState({ lat, lon })} />
      <p>Lat: {state.lat.toFixed(6)} | Lon: {state.lon.toFixed(6)}</p>
      <input style={{ width: '100%' }} value={state.address} onChange={(e) => setState({ address: e.target.value })} />
      <button onClick={() => navigate('/form')}>Confirmar ubicación</button>
    </div>
  );
}
