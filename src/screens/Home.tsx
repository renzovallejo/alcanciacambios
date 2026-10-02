import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, ChildContext, ConnectionStatus, Icon, IconTile, LinkButton, Mascota, ScreenHeader, useCountUp } from '../components/ui';
import { goalAchieved, goalUsed, movementReason, senderLabel, newId, useStore, type Goal, type Movement } from '../lib/store';
import { dayName, friendlyDate, inLastWeek } from '../lib/dates';
import { ideaOfDay } from '../lib/content';
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
  const { state, dispatch } = useStore();
  const nav = useNavigate();
  const [hops, setHops] = useState(0);
  const { balanceMinor, goals, movements, childName, draft } = state;
  const firstDay = balanceMinor === 0 && goals.length === 0 && movements.length === 0;
  // Metas en camino primero; las ya usadas no ocupan lugar en la portada.
  const shownGoals = goals.filter((g) => !goalUsed(g)).slice(0, 2); // orden estable, sin reordenar por porcentaje
  const weekIn = movements.filter((m) => m.kind === 'in' && inLastWeek(m.at)).reduce((a, m) => a + m.amountMinor, 0);
  const today = new Date().getDay();
  const propinaToday = state.propinaDay === today && !movements.some((m) => m.reasonId === 'mesada' && friendlyDate(m.at) === friendlyDate(new Date().toISOString()));
  const draftMoney = draft.active ? Number.parseFloat(draft.amountInput) : NaN;

  const resume = () => nav(draft.kind === 'in' ? '/saldo/importe' : '/salida/importe');
  const guardarPropina = () => {
    dispatch({ type: 'clearDraft' });
    dispatch({ type: 'startDraft', kind: 'in' });
    dispatch({ type: 'draft', patch: { reason: { reason: 'mesada' } } });
    nav('/saldo/importe');
  };
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
        {/* Tocar el chanchito lo hace saltar (cada toque reinicia el salto). */}
        <button type="button" className="mascota-btn" aria-label={t('alcancia.saltar')} onClick={() => setHops((n) => n + 1)}>
          <Mascota key={hops} size={64} className={hops > 0 ? 'hop now' : changed ? 'hop' : ''} />
        </button>
        <div>
          <div className="eyebrow on-dark">{t('alcancia.llevaAhorrado')}</div>
          <div className="amount" aria-hidden="true">{formatMoney(shown)}</div>
          <span className="sr-only" aria-live="polite">{formatMoney(balanceMinor)}</span>
          {weekIn > 0 && <div className="week-line">{t('alcancia.estaSemana', { monto: formatMoney(weekIn) })}</div>}
        </div>
      </section>

      {draft.active && Number.isFinite(draftMoney) && draftMoney > 0 ? (
        <div className="banner">
          <Icon name="pause" size={20} />
          <span>{t('alcancia.borrador', { monto: formatMoney(Math.round(draftMoney * 100)) })}</span>
          <Button variant="tertiary" onClick={() => dispatch({ type: 'clearDraft' })}>{t('alcancia.borradorDescartar')}</Button>
          <Button variant="secondary" onClick={resume}>{t('alcancia.borradorSeguir')}</Button>
        </div>
      ) : propinaToday && (
        <div className="banner">
          <Icon name="bell" size={20} />
          <span>{t('alcancia.recordatorio', { dia: dayName(today) })}</span>
          <Button variant="secondary" onClick={guardarPropina}>{t('alcancia.recordatorioBoton')}</Button>
        </div>
      )}

      {firstDay ? (
        <>
          <p className="value-line">{t('alcancia.valorPrimerDia', { nombre: childName })}</p>
          <LinkButton to="/saldo/importe" block>{t('alcancia.primeraPlata')}</LinkButton>
        </>
      ) : (
        <>
          <div className="btn-pair">
            <LinkButton to="/saldo/importe">{t('alcancia.agregarPlata')}</LinkButton>
            {balanceMinor > 0 && <LinkButton to="/salida/importe" variant="secondary">{t('alcancia.sacarPlata')}</LinkButton>}
          </div>
        </>
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

      {!firstDay && <IdeaCard />}
    </>
  );
}

/** Idea de 1 minuto: algo para hacer hoy sin preparar nada. «Ya lo hicimos» la cuenta como conversación. */
export function IdeaCard() {
  const { dispatch } = useStore();
  const idea = ideaOfDay();
  const [done, setDone] = useState(false);
  return (
    <section className="card card-violet idea">
      <div className="eyebrow violet"><Icon name="lightbulb" size={16} /> {t('idea.ceja')}</div>
      <p>{idea.text}</p>
      {done
        ? <p className="alert-box ok appear" role="status">{t('idea.anotado')}</p>
        : <Button variant="secondary" onClick={() => { dispatch({ type: 'addConversation', conversation: { id: newId('c'), title: idea.text, recordedAt: new Date().toISOString() } }); setDone(true); }}>{t('idea.hecho')}</Button>}
    </section>
  );
}

export function GoalCard({ g }: { g: Goal }) {
  const pct = percent(g.savedMinor, g.targetMinor);
  const reached = goalAchieved(g);
  return (
    <Link to={`/meta/${g.id}`} className={`card goal ${reached ? 'reached' : ''}`}>
      <IconTile icon={reached ? 'circle-check' : g.icon} tone={reached ? 'verde' : g.icon === 'puzzle' ? 'naranja' : 'azul'} size={36} />
      <div className="goal-body">
        <strong>{g.name}</strong>
        <span className="meta">{t('meta.deObjetivo', { guardado: formatMoney(g.savedMinor), objetivo: formatMoney(g.targetMinor) })}</span>
      </div>
      <span className="pct">{goalUsed(g) ? t('meta.usada') : reached ? t('meta.logrado') : `${pct}%`}</span>
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
  // En entradas importa de quién vino la plata; en salidas, en qué se usó.
  const who = out ? m.author : senderLabel(m.senderId, m.senderName) || m.author;
  const reason = movementReason(m);
  return (
    <li>
      <Link to={`/movimiento/${m.id}`} className={`row ${isNew ? 'is-new' : ''}`}>
        <span className={out ? "out-ic" : ""}><IconTile icon="arrow-up" tone={out ? "naranja" : "verde"} /></span>
        <span className="row-text">
          <strong>{t(`movimientos.${m.kind}`)}</strong>
          <span className="muted small">{who}{when ? ` · ${when}` : ''}{reason ? ` · ${reason}` : ''}</span>
        </span>
        <strong className="money-in">{out ? '−' : '+'}{formatMoney(Math.abs(m.amountMinor))}</strong>
      </Link>
    </li>
  );
}
