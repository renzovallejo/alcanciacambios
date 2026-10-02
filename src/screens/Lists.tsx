import { useParams } from 'react-router-dom';
import { BackBar, Icon, LinkButton } from '../components/ui';
import { useStore } from '../lib/store';
import { formatMoney } from '../lib/money';
import { friendlyDate } from '../lib/dates';
import { GoalCard, MovementRow } from './Home';

export function AllGoals() {
  const { state } = useStore();
  return (
    <>
      <BackBar label="Alcancía" to="/" />
      <h1 className="title">Metas de ahorro</h1>
      <ul className="plain stack-8">
        {state.goals.map((g) => <li key={g.id}><GoalCard g={g} /></li>)}
      </ul>
      {state.goals.length === 0 && <p className="muted">Aún no hay metas.</p>}
      <LinkButton to="/meta/nueva" variant="secondary" block>Crear nueva meta</LinkButton>
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

export function MovementDetail() {
  const { id } = useParams();
  const { state } = useStore();
  const m = state.movements.find((x) => x.id === id);
  if (!m) return (<><BackBar label="Movimientos" to="/movimientos" /><p className="muted">No encontramos este movimiento.</p></>);
  const out = m.kind === 'out';
  return (
    <>
      <BackBar label="Movimientos" to="/movimientos" />
      <h1 className="title">{m.label}</h1>
      <div className="info-box"><span>{out ? 'Salida' : 'Ingreso'}</span><strong>{out ? '−' : '+'}{formatMoney(Math.abs(m.amountMinor))}</strong></div>
      <dl className="summary-list">
        <div><dt>Registrado por</dt><dd>{m.author}</dd></div>
        <div><dt>Fecha</dt><dd>{friendlyDate(m.at) ?? 'Sin fecha'}</dd></div>
        {m.reason && <div><dt>Motivo</dt><dd>{m.reason}</dd></div>}
        <div><dt>{out ? 'Origen' : 'Destino'}</dt><dd>{m.goalName ?? 'Sin meta'}</dd></div>
      </dl>
      <p className="note"><Icon name="info" size={18} /> Registro de práctica: no mueve dinero real.</p>
    </>
  );
}
