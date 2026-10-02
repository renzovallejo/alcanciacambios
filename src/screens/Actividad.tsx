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
        <h2 className="section-title">Lo que van a hacer</h2>
        <p className="muted small">En el orden que quieran. Si no terminan hoy, siguen otro día.</p>
        <ol className="plain list steps-list">
          {act.steps.map((s, i) => (
            <li key={s.id}>
              <Link to={stepPath(s, topic, i + 1)} className="row">
                <span className={`step-num ${started && i === cur ? 'on' : ''} ${started && i < cur ? 'past' : ''}`}>{started && i < cur ? <Icon name="check" size={14} /> : i + 1}</span>
                <span className="row-text"><strong>{s.title}</strong>{started && i === cur && <span className="muted small">Toca ahora</span>}</span>
                <Icon name="chevron-right" size={18} className="muted" />
              </Link>
            </li>
          ))}
        </ol>
        {started && cur < act.steps.length - 1 && (
          <Button variant="secondary" block onClick={() => dispatch({ type: 'advanceStep', topic, total: act.steps.length })}>Ya hicimos este paso</Button>
        )}
        {started && cur === act.steps.length - 1 && (
          <p className="alert-box ok">¡Ya están en el último paso! Pueden repetir lo que quieran o <Link to="/progreso" className="inline-link">ver otro tema</Link> cuando quieran.</p>
        )}
        {!started && <p className="note"><Icon name="info" size={18} />Mirar esto no la empieza. Empiecen cuando quieran.</p>}
      </div>
      <ActionFooter helper={started ? 'Pueden seguir otro día.' : 'La pueden dejar cuando quieran.'}>
        {started
          ? <LinkButton to={stepPath(act.steps[cur], topic, cur + 1)} block>Seguir con la actividad</LinkButton>
          : <Button block onClick={start}>Empezar</Button>}
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
      <div className="tema-head"><IconTile icon={TOPIC_ICON[topic]} tone="azul" size={48} /><div><h1 className="title">{TOPIC_LABEL[topic]}</h1><span className={`state ${started ? 'on' : ''}`}>{started ? 'Ya empezaron' : 'Todavía no empiezan'}</span></div></div>
      <h2 className="section-title">Lo que han anotado</h2>
      {obs.length === 0 ? (
        <p className="muted">Todavía no han anotado nada de este tema. Es opcional.</p>
      ) : (
        <ul className="plain stack-8">
          {obs.map((o) => (
            <li key={o.id}>
              <Link to={`/momento/${o.id}`} className="card card-mint obs">
                <strong>{o.narrative}</strong>
                <span className="muted small">Lo contó {o.authorDisplayName}{friendlyDate(o.recordedAt) ? ` · ${friendlyDate(o.recordedAt)}` : ''}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <LinkButton to={`/momento/nuevo?tema=${topic}`} variant="secondary" block>Anotar algo que pasó</LinkButton>
      <h2 className="section-title">Actividad</h2>
      <div className="card card-violet feature">
        <h3 className="feature-title">{act.title}</h3>
        <p className="body">{act.blurb}</p>
        <LinkButton to={`/actividad/${topic}`} block>{started ? 'Seguir con la actividad' : 'Ver la actividad'}</LinkButton>
      </div>
    </>
  );
}
