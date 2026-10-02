import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackBar, Button, Icon, IconTile, LinkButton, Mascota } from '../components/ui';
import { ActionFooter } from './Saldo';
import { Link } from 'react-router-dom';
import { exampleState, firstDayState, useStore } from '../lib/store';
import { DEVICE, isConnected } from '../lib/device';

type Conn = 'disconnected' | 'connecting' | 'error';

export default function Chanchito() {
  const { state, dispatch } = useStore();
  // Sin hardware real: la conexión nunca se declara exitosa. Reintentar termina en un error recuperable.
  const [conn, setConn] = useState<Conn>('disconnected');
  const retry = () => {
    if (conn === 'connecting') return; // un reintento a la vez
    setConn('connecting');
    window.setTimeout(() => setConn('error'), 1500);
  };
  const title = conn === 'connecting' ? 'Conectando…' : 'Sin conexión';
  const text = conn === 'error' ? 'No se pudo conectar. Préndelo, revisa el WiFi de la casa e intenta otra vez.' : conn === 'connecting' ? 'Buscando el chanchito…' : 'Préndelo y revisa el WiFi de la casa.';

  return (
    <div className="task">
      <div className="task-scroll">
        <BackBar title={`El chanchito de ${state.childName}`} heading />
        <section className={`card card-cream device-status ${conn}`} aria-live="polite">
          <div className="device-top"><Mascota size={64} /><div><h2 className="device-title">{title}</h2><p className="muted">{text}</p></div></div>
          <Button block loading={conn === 'connecting'} onClick={retry}>Intentar otra vez</Button>
        </section>

        <h2 className="section-title">El chanchito</h2>
        <p className="muted small">Sin conexión, esto es lo último que sabemos.</p>
        <ul className="plain list">
          <Row to="bateria" icon="battery-medium" title="Batería" desc={`${DEVICE.battery.value}% · ${isConnected() ? 'Ahora' : 'lo último que sabemos'}`} />
          <Row to="wifi" icon="wifi" title="Red WiFi" desc={`${DEVICE.savedWifiName} · la que tiene guardada`} />
          <Row to="sonido" icon="volume-2" title="Volumen" desc={`${DEVICE.volume.value}% · lo último que sabemos`} />
          <Row to="emparejar" icon="bluetooth" title="Conectar este celular" desc="Para manejar el chanchito desde aquí." />
        </ul>

        <h2 className="section-title">Familia</h2>
        <ul className="plain list"><Row to="perfil" icon="user-round" title={`Perfil de ${state.childName}`} desc="Su nombre" /></ul>

        <div className="center foot-links">
          <Link to="/sesion/cerrar" className="link">Cerrar sesión</Link>
          <p className="muted small">PiggyBank IoT · v2.4.0</p>
          <button className="link small" onClick={() => { if (window.confirm('Se van a poner otra vez los datos de ejemplo. ¿Seguro?')) dispatch({ type: 'reset', state: exampleState() }); }}>Poner datos de ejemplo</button>
          <button className="link small" onClick={() => { if (window.confirm('Se va a borrar todo para empezar desde cero. ¿Seguro?')) dispatch({ type: 'reset', state: firstDayState() }); }}>Empezar desde cero</button>
        </div>
      </div>
    </div>
  );
}

function Row({ to, icon, title, desc }: { to: string; icon: string; title: string; desc: string }) {
  return (
    <li>
      <Link to={`/chanchito/${to}`} className="row">
        <IconTile icon={icon} tone="azul" />
        <span className="row-text"><strong>{title}</strong><span className="muted small">{desc}</span></span>
        <Icon name="chevron-right" size={18} className="muted" />
      </Link>
    </li>
  );
}

function Offline({ children }: { children?: React.ReactNode }) {
  return <p className="alert-box"><strong>Sin conexión.</strong> Esto es lo último que sabemos; no está al día. {children}</p>;
}

export function Bateria() {
  return (
    <div className="task"><div className="task-scroll">
      <BackBar title="Batería" heading />
      <div className="info-box"><span>Lo último que sabemos</span><strong>{DEVICE.battery.value}%</strong></div>
      <div className="bar" role="progressbar" aria-valuenow={DEVICE.battery.value} aria-valuemin={0} aria-valuemax={100} aria-label="Batería"><div style={{ width: `${DEVICE.battery.value}%` }} /></div>
      <p className="muted small">No sabemos de cuándo es este dato.</p>
      <Offline>Conecta el chanchito para ver cuánta batería tiene ahora.</Offline>
      <h2 className="section-title">Algunos consejos</h2>
      <ul className="bullets"><li>Cárgalo cuando le quede poquita batería.</li><li>Si no prende, revisa el cable y el cargador.</li></ul>
    </div></div>
  );
}

export function Wifi() {
  return (
    <div className="task"><div className="task-scroll">
      <BackBar title="Red WiFi" heading />
      <div className="info-box"><span>WiFi guardado</span><strong>{DEVICE.savedWifiName}</strong></div>
      <Offline>Para cambiar de WiFi, primero conecta el chanchito.</Offline>
      <Button block variant="secondary" disabled>Cambiar de WiFi</Button>
      <h2 className="section-title">Para volver a conectarlo</h2>
      <ul className="bullets"><li>Prende el chanchito.</li><li>Revisa que el WiFi de la casa esté funcionando (tiene que ser de 2.4 GHz).</li><li>Acércalo al router (el aparato del internet) e intenta otra vez.</li></ul>
    </div></div>
  );
}

