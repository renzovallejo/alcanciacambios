import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackBar, Button, Icon, IconTile, LinkButton, Mascota } from '../components/ui';
import { ActionFooter } from './Saldo';
import { Link } from 'react-router-dom';
import { firstDayState, seedIsEmpty, seedState, useStore } from '../lib/store';
import { DEVICE, isConnected } from '../lib/device';
import { t } from '../i18n';

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
  const title = conn === 'connecting' ? t('chanchito.conectando') : t('conexion.sinConexion');
  const text = conn === 'error' ? t('chanchito.errorConexion') : conn === 'connecting' ? t('chanchito.buscando') : t('chanchito.sinConexionTexto');

  return (
    <div className="task">
      <div className="task-scroll">
        <BackBar title={t('chanchito.titulo', { nombre: state.childName })} heading />
        <section className={`card card-cream device-status ${conn}`} aria-live="polite">
          <div className="device-top"><Mascota size={64} /><div><h2 className="device-title">{title}</h2><p className="muted">{text}</p></div></div>
          <Button block loading={conn === 'connecting'} onClick={retry}>{t('chanchito.intentar')}</Button>
        </section>

        <h2 className="section-title">{t('chanchito.seccion')}</h2>
        <p className="muted small">{t('chanchito.sinConexionNota')}</p>
        <ul className="plain list">
          <Row to="bateria" icon="battery-medium" title={t('chanchito.bateria')} desc={t('chanchito.bateriaDato', { porcentaje: DEVICE.battery.value, cuando: t(isConnected() ? 'chanchito.ahoraMismo' : 'chanchito.loUltimo') })} />
          <Row to="wifi" icon="wifi" title={t('chanchito.wifi')} desc={t('chanchito.wifiDato', { red: DEVICE.savedWifiName })} />
          <Row to="sonido" icon="volume-2" title={t('chanchito.volumen')} desc={t('chanchito.volumenDato', { porcentaje: DEVICE.volume.value })} />
          <Row to="emparejar" icon="bluetooth" title={t('chanchito.conectarCelular')} desc={t('chanchito.conectarCelularTexto')} />
        </ul>

        <h2 className="section-title">{t('chanchito.familia')}</h2>
        <ul className="plain list"><Row to="perfil" icon="user-round" title={t('chanchito.perfil', { nombre: state.childName })} desc={t('chanchito.perfilTexto')} /></ul>

        <div className="center foot-links">
          <Link to="/sesion/cerrar" className="link">{t('chanchito.cerrarSesion')}</Link>
          <p className="muted small">{t('chanchito.version')}</p>
          <button className="link small" onClick={() => { if (window.confirm(t('chanchito.reiniciarConfirmar'))) dispatch({ type: 'reset', state: seedState() }); }}>{t('chanchito.reiniciarDemo')}</button>
          {!seedIsEmpty && <button className="link small" onClick={() => { if (window.confirm(t('chanchito.desdeCeroConfirmar'))) dispatch({ type: 'reset', state: firstDayState() }); }}>{t('chanchito.desdeCero')}</button>}
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
  return <p className="alert-box"><strong>{t('chanchito.avisoSinConexion')}</strong> {t('chanchito.avisoNoAlDia')} {children}</p>;
}

export function Bateria() {
  return (
    <div className="task"><div className="task-scroll">
      <BackBar title={t('chanchito.bateria')} heading />
      <div className="info-box"><span>{t('bateria.loUltimo')}</span><strong>{DEVICE.battery.value}%</strong></div>
      <div className="bar" role="progressbar" aria-valuenow={DEVICE.battery.value} aria-valuemin={0} aria-valuemax={100} aria-label={t('chanchito.bateria')}><div style={{ width: `${DEVICE.battery.value}%` }} /></div>
      <p className="muted small">{t('bateria.sinFecha')}</p>
      <Offline>{t('bateria.conecta')}</Offline>
      <h2 className="section-title">{t('bateria.consejos')}</h2>
      <ul className="bullets"><li>{t('bateria.consejo1')}</li><li>{t('bateria.consejo2')}</li></ul>
    </div></div>
  );
}

