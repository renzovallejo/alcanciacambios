import { useState } from 'react';
import { BackBar, ChildContext, ConnectionStatus, AccessRow, Icon, LinkButton, Mascota, ScreenHeader } from '../components/ui';
import { useStore } from '../lib/store';

export function Aprender() {
  const { state } = useStore();
  const started = state.balanceMinor > 0 || state.goals.length > 0;
  return (
    <>
      <ScreenHeader title="Aprender" />
      <ChildContext name={state.childName} status={<ConnectionStatus />} />
      {!started && (
        <>
          <h2 className="lead">Aprendan a ahorrar juntos</h2>
          <p className="muted">Explora ideas para acompañar a {state.childName}. No necesitas ser experto.</p>
        </>
      )}
      <section className="card card-violet feature">
        <div className="eyebrow violet">{started ? 'EN CURSO · AHORRAR' : 'PARA EMPEZAR · AHORRAR'}</div>
        <div className="feature-top">
          <h2 className="feature-title">Fijar una meta de ahorro</h2>
          <Mascota size={64} />
        </div>
        {started && (
          <div className="now"><Icon name="book-open" size={20} /><span>Ahora: un cuento para conversar</span></div>
        )}
        <LinkButton to="/cuento" block>{started ? 'Continuar actividad' : 'Conocer la actividad'}</LinkButton>
      </section>

      <h2 className="section-title">{started ? 'También puedes acompañar así' : 'Otras formas de acompañar'}</h2>
      <p className="muted small">{started ? 'Tú eliges cuándo. No son tareas pendientes.' : 'Explora a tu ritmo. Tú eliges por dónde empezar.'}</p>
      <ul className="plain list">
        {!started && <li><AccessRow to="/biblioteca" icon="library" tone="azul" title="Biblioteca" description="Cuentos, misiones y juegos de rol." /></li>}
        <li><AccessRow to="/progreso" icon="sparkles" tone="violeta" title="Registrar un momento" description={`Algo que ${state.childName} dijo o hizo.`} /></li>
        <li><AccessRow to="/progreso" icon="party-popper" tone="naranja" title="Celebrar un logro" description="Un mensaje para reconocer su esfuerzo." /></li>
        {started && <li><AccessRow to="/biblioteca" icon="library" tone="azul" title="Biblioteca" description="Cuentos, misiones y juegos de rol." /></li>}
      </ul>
    </>
  );
}

type Format = 'cuentos' | 'misiones' | 'juegos';
const FORMATS: { id: Format; label: string }[] = [
  { id: 'cuentos', label: 'Cuentos' }, { id: 'misiones', label: 'Misiones' }, { id: 'juegos', label: 'Juegos de rol' },
];
const TOPICS = ['Todos los temas', 'Ahorrar', 'Gastar bien', 'Compartir', 'Ganar'];

const CONTENT: Record<Format, {
  sub: string; tone: 'violeta' | 'verde' | 'naranja'; card: string; eyebrow: string; title: string; cta: string; icon: string; to: string;
  items: { title: string; meta: string; topic: string }[];
}> = {
  cuentos: {
    sub: 'Elijan qué descubrir, sin seguir un orden.', tone: 'violeta', card: 'card-violet', eyebrow: 'EL CUENTO DEL CHANCHITO',
    title: 'Cómo nació tu alcancía', cta: 'Escuchar en la alcancía', icon: 'book-open', to: '/cuento',
    items: [
      { title: 'Planifica y ahorra para una meta', meta: 'Ahorrar · 5 min', topic: 'Ahorrar' },
      { title: 'Separa el ahorro del gasto', meta: 'Ahorrar · 7 min', topic: 'Ahorrar' },
      { title: 'Lleva control de lo que gastas', meta: 'Gastar bien · cuento', topic: 'Gastar bien' },
    ],
  },
  misiones: {
    sub: 'Elijan qué descubrir, sin seguir un orden.', tone: 'verde', card: 'card-mint', eyebrow: 'PARA HACER EN CASA',
    title: 'Una meta en familia', cta: 'Ver misión', icon: 'flag', to: '/progreso',
    items: [
      { title: 'Separa tus monedas', meta: 'Ahorrar · en familia', topic: 'Ahorrar' },
      { title: 'Compara antes de elegir', meta: 'Gastar bien · en familia', topic: 'Gastar bien' },
      { title: 'Elige algo para compartir', meta: 'Compartir · en familia', topic: 'Compartir' },
    ],
  },
  juegos: {
    sub: 'Imaginen situaciones para practicar juntos.', tone: 'naranja', card: 'card-cream', eyebrow: 'IMAGINEN Y CONVERSEN',
    title: 'La tienda de casa', cta: 'Ver juego', icon: 'messages-square', to: '/progreso',
    items: [
      { title: '¿Lo necesito o lo quiero?', meta: 'Gastar bien · dos personas', topic: 'Gastar bien' },
      { title: 'Un regalo entre todos', meta: 'Compartir · en familia', topic: 'Compartir' },
      { title: 'Mi primer pequeño negocio', meta: 'Ganar · dos personas', topic: 'Ganar' },
    ],
  },
};

export function Biblioteca() {
  const [format, setFormat] = useState<Format>('cuentos');
  const [topic, setTopic] = useState(TOPICS[0]); // el tema se conserva al cambiar de formato
  const c = CONTENT[format];
  const items = c.items.filter((i) => topic === TOPICS[0] || i.topic === topic);
  return (
    <>
      <BackBar label="Aprender" to="/aprender" />
      <h1 className="title">Biblioteca</h1>
      <p className="muted">{c.sub}</p>
      <div className="segmented" role="tablist" aria-label="Formato">
        {FORMATS.map((f) => (
          <button key={f.id} role="tab" aria-selected={format === f.id} className={format === f.id ? 'on' : ''} onClick={() => setFormat(f.id)}>{f.label}</button>
        ))}
      </div>
      <section className={`card ${c.card} feature`}>
        <div className="eyebrow">{c.eyebrow}</div>
        <div className="feature-top">
          <h2 className="feature-title">{c.title}</h2>
          {format === 'cuentos' ? <Mascota size={64} /> : <span className="badge-white"><Icon name={c.icon} size={28} /></span>}
        </div>
        <LinkButton to={c.to} block>{c.cta}</LinkButton>
      </section>
      <div className="section-head">
        <h2>Para descubrir</h2>
        <label className="select-link">
          <span className="sr-only">Filtrar por tema</span>
          <select value={topic} onChange={(e) => setTopic(e.target.value)}>
            {TOPICS.map((t) => <option key={t}>{t}</option>)}
          </select>
          <Icon name="chevron-down" size={18} />
        </label>
      </div>
      {items.length === 0 ? <p className="muted">No hay {format === 'juegos' ? 'juegos de rol' : format} para este tema todavía.</p> : (
        <ul className="plain list">
          {items.map((i) => (
            <li key={i.title}>
              <AccessRow to={c.to} icon={c.icon} tone={c.tone} title={i.title} description={i.meta} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
