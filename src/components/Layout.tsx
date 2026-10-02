import { useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from './ui';
import { firstDayState, seedIsEmpty, useStore } from '../lib/store';
import { t } from '../i18n';

const TABS = [
  { to: '/', label: 'nav.alcancia', icon: 'piggy-bank', end: true },
  { to: '/aprender', label: 'nav.aprender', icon: 'book-open', end: false },
  { to: '/progreso', label: 'nav.progreso', icon: 'chart-no-axes-combined', end: false },
];

/** Qué pestaña queda activa para cada ruta (Biblioteca pertenece a Aprender). */
function tabIndex(path: string): number {
  if (path === '/' || ['/metas', '/meta/', '/movimiento'].some((p) => path.startsWith(p))) return 0;
  if (['/aprender', '/biblioteca'].some((p) => path.startsWith(p))) return 1;
  if (['/progreso', '/avances', '/tema/'].some((p) => path.startsWith(p))) return 2;
  return -1;
}

let firstRender = true;

/** Al cambiar de pantalla: volver arriba, actualizar el título y llevar el foco al h1 (lectores de pantalla). */
function useRouteChange() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    const h1 = document.querySelector<HTMLElement>('main h1, .task h1');
    document.title = h1?.textContent ? t('comun.tituloPestana', { titulo: h1.textContent }) : t('comun.app');
    if (firstRender) { firstRender = false; return; }
    if (h1) {
      h1.setAttribute('tabindex', '-1');
      h1.focus({ preventScroll: true });
    }
  }, [pathname]);
  return pathname;
}

/**
 * Solo en la demo «primer día» (VITE_SEED=vacio): botón rojo arriba para volver a cero y ver la app desde el inicio.
 * Es una herramienta del prototipo; no va en la app real.
 */
function DemoReset() {
  const { dispatch } = useStore();
  const nav = useNavigate();
  if (!seedIsEmpty) return null;
  const reset = () => {
    if (!window.confirm(t('demo.volverACeroConfirmar'))) return;
    dispatch({ type: 'reset', state: firstDayState() });
    nav('/');
  };
  return (
    <button type="button" className="demo-reset" onClick={reset}>
      <Icon name="rotate-ccw" size={16} /> {t('demo.volverACero')}
    </button>
  );
}

export default function Layout() {
  const pathname = useRouteChange();
  const active = tabIndex(pathname);
  return (
    <div className="app">
      <DemoReset />
      <main className="page page-enter" key={pathname}><Outlet /></main>
      <nav className="tabbar" aria-label={t('nav.etiqueta')} style={{ ['--i' as string]: active }}>
        {active >= 0 && <span className="tab-pill" aria-hidden="true" />}
        {TABS.map((tab, i) => (
          <NavLink key={tab.to} to={tab.to} end={tab.end}
            className={`tab ${i === active ? 'active' : ''}`} aria-current={i === active ? 'page' : undefined}>
            <Icon name={tab.icon} size={24} />
            <span>{t(tab.label)}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

/** Subpantallas de tarea: sin navegación global. */
export function TaskLayout() {
  const pathname = useRouteChange();
  return <div className="app task-enter" key={pathname}><DemoReset /><Outlet /></div>;
}
