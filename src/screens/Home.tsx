import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChildContext, ConnectionStatus, Icon, IconTile, LinkButton, Mascota, ScreenHeader, useCountUp } from '../components/ui';
import { useStore, type Goal, type Movement } from '../lib/store';
import { friendlyDate } from '../lib/dates';
import { formatMoney, percent } from '../lib/money';

// Último estado visto en esta sesión, para animar solo lo que cambió.
let seenBalance: number | null = null;
let seenMovement: string | null | undefined;

/** Movimientos agregados desde la última vez que se vio Alcancía en esta sesión. */
function newMovementIds(movements: Movement[]): string[] {
  if (seenMovement === undefined) return [];
  if (seenMovement === null) return movements.map((m) => m.id);
  const idx = movements.findIndex((m) => m.id === seenMovement);
  return idx === -1 ? [] : movements.slice(0, idx).map((m) => m.id);
}

export default function Home() {
  const { state } = useStore();
  const { balanceMinor, goals, movements, childName } = state;
  const firstDay = balanceMinor === 0 && goals.length === 0 && movements.length === 0;
  const shownGoals = goals.slice(0, 2); // orden estable, sin reordenar por porcentaje
  const shownMoves = movements.slice(0, 2);
  const changed = (seenBalance ?? balanceMinor) !== balanceMinor;
  const shown = useCountUp(balanceMinor, 'balance');
  const newIds = new Set(newMovementIds(movements));
  useEffect(() => () => { seenBalance = balanceMinor; seenMovement = movements[0]?.id ?? null; }, [balanceMinor, movements]);

  return (
    <>
      <ScreenHeader title="Alcancía" />
      <ChildContext name={childName} status={<ConnectionStatus />} />

      <section className={`balance ${changed ? 'changed' : ''}`} aria-label="Saldo de práctica">
        <Mascota size={64} className={changed ? 'hop' : ''} />
        <div>
          <div className="eyebrow on-dark">DINERO AHORRADO</div>
          <div className="amount" aria-hidden="true">{formatMoney(shown)}</div>
          <span className="sr-only" aria-live="polite">{formatMoney(balanceMinor)}</span>
        </div>
      </section>

      {firstDay ? (
        <LinkButton to="/saldo/importe" block>Agregar primer saldo</LinkButton>
      ) : (
        <div className="btn-pair">
          <LinkButton to="/saldo/importe">Agregar saldo</LinkButton>
          <LinkButton to="/salida/importe" variant="secondary">Registrar salida</LinkButton>
        </div>
      )}

      <div className="section-head">
        <h2>Metas de ahorro</h2>
        {goals.length > 0 && <Link to="/metas" className="link">Ver todas ({goals.length})</Link>}
      </div>
      {goals.length === 0 ? (
        <section className="card card-cream empty-goal">
          <div className="empty-goal-top">
            <IconTile icon="target" tone="naranja" size={40} />
            <h3>¿Para qué quiere ahorrar {childName}?</h3>
          </div>
          <p className="muted">Un juguete, un libro o algo que le haga ilusión. Elijan juntos su primera meta.</p>
          <LinkButton to="/meta/nueva" variant="secondary" block>Crear primera meta</LinkButton>
        </section>
      ) : (
        <ul className="stack-8 plain">
          {shownGoals.map((g) => {
            return <li key={g.id}><GoalCard g={g} /></li>;
          })}
        </ul>
      )}

      <div className="section-head">
        <h2>Últimos movimientos</h2>
        {movements.length > 0 && <Link to="/movimientos" className="link">Ver todos</Link>}
      </div>
      {movements.length === 0 ? (
        <div className="row static">
          <IconTile icon="list" tone="azul" />
          <span className="row-text">
            <strong>Aún no hay movimientos</strong>
            <span className="muted">Cuando agregues saldo o registres una salida, lo verás aquí.</span>
          </span>
        </div>
      ) : (
        <ul className="plain list">
          {shownMoves.map((m) => <MovementRow key={m.id} m={m} isNew={newIds.has(m.id)} />)}
        </ul>
      )}
    </>
  );
}

export function GoalCard({ g }: { g: Goal }) {
  const pct = percent(g.savedMinor, g.targetMinor);
  const reached = g.savedMinor >= g.targetMinor;
  return (
    <Link to={`/meta/${g.id}`} className={`card goal ${reached ? 'reached' : ''}`}>
      <IconTile icon={reached ? 'circle-check' : g.icon} tone={reached ? 'verde' : g.icon === 'puzzle' ? 'naranja' : 'azul'} size={36} />
      <div className="goal-body">
        <strong>{g.name}</strong>
        <span className="meta">{formatMoney(g.savedMinor)} de {formatMoney(g.targetMinor)}</span>
      </div>
      <span className="pct">{reached ? 'Lograda' : `${pct}%`}</span>
      <Icon name="chevron-right" size={16} className="muted" />
      <div className="bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Avance de ${g.name}: ${pct}%`}>
        <div style={{ width: `${pct}%` }} />
      </div>
    </Link>
  );
}

export function MovementRow({ m, isNew = false }: { m: Movement; isNew?: boolean }) {
  const out = m.kind === 'out';
  const when = friendlyDate(m.at);
  return (
    <li>
      <Link to={`/movimiento/${m.id}`} className={`row ${isNew ? 'is-new' : ''}`}>
        <span className={out ? "out-ic" : ""}><IconTile icon="arrow-up" tone={out ? "naranja" : "verde"} /></span>
        <span className="row-text">
          <strong>{m.label}</strong>
          <span className="muted small">{m.author}{when ? ` · ${when}` : ''}{m.reason ? ` · ${m.reason}` : ''}</span>
        </span>
        <strong className="money-in">{out ? '−' : '+'}{formatMoney(Math.abs(m.amountMinor))}</strong>
      </Link>
    </li>
  );
}
