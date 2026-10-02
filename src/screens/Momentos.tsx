import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { BackBar, Button, ChildContext, Icon, LinkButton, Mascota, ScreenHeader } from '../components/ui';
import { useToast } from '../components/Toast';
import { ActionFooter } from './Saldo';
import { ACTIVITIES, TOPIC_ICON, TOPIC_LABEL, TOPIC_ORDER } from '../lib/content';
import { newId, useStore } from '../lib/store';
import { friendlyDate } from '../lib/dates';
import type { Topic } from '../domain';
import type { Moment } from '../lib/store';
import { t, tn } from '../i18n';

const byRecent = (a: Moment, b: Moment) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime();
const valid = (o: Moment) => !Number.isNaN(new Date(o.recordedAt).getTime());
const thisWeek = (iso: string) => Date.now() - new Date(iso).getTime() < 7 * 86_400_000;

export default function Progreso() {
  const { state } = useStore();
  // Momento destacado: el más reciente con fecha válida; sin índice de importancia inventado.
  const featured = [...state.observations].filter(valid).sort(byRecent)[0] ?? null;
  const next = TOPIC_ORDER.find((tp) => !state.startedTopics.includes(tp));
  const rec = next ? ACTIVITIES[next] : null;
  const obsCount = state.observations.length;
  const convCount = state.conversations.length;

  return (
    <>
      <ScreenHeader title={t('progreso.titulo')} />
      <ChildContext name={state.childName} />

      {featured ? (
        <section className="card card-mint moment">
          <div className="feature-top">
            <div><div className="eyebrow">{t(thisWeek(featured.recordedAt) ? 'progreso.estaSemana' : 'progreso.loUltimo')}</div><h2 className="moment-title">{featured.title ?? t('progreso.momentoDe', { nombre: state.childName })}</h2></div>
            <Mascota size={64} />
          </div>
          <p className="body">{featured.narrative}</p>
          <div className="moment-foot">
            <span className="muted small">{t('progreso.loConto', { autor: featured.authorDisplayName })}{friendlyDate(featured.recordedAt) ? ` · ${friendlyDate(featured.recordedAt)}` : ''}</span>
            <Link to={`/momento/${featured.id}`} className="link">{t('comun.verMas')} <Icon name="arrow-left" size={16} className="flip" /></Link>
          </div>
        </section>
      ) : (
        <section className="card card-mint moment">
          <div className="feature-top">
            <h2 className="moment-title">{t('progreso.vacioTitulo')}</h2>
            <Mascota size={64} />
          </div>
          <LinkButton to="/momento/nuevo" variant="secondary" block>{t('progreso.anotar')}</LinkButton>
        </section>
      )}

      {obsCount + convCount > 0 && (
        <div className="summary">
          <span className="muted small">{tn('progreso.cosas', obsCount)} · {tn('progreso.conversaciones', convCount)}</span>
          <Link to="/avances" className="link">{t('comun.verTodo')} <Icon name="arrow-left" size={16} className="flip" /></Link>
        </div>
      )}

      <h2 className="section-title">{t('progreso.descubriendo')}</h2>
      <ul className="plain topics stagger">
        {TOPIC_ORDER.map((tp) => {
          const started = state.startedTopics.includes(tp);
          return (
            <li key={tp}>
              <Link to={`/tema/${tp}`} className={`topic ${started ? 'started' : ''}`}>
                <Icon name={TOPIC_ICON[tp]} size={18} className={tp === 'compartir' ? 'violet-ic' : ''} />
                <strong>{TOPIC_LABEL[tp]}</strong>
                <Icon name="chevron-right" size={16} className="muted chev" />
                {started && <span className="state on">{t('temas.yaEmpezaron')}</span>}
              </Link>
            </li>
          );
        })}
      </ul>

      <h2 className="section-title">{t('progreso.queHacer')}</h2>
      {rec ? (
        <>
          <p className="muted">{rec.title}</p>
          <LinkButton to={`/actividad/${rec.topic}`} block>{t('progreso.verActividad')}</LinkButton>
        </>
      ) : (
        <>
          <p className="muted">{t('progreso.todosEmpezados')}</p>
          <LinkButton to="/biblioteca" block>{t('progreso.abrirBiblioteca')}</LinkButton>
        </>
      )}
    </>
  );
}

