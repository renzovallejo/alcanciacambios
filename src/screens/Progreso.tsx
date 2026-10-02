import { Link } from 'react-router-dom';
import { ChildContext, Icon, LinkButton, Mascota, ScreenHeader } from '../components/ui';
import { useStore } from '../lib/store';

const TOPICS = [
  { name: 'Ahorrar', icon: 'wallet', started: true },
  { name: 'Gastar bien', icon: 'shopping-cart', started: false },
  { name: 'Compartir', icon: 'hand-heart', started: false },
  { name: 'Ganar', icon: 'briefcase-business', started: false },
];

export default function Progreso() {
  const { state } = useStore();
  return (
    <>
      <ScreenHeader title="Progreso" />
      <ChildContext name={state.childName} status={<span className="muted small">Sin notas ni comparaciones</span>} />

      <section className="card card-mint moment">
        <div className="feature-top">
          <div>
            <div className="eyebrow">ESTA SEMANA</div>
            <h2 className="moment-title">Un pequeño gran paso</h2>
          </div>
          <Mascota size={64} />
        </div>
        <p className="body">{state.childName} decidió guardar sus monedas para el libro que quiere.</p>
        <div className="moment-foot">
          <span className="muted small">Observado por Mamá · 1 oct</span>
          <Link to="/aprender" className="link">Ver momento <Icon name="arrow-left" size={16} className="flip" /></Link>
        </div>
      </section>

      <div className="summary">
        <span className="muted small">1 momento · 1 conversación</span>
        <Link to="/aprender" className="link">Ver avances <Icon name="arrow-left" size={16} className="flip" /></Link>
      </div>

      <h2 className="section-title">Lo que va descubriendo</h2>
      <ul className="plain topics">
        {TOPICS.map((t) => (
          <li key={t.name}>
            <Link to="/aprender" className={`topic ${t.started ? 'started' : ''}`}>
              <Icon name={t.icon} size={18} className={t.name === 'Compartir' ? 'violet-ic' : ''} />
              <strong>{t.name}</strong>
              <Icon name="chevron-right" size={16} className="muted chev" />
              <span className={t.started ? 'state on' : 'state'}>{t.started ? 'Actividad iniciada' : 'Por explorar'}</span>
            </Link>
          </li>
        ))}
      </ul>

      <h2 className="section-title">¿Qué pueden descubrir ahora?</h2>
      <p className="muted">Conversen cómo acercarse a esa primera meta.</p>
      <LinkButton to="/aprender" block>Explorar actividad</LinkButton>
    </>
  );
}
