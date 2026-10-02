import { useState } from 'react';
import { BackBar, ChildContext, ConnectionStatus, AccessRow, Icon, LinkButton, Mascota, ScreenHeader } from '../components/ui';
import { useStore } from '../lib/store';
import { ACTIVITIES, GAMES, MISSIONS, STEP_ICON, STORIES, TOPIC_LABEL, type StepRef } from '../lib/content';

export function Aprender() {
  const { state } = useStore();
  const topic = state.activeTopic;
  const act = ACTIVITIES[topic ?? 'ahorrar'];
  const stepIdx = topic ? Math.min(state.activityStep[topic] ?? 0, act.steps.length - 1) : 0;
  const step: StepRef = act.steps[stepIdx];
  return (
    <>
      <ScreenHeader title="Aprender" />
      <ChildContext name={state.childName} status={<ConnectionStatus />} />
      {!topic && (
        <>
          <h2 className="lead">Aprendan a ahorrar juntos</h2>
          <p className="muted">Explora ideas para acompañar a {state.childName}. No necesitas ser experto.</p>
        </>
      )}
      <section className="card card-violet feature">
        <div className="eyebrow violet">{topic ? 'EN CURSO' : 'PARA EMPEZAR'} · {TOPIC_LABEL[act.topic].toUpperCase()}</div>
        <div className="feature-top">
          <h2 className="feature-title">{act.title}</h2>
          <Mascota size={64} />
        </div>
        {topic && (
          <div className="now"><Icon name={STEP_ICON[step.kind]} size={20} /><span>Ahora: {step.title.charAt(0).toLowerCase() + step.title.slice(1)}</span></div>
        )}
        <LinkButton to={`/actividad/${act.topic}`} block>{topic ? 'Continuar actividad' : 'Conocer la actividad'}</LinkButton>
      </section>

      <h2 className="section-title">{topic ? 'También puedes acompañar así' : 'Otras formas de acompañar'}</h2>
      <p className="muted small">{topic ? 'Tú eliges cuándo. No son tareas pendientes.' : 'Explora a tu ritmo. Tú eliges por dónde empezar.'}</p>
      <ul className="plain list">
        {!topic && <li><AccessRow to="/biblioteca" icon="library" tone="azul" title="Biblioteca" description="Cuentos, misiones y juegos de rol." /></li>}
        <li><AccessRow to="/momento/nuevo" icon="sparkles" tone="violeta" title="Registrar un momento" description={`Algo que ${state.childName} dijo o hizo.`} /></li>
        <li><AccessRow to="/celebrar" icon="party-popper" tone="naranja" title="Celebrar un logro" description="Un mensaje para reconocer su esfuerzo." /></li>
        {topic && <li><AccessRow to="/biblioteca" icon="library" tone="azul" title="Biblioteca" description="Cuentos, misiones y juegos de rol." /></li>}
      </ul>
    </>
  );
}

type Format = 'cuentos' | 'misiones' | 'juegos';
const FORMATS: { id: Format; label: string }[] = [
  { id: 'cuentos', label: 'Cuentos' }, { id: 'misiones', label: 'Misiones' }, { id: 'juegos', label: 'Juegos de rol' },
];
const TOPICS = ['Todos los temas', 'Ahorrar', 'Gastar bien', 'Compartir', 'Ganar'];

const topicName = (t: keyof typeof TOPIC_LABEL) => TOPIC_LABEL[t];
const LIB_STORIES = ['s-planifica', 's-separa', 's-control'];
const LIB_MISSIONS = ['m-monedas', 'm-compara', 'm-compartir'];
const LIB_GAMES = ['g-necesito', 'g-regalo', 'g-negocio'];

const CONTENT: Record<Format, {
  sub: string; tone: 'violeta' | 'verde' | 'naranja'; card: string; eyebrow: string; title: string; cta: string; icon: string; to: string;
  items: { id: string; title: string; meta: string; topic: string; to: string }[];
}> = {
  cuentos: {
    sub: 'Elijan qué descubrir, sin seguir un orden.', tone: 'violeta', card: 'card-violet', eyebrow: 'EL CUENTO DEL CHANCHITO',
    title: 'Cómo nació tu alcancía', cta: 'Escuchar en la alcancía', icon: 'book-open', to: '/cuento/s-chanchito',
    items: LIB_STORIES.map((id) => STORIES.find((x) => x.id === id)!).map((x) => ({ id: x.id, title: x.title, meta: `${topicName(x.topic)} · ${x.minutes} min`, topic: topicName(x.topic), to: `/cuento/${x.id}` })),
  },
  misiones: {
    sub: 'Elijan qué descubrir, sin seguir un orden.', tone: 'verde', card: 'card-mint', eyebrow: 'PARA HACER EN CASA',
    title: 'Una meta en familia', cta: 'Ver misión', icon: 'flag', to: '/mision/m-meta-familia',
    items: LIB_MISSIONS.map((id) => MISSIONS.find((x) => x.id === id)!).map((x) => ({ id: x.id, title: x.title, meta: `${topicName(x.topic)} · en familia`, topic: topicName(x.topic), to: `/mision/${x.id}` })),
  },
  juegos: {
    sub: 'Imaginen situaciones para practicar juntos.', tone: 'naranja', card: 'card-cream', eyebrow: 'IMAGINEN Y CONVERSEN',
    title: 'La tienda de casa', cta: 'Ver juego', icon: 'messages-square', to: '/juego/g-tienda',
    items: LIB_GAMES.map((id) => GAMES.find((x) => x.id === id)!).map((x) => ({ id: x.id, title: x.title, meta: `${topicName(x.topic)} · ${x.players}`, topic: topicName(x.topic), to: `/juego/${x.id}` })),
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
      <div className="segmented" role="tablist" aria-label="Formato" style={{ ['--i' as string]: FORMATS.findIndex((f) => f.id === format) }}>
        <span className="seg-pill" aria-hidden="true" />
        {FORMATS.map((f) => (
          <button key={f.id} role="tab" aria-selected={format === f.id} className={format === f.id ? 'on' : ''} onClick={() => setFormat(f.id)}>{f.label}</button>
        ))}
      </div>
      <section key={format} className={`card ${c.card} feature swap`}>
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
        <ul key={format + topic} className="plain list swap">
          {items.map((i) => (
            <li key={i.title}>
              <AccessRow to={i.to} icon={c.icon} tone={c.tone} title={i.title} description={i.meta} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
