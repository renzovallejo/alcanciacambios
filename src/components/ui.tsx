import { useEffect, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link, useNavigate, type LinkProps } from 'react-router-dom';
import { isConnected } from '../lib/device';
import { useStore } from '../lib/store';
import { t } from '../i18n';
import mascota1 from '../assets/mascota/mascota-1x.png';
import mascota2 from '../assets/mascota/mascota-2x.png';
import mascota3 from '../assets/mascota/mascota-3x.png';

const svgs = import.meta.glob('../assets/iconos/*.svg', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

export function Icon({ name, size = 24, className = '' }: { name: string; size?: number; className?: string }) {
  const raw = svgs[`../assets/iconos/${name}.svg`] ?? '';
  return (
    <span className={`icon ${className}`} style={{ width: size, height: size }} aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: raw }} />
  );
}

export function Mascota({ size = 64, className = '' }: { size?: number; className?: string }) {
  return (
    <img className={`mascota ${className}`} width={size} height={size} alt=""
      src={mascota1} srcSet={`${mascota1} 1x, ${mascota2} 2x, ${mascota3} 3x`} />
  );
}

type Variant = 'primary' | 'secondary' | 'tertiary';
interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: Variant; loading?: boolean; block?: boolean }

export function Button({ variant = 'primary', loading, block, disabled, children, className = '', ...rest }: BtnProps) {
  return (
    <button {...rest} disabled={disabled || loading} aria-busy={loading || undefined}
      className={`btn btn-${variant} ${block ? 'btn-block' : ''} ${className}`}>
      {loading ? <><span className="spinner" aria-hidden="true" />{t('comun.unRatito')}</> : children}
    </button>
  );
}

export function LinkButton({ variant = 'primary', block, children, className = '', ...rest }: LinkProps & { variant?: Variant; block?: boolean }) {
  return <Link {...rest} className={`btn btn-${variant} ${block ? 'btn-block' : ''} ${className}`}>{children}</Link>;
}

export function IconTile({ icon, tone, size = 40 }: { icon: string; tone: 'azul' | 'violeta' | 'naranja' | 'verde'; size?: number }) {
  return (
    <span className={`tile tile-${tone}`} style={{ width: size, height: size }}>
      <Icon name={icon} size={20} />
    </span>
  );
}

/** Fila pulsable completa: toda la fila es el objetivo táctil. */
export function AccessRow({ to, icon, tone, title, description }: { to: string; icon: string; tone: 'azul' | 'violeta' | 'naranja' | 'verde'; title: string; description: string }) {
  return (
    <Link to={to} className="row">
      <IconTile icon={icon} tone={tone} />
      <span className="row-text"><strong>{title}</strong><span className="muted">{description}</span></span>
      <Icon name="chevron-right" size={18} className="muted" />
    </Link>
  );
}

export function SettingsLink() {
  return (
    <Link to="/chanchito" className="settings-btn" aria-label={t('comun.ajustesChanchito')}>
      <Icon name="settings" size={22} />
    </Link>
  );
}

export function ScreenHeader({ title, action = true }: { title: string; action?: boolean }) {
  return (
    <header className="screen-header">
      <h1>{title}</h1>
      {action && <SettingsLink />}
    </header>
  );
}

export function ChildContext({ name, status }: { name: string; status?: ReactNode }) {
  return (
    <div className="context">
      <Link to="/perfiles" className="context-name" aria-label={t('comun.estasViendo', { nombre: name })}>{name}<Icon name="chevron-down" size={16} /></Link>
      {status}
    </div>
  );
}

/** Estado de conexión del chanchito: icono + texto, enlaza a sus ajustes. */
export function ConnectionStatus() {
  const on = isConnected();
  const { state } = useStore();
  // Si nunca se conectó, no se dice «Sin conexión» (asusta): se invita a conectarlo.
  if (!on && !state.devicePaired) {
    return <Link to="/chanchito" className="conn invite"><Icon name="wifi" size={16} />{t('conexion.conectar')}</Link>;
  }
  return (
    <Link to="/chanchito" className={`conn ${on ? '' : 'off'}`} aria-label={t('conexion.etiqueta', { estado: t(on ? 'conexion.estadoConectado' : 'conexion.estadoSinConexion') })}>
      <Icon name="wifi" size={16} />{t(on ? 'conexion.conectado' : 'conexion.sinConexion')}
    </Link>
  );
}

export function BackBar({ label, to, icon = 'arrow-left', title, onBack, heading = false }: { label?: string; to?: string; icon?: 'arrow-left' | 'x'; title?: string; onBack?: () => void; heading?: boolean }) {
  const nav = useNavigate();
  const canGoBack = ((window.history.state as { idx?: number } | null)?.idx ?? 0) > 0;
  const go = () => (onBack ? onBack() : to ? nav(to) : canGoBack ? nav(-1) : nav('/'));
  if (label) {
    return (
      <button className="back-link" onClick={go}><Icon name="chevron-left" size={18} />{label}</button>
    );
  }
  return (
    <div className="task-bar">
      <button className="icon-btn" onClick={go} aria-label={t(icon === 'x' ? 'comun.cerrar' : 'comun.volver')}><Icon name={icon} size={22} /></button>
      {heading ? <h1 className="task-title">{title}</h1> : <span>{title}</span>}
    </div>
  );
}

/** Anima un número desde el último valor mostrado (solo visual; el valor real se anuncia de inmediato). */
export function useCountUp(target: number, key: string, duration = 700): number {
  const start = lastShown.get(key) ?? target;
  const [v, setV] = useState(start);
  useEffect(() => {
    lastShown.set(key, target);
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (start === target || reduce) { setV(target); return; }
    let raf = 0; const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / duration);
      const e = 1 - Math.pow(1 - k, 3);
      setV(Math.round(start + (target - start) * e));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return v;
}
const lastShown = new Map<string, number>();

export function useToggle(initial = false): [boolean, () => void] {
  const [v, setV] = useState(initial);
  return [v, () => setV((x) => !x)];
}

/** Aviso de honestidad: completo la primera vez; luego una línea corta que se puede abrir. */
export function HonestyNote({ long = false }: { long?: boolean }) {
  const { state } = useStore();
  const [open, toggle] = useToggle(false);
  if (long && !state.seenHonesty) return <p className="note"><Icon name="info" size={18} /> {t('comun.soloCuentaLargo')}</p>;
  return (
    <p className="note short">
      <Icon name="info" size={16} />
      <span>
        {open ? t('comun.soloCuentaLargo') : t('comun.soloCuentaCorto')}
        {!open && <button type="button" className="link-btn" onClick={toggle}>{t('comun.saberMas')}</button>}
      </span>
    </p>
  );
}

/** Lee un texto con la voz del celular (speechSynthesis). Si no hay, avisa. */
export function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  useEffect(() => () => { if (supported) window.speechSynthesis.cancel(); }, [supported]);
  const speak = (text: string) => {
    if (!supported) return false;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'es-PE'; u.rate = 0.95;
    u.onend = () => setSpeaking(false); u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(u);
    return true;
  };
  const stop = () => { if (supported) window.speechSynthesis.cancel(); setSpeaking(false); };
  return { supported, speaking, speak, stop };
}
