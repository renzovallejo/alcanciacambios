import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChildContext, ConnectionStatus, Icon, IconTile, LinkButton, Mascota, ScreenHeader, useCountUp } from '../components/ui';
import { useStore, type Goal, type Movement } from '../lib/store';
import { friendlyDate } from '../lib/dates';
import { t } from '../i18n';
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
      <ScreenHeader title={t('nav.alcancia')} />
      <ChildContext name={childName} status={<ConnectionStatus />} />

      <section className={`balance ${changed ? 'changed' : ''}`} aria-label={t('alcancia.etiquetaSaldo', { nombre: childName })}>
        <Mascota size={64} className={changed ? 'hop' : ''} />
        <div>
          <div className="eyebrow on-dark">{t('alcancia.llevaAhorrado')}</div>
          <div className="amount" aria-hidden="true">{formatMoney(shown)}</div>
          <span className="sr-only" aria-live="polite">{formatMoney(balanceMinor)}</span>
          <div className="balance-sub">{t('alcancia.segunAnotado')}</div>
        </div>
      </section>

      {firstDay ? (
        <LinkButton to="/saldo/importe" block>{t('alcancia.primeraPlata')}</LinkButton>
      ) : (
        <div className="btn-pair">
          <LinkButton to="/saldo/importe">{t('alcancia.agregarPlata')}</LinkButton>
          <LinkButton to="/salida/importe" variant="secondary">{t('alcancia.sacarPlata')}</LinkButton>
        </div>
      )}

      <div className="section-head">
        <h2>{t('alcancia.susMetas')}</h2>
        {goals.length > 0 && <Link to="/metas" className="link">{t('comun.verTodas', { count: goals.length })}</Link>}
      </div>
      {goals.length === 0 ? (
        <section className="card card-cream empty-goal">
          <div className="empty-goal-top">
            <IconTile icon="target" tone="naranja" size={40} />
            <h3>{t('alcancia.metaVaciaTitulo', { nombre: childName })}</h3>
          </div>
          <p className="muted">{t('alcancia.metaVaciaTexto')}</p>
          <LinkButton to="/meta/nueva" variant="secondary" block>{t('alcancia.metaVaciaBoton')}</LinkButton>
        </section>
      ) : (
        <ul className="stack-8 plain">
          {shownGoals.map((g) => {
            return <li key={g.id}><GoalCard g={g} /></li>;
          })}
        </ul>
      )}

      <div className="section-head">
        <h2>{t('alcancia.loUltimo')}</h2>
        {movements.length > 0 && <Link to="/movimientos" className="link">{t('comun.verTodos')}</Link>}
      </div>
      {movements.length === 0 ? (
        <div className="row static">
          <IconTile icon="list" tone="azul" />
          <span className="row-text">
            <strong>{t('alcancia.vacioTitulo')}</strong>
            <span className="muted">{t('alcancia.vacioTexto')}</span>
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
        <span className="meta">{t('meta.deObjetivo', { guardado: formatMoney(g.savedMinor), objetivo: formatMoney(g.targetMinor) })}</span>
      </div>
      <span className="pct">{reached ? t('meta.logrado') : `${pct}%`}</span>
      <Icon name="chevron-right" size={16} className="muted" />
      <div className="bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={t('meta.avance', { meta: g.name, porcentaje: pct })}>
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
          <strong>{t(`movimientos.${m.kind}`)}</strong>
          <span className="muted small">{m.author}{when ? ` · ${when}` : ''}{m.reason ? ` · ${m.reason}` : ''}</span>
        </span>
        <strong className="money-in">{out ? '−' : '+'}{formatMoney(Math.abs(m.amountMinor))}</strong>
      </Link>
    </li>
  );
}
