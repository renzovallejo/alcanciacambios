import { Link } from 'react-router-dom';
import { ChildContext, ConnectionStatus, Icon, IconTile, LinkButton, Mascota, ScreenHeader } from '../components/ui';
import { useStore } from '../lib/store';
import { formatMoney, percent } from '../lib/money';

export default function Home() {
  const { state } = useStore();
  const { balanceMinor, goals, movements, childName } = state;
  const firstDay = balanceMinor === 0 && goals.length === 0 && movements.length === 0;
  const shownGoals = goals.slice(0, 2); // orden estable, sin reordenar por porcentaje
  const shownMoves = movements.slice(0, 2);

  return (
    <>
      <ScreenHeader title="Alcancía" />
      <ChildContext name={childName} status={<ConnectionStatus text={firstDay ? 'Conectada' : 'Conectada · hace 2 min'} />} />

      <section className="balance" aria-label="Saldo de práctica">
        <Mascota size={64} />
        <div>
          <div className="eyebrow on-dark">DINERO AHORRADO</div>
          <div className="amount">{formatMoney(balanceMinor)}</div>
        </div>
      </section>

      {firstDay ? (
        <LinkButton to="/saldo/importe" block>Agregar primer saldo</LinkButton>
      ) : (
        <div className="btn-pair">
          <LinkButton to="/saldo/importe">Agregar saldo</LinkButton>
          <LinkButton to="/saldo/importe" variant="secondary">Registrar salida</LinkButton>
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
            const pct = percent(g.savedMinor, g.targetMinor);
            return (
              <li key={g.id}>
                <Link to="/metas" className="card goal">
                  <IconTile icon={g.icon} tone={g.icon === 'puzzle' ? 'naranja' : 'azul'} size={36} />
                  <div className="goal-body">
                    <strong>{g.name}</strong>
                    <span className="meta">{formatMoney(g.savedMinor)} de {formatMoney(g.targetMinor)}</span>
                  </div>
                  <span className="pct">{pct}%</span>
                  <Icon name="chevron-right" size={16} className="muted" />
                  <div className="bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Avance de ${g.name}`}>
                    <div style={{ width: `${pct}%` }} />
                  </div>
                </Link>
              </li>
            );
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
          {shownMoves.map((m) => <MovementRow key={m.id} m={m} />)}
        </ul>
      )}
    </>
  );
}

export function MovementRow({ m }: { m: { label: string; author: string; whenLabel: string; amountMinor: number; reason?: string } }) {
  const sign = m.amountMinor >= 0 ? '+' : '−';
  return (
    <li className="row static">
      <IconTile icon="arrow-up" tone="verde" />
      <span className="row-text">
        <strong>{m.label}</strong>
        <span className="muted small">{m.author} · {m.whenLabel}{m.reason ? ` · ${m.reason}` : ''}</span>
      </span>
      <strong className="money-in">{sign}{formatMoney(Math.abs(m.amountMinor))}</strong>
    </li>
  );
}
