import { useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Icon } from './ui';

const TABS = [
  { to: '/', label: 'Alcancía', icon: 'piggy-bank', end: true },
  { to: '/aprender', label: 'Aprender', icon: 'book-open', end: false },
  { to: '/progreso', label: 'Progreso', icon: 'chart-no-axes-combined', end: false },
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
    document.title = h1?.textContent ? `${h1.textContent} · Alcancía` : 'Alcancía';
    if (firstRender) { firstRender = false; return; }
    if (h1) {
      h1.setAttribute('tabindex', '-1');
      h1.focus({ preventScroll: true });
    }
  }, [pathname]);
  return pathname;
}

export default function Layout() {
  const pathname = useRouteChange();
  const active = tabIndex(pathname);
  return (
    <div className="app">
      <main className="page page-enter" key={pathname}><Outlet /></main>
      <nav className="tabbar" aria-label="Navegación principal" style={{ ['--i' as string]: active }}>
        {active >= 0 && <span className="tab-pill" aria-hidden="true" />}
        {TABS.map((t, i) => (
          <NavLink key={t.to} to={t.to} end={t.end}
            className={`tab ${i === active ? 'active' : ''}`} aria-current={i === active ? 'page' : undefined}>
            <Icon name={t.icon} size={24} />
            <span>{t.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

/** Subpantallas de tarea: sin navegación global. */
export function TaskLayout() {
  const pathname = useRouteChange();
  return <div className="app task-enter" key={pathname}><Outlet /></div>;
}
