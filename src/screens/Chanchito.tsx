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
  const text = conn === 'error' ? 'No pudimos conectar. Enciéndela, revisa la red WiFi y vuelve a intentar.' : conn === 'connecting' ? 'Buscando el chanchito…' : 'Enciéndela y revisa la red WiFi.';

  return (
    <div className="task">
      <div className="task-scroll">
        <BackBar title={`El chanchito de ${state.childName}`} heading />
        <section className={`card card-cream device-status ${conn}`} aria-live="polite">
          <div className="device-top"><Mascota size={64} /><div><h2 className="device-title">{title}</h2><p className="muted">{text}</p></div></div>
          <Button block loading={conn === 'connecting'} onClick={retry}>Reintentar conexión</Button>
        </section>

        <h2 className="section-title">Dispositivo</h2>
        <p className="muted small">Los datos no se actualizan sin conexión.</p>
        <ul className="plain list">
          <Row to="bateria" icon="battery-medium" title="Batería y energía" desc={`${DEVICE.battery.value}% · ${isConnected() ? 'Ahora' : 'Último dato recibido'}`} />
          <Row to="wifi" icon="wifi" title="Red WiFi" desc={`${DEVICE.savedWifiName} · guardada`} />
          <Row to="sonido" icon="volume-2" title="Voz y sonido" desc={`Volumen ${DEVICE.volume.value}% · Último ajuste conocido`} />
          <Row to="emparejar" icon="bluetooth" title="Emparejar este celular" desc="Para usarla desde este celular." />
        </ul>

        <h2 className="section-title">Familia</h2>
        <ul className="plain list"><Row to="perfil" icon="user-round" title={`Perfil de ${state.childName}`} desc="Nombre y datos del perfil" /></ul>

        <div className="center foot-links">
          <Link to="/sesion/cerrar" className="link">Cerrar sesión</Link>
          <p className="muted small">PiggyBank IoT · v2.4.0</p>
          <button className="link small" onClick={() => { if (window.confirm('Se restablecerán todos los datos de ejemplo. ¿Continuar?')) dispatch({ type: 'reset', state: exampleState() }); }}>Restablecer datos de ejemplo</button>
          <button className="link small" onClick={() => { if (window.confirm('Se borrarán los datos actuales para ver el primer día. ¿Continuar?')) dispatch({ type: 'reset', state: firstDayState() }); }}>Ver primer día (sin datos)</button>
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
  return <p className="alert-box"><strong>Sin conexión.</strong> Estos datos son el último dato conocido y no se actualizan en vivo. {children}</p>;
}

export function Bateria() {
  return (
    <div className="task"><div className="task-scroll">
      <BackBar title="Batería y energía" heading />
      <div className="info-box"><span>Último dato recibido</span><strong>{DEVICE.battery.value}%</strong></div>
      <div className="bar" role="progressbar" aria-valuenow={DEVICE.battery.value} aria-valuemin={0} aria-valuemax={100} aria-label="Batería"><div style={{ width: `${DEVICE.battery.value}%` }} /></div>
      <p className="muted small">Sin fecha de lectura disponible.</p>
      <Offline>Conecta el chanchito para ver la batería actual.</Offline>
      <h2 className="section-title">Consejos</h2>
      <ul className="bullets"><li>Cárgalo cuando quede poca batería.</li><li>Si no enciende, revisa el cable y el cargador.</li></ul>
    </div></div>
  );
}

export function Wifi() {
  return (
    <div className="task"><div className="task-scroll">
      <BackBar title="Red WiFi" heading />
      <div className="info-box"><span>Red guardada</span><strong>{DEVICE.savedWifiName}</strong></div>
      <Offline>Para cambiar de red, primero conecta el chanchito.</Offline>
      <Button block variant="secondary" disabled>Cambiar de red</Button>
      <h2 className="section-title">Para reconectar</h2>
      <ul className="bullets"><li>Enciende el chanchito.</li><li>Revisa que el WiFi de casa esté funcionando (red de 2.4 GHz).</li><li>Acércalo al router y vuelve a intentar.</li></ul>
    </div></div>
  );
}

export function Sonido() {
  return (
    <div className="task"><div className="task-scroll">
      <BackBar title="Voz y sonido" heading />
      <div className="info-box"><span>Último volumen conocido</span><strong>{DEVICE.volume.value}%</strong></div>
      <label htmlFor="vol" className="field-label">Volumen</label>
      <input id="vol" type="range" min={0} max={100} value={DEVICE.volume.value} disabled aria-describedby="vol-ayuda" readOnly />
      <p id="vol-ayuda" className="muted small">Un cambio de volumen solo se aplica cuando el chanchito confirme.</p>
      <Offline>No se puede cambiar el volumen sin conexión.</Offline>
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
        <BackBar title="Emparejar este celular" />
        <h1 className="title">Usa el chanchito desde este celular</h1>
        <ol className="bullets num"><li>Enciende el chanchito y acércalo.</li><li>Activa el Bluetooth de este celular.</li><li>Toca «Buscar chanchito» y elígelo en la lista.</li></ol>
        {s === 'unsupported' && <p className="alert-box appear" role="alert">Este navegador no permite emparejar por Bluetooth. Prueba con Chrome en Android.</p>}
        {s === 'notfound' && <p className="alert-box appear" role="alert">No se completó el emparejamiento. Revisa que esté encendido y cerca, y vuelve a intentar.</p>}
        <p className="note"><Icon name="info" size={18} />El emparejamiento requiere confirmar los permisos del dispositivo.</p>
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
        <p className="muted small">El nombre se usa en las pantallas de la app.</p>
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
      <p className="muted">Siempre verás a quién se aplica cada acción.</p>
      <ul className="plain list">
        <li className="row static">
          <IconTile icon="user-round" tone="azul" />
          <span className="row-text"><strong>{state.childName}</strong><span className="muted small">Seleccionada</span></span>
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
          <p className="muted center">Podrás volver a entrar cuando quieras. Tus registros de práctica en este celular se conservan.</p>
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
          <p className="muted center">Aquí iría el inicio de sesión real. Aún no está conectado a un servicio de cuentas.</p>
        </div>
      </div>
      <ActionFooter><LinkButton to="/" block>Entrar de nuevo</LinkButton></ActionFooter>
    </div>
  );
}
