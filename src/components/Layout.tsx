import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Icon } from './ui';

const TABS = [
  { to: '/', label: 'Alcancía', icon: 'piggy-bank', end: true },
  { to: '/aprender', label: 'Aprender', icon: 'book-open', end: false },
  { to: '/progreso', label: 'Progreso', icon: 'chart-no-axes-combined', end: false },
];

/** Biblioteca pertenece a Aprender: mantiene esa pestaña activa. */
const learnPaths = ['/aprender', '/biblioteca'];

export default function Layout() {
  const { pathname } = useLocation();
  return (
    <div className="app">
      <main className="page"><Outlet /></main>
      <nav className="tabbar" aria-label="Navegación principal">
        {TABS.map((t) => {
          const forced = t.to === '/aprender' ? learnPaths.some((p) => pathname.startsWith(p)) : undefined;
          return (
            <NavLink key={t.to} to={t.to} end={t.end}
              className={({ isActive }) => `tab ${(forced ?? isActive) ? 'active' : ''}`}
              aria-current={(forced ?? undefined) ? 'page' : undefined}>
              <Icon name={t.icon} size={24} />
              <span>{t.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

/** Subpantallas de tarea: sin navegación global. */
export function TaskLayout() {
  return <div className="app"><Outlet /></div>;
}
