import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { BackBar, Button, Icon, LinkButton } from '../components/ui';
import { ActionFooter } from './Saldo';
import { ACTIVITIES, TOPIC_LABEL, findGame, findMission, findStory } from '../lib/content';
import { newId, useStore } from '../lib/store';
import type { AudioState, Topic } from '../domain';

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const clamp = (v: number, max: number) => Math.min(Math.max(v, 0), max);

function NotFound({ to, label }: { to: string; label: string }) {
  return (<div className="task"><div className="task-scroll"><BackBar title={label} to={to} /><p className="muted">No encontramos esto. Puede que ya no esté.</p></div></div>);
}

function stepLabel(topic: Topic | null, p: string | null): string | null {
  if (!topic || !p) return null;
  const act = ACTIVITIES[topic];
  return act ? `PASO ${p} DE ${act.steps.length}` : null;
}

/** Cuento con reproductor. El audio no se entrega con el handoff: sin fuente, error recuperable y texto legible. */
export function Cuento() {
  const { id = 's-compara' } = useParams();
  const [qs] = useSearchParams();
  const { state } = useStore();
  const story = findStory(id);
  const audio = useRef<HTMLAudioElement | null>(null);
  const [audioState, setAudioState] = useState<AudioState>('idle');
  const [pos, setPos] = useState(0);
  const [dur, setDur] = useState(0);
  useEffect(() => () => { audio.current?.pause(); }, []);
  if (!story) return <NotFound to="/biblioteca" label="Cuento" />;

  const audioSource: string | null = null; // sin archivo de audio en el handoff
  const hasAudio = !!audioSource;
  const device = story.output === 'piggy-bank';
  const total = (story.minutes * 60) || 0;
  const duration = dur || total;
  const label = stepLabel(qs.get('a') as Topic | null, qs.get('p'));

  const toggle = () => {
    if (device) { setAudioState('error'); return; } // el chanchito no está conectado
    if (!audioSource) { setAudioState('error'); return; }
    if (!audio.current) {
      const a = new Audio(audioSource);
      a.onloadedmetadata = () => setDur(a.duration);
      a.ontimeupdate = () => setPos(a.currentTime);
      a.onended = () => setAudioState('ended');
      a.onerror = () => setAudioState('error');
      audio.current = a;
    }
    const a = audio.current;
    if (audioState === 'playing') { a.pause(); setAudioState('paused'); } else { setAudioState('loading'); a.play().then(() => setAudioState('playing')).catch(() => setAudioState('error')); }
  };
  const seek = (d: number) => { const a = audio.current; if (!a) return; a.currentTime = clamp(a.currentTime + d, duration); setPos(a.currentTime); };
  const errMsg = device
    ? 'El chanchito no está conectado, así que no se puede escuchar ahí. Pero pueden leer el cuento juntos.'
    : 'El audio todavía no está listo. Pero pueden leer el cuento juntos.';

  return (
    <div className="task">
      <div className="task-scroll">
        <BackBar title="Aprender juntos" />
        <div className="eyebrow violet">{TOPIC_LABEL[story.topic].toUpperCase()}{label ? ` · ${label}` : ''}</div>
        <h1 className="title">{story.title}</h1>
        <p className="muted">Un cuento para escuchar juntos.</p>
        <section className="card card-violet story">
          <div className="eyebrow violet"><Icon name="book-open" size={18} /> EL CUENTO</div>
          <p>{story.text}</p>
        </section>

        <p className="muted">{device ? 'Escuchar en el chanchito' : 'Escuchar en este celular'}</p>
        <div className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={duration} aria-valuenow={pos} aria-label="Posición del audio">
          <div style={{ width: duration ? `${(pos / duration) * 100}%` : 0 }} />
        </div>
        <div className="times muted small"><span>{fmt(pos)}</span><span>{fmt(duration)}</span></div>
        <div className="player">
          <button className="skip" disabled={!hasAudio} onClick={() => seek(-10)} aria-label="Retroceder 10 segundos"><Icon name="rotate-ccw" size={24} /><span>10 s</span></button>
          <button className="play" onClick={toggle} aria-label={audioState === 'playing' ? 'Pausar' : 'Reproducir'} aria-busy={audioState === 'loading'}>
            <Icon name={audioState === 'playing' ? 'pause' : 'play'} size={28} />
          </button>
          <button className="skip" disabled={!hasAudio} onClick={() => seek(10)} aria-label="Adelantar 10 segundos"><Icon name="rotate-cw" size={24} /><span>10 s</span></button>
        </div>
        {audioState === 'error' && <p className="alert-box appear" role="alert">{errMsg}</p>}
        <p className="talk"><Icon name="messages-square" size={22} />Después, conversen: {story.questions[0].charAt(0).toLowerCase() + story.questions[0].slice(1)}</p>
      </div>
      <ActionFooter>
        <LinkButton to={`/guia/${story.id}`} block>Ver preguntas para conversar</LinkButton>
        <LinkButton to="/aprender" variant="tertiary" block>Seguir otro día</LinkButton>
      </ActionFooter>
      <span className="sr-only">{state.childName}</span>
    </div>
  );
}