export function Wifi() {
  return (
    <div className="task"><div className="task-scroll">
      <BackBar title={t('chanchito.wifi')} heading />
      <div className="info-box"><span>{t('wifi.guardado')}</span><strong>{DEVICE.savedWifiName}</strong></div>
      <Offline>{t('wifi.primero')}</Offline>
      <Button block variant="secondary" disabled>{t('wifi.cambiar')}</Button>
      <h2 className="section-title">{t('wifi.reconectar')}</h2>
      <ul className="bullets"><li>{t('wifi.paso1')}</li><li>{t('wifi.paso2')}</li><li>{t('wifi.paso3')}</li></ul>
    </div></div>
  );
}

export function Sonido() {
  return (
    <div className="task"><div className="task-scroll">
      <BackBar title={t('chanchito.volumen')} heading />
      <div className="info-box"><span>{t('volumen.loUltimo')}</span><strong>{DEVICE.volume.value}%</strong></div>
      <label htmlFor="vol" className="field-label">{t('volumen.etiqueta')}</label>
      <input id="vol" type="range" min={0} max={100} value={DEVICE.volume.value} disabled aria-describedby="vol-ayuda" readOnly />
      <p id="vol-ayuda" className="muted small">{t('volumen.confirma')}</p>
      <Offline>{t('volumen.sinConexion')}</Offline>
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
        <BackBar title={t('chanchito.conectarCelular')} />
        <h1 className="title">{t('emparejar.titulo')}</h1>
        <ol className="bullets num"><li>{t('emparejar.paso1')}</li><li>{t('emparejar.paso2')}</li><li>{t('emparejar.paso3')}</li></ol>
        {s === 'unsupported' && <p className="alert-box appear" role="alert">{t('emparejar.noSoportado')}</p>}
        {s === 'notfound' && <p className="alert-box appear" role="alert">{t('emparejar.noEncontrado')}</p>}
        <p className="note"><Icon name="info" size={18} />{t('emparejar.permiso')}</p>
      </div>
      <ActionFooter><Button block loading={s === 'searching'} onClick={search}>{t('emparejar.buscar')}</Button></ActionFooter>
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
        <BackBar title={t('chanchito.perfil', { nombre: state.childName })} heading />
        <label htmlFor="nombre" className="field-label">{t('perfil.nombre')}</label>
        <input id="nombre" className="text-field" maxLength={30} value={name} onChange={(e) => setName(e.target.value)} />
        {touched && !name.trim() && <p className="small error" role="alert">{t('perfil.nombreError')}</p>}
        <p className="muted small">{t('perfil.ayuda')}</p>
      </div>
      <ActionFooter><Button block onClick={save}>{t('comun.guardar')}</Button></ActionFooter>
    </div>
  );
}

export function Perfiles() {
  const { state } = useStore();
  return (
    <>
      <BackBar label={t('comun.volver')} />
      <h1 className="title">{t('perfiles.titulo')}</h1>
      <p className="muted">{t('perfiles.ayuda')}</p>
      <ul className="plain list">
        <li className="row static">
          <IconTile icon="user-round" tone="azul" />
          <span className="row-text"><strong>{state.childName}</strong><span className="muted small">{t('perfiles.estasAqui')}</span></span>
          <Icon name="check" size={20} />
        </li>
      </ul>
      <LinkButton to="/chanchito/perfil" variant="secondary" block>{t('perfiles.editar')}</LinkButton>
    </>
  );
}

export function CerrarSesion() {
  return (
    <div className="task">
      <div className="task-scroll">
        <BackBar title={t('chanchito.cerrarSesion')} />
        <div className="center-col">
          <h1 className="title center">{t('sesion.cerrarTitulo')}</h1>
          <p className="muted center">{t('sesion.cerrarTexto')}</p>
        </div>
      </div>
      <ActionFooter>
        <LinkButton to="/sesion/cerrada" block>{t('chanchito.cerrarSesion')}</LinkButton>
        <LinkButton to="/chanchito" variant="tertiary" block>{t('comun.cancelar')}</LinkButton>
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
          <h1 className="title center">{t('sesion.cerrada')}</h1>
          <p className="muted center">{t('sesion.cerradaTexto')}</p>
        </div>
      </div>
      <ActionFooter><LinkButton to="/" block>{t('sesion.entrar')}</LinkButton></ActionFooter>
    </div>
  );
}
