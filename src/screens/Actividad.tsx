import { Link, useNavigate, useParams } from 'react-router-dom';
import { BackBar, Button, Icon, IconTile, LinkButton, Mascota } from '../components/ui';
import { ActionFooter } from './Saldo';
import { ACTIVITIES, TOPIC_ICON, TOPIC_LABEL, TOPIC_ORDER, stepPath } from '../lib/content';
import { useStore } from '../lib/store';
import { friendlyDate } from '../lib/dates';
import type { Topic } from '../domain';

const isTopic = (t: string | undefined): t is Topic => !!t && (TOPIC_ORDER as string[]).includes(t);

/** Detalle de actividad: abrirlo NO la inicia. El inicio es una acción explícita y confirmada. */
export function Actividad() {
  const { topic } = useParams();
  const nav = useNavigate();
  const { state, dispatch } = useStore();
  if (!isTopic(topic)) return <div className="task"><div className="task-scroll"><BackBar title="Actividad" /><p className="muted">No encontramos esta actividad.</p></div></div>;
  const act = ACTIVITIES[topic];
  const started = state.startedTopics.includes(topic);
  const cur = Math.min(state.activityStep[topic] ?? 0, act.steps.length - 1);

  const start = () => { dispatch({ type: 'startActivity', topic }); nav(stepPath(act.steps[0], topic, 1)); };

  return (
    <div className="task">
      <div className="task-scroll">
        <BackBar title="Actividad" />
        <section className="card card-violet feature">
          <div className="eyebrow violet">{started ? 'EN CURSO' : 'PARA EMPEZAR'} · {TOPIC_LABEL[topic].toUpperCase()}</div>
          <div className="feature-top"><h1 className="feature-title">{act.title}</h1><Mascota size={64} /></div>
          <p className="body">{act.blurb}</p>
        </section>
        <h2 className="section-title">Qué pueden hacer</h2>
        <p className="muted small">Pueden hacerlo en el orden que quieran y dejarlo para otro día.</p>
        <ol className="plain list steps-list">
          {act.steps.map((s, i) => (
            <li key={s.id}>
              <Link to={stepPath(s, topic, i + 1)} className="row">
                <span className={`step-num ${started && i === cur ? 'on' : ''}`}>{i + 1}</span>
                <span className="row-text"><strong>{s.title}</strong>{started && i === cur && <span className="muted small">Paso actual</span>}</span>
                <Icon name="chevron-right" size={18} className="muted" />
              </Link>
            </li>
          ))}
        </ol>
        {started && cur < act.steps.length - 1 && (
          <Button variant="secondary" block onClick={() => dispatch({ type: 'advanceStep', topic, total: act.steps.length })}>Pasar al siguiente paso</Button>
        )}
        {!started && <p className="note"><Icon name="info" size={18} />Mirar la actividad no la inicia. Empieza cuando tú lo decidas.</p>}
      </div>
      <ActionFooter helper={started ? 'Puedes seguir otro día.' : 'Podrás dejarla cuando quieras.'}>
        {started
          ? <LinkButton to={stepPath(act.steps[cur], topic, cur + 1)} block>Continuar actividad</LinkButton>
          : <Button block onClick={start}>Empezar actividad</Button>}
      </ActionFooter>
    </div>
  );
}

/** Tema: observaciones y actividad de ese tema; sin porcentajes ni notas. */
export function Tema() {
  const { topic } = useParams();
  const { state } = useStore();
  if (!isTopic(topic)) return <div className="task"><div className="task-scroll"><BackBar title="Tema" /><p className="muted">No encontramos este tema.</p></div></div>;
  const act = ACTIVITIES[topic];
  const started = state.startedTopics.includes(topic);
  const obs = state.observations.filter((o) => o.topic === topic);
  return (
    <>
      <BackBar label="Progreso" to="/progreso" />
      <div className="tema-head"><IconTile icon={TOPIC_ICON[topic]} tone="azul" size={48} /><div><h1 className="title">{TOPIC_LABEL[topic]}</h1><span className={`state ${started ? 'on' : ''}`}>{started ? 'Actividad iniciada' : 'Por explorar'}</span></div></div>
      <h2 className="section-title">Momentos observados</h2>
      {obs.length === 0 ? (
        <p className="muted">Aún no hay momentos registrados en este tema. Registrar uno es opcional.</p>
      ) : (
        <ul className="plain stack-8">
          {obs.map((o) => (
            <li key={o.id}>
              <Link to={`/momento/${o.id}`} className="card card-mint obs">
                <strong>{o.narrative}</strong>
                <span className="muted small">Observado por {o.authorDisplayName}{friendlyDate(o.recordedAt) ? ` · ${friendlyDate(o.recordedAt)}` : ''}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <LinkButton to="/momento/nuevo" variant="secondary" block>Registrar un momento</LinkButton>
      <h2 className="section-title">Actividad</h2>
      <div className="card card-violet feature">
        <h3 className="feature-title">{act.title}</h3>
        <p className="body">{act.blurb}</p>
        <LinkButton to={`/actividad/${topic}`} block>{started ? 'Continuar actividad' : 'Explorar actividad'}</LinkButton>
      </div>
    </>
  );
}