export function MomentoDetalle() {
  const { id } = useParams();
  const { state, dispatch } = useStore();
  const nav = useNavigate();
  const toast = useToast();
  const o = state.observations.find((x) => x.id === id);
  if (!o) return <div className="task"><div className="task-scroll"><BackBar title={t('momento.titulo')} to="/progreso" /><p className="muted">{t('comun.noEncontrado')}</p></div></div>;
  const date = friendlyDate(o.recordedAt);
  const cel = state.celebrations.filter((c) => c.observationId === o.id);
  const remove = () => {
    if (!window.confirm(t('nuevoMomento.borrarConfirmar'))) return;
    const before = state;
    dispatch({ type: 'deleteObservation', id: o.id });
    toast({ message: t('nuevoMomento.borrado'), action: { label: t('comun.deshacer'), run: () => dispatch({ type: 'reset', state: before }) } });
    nav('/progreso', { replace: true });
  };
  return (
    <div className="task">
      <div className="task-scroll">
        <BackBar title={t('momento.titulo')} />
        <section className="card card-mint moment">
          <div className="eyebrow">{o.topic ? TOPIC_LABEL[o.topic].toUpperCase() : t('momento.ceja')}</div>
          <h1 className="moment-title">{o.title ?? t('progreso.momentoDe', { nombre: state.childName })}</h1>
          <p className="moment-quote">{o.narrative}</p>
          <span className="muted small">{t('progreso.loConto', { autor: o.authorDisplayName })}{date ? ` · ${date}` : ''}</span>
        </section>
        {cel.length > 0 && (<><h2 className="section-title">{t('momento.mensajitos')}</h2><ul className="plain stack-8">{cel.map((c) => <li key={c.id} className="card card-cream appear"><Icon name="party-popper" size={18} /> {c.message}</li>)}</ul></>)}
        <div className="btn-pair">
          <LinkButton to={`/momento/${o.id}/editar`} variant="tertiary"><Icon name="pencil" size={18} />{t('comun.editar')}</LinkButton>
          <Button variant="tertiary" className="danger" onClick={remove}><Icon name="trash-2" size={18} />{t('comun.borrar')}</Button>
        </div>
      </div>
      <ActionFooter>
        <LinkButton to={`/celebrar?m=${o.id}`} variant="secondary" block>{t('momento.mandarMensajito')}</LinkButton>
      </ActionFooter>
    </div>
  );
}

/** Contar algo que pasó, o editarlo con /momento/:id/editar. «¿Quién lo vio?» viene con quien acompaña. */
export function NuevoMomento() {
  const { state, dispatch } = useStore();
  const nav = useNavigate();
  const toast = useToast();
  const { id: editId } = useParams();
  const editing = editId ? state.observations.find((o) => o.id === editId) : undefined;
  const [qs] = useSearchParams();
  const preset = qs.get('tema');
  const [title, setTitle] = useState(editing?.title ?? '');
  const [text, setText] = useState(editing?.narrative ?? '');
  const [author, setAuthor] = useState(editing?.authorDisplayName ?? state.caregiver?.name ?? '');
  const [topic, setTopic] = useState<Topic | ''>(editing ? editing.topic ?? '' : preset && (TOPIC_ORDER as string[]).includes(preset) ? (preset as Topic) : '');
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const ok = text.trim().length > 0 && author.trim().length > 0;

  const save = () => {
    setTouched(true);
    if (!ok || busy) return;
    setBusy(true);
    // La primera vez, quien anota queda como quien acompaña: la próxima no lo vuelve a escribir.
    if (!state.caregiver) dispatch({ type: 'setCaregiver', caregiver: { name: author.trim() } });
    if (editing) {
      dispatch({ type: 'updateObservation', observation: { ...editing, title: title.trim() || undefined, narrative: text.trim(), authorId: author.trim(), authorDisplayName: author.trim(), topic: topic || undefined } });
      toast({ message: t('comun.cambiosGuardados') });
      nav(`/momento/${editing.id}`, { replace: true });
      return;
    }
    const id = newId('o');
    dispatch({ type: 'addObservation', observation: { id, title: title.trim() || undefined, childId: 'c1', narrative: text.trim(), authorId: author.trim(), authorDisplayName: author.trim(), recordedAt: new Date().toISOString(), topic: topic || undefined } });
    nav(`/momento/${id}`, { replace: true });
  };

  return (
    <div className="task">
      <div className="task-scroll">
        <BackBar icon="x" title={t(editing ? 'nuevoMomento.barraEditar' : 'nuevoMomento.barra')} />
        <h1 className="title">{t('nuevoMomento.pregunta', { nombre: state.childName })}</h1>
        <label htmlFor="mom-texto" className="field-label">{t('nuevoMomento.quePaso')}</label>
        <textarea id="mom-texto" className="text-field area" rows={4} maxLength={280} value={text} onChange={(e) => setText(e.target.value)} />
        {touched && !text.trim() && <p className="small error" role="alert">{t('nuevoMomento.quePasoError')}</p>}
        <label htmlFor="mom-titulo" className="field-label">{t('nuevoMomento.titulo')}</label>
        <input id="mom-titulo" className="text-field" maxLength={40} placeholder={t('nuevoMomento.tituloEjemplo')} value={title} onChange={(e) => setTitle(e.target.value)} />
        <label htmlFor="mom-autor" className="field-label">{t('nuevoMomento.quien')}</label>
        <input id="mom-autor" className="text-field" maxLength={30} placeholder={t('nuevoMomento.quienEjemplo')} value={author} onChange={(e) => setAuthor(e.target.value)} />
        {touched && !author.trim() && <p className="small error" role="alert">{t('nuevoMomento.quienError')}</p>}
        <label htmlFor="mom-tema" className="field-label">{t('nuevoMomento.tema')}</label>
        <select id="mom-tema" className="text-field" value={topic} onChange={(e) => setTopic(e.target.value as Topic | '')}>
          <option value="">{t('nuevoMomento.sinTema')}</option>
          {TOPIC_ORDER.map((tp) => <option key={tp} value={tp}>{TOPIC_LABEL[tp]}</option>)}
        </select>
      </div>
      <ActionFooter>
        <Button block loading={busy} onClick={save}>{t(editing ? 'comun.guardarCambios' : 'comun.guardar')}</Button>
      </ActionFooter>
    </div>
  );
}

