import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { BackBar, Button, ChildContext, Icon, LinkButton, Mascota, ScreenHeader } from '../components/ui';
import { ActionFooter } from './Saldo';
import { ACTIVITIES, TOPIC_ICON, TOPIC_LABEL, TOPIC_ORDER } from '../lib/content';
import { newId, useStore } from '../lib/store';
import { friendlyDate } from '../lib/dates';
import type { Topic } from '../domain';
import type { Moment } from '../lib/store';

const byRecent = (a: Moment, b: Moment) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime();
const valid = (o: Moment) => !Number.isNaN(new Date(o.recordedAt).getTime());
const thisWeek = (iso: string) => Date.now() - new Date(iso).getTime() < 7 * 86_400_000;

export default function Progreso() {
  const { state } = useStore();
  // Momento destacado: el más reciente con fecha válida; sin índice de importancia inventado.
  const featured = [...state.observations].filter(valid).sort(byRecent)[0] ?? null;
  const next = TOPIC_ORDER.find((t) => !state.startedTopics.includes(t));
  const rec = next ? ACTIVITIES[next] : null;
  const obsCount = state.observations.length;
  const convCount = state.conversations.length;

  return (
    <>
      <ScreenHeader title="Progreso" />
      <ChildContext name={state.childName} status={<span className="muted small">Sin notas ni comparar con nadie</span>} />

      {featured ? (
        <section className="card card-mint moment">
          <div className="feature-top">
            <div><div className="eyebrow">{thisWeek(featured.recordedAt) ? 'ESTA SEMANA' : 'LO ÚLTIMO QUE ANOTARON'}</div><h2 className="moment-title">{featured.title ?? `Un momento de ${state.childName}`}</h2></div>
            <Mascota size={64} />
          </div>
          <p className="body">{featured.narrative}</p>
          <div className="moment-foot">
            <span className="muted small">Lo contó {featured.authorDisplayName}{friendlyDate(featured.recordedAt) ? ` · ${friendlyDate(featured.recordedAt)}` : ''}</span>
            <Link to={`/momento/${featured.id}`} className="link">Ver más <Icon name="arrow-left" size={16} className="flip" /></Link>
          </div>
        </section>
      ) : (
        <section className="card card-mint moment">
          <div className="feature-top">
            <div><div className="eyebrow">TODAVÍA NO HAN ANOTADO NADA</div><h2 className="moment-title">Cuenten lo que vean</h2></div>
            <Mascota size={64} />
          </div>
          <p className="body">Cuando {state.childName} diga o haga algo que quieran recordar, anótenlo aquí. Sin apuro.</p>
          <LinkButton to="/momento/nuevo" variant="secondary" block>Anotar algo que pasó</LinkButton>
        </section>
      )}

      <div className="summary">
        <span className="muted small">{obsCount} {obsCount === 1 ? 'cosa anotada' : 'cosas anotadas'} · {convCount} {convCount === 1 ? 'conversación' : 'conversaciones'}</span>
        <Link to="/avances" className="link">Ver todo <Icon name="arrow-left" size={16} className="flip" /></Link>
      </div>

      <h2 className="section-title">Lo que va descubriendo</h2>
      <ul className="plain topics stagger">
        {TOPIC_ORDER.map((t) => {
          const started = state.startedTopics.includes(t);
          return (
            <li key={t}>
              <Link to={`/tema/${t}`} className={`topic ${started ? 'started' : ''}`}>
                <Icon name={TOPIC_ICON[t]} size={18} className={t === 'compartir' ? 'violet-ic' : ''} />
                <strong>{TOPIC_LABEL[t]}</strong>
                <Icon name="chevron-right" size={16} className="muted chev" />
                <span className={started ? 'state on' : 'state'}>{started ? 'Ya empezaron' : 'Todavía no empiezan'}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <h2 className="section-title">¿Qué pueden hacer ahora?</h2>
      {rec ? (
        <>
          <p className="muted">{rec.blurb}</p>
          <LinkButton to={`/actividad/${rec.topic}`} block>Ver la actividad</LinkButton>
        </>
      ) : (
        <>
          <p className="muted">Ya empezaron algo en todos los temas. Cuando quieran, escojan algo de la Biblioteca.</p>
          <LinkButton to="/biblioteca" block>Abrir Biblioteca</LinkButton>
        </>
      )}
    </>
  );
}

export function MomentoDetalle() {
  const { id } = useParams();
  const { state } = useStore();
  const o = state.observations.find((x) => x.id === id);
  if (!o) return <div className="task"><div className="task-scroll"><BackBar title="Lo que pasó" to="/progreso" /><p className="muted">No encontramos esto.</p></div></div>;
  const date = friendlyDate(o.recordedAt);
  const cel = state.celebrations.filter((c) => c.observationId === o.id);
  return (
    <div className="task">
      <div className="task-scroll">
        <BackBar title="Lo que pasó" />
        <section className="card card-mint moment">
          <div className="eyebrow">{o.topic ? TOPIC_LABEL[o.topic].toUpperCase() : 'LO QUE PASÓ'}</div>
          <h1 className="moment-title">{o.title ?? `Un momento de ${state.childName}`}</h1>
          <p className="moment-quote">{o.narrative}</p>
          <span className="muted small">Lo contó {o.authorDisplayName}{date ? ` · ${date}` : ''}</span>
        </section>
        <p className="note"><Icon name="info" size={18} />Es lo que vio alguien de la familia, no una nota.</p>
        {cel.length > 0 && (<><h2 className="section-title">Mensajitos</h2><ul className="plain stack-8">{cel.map((c) => <li key={c.id} className="card card-cream appear"><Icon name="party-popper" size={18} /> {c.message}</li>)}</ul></>)}
      </div>
      <ActionFooter helper="Es opcional.">
        <LinkButton to={`/celebrar?m=${o.id}`} variant="secondary" block>Mandarle un mensajito</LinkButton>
      </ActionFooter>
    </div>
  );
}

export function NuevoMomento() {
  const { state, dispatch } = useStore();
  const nav = useNavigate();
  const [qs] = useSearchParams();
  const preset = qs.get('tema');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');
  const [topic, setTopic] = useState<Topic | ''>(preset && (TOPIC_ORDER as string[]).includes(preset) ? (preset as Topic) : '');
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const ok = text.trim().length > 0 && author.trim().length > 0;

  const save = () => {
    setTouched(true);
    if (!ok || busy) return;
    setBusy(true);
    const id = newId('o');
    dispatch({ type: 'addObservation', observation: { id, title: title.trim() || undefined, childId: 'c1', narrative: text.trim(), authorId: author.trim(), authorDisplayName: author.trim(), recordedAt: new Date().toISOString(), topic: topic || undefined } });
    nav(`/momento/${id}`, { replace: true });
  };

  return (
    <div className="task">
      <div className="task-scroll">
        <BackBar icon="x" title="Anotar algo que pasó" />
        <h1 className="title">¿Qué dijo o hizo {state.childName}?</h1>
        <p className="muted">Cuenta lo que viste o escuchaste, con tus palabras.</p>
        <label htmlFor="mom-texto" className="field-label">¿Qué pasó?</label>
        <textarea id="mom-texto" className="text-field area" rows={4} maxLength={280} value={text} onChange={(e) => setText(e.target.value)} />
        {touched && !text.trim() && <p className="small error" role="alert">Cuéntanos qué pasó.</p>}
        <label htmlFor="mom-titulo" className="field-label">Título (opcional)</label>
        <input id="mom-titulo" className="text-field" maxLength={40} placeholder="Por ejemplo: ¡Guardó su propina!" value={title} onChange={(e) => setTitle(e.target.value)} />
        <label htmlFor="mom-autor" className="field-label">¿Quién lo vio?</label>
        <input id="mom-autor" className="text-field" maxLength={30} placeholder="Mamá, papá, la abuela, el tío…" value={author} onChange={(e) => setAuthor(e.target.value)} />
        {touched && !author.trim() && <p className="small error" role="alert">Dinos quién lo vio.</p>}
        <label htmlFor="mom-tema" className="field-label">Tema (opcional)</label>
        <select id="mom-tema" className="text-field" value={topic} onChange={(e) => setTopic(e.target.value as Topic | '')}>
          <option value="">Ninguno en especial</option>
          {TOPIC_ORDER.map((t) => <option key={t} value={t}>{TOPIC_LABEL[t]}</option>)}
        </select>
      </div>
      <ActionFooter helper="Se guarda con la fecha de hoy.">
        <Button block loading={busy} onClick={save}>Guardar</Button>
      </ActionFooter>
    </div>
  );
}

const MESSAGES = ['¡Qué orgullo, lo hiciste muy bien!', '¡Qué chévere cómo lo pensaste!', 'Gracias por contármelo.', 'Sigue así, a tu ritmo.'];

export function Celebrar() {
  const [qs] = useSearchParams();
  const { state, dispatch } = useStore();
  const [sel, setSel] = useState<string | null>(null);
  const [custom, setCustom] = useState('');
  const [done, setDone] = useState(false);
  const message = sel === 'custom' ? custom.trim() : sel ?? '';
  const mid = qs.get('m') ?? undefined;

  const save = () => {
    if (!message || done) return;
    dispatch({ type: 'addCelebration', celebration: { id: newId('k'), message, observationId: mid, recordedAt: new Date().toISOString() } });
    setDone(true);
  };

  if (done) {
    return (
      <div className="task">
        <div className="task-scroll">
          <div className="center-col">
            <span className="tile tile-naranja big pop"><Icon name="party-popper" size={40} /></span>
            <h1 className="title center">¡Mensajito guardado!</h1>
            <p className="muted center">«{message}»</p>
          </div>
        </div>
        <ActionFooter><LinkButton to={mid ? `/momento/${mid}` : '/aprender'} block>{mid ? 'Volver' : 'Volver a Aprender'}</LinkButton></ActionFooter>
      </div>
    );
  }
  return (
    <div className="task">
      <div className="task-scroll">
        <BackBar icon="x" title="Felicitar" />
        <h1 className="title">Un mensajito para {state.childName}</h1>
        <p className="muted">Escoge una frase o escribe la tuya. Lo bonito es reconocer su esfuerzo.</p>
        <div className="radio-list" role="radiogroup" aria-label="Mensaje">
          {MESSAGES.map((m) => (
            <button key={m} type="button" role="radio" aria-checked={sel === m} className={`reason ${sel === m ? 'on' : ''}`} onClick={() => setSel(m)}>
              <Icon name={sel === m ? 'circle-check' : 'party-popper'} size={20} />{m}
            </button>
          ))}
          <button type="button" role="radio" aria-checked={sel === 'custom'} className={`reason ${sel === 'custom' ? 'on' : ''}`} onClick={() => setSel('custom')}>
            <Icon name={sel === 'custom' ? 'circle-check' : 'ellipsis'} size={20} />Escribir el mío
          </button>
        </div>
        {sel === 'custom' && (<><label htmlFor="cel" className="field-label">Tu mensajito</label><input id="cel" className="text-field" maxLength={100} value={custom} onChange={(e) => setCustom(e.target.value)} /></>)}
      </div>
      <ActionFooter helper="Es solo un mensaje bonito, no una nota.">
        <Button block disabled={!message} onClick={save}>Guardar</Button>
      </ActionFooter>
    </div>
  );
}

export function Avances() {
  const { state } = useStore();
  const obs = [...state.observations].filter(valid).sort(byRecent);
  return (
    <>
      <BackBar label="Progreso" to="/progreso" />
      <h1 className="title">Todo lo anotado</h1>
      <p className="muted small">Lo que han anotado y conversado. La plata se ve en Alcancía.</p>
      <h2 className="section-title">Cosas que pasaron</h2>
      {obs.length === 0 ? <p className="muted">Todavía no hay nada.</p> : (
        <ul className="plain stack-8">{obs.map((o) => (
          <li key={o.id}><Link to={`/momento/${o.id}`} className="card card-mint obs"><strong>{o.narrative}</strong><span className="muted small">Lo contó {o.authorDisplayName}{friendlyDate(o.recordedAt) ? ` · ${friendlyDate(o.recordedAt)}` : ''}</span></Link></li>
        ))}</ul>
      )}
      <h2 className="section-title">Conversaciones</h2>
      {state.conversations.length === 0 ? <p className="muted">Todavía no han anotado conversaciones.</p> : (
        <ul className="plain list">{state.conversations.map((c) => (
          <li key={c.id} className="row static"><span className="row-text"><strong>{c.title}</strong><span className="muted small">{friendlyDate(c.recordedAt) ?? ''}</span></span></li>
        ))}</ul>
      )}
      <h2 className="section-title">Mensajitos</h2>
      {state.celebrations.length === 0 ? <p className="muted">Todavía no hay mensajitos.</p> : (
        <ul className="plain stack-8">{state.celebrations.map((c) => <li key={c.id} className="card card-cream">{c.message}</li>)}</ul>
      )}
    </>
  );
}
