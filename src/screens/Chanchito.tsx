import { BackBar, Button, Icon, IconTile, Mascota } from '../components/ui';
import { exampleState, firstDayState, useStore } from '../lib/store';
import { useState } from 'react';

type Conn = 'disconnected' | 'connecting' | 'error';

export default function Chanchito() {
  const { state, dispatch } = useStore();
  // Sin hardware real: la conexión nunca se declara exitosa. Reintentar vuelve a un error recuperable.
  const [conn, setConn] = useState<Conn>('disconnected');

  const retry = () => {
    if (conn === 'connecting') return; // un reintento a la vez
    setConn('connecting');
    window.setTimeout(() => setConn('error'), 1500);
  };

  const title = conn === 'connecting' ? 'Conectando…' : 'Sin conexión';
  const text = conn === 'error' ? 'No pudimos conectar. Enciéndela, revisa la red WiFi y vuelve a intentar.' : conn === 'connecting' ? 'Buscando el chanchito…' : 'Enciéndela y revisa la red WiFi.';

  return (
    <div className="task">
      <div className="task-scroll">
        <BackBar title={`El chanchito de ${state.childName}`} />
        <section className="card card-cream device-status" aria-live="polite">
          <div className="device-top"><Mascota size={64} /><div><h2 className="device-title">{title}</h2><p className="muted">{text}</p></div></div>
          <Button block loading={conn === 'connecting'} onClick={retry}>Reintentar conexión</Button>
        </section>

        <h2 className="section-title">Dispositivo</h2>
        <p className="muted small">Los datos no se actualizan sin conexión.</p>
        <ul className="plain list">
          <Row icon="battery-medium" title="Batería y energía" desc="52% · Último dato recibido" />
          <Row icon="wifi" title="Red WiFi" desc="CREMA VOLTEADA 2.4G · guardada" />
          <Row icon="volume-2" title="Voz y sonido" desc="Volumen 10% · Último ajuste conocido" />
          <Row icon="bluetooth" title="Emparejar este celular" desc="Para usarla desde este celular." />
        </ul>

        <h2 className="section-title">Familia</h2>
        <ul className="plain list"><Row icon="user-round" title={`Perfil de ${state.childName}`} desc="Nombre y datos del perfil" /></ul>

        <div className="center foot-links">
          <button className="link" onClick={() => alert('Cerrar sesión requiere conectar la autenticación real.')}>Cerrar sesión</button>
          <p className="muted small">PiggyBank IoT · v2.4.0</p>
          <button className="link small" onClick={() => dispatch({ type: 'reset', state: exampleState })}>Restablecer datos de ejemplo</button>
          <button className="link small" onClick={() => dispatch({ type: 'reset', state: firstDayState })}>Ver primer día (sin datos)</button>
        </div>
      </div>
    </div>
  );
}

function Row({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <li className="row static">
      <IconTile icon={icon} tone="azul" />
      <span className="row-text"><strong>{title}</strong><span className="muted small">{desc}</span></span>
      <Icon name="chevron-right" size={18} className="muted" />
    </li>
  );
}