export function Sonido() {
  return (
    <div className="task"><div className="task-scroll">
      <BackBar title="Volumen" heading />
      <div className="info-box"><span>Lo último que sabemos</span><strong>{DEVICE.volume.value}%</strong></div>
      <label htmlFor="vol" className="field-label">Volumen</label>
      <input id="vol" type="range" min={0} max={100} value={DEVICE.volume.value} disabled aria-describedby="vol-ayuda" readOnly />
      <p id="vol-ayuda" className="muted small">El volumen solo cambia cuando el chanchito lo confirme.</p>
      <Offline>Sin conexión no se puede cambiar el volumen.</Offline>
    </div></div>
  );
}

export function Emparejar() {
  type S = 'idle' | 'searching' | 'unsupported' | 'notfound';
  const [s, setS] = useState<S>('idle');
  const search = async () => {
    if (s === 'searching') return;
    const bt = (navigator as unknown as { bluetooth?: { requestDevice: (o: unknown) => Promise<unknown> } }).bluetooth;
    if (!bt) { setS('unsupported'); return; }
    setS('searching');
    try { await bt.requestDevice({ acceptAllDevices: true }); setS('notfound'); }
    catch { setS('notfound'); }
  };
  return (
    <div className="task">
      <div className="task-scroll">
        <BackBar title="Conectar este celular" />
        <h1 className="title">Maneja el chanchito desde este celular</h1>
        <ol className="bullets num"><li>Prende el chanchito y tenlo cerca.</li><li>Prende el Bluetooth de este celular.</li><li>Toca «Buscar chanchito» y escógelo en la lista.</li></ol>
        {s === 'unsupported' && <p className="alert-box appear" role="alert">Desde este navegador no se puede usar Bluetooth. Prueba con Chrome en un celular Android.</p>}
        {s === 'notfound' && <p className="alert-box appear" role="alert">No se pudo conectar. Revisa que esté prendido y cerca, e intenta otra vez.</p>}
        <p className="note"><Icon name="info" size={18} />El celular te va a pedir permiso para conectarse.</p>
      </div>
      <ActionFooter><Button block loading={s === 'searching'} onClick={search}>Buscar chanchito</Button></ActionFooter>
    </div>
  );
}

export function Perfil() {
  const { state, dispatch } = useStore();
  const nav = useNavigate();
  const [name, setName] = useState(state.childName);
  const [touched, setTouched] = useState(false);
  const save = () => { setTouched(true); if (!name.trim()) return; dispatch({ type: 'setName', name: name.trim() }); nav(-1); };
  return (
    <div className="task">
      <div className="task-scroll">
        <BackBar title={`Perfil de ${state.childName}`} heading />
        <label htmlFor="nombre" className="field-label">Nombre</label>
        <input id="nombre" className="text-field" maxLength={30} value={name} onChange={(e) => setName(e.target.value)} />
        {touched && !name.trim() && <p className="small error" role="alert">Escribe un nombre.</p>}
        <p className="muted small">Así aparecerá en toda la app.</p>
      </div>
      <ActionFooter><Button block onClick={save}>Guardar</Button></ActionFooter>
    </div>
  );
}

export function Perfiles() {
  const { state } = useStore();
  return (
    <>
      <BackBar label="Volver" />
      <h1 className="title">¿Con quién estás?</h1>
      <p className="muted">Todo lo que anotes será para esta persona.</p>
      <ul className="plain list">
        <li className="row static">
          <IconTile icon="user-round" tone="azul" />
          <span className="row-text"><strong>{state.childName}</strong><span className="muted small">Estás aquí</span></span>
          <Icon name="check" size={20} />
        </li>
      </ul>
      <LinkButton to="/chanchito/perfil" variant="secondary" block>Editar perfil</LinkButton>
    </>
  );
}

export function CerrarSesion() {
  return (
    <div className="task">
      <div className="task-scroll">
        <BackBar title="Cerrar sesión" />
        <div className="center-col">
          <h1 className="title center">¿Cerrar sesión?</h1>
          <p className="muted center">Puedes volver a entrar cuando quieras. Lo que anotaste en este celular no se borra.</p>
        </div>
      </div>
      <ActionFooter>
        <LinkButton to="/sesion/cerrada" block>Cerrar sesión</LinkButton>
        <LinkButton to="/chanchito" variant="tertiary" block>Cancelar</LinkButton>
      </ActionFooter>
    </div>
  );
}

export function SesionCerrada() {
  return (
    <div className="task">
      <div className="task-scroll">
        <div className="center-col">
          <Mascota size={100} />
          <h1 className="title center">Sesión cerrada</h1>
          <p className="muted center">Todavía no hay cuentas de usuario en esta versión, así que puedes entrar directo.</p>
        </div>
      </div>
      <ActionFooter><LinkButton to="/" block>Entrar de nuevo</LinkButton></ActionFooter>
    </div>
  );
}
