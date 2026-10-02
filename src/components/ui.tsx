import { useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link, useNavigate, type LinkProps } from 'react-router-dom';
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
      {loading ? 'Procesando…' : children}
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
    <Link to="/chanchito" className="settings-btn" aria-label="Ajustes del chanchito">
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
      <Link to="/perfiles" className="context-name" aria-label={`Persona seleccionada: ${name}. Cambiar`}>{name}<Icon name="chevron-down" size={16} /></Link>
      {status}
    </div>
  );
}

export function ConnectionStatus({ text = 'Conectada' }: { text?: string }) {
  return <span className="conn"><Icon name="wifi" size={16} />{text}</span>;
}

export function BackBar({ label, to, icon = 'arrow-left', title, onBack }: { label?: string; to?: string; icon?: 'arrow-left' | 'x'; title?: string; onBack?: () => void }) {
  const nav = useNavigate();
  const go = () => (onBack ? onBack() : to ? nav(to) : nav(-1));
  if (label) {
    return (
      <button className="back-link" onClick={go}><Icon name="chevron-left" size={18} />{label}</button>
    );
  }
  return (
    <div className="task-bar">
      <button className="icon-btn" onClick={go} aria-label={icon === 'x' ? 'Cerrar' : 'Volver'}><Icon name={icon} size={22} /></button>
      <span>{title}</span>
    </div>
  );
}

export function useToggle(initial = false): [boolean, () => void] {
  const [v, setV] = useState(initial);
  return [v, () => setV((x) => !x)];
}
