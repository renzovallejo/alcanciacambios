import { BackBar, Icon, IconTile } from '../components/ui';
import { useStore } from '../lib/store';
import { formatMoney, percent } from '../lib/money';
import { MovementRow } from './Home';

export function AllGoals() {
  const { state } = useStore();
  return (
    <>
      <BackBar label="Alcancía" to="/" />
      <h1 className="title">Metas de ahorro</h1>
      <ul className="plain stack-8">
        {state.goals.map((g) => {
          const pct = percent(g.savedMinor, g.targetMinor);
          return (
            <li key={g.id} className="card goal">
              <IconTile icon={g.icon} tone="azul" size={36} />
              <div className="goal-body"><strong>{g.name}</strong><span className="meta">{formatMoney(g.savedMinor)} de {formatMoney(g.targetMinor)}</span></div>
              <span className="pct">{pct}%</span>
              <div className="bar"><div style={{ width: `${pct}%` }} /></div>
            </li>
          );
        })}
      </ul>
      {state.goals.length === 0 && <p className="muted">Aún no hay metas.</p>}
    </>
  );
}

export function AllMovements() {
  const { state } = useStore();
  return (
    <>
      <BackBar label="Alcancía" to="/" />
      <h1 className="title">Movimientos</h1>
      {state.movements.length === 0
        ? <p className="muted">Aún no hay movimientos.</p>
        : <ul className="plain list">{state.movements.map((m) => <MovementRow key={m.id} m={m} />)}</ul>}
      <p className="note"><Icon name="info" size={18} /> Registro de práctica: no mueve dinero real.</p>
    </>
  );
}
