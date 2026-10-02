import { useEffect, useRef, useState } from 'react';
import { BackBar, Icon, LinkButton } from '../components/ui';
import type { AudioState, Story } from '../domain';

// El archivo de audio (8:37) no se entrega con el handoff: sin fuente, el reproductor muestra un error recuperable.
const story: Story = {
  id: 's1', topic: 'gastar-bien', title: 'Compara precios antes de comprar', audioSource: null, durationSeconds: 517,
  text: 'Sofía quería un cuaderno. En la primera tienda costaba mucho; pero como buena detective, buscó en dos más… ¡y encontró el mismo cuaderno más barato! Con lo que ahorró, le alcanzó para un lápiz. ¡Caso cerrado!',
};

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const clamp = (v: number, max: number) => Math.min(Math.max(v, 0), max);

export default function Cuento() {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<AudioState>('idle');
  const [pos, setPos] = useState(0);
  const [dur, setDur] = useState(story.durationSeconds ?? 0);

  useEffect(() => () => { audio.current?.pause(); }, []);

  const toggle = () => {
    if (!story.audioSource) { setState('error'); return; } // sin autoplay; sin fuente = error recuperable
    if (!audio.current) {
      const a = new Audio(story.audioSource);
      a.onloadedmetadata = () => setDur(a.duration);
      a.ontimeupdate = () => setPos(a.currentTime);
      a.onended = () => setState('ended');
      a.onerror = () => setState('error');
      audio.current = a;
    }
    const a = audio.current;
    if (state === 'playing') { a.pause(); setState('paused'); } else { setState('loading'); a.play().then(() => setState('playing')).catch(() => setState('error')); }
  };
  const seek = (delta: number) => {
    const a = audio.current;
    if (!a) return;
    a.currentTime = clamp(a.currentTime + delta, dur);
    setPos(a.currentTime);
  };
  const hasAudio = !!story.audioSource;

  return (
    <div className="task">
      <div className="task-scroll">
        <BackBar title="Aprender juntos" />
        <div className="eyebrow violet">GASTAR BIEN · PASO 1 DE 5</div>
        <h1 className="title">{story.title}</h1>
        <p className="muted">Un cuento para escuchar juntos.</p>
        <section className="card card-violet story">
          <div className="eyebrow violet"><Icon name="book-open" size={18} /> EL CUENTO</div>
          <p>{story.text}</p>
        </section>

        <p className="muted">Escuchar en este celular</p>
        <div className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={dur} aria-valuenow={pos} aria-label="Posición del audio">
          <div style={{ width: dur ? `${(pos / dur) * 100}%` : 0 }} />
        </div>
        <div className="times muted small"><span>{fmt(pos)}</span><span>{fmt(dur)}</span></div>
        <div className="player">
          <button className="skip" disabled={!hasAudio} onClick={() => seek(-10)} aria-label="Retroceder 10 segundos"><Icon name="rotate-ccw" size={24} /><span>10 s</span></button>
          <button className="play" onClick={toggle} aria-label={state === 'playing' ? 'Pausar' : 'Reproducir'} aria-busy={state === 'loading'}>
            <Icon name={state === 'playing' ? 'x' : 'play'} size={28} />
          </button>
          <button className="skip" disabled={!hasAudio} onClick={() => seek(10)} aria-label="Adelantar 10 segundos"><Icon name="rotate-cw" size={24} /><span>10 s</span></button>
        </div>
        {state === 'error' && (
          <p className="alert-box" role="alert">El audio aún no está disponible. Puedes leer el cuento juntos.</p>
        )}
        <p className="talk"><Icon name="messages-square" size={22} />Después, conversen: ¿qué hizo Sofía antes de elegir?</p>
      </div>
      <footer className="action-footer">
        <LinkButton to="/progreso" block>Ver guía y preguntas</LinkButton>
        <LinkButton to="/aprender" variant="tertiary" block>Seguir otro día</LinkButton>
      </footer>
    </div>
  );
}
