import { useState } from 'react';
import { BackBar, ChildContext, ConnectionStatus, AccessRow, Icon, LinkButton, Mascota, ScreenHeader } from '../components/ui';
import { useStore } from '../lib/store';
import { ACTIVITIES, GAMES, MISSIONS, STEP_ICON, STORIES, TOPIC_LABEL, TOPIC_ORDER, nextActivity, type StepRef } from '../lib/content';
import { IdeaCard } from './Home';
import { t } from '../i18n';
import type { Topic } from '../domain';

export function Aprender() {
  const { state } = useStore();
  const topic = state.activeTopic;
  // Sin actividad en curso: se propone la siguiente que no hayan terminado (sin puntaje).
  const suggested = nextActivity(state.finishedTopics) ?? ACTIVITIES.ahorrar;
  const act = topic ? ACTIVITIES[topic] : suggested;
  const lastDone = state.finishedTopics[state.finishedTopics.length - 1];
  const stepIdx = topic ? Math.min(state.activityStep[topic] ?? 0, act.steps.length - 1) : 0;
  const step: StepRef = act.steps[stepIdx];
  const tema = TOPIC_LABEL[act.topic].toUpperCase();
  const biblioteca = <li><AccessRow to="/biblioteca" icon="library" tone="azul" title={t('aprender.biblioteca')} /></li>;
  return (
    <>
      <ScreenHeader title={t('aprender.titulo')} />
      <ChildContext name={state.childName} status={<ConnectionStatus />} />
      {!topic && lastDone && (
        <p className="alert-box ok">{nextActivity(state.finishedTopics) ? t('aprender.terminaron', { actividad: ACTIVITIES[lastDone].title }) : t('aprender.todasTerminadas')}</p>
      )}
      <section className="card card-violet feature">
        <div className="eyebrow violet">{t(topic ? 'aprender.enCurso' : 'aprender.paraEmpezar', { tema })}</div>
        <div className="feature-top">
          <h2 className="feature-title">{act.title}</h2>
          <Mascota size={64} />
        </div>
        {topic && (
          <div className="now"><Icon name={STEP_ICON[step.kind]} size={20} /><span>{t('aprender.ahora', { paso: step.title.charAt(0).toLowerCase() + step.title.slice(1) })}</span></div>
        )}
        <LinkButton to={`/actividad/${act.topic}`} block>{t(topic ? 'aprender.seguir' : 'aprender.verDeQue')}</LinkButton>
      </section>

      <IdeaCard />

      <h2 className="section-title">{t(topic ? 'aprender.otrasCosas' : 'aprender.otrasFormas')}</h2>
      <ul className="plain list">
        {!topic && biblioteca}
        <li><AccessRow to="/momento/nuevo" icon="sparkles" tone="violeta" title={t('aprender.anotar')} /></li>
        <li><AccessRow to="/celebrar" icon="party-popper" tone="naranja" title={t('aprender.felicitar', { nombre: state.childName })} /></li>
        {topic && biblioteca}
      </ul>
    </>
  );
}

type Format = 'cuentos' | 'misiones' | 'juegos';
const FORMATS: Format[] = ['cuentos', 'misiones', 'juegos'];
type TopicFilter = 'todos' | Topic;

// Todo el contenido, salvo el destacado de arriba.
const LIB_STORIES = STORIES.map((x) => x.id).filter((id) => id !== 's-chanchito');
const LIB_MISSIONS = MISSIONS.map((x) => x.id).filter((id) => id !== 'm-meta-familia');
const LIB_GAMES = GAMES.map((x) => x.id).filter((id) => id !== 'g-tienda');

interface Shelf {
  tone: 'violeta' | 'verde' | 'naranja'; card: string; eyebrow: string; title: string; cta: string; icon: string; to: string;
  items: { id: string; title: string; meta: string; topic: Topic; to: string }[];
}

/** Se arma al renderizar para leer siempre los textos actuales del catálogo. */
function shelf(format: Format): Shelf {
  if (format === 'cuentos') return {
    tone: 'violeta', card: 'card-violet', eyebrow: t('biblioteca.cejaCuento'),
    title: STORIES.find((x) => x.id === 's-chanchito')!.title, cta: t('biblioteca.ctaCuento'), icon: 'book-open', to: '/cuento/s-chanchito',
    items: LIB_STORIES.map((id) => STORIES.find((x) => x.id === id)!).map((x) => ({ id: x.id, title: x.title, topic: x.topic, to: `/cuento/${x.id}`, meta: t('biblioteca.minutos', { tema: TOPIC_LABEL[x.topic], minutos: x.minutes }) })),
  };
  if (format === 'misiones') return {
    tone: 'verde', card: 'card-mint', eyebrow: t('biblioteca.cejaMision'),
    title: MISSIONS.find((x) => x.id === 'm-meta-familia')!.title, cta: t('biblioteca.ctaMision'), icon: 'flag', to: '/mision/m-meta-familia',
    items: LIB_MISSIONS.map((id) => MISSIONS.find((x) => x.id === id)!).map((x) => ({ id: x.id, title: x.title, topic: x.topic, to: `/mision/${x.id}`, meta: t('biblioteca.minutos', { tema: TOPIC_LABEL[x.topic], minutos: x.minutes }) })),
  };
  return {
    tone: 'naranja', card: 'card-cream', eyebrow: t('biblioteca.cejaJuego'),
    title: GAMES.find((x) => x.id === 'g-tienda')!.title, cta: t('biblioteca.ctaJuego'), icon: 'messages-square', to: '/juego/g-tienda',
    items: LIB_GAMES.map((id) => GAMES.find((x) => x.id === id)!).map((x) => ({ id: x.id, title: x.title, topic: x.topic, to: `/juego/${x.id}`, meta: t('biblioteca.jugadores', { tema: TOPIC_LABEL[x.topic], jugadores: x.players }) })),
  };
}

export function Biblioteca() {
  const [format, setFormat] = useState<Format>('cuentos');
  const [topic, setTopic] = useState<TopicFilter>('todos'); // el tema se conserva al cambiar de formato
  const c = shelf(format);
  const items = c.items.filter((i) => topic === 'todos' || i.topic === topic);
  return (
    <>
      <BackBar label={t('biblioteca.volver')} to="/aprender" />
      <h1 className="title">{t('biblioteca.titulo')}</h1>
      <div className="segmented" role="tablist" aria-label={t('biblioteca.formato')} style={{ ['--i' as string]: FORMATS.indexOf(format) }}>
        <span className="seg-pill" aria-hidden="true" />
        {FORMATS.map((f) => (
          <button key={f} role="tab" aria-selected={format === f} className={format === f ? 'on' : ''} onClick={() => setFormat(f)}>{t(`biblioteca.${f}`)}</button>
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
        <h2>{t('biblioteca.masParaVer')}</h2>
        <label className="select-link">
          <span className="sr-only">{t('biblioteca.filtrar')}</span>
          <select value={topic} onChange={(e) => setTopic(e.target.value as TopicFilter)}>
            <option value="todos">{t('temas.todos')}</option>
            {TOPIC_ORDER.map((tp) => <option key={tp} value={tp}>{TOPIC_LABEL[tp]}</option>)}
          </select>
          <Icon name="chevron-down" size={18} />
        </label>
      </div>
      {items.length === 0 ? <p className="muted">{t('biblioteca.vacio', { formato: t(`biblioteca.${format}`).toLowerCase() })}</p> : (
        <ul key={format + topic} className="plain list swap">
          {items.map((i) => (
            <li key={i.id}>
              <AccessRow to={i.to} icon={c.icon} tone={c.tone} title={i.title} description={i.meta} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
