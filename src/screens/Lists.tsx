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
      <h1 className="title">Sus metas</h1>
      <ul className="plain stack-8">
        {state.goals.map((g) => <li key={g.id}><GoalCard g={g} /></li>)}
      </ul>
      {state.goals.length === 0 && <p className="muted">Todavía no tiene metas.</p>}
      <LinkButton to="/meta/nueva" variant="secondary" block>Poner otra meta</LinkButton>
    </>
  );
}

export function AllMovements() {
  const { state } = useStore();
  return (
    <>
      <BackBar label="Alcancía" to="/" />
      <h1 className="title">Todo lo anotado</h1>
      {state.movements.length === 0
        ? <p className="muted">Todavía no hay nada anotado.</p>
        : <ul className="plain list">{state.movements.map((m) => <MovementRow key={m.id} m={m} />)}</ul>}
      <p className="note"><Icon name="info" size={18} /> Es solo para llevar la cuenta: la app no mueve plata de verdad.</p>
    </>
  );
}

export function MovementDetail() {
  const { id } = useParams();
  const { state } = useStore();
  const m = state.movements.find((x) => x.id === id);
  if (!m) return (<><BackBar label="Volver" to="/movimientos" /><p className="muted">No encontramos esto.</p></>);
  const out = m.kind === 'out';
  return (
    <>
      <BackBar label="Volver" to="/movimientos" />
      <h1 className="title">{m.label}</h1>
      <div className="info-box"><span>{out ? 'Salió' : 'Entró'}</span><strong>{out ? '−' : '+'}{formatMoney(Math.abs(m.amountMinor))}</strong></div>
      <dl className="summary-list">
        <div><dt>Lo anotó</dt><dd>{m.author}</dd></div>
        <div><dt>Cuándo</dt><dd>{friendlyDate(m.at) ?? 'No sabemos'}</dd></div>
        {m.reason && <div><dt>Por qué</dt><dd>{m.reason}</dd></div>}
        <div><dt>Meta</dt><dd>{m.goalName ?? 'Ninguna'}</dd></div>
      </dl>
      <p className="note"><Icon name="info" size={18} /> Es solo para llevar la cuenta: la app no mueve plata de verdad.</p>
    </>
  );
}
