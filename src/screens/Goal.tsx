import { useNavigate, useParams } from 'react-router-dom';
import { BackBar, Button, Icon, IconTile } from '../components/ui';
import { useStore } from '../lib/store';
import { formatMoney, percent } from '../lib/money';
import { MovementRow } from './Home';

/** Detalle de meta: avance = acumulado / objetivo; la barra nunca va sola. */
export default function GoalDetail() {
  const { id } = useParams();
  const { state, dispatch } = useStore();
  const nav = useNavigate();
  const g = state.goals.find((x) => x.id === id);
  if (!g) return (<><BackBar label="Metas" to="/metas" /><h1 className="title">Meta no encontrada</h1><p className="muted">Puede que se haya restablecido la información.</p></>);
  const pct = percent(g.savedMinor, g.targetMinor);
  const reached = g.savedMinor >= g.targetMinor;
  const missing = Math.max(0, g.targetMinor - g.savedMinor);
  const moves = state.movements.filter((m) => m.goalId === g.id);

  const add = () => {
    dispatch({ type: 'startDraft', kind: 'in' });
    dispatch({ type: 'draft', patch: { goalId: g.id } });
    nav('/saldo/importe');
  };

  return (
    <>
      <BackBar label="Metas" to="/metas" />
      <div className="tema-head"><IconTile icon={reached ? 'circle-check' : g.icon} tone={reached ? 'verde' : 'azul'} size={48} /><h1 className="title">{g.name}</h1></div>
      <section className={`card goal-hero ${reached ? 'card-mint' : ''}`}>
        <div className="goal-hero-top">
          <span className="amount-sm">{formatMoney(g.savedMinor)}</span>
          <span className="muted">de {formatMoney(g.targetMinor)}</span>
        </div>
        <div className="bar big" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Avance: ${pct}%`}><div style={{ width: `${pct}%` }} /></div>
        <p className="body">
          {reached
            ? <><Icon name="party-popper" size={18} /> ¡Llegaron a la meta! Conversen juntos qué hacer ahora.</>
            : <>{pct}% · Faltan {formatMoney(missing)}</>}
        </p>
      </section>
      {!reached && <Button block onClick={add}>Agregar a esta meta</Button>}
      <h2 className="section-title">Movimientos de esta meta</h2>
      {moves.length === 0
        ? <p className="muted">Aún no hay movimientos asociados a esta meta.</p>
        : <ul className="plain list">{moves.map((m) => <MovementRow key={m.id} m={m} />)}</ul>}
      <p className="note"><Icon name="info" size={18} />Registro de práctica: no mueve dinero real.</p>
    </>
  );
}