/** Guía y preguntas: abrirla no completa la actividad ni infiere aprendizaje. */
export function Guia() {
  const { id = '' } = useParams();
  const story = findStory(id);
  const { dispatch } = useStore();
  const [saved, setSaved] = useState(false);
  if (!story) return <NotFound to="/aprender" label="Guía" />;
  const save = () => {
    if (saved) return;
    dispatch({ type: 'addConversation', conversation: { id: newId('c'), title: story.title, recordedAt: new Date().toISOString() } });
    setSaved(true);
  };
  return (
    <div className="task">
      <div className="task-scroll">
        <BackBar title="Para conversar" />
        <div className="eyebrow violet">{TOPIC_LABEL[story.topic].toUpperCase()}</div>
        <h1 className="title">{story.title}</h1>
        <h2 className="section-title">Pregúntale</h2>
        <ul className="plain stack-8">
          {story.questions.map((q) => (<li key={q} className="card card-violet talk"><Icon name="messages-square" size={22} />{q}</li>))}
        </ul>
        <h2 className="section-title">Unos consejos para ti</h2>
        <ul className="bullets">
          <li>Escucha primero. Aquí no hay respuestas buenas ni malas.</li>
          <li>Pregunta «¿y por qué?» con curiosidad, sin corregir.</li>
          <li>Si no es el momento, lo dejan para otro día. No pasa nada.</li>
        </ul>
        {saved && <p className="alert-box ok appear" role="status">¡Anotado! Gracias por darte el tiempo.</p>}
      </div>
      <ActionFooter helper="Anotarlo es opcional. No es una nota para nadie.">
        <Button block variant={saved ? 'secondary' : 'primary'} onClick={save} disabled={saved}>{saved ? '¡Anotado!' : 'Ya lo conversamos'}</Button>
        <LinkButton to="/aprender" variant="tertiary" block>Volver a Aprender</LinkButton>
      </ActionFooter>
    </div>
  );
}

export function Mision() {
  const { id = '' } = useParams();
  const m = findMission(id);
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  if (!m) return <NotFound to="/biblioteca" label="Misión" />;
  return (
    <div className="task">
      <div className="task-scroll">
        <BackBar title="Misión" />
        <section className="card card-mint feature">
          <div className="eyebrow">PARA HACER EN CASA · {TOPIC_LABEL[m.topic].toUpperCase()}</div>
          <h1 className="feature-title">{m.title}</h1>
          <p className="body">{m.summary}</p>
        </section>
        <h2 className="section-title">Van a necesitar</h2>
        <ul className="bullets">{m.materials.map((x) => <li key={x}>{x}</li>)}</ul>
        <h2 className="section-title">Cómo se hace</h2>
        <p className="muted small">Marquen lo que van haciendo. No es tarea.</p>
        <ul className="plain list">
          {m.steps.map((st, i) => (
            <li key={st}>
              <label className="check-row">
                <input type="checkbox" className="check" checked={!!checked[i]} onChange={() => setChecked({ ...checked, [i]: !checked[i] })} />
                <span>{st}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
      <ActionFooter helper="Si quieren, anoten cómo les fue.">
        <LinkButton to={`/momento/nuevo?tema=${m.topic}`} block>Anotar cómo les fue</LinkButton>
        <LinkButton to="/biblioteca" variant="tertiary" block>Volver a Biblioteca</LinkButton>
      </ActionFooter>
    </div>
  );
}

export function Juego() {
  const { id = '' } = useParams();
  const g = findGame(id);
  const { dispatch } = useStore();
  const [saved, setSaved] = useState(false);
  if (!g) return <NotFound to="/biblioteca" label="Juego" />;
  const save = () => {
    if (saved) return;
    dispatch({ type: 'addConversation', conversation: { id: newId('c'), title: g.title, recordedAt: new Date().toISOString() } });
    setSaved(true);
  };
  return (
    <div className="task">
      <div className="task-scroll">
        <BackBar title="Juego" />
        <section className="card card-cream feature">
          <div className="eyebrow">IMAGINEN Y CONVERSEN · {g.players.toUpperCase()}</div>
          <h1 className="feature-title">{g.title}</h1>
          <p className="body">{g.scenario}</p>
        </section>
        <h2 className="section-title">Quién hace qué</h2>
        <ul className="bullets">{g.roles.map((x) => <li key={x}>{x}</li>)}</ul>
        <h2 className="section-title">Para conversar después</h2>
        <ul className="plain stack-8">{g.questions.map((q) => (<li key={q} className="card card-cream talk"><Icon name="messages-square" size={22} />{q}</li>))}</ul>
        {saved && <p className="alert-box ok appear" role="status">¡Anotado!</p>}
      </div>
      <ActionFooter helper="Anotarlo es opcional. No es una nota para nadie.">
        <Button block onClick={save} disabled={saved}>{saved ? '¡Anotado!' : 'Ya lo conversamos'}</Button>
        <LinkButton to="/biblioteca" variant="tertiary" block>Volver a Biblioteca</LinkButton>
      </ActionFooter>
    </div>
  );
}

