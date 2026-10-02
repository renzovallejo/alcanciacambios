import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { BackBar, Button, Icon, LinkButton, useSpeech } from '../components/ui';
import { ActionFooter } from './Saldo';
import { ACTIVITIES, TOPIC_LABEL, findGame, findMission, findStory } from '../lib/content';
import { newId, useStore } from '../lib/store';
import { isConnected } from '../lib/device';
import type { AudioState, Topic } from '../domain';
import { t } from '../i18n';

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const clamp = (v: number, max: number) => Math.min(Math.max(v, 0), max);

function NotFound({ to, label }: { to: string; label: string }) {
  return (<div className="task"><div className="task-scroll"><BackBar title={label} to={to} /><p className="muted">{t('comun.noEncontradoContenido')}</p></div></div>);
}

function stepLabel(topic: Topic | null, p: string | null): string | null {
  if (!topic || !p) return null;
  const act = ACTIVITIES[topic];
  return act ? t('actividad.paso', { actual: p, total: act.steps.length }) : null;
}

/** Cuento con reproductor. El audio no se entrega con el handoff: sin fuente, error recuperable y texto legible. */
export function Cuento() {
  const { id = 's-compara' } = useParams();
  const [qs] = useSearchParams();
  const { state } = useStore();
  const online = isConnected(state);
  const [onPig, setOnPig] = useState(false);
  const story = findStory(id);
  const audio = useRef<HTMLAudioElement | null>(null);
  const [audioState, setAudioState] = useState<AudioState>('idle');
  const [pos, setPos] = useState(0);
  const [dur, setDur] = useState(0);
  const [short, setShort] = useState(false);
  const [noVoice, setNoVoice] = useState(false);
  const voice = useSpeech();
  useEffect(() => () => { audio.current?.pause(); }, []);
  if (!story) return <NotFound to="/biblioteca" label={t('cuento.titulo')} />;

  const audioSource: string | null = null; // sin archivo de audio en el handoff
  const hasAudio = !!audioSource;
  const device = story.output === 'piggy-bank';
  const total = (story.minutes * 60) || 0;
  const duration = dur || total;
  const label = stepLabel(qs.get('a') as Topic | null, qs.get('p'));

  const toggle = () => {
    if (device && online) { setOnPig((x) => !x); return; } // lo reproduce el chanchito, no este celular
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
    ? t('cuento.errorChanchito')
    : t('cuento.errorAudio');

  return (
    <div className="task">
      <div className="task-scroll">
        <BackBar title={t('cuento.barra')} />
        <div className="eyebrow violet">{TOPIC_LABEL[story.topic].toUpperCase()}{label ? ` · ${label}` : ''}</div>
        <h1 className="title">{story.title}</h1>
        <section className="card card-violet story">
          <div className="eyebrow violet"><Icon name="book-open" size={18} /> {t('cuento.ceja')}</div>
          <p key={short ? 'c' : 'l'} className="swap">{short ? story.short : story.text}</p>
        </section>
        <div className="toggle-row" role="group" aria-label={t('cuento.ceja')}>
          <button type="button" className="chip" aria-pressed={!short} onClick={() => { voice.stop(); setShort(false); }}>{t('cuento.versionCompleta')}</button>
          <button type="button" className="chip" aria-pressed={short} onClick={() => { voice.stop(); setShort(true); }}>{t('cuento.versionCorta')}</button>
        </div>
        {/* Voz del celular: se dice claramente que no es el audio del chanchito. */}
        <Button variant="secondary" block onClick={() => {
          if (voice.speaking) { voice.stop(); return; }
          setNoVoice(!voice.speak(`${story.title}. ${short ? story.short : story.text}`));
        }}>
          <Icon name={voice.speaking ? 'pause' : 'volume-2'} size={20} />{t(voice.speaking ? 'cuento.detenerVoz' : 'cuento.leerVoz')}
        </Button>
        {noVoice && <p className="alert-box appear" role="alert">{t('cuento.vozNoDisponible')}</p>}

        {/* Reproductor solo para el cuento que suena en el chanchito; los demás se leen con la voz del celular. */}
        {device && <>
        <p className="muted">{t('cuento.enChanchito')}</p>
        <div className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={duration} aria-valuenow={pos} aria-label={t('cuento.posicion')}>
          <div style={{ width: duration ? `${(pos / duration) * 100}%` : 0 }} />
        </div>
        <div className="times muted small"><span>{fmt(pos)}</span><span>{fmt(duration)}</span></div>
        <div className="player">
          <button className="skip" disabled={!hasAudio} onClick={() => seek(-10)} aria-label={t('cuento.atras')}><Icon name="rotate-ccw" size={24} /><span>{t('cuento.diezSegundos')}</span></button>
          <button className="play" onClick={toggle} aria-label={t(audioState === 'playing' ? 'cuento.pausar' : 'cuento.reproducir')} aria-busy={audioState === 'loading'}>
            <Icon name={audioState === 'playing' || onPig ? 'pause' : 'play'} size={28} />
          </button>
          <button className="skip" disabled={!hasAudio} onClick={() => seek(10)} aria-label={t('cuento.adelante')}><Icon name="rotate-cw" size={24} /><span>{t('cuento.diezSegundos')}</span></button>
        </div>
        {audioState === 'error' && <p className="alert-box appear" role="alert">{errMsg}</p>}
        {onPig && <p className="alert-box ok appear" role="status">{t('cuento.sonandoChanchito')}</p>}
        </>}
      </div>
      <ActionFooter>
        <LinkButton to={`/guia/${story.id}`} block>{t('cuento.verPreguntas')}</LinkButton>
        <LinkButton to="/aprender" variant="tertiary" block>{t('cuento.otroDia')}</LinkButton>
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
  if (!story) return <NotFound to="/aprender" label={t('guia.titulo')} />;
  const save = () => {
    if (saved) return;
    dispatch({ type: 'addConversation', conversation: { id: newId('c'), title: story.title, recordedAt: new Date().toISOString() } });
    setSaved(true);
  };
  return (
    <div className="task">
      <div className="task-scroll">
        <BackBar title={t('guia.titulo')} />
        <div className="eyebrow violet">{TOPIC_LABEL[story.topic].toUpperCase()}</div>
        <h1 className="title">{story.title}</h1>
        <h2 className="section-title">{t('guia.pregunta')}</h2>
        <ul className="plain stack-8">
          {story.questions.map((q) => (<li key={q} className="card card-violet talk"><Icon name="messages-square" size={22} />{q}</li>))}
        </ul>
        <h2 className="section-title">{t('guia.consejos')}</h2>
        <ul className="bullets">
          <li>{t('guia.consejo1')}</li>
          <li>{t('guia.consejo2')}</li>
          <li>{t('guia.consejo3')}</li>
        </ul>
        {saved && <p className="alert-box ok appear" role="status">{t('guia.anotado')}</p>}
      </div>
      <ActionFooter>
        <Button block variant={saved ? 'secondary' : 'primary'} onClick={save} disabled={saved}>{t(saved ? 'guia.anotadoCorto' : 'guia.yaConversamos')}</Button>
        <LinkButton to="/aprender" variant="tertiary" block>{t('guia.volverAprender')}</LinkButton>
      </ActionFooter>
    </div>
  );
}

export function Mision() {
  const { id = '' } = useParams();
  const m = findMission(id);
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  if (!m) return <NotFound to="/biblioteca" label={t('mision.titulo')} />;
  return (
    <div className="task">
      <div className="task-scroll">
        <BackBar title={t('mision.titulo')} />
        <section className="card card-mint feature">
          <div className="eyebrow">{t('mision.ceja', { tema: TOPIC_LABEL[m.topic].toUpperCase() })}</div>
          <h1 className="feature-title">{m.title}</h1>
          <p className="body">{m.summary}</p>
        </section>
        <h2 className="section-title">{t('mision.necesitan')}</h2>
        <ul className="bullets">{m.materials.map((x) => <li key={x}>{x}</li>)}</ul>
        <h2 className="section-title">{t('mision.comoSeHace')}</h2>
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
      <ActionFooter>
        <LinkButton to={`/momento/nuevo?tema=${m.topic}`} block>{t('mision.anotar')}</LinkButton>
        <LinkButton to="/biblioteca" variant="tertiary" block>{t('mision.volverBiblioteca')}</LinkButton>
      </ActionFooter>
    </div>
  );
}

export function Juego() {
  const { id = '' } = useParams();
  const g = findGame(id);
  const { dispatch } = useStore();
  const [saved, setSaved] = useState(false);
  if (!g) return <NotFound to="/biblioteca" label={t('juego.titulo')} />;
  const save = () => {
    if (saved) return;
    dispatch({ type: 'addConversation', conversation: { id: newId('c'), title: g.title, recordedAt: new Date().toISOString() } });
    setSaved(true);
  };
  return (
    <div className="task">
      <div className="task-scroll">
        <BackBar title={t('juego.titulo')} />
        <section className="card card-cream feature">
          <div className="eyebrow">{t('juego.ceja', { jugadores: g.players.toUpperCase() })}</div>
          <h1 className="feature-title">{g.title}</h1>
          <p className="body">{g.scenario}</p>
        </section>
        <h2 className="section-title">{t('juego.roles')}</h2>
        <ul className="bullets">{g.roles.map((x) => <li key={x}>{x}</li>)}</ul>
        <h2 className="section-title">{t('juego.despues')}</h2>
        <ul className="plain stack-8">{g.questions.map((q) => (<li key={q} className="card card-cream talk"><Icon name="messages-square" size={22} />{q}</li>))}</ul>
        {saved && <p className="alert-box ok appear" role="status">{t('guia.anotadoCorto')}</p>}
      </div>
      <ActionFooter>
        <Button block onClick={save} disabled={saved}>{t(saved ? 'guia.anotadoCorto' : 'guia.yaConversamos')}</Button>
        <LinkButton to="/biblioteca" variant="tertiary" block>{t('mision.volverBiblioteca')}</LinkButton>
      </ActionFooter>
    </div>
  );
}