const MESSAGE_KEYS = ['felicitar.frase1', 'felicitar.frase2', 'felicitar.frase3', 'felicitar.frase4'];

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
            <h1 className="title center">{t('felicitar.guardado')}</h1>
            <p className="muted center">«{message}»</p>
          </div>
        </div>
        <ActionFooter><LinkButton to={mid ? `/momento/${mid}` : '/aprender'} block>{t(mid ? 'comun.volver' : 'felicitar.volverAprender')}</LinkButton></ActionFooter>
      </div>
    );
  }
  return (
    <div className="task">
      <div className="task-scroll">
        <BackBar icon="x" title={t('felicitar.barra')} />
        <h1 className="title">{t('felicitar.titulo', { nombre: state.childName })}</h1>
        <div className="radio-list" role="radiogroup" aria-label={t('felicitar.etiqueta')}>
          {MESSAGE_KEYS.map((k) => t(k)).map((m) => (
            <button key={m} type="button" role="radio" aria-checked={sel === m} className={`reason ${sel === m ? 'on' : ''}`} onClick={() => setSel(m)}>
              <Icon name={sel === m ? 'circle-check' : 'party-popper'} size={20} />{m}
            </button>
          ))}
          <button type="button" role="radio" aria-checked={sel === 'custom'} className={`reason ${sel === 'custom' ? 'on' : ''}`} onClick={() => setSel('custom')}>
            <Icon name={sel === 'custom' ? 'circle-check' : 'ellipsis'} size={20} />{t('felicitar.escribirMio')}
          </button>
        </div>
        {sel === 'custom' && (<><label htmlFor="cel" className="field-label">{t('felicitar.tuMensajito')}</label><input id="cel" className="text-field" maxLength={100} value={custom} onChange={(e) => setCustom(e.target.value)} /></>)}
      </div>
      <ActionFooter>
        <Button block disabled={!message} onClick={save}>{t('comun.guardar')}</Button>
      </ActionFooter>
    </div>
  );
}

export function Avances() {
  const { state } = useStore();
  const obs = [...state.observations].filter(valid).sort(byRecent);
  return (
    <>
      <BackBar label={t('avances.volver')} to="/progreso" />
      <h1 className="title">{t('avances.titulo')}</h1>
      <h2 className="section-title">{t('avances.cosas')}</h2>
      {obs.length === 0 ? <p className="muted">{t('avances.cosasVacio')}</p> : (
        <ul className="plain stack-8">{obs.map((o) => (
          <li key={o.id}><Link to={`/momento/${o.id}`} className="card card-mint obs"><strong>{o.narrative}</strong><span className="muted small">{t('progreso.loConto', { autor: o.authorDisplayName })}{friendlyDate(o.recordedAt) ? ` · ${friendlyDate(o.recordedAt)}` : ''}</span></Link></li>
        ))}</ul>
      )}
      <h2 className="section-title">{t('avances.conversaciones')}</h2>
      {state.conversations.length === 0 ? <p className="muted">{t('avances.conversacionesVacio')}</p> : (
        <ul className="plain list">{state.conversations.map((c) => (
          <li key={c.id} className="row static"><span className="row-text"><strong>{c.title}</strong><span className="muted small">{friendlyDate(c.recordedAt) ?? ''}</span></span></li>
        ))}</ul>
      )}
      <h2 className="section-title">{t('avances.mensajitos')}</h2>
      {state.celebrations.length === 0 ? <p className="muted">{t('avances.mensajitosVacio')}</p> : (
        <ul className="plain stack-8">{state.celebrations.map((c) => <li key={c.id} className="card card-cream">{c.message}</li>)}</ul>
      )}
    </>
  );
}
