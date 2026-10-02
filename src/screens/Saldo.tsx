import { useEffect, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { BackBar, Button, Icon, LinkButton, Mascota } from '../components/ui';
import { SENDERS, goalUsed, reasonLabel, senderLabel, useStore, type FlowKind } from '../lib/store';
import { formatMoney, parseAmount } from '../lib/money';
import { t } from '../i18n';
import { dayName } from '../lib/dates';

/**
 * Agregar plata: Cuánto → ¿De dónde salió? → ¿Quién le envía? (+ resumen y confirmar) → ¡Listo!  (4 pasos)
 * Sacar plata:   Cuánto → ¿En qué la va a usar? (+ resumen y confirmar) → ¡Listo!            (3 pasos)
 * Motivo, meta y quién envía vienen marcados de la última vez.
 */
const BASE = { in: '/saldo', out: '/salida' } as const;
const STEPS: Record<FlowKind, string[]> = {
  in: ['flujo.pasoCuanto', 'flujo.pasoDeDonde', 'flujo.pasoQuien', 'flujo.pasoListo'],
  out: ['flujo.pasoCuanto', 'flujo.pasoEnQue', 'flujo.pasoListo'],
};
const tf = (kind: FlowKind, key: string, params?: Record<string, string | number>) => t(`flujo.${kind}.${key}`, params);

export const useKind = (): FlowKind => (useLocation().pathname.startsWith('/salida') ? 'out' : 'in');

/** Opciones en orden de aparición; el texto sale de es.json → motivos.<id>. */
export const REASONS: Record<FlowKind, { id: string; icon: string }[]> = {
  in: [
    { id: 'mesada', icon: 'calendar-days' }, { id: 'ayuda-en-casa', icon: 'house' },
    { id: 'cumpleanos', icon: 'cake' }, { id: 'propina', icon: 'hand-coins' },
    { id: 'buen-comportamiento', icon: 'star' }, { id: 'otro', icon: 'ellipsis' },
  ],
  out: [
    { id: 'compra', icon: 'shopping-cart' }, { id: 'regalo', icon: 'party-popper' },
    { id: 'compartir', icon: 'hand-heart' }, { id: 'otro', icon: 'ellipsis' },
  ],
};

function Steps({ kind, current }: { kind: FlowKind; current: number }) {
  const steps = STEPS[kind];
  return (
    <div className="steps">
      <p className="muted small" aria-live="polite">{t('flujo.paso', { actual: current, total: steps.length, etiqueta: t(steps[current - 1]) })}</p>
      <div className="seg" style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }} aria-hidden="true">{steps.map((_, i) => <i key={i} className={i < current ? 'on' : ''} />)}</div>
    </div>
  );
}

export function ActionFooter({ children, helper }: { children: React.ReactNode; helper?: string }) {
  return <footer className="action-footer">{children}{helper && <p className="muted small center">{helper}</p>}</footer>;
}

/** Valida el importe; en salidas no puede superar el saldo (ni lo guardado en la meta de origen). */
function useValidatedAmount(kind: FlowKind) {
  const { state } = useStore();
  const parsed = parseAmount(state.draft.amountInput);
  if (!parsed.ok || kind === 'in') return parsed;
  const goal = state.goals.find((g) => g.id === state.draft.goalId);
  if (parsed.money.minorUnits > state.balanceMinor) return { ok: false as const, code: 'dinero.errorNoAlcanza', error: t('dinero.errorNoAlcanza', { monto: formatMoney(state.balanceMinor) }) };
  if (goal && parsed.money.minorUnits > goal.savedMinor) return { ok: false as const, code: 'dinero.errorMetaNoAlcanza', error: t('dinero.errorMetaNoAlcanza', { meta: goal.name, monto: formatMoney(goal.savedMinor) }) };
  return parsed;
}

export const reasonValid = (r: { reason: string; detail?: string } | null) => !!r && (r.reason !== 'otro' || (r.detail ?? '').trim().length > 0);
export const senderValid = (id?: string | null, name?: string) => !!id && (id !== 'otro' || !!name?.trim());

/** Paso 1 · Cuánto */
export function SaldoImporte() {
  const kind = useKind();
  const { state, dispatch } = useStore();
  const nav = useNavigate();
  const [touched, setTouched] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => { dispatch({ type: 'startDraft', kind }); }, [kind, dispatch]);
  const parsed = useValidatedAmount(kind);
  const input = state.draft.amountInput;
  const quick = [500, 1000, 2000];
  const isQuick = (q: number) => parsed.ok && parsed.money.minorUnits === q;

  const close = () => {
    if (state.draft.active && !window.confirm(t('flujo.salirConfirmar'))) return;
    dispatch({ type: 'clearDraft' });
    nav('/');
  };
  const projected = parsed.ok ? state.balanceMinor + (kind === 'in' ? 1 : -1) * parsed.money.minorUnits : null;

  return (
    <div className="task">
      <div className="task-scroll">
        <BackBar icon="x" title={tf(kind, 'titulo')} onBack={close} />
        <Steps kind={kind} current={1} />
        <h1 className="title">{tf(kind, 'pregunta')}</h1>

        <label htmlFor="monto" className="sr-only">{t('flujo.cuanto')}</label>
        <div className={`amount-field ${touched && !parsed.ok ? 'invalid' : ''}`} onClick={() => ref.current?.focus()}>
          <span aria-hidden="true">S/</span>
          {/* Al tocar se selecciona todo: se escribe encima sin borrar a mano. */}
          <input id="monto" ref={ref} inputMode="decimal" autoComplete="off" value={input.replace(/^S\/\s*/, '')}
            aria-invalid={touched && !parsed.ok} aria-describedby={touched && !parsed.ok ? 'monto-ayuda' : undefined} onFocus={(e) => e.currentTarget.select()}
            onChange={(e) => { setTouched(true); dispatch({ type: 'draft', patch: { amountInput: e.target.value } }); }}
            onBlur={() => setTouched(true)} />
        </div>
        {touched && !parsed.ok && <p id="monto-ayuda" className="small error" role="alert">{parsed.error}</p>}

        <div className="quick">
          {quick.map((q) => (
            <button key={q} type="button" className={isQuick(q) ? 'on' : ''} aria-pressed={isQuick(q)}
              onClick={() => { setTouched(false); dispatch({ type: 'draft', patch: { amountInput: (q / 100).toFixed(2) } }); }}>
              {isQuick(q) && <Icon name="check" size={16} />}{formatMoney(q).replace('.00', '')}
            </button>
          ))}
        </div>

        {projected !== null && (
          <div className="projection"><span className="muted">{t('flujo.asiQuedaria')}</span><strong>{formatMoney(projected)}</strong></div>
        )}
      </div>
      <ActionFooter>
        <Button block disabled={!parsed.ok} onClick={() => { setTouched(true); if (parsed.ok) nav(`${BASE[kind]}/motivo`); }}>{t('comun.continuar')}</Button>
      </ActionFooter>
    </div>
  );
}

/** Metas como tarjetas a la vista (no desplegable). En salidas, solo metas con plata. */
function GoalChoice({ kind }: { kind: FlowKind }) {
  const { state, dispatch } = useStore();
  const goals = state.goals.filter((g) => (kind === 'in' ? !goalUsed(g) : g.savedMinor > 0));
  const sel = state.draft.goalId;
  const pick = (id: string | null) => dispatch({ type: 'draft', patch: { goalId: id } });
  return (
    <>
      <h2 className="section-title" id="meta">{tf(kind, 'paraMeta')}</h2>
      <div className="radio-list" role="radiogroup" aria-labelledby="meta">
        <button type="button" role="radio" aria-checked={sel === null} className={`reason wide ${sel === null ? 'on' : ''}`} onClick={() => pick(null)}>
          <Icon name={sel === null ? 'circle-check' : 'wallet'} size={20} />
          <span className="row-text"><strong>{t('flujo.ningunaMeta')}</strong></span>
        </button>
        {goals.map((g) => (
          <button key={g.id} type="button" role="radio" aria-checked={sel === g.id} className={`reason wide ${sel === g.id ? 'on' : ''}`} onClick={() => pick(g.id)}>
            <Icon name={sel === g.id ? 'circle-check' : g.icon} size={20} />
            <span className="row-text"><strong>{g.name}</strong><span className="muted small">{t('meta.deObjetivo', { guardado: formatMoney(g.savedMinor), objetivo: formatMoney(g.targetMinor) })}</span></span>
          </button>
        ))}
      </div>
    </>
  );
}

/** «Así quedaría S/ X» antes de confirmar (lo elegido ya está a la vista). */
function Projection({ kind, amountMinor }: { kind: FlowKind; amountMinor: number }) {
  const { state } = useStore();
  const after = state.balanceMinor + (kind === 'in' ? 1 : -1) * amountMinor;
  return <div className="projection"><span className="muted">{t('flujo.asiQuedaria')}</span><strong>{formatMoney(after)}</strong></div>;
}

/** Confirma una sola vez y va al paso final. */
function useConfirm(kind: FlowKind, amountMinor: number | null) {
  const { state, dispatch } = useStore();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const confirm = () => {
    if (busy || amountMinor === null || !state.draft.reason) return; // sin envíos duplicados
    setBusy(true);
    const goal = state.goals.find((g) => g.id === state.draft.goalId);
    const reached = kind === 'in' && goal && goal.savedMinor < goal.targetMinor && goal.savedMinor + amountMinor >= goal.targetMinor;
    dispatch({
      type: 'confirm', amountMinor, reason: state.draft.reason, goalId: state.draft.goalId, author: state.caregiver?.name || t('comun.tu'),
      senderId: kind === 'in' ? state.draft.senderId : null, senderName: kind === 'in' ? state.draft.senderName : '',
    });
    nav(`${BASE[kind]}/listo`, { replace: true, state: { reachedGoal: reached ? goal!.name : null, reasonId: state.draft.reason.reason } });
  };
  return { busy, confirm };
}

/** Paso 2 · ¿De dónde salió? / ¿En qué la va a usar? */
export function SaldoMotivo() {
  const kind = useKind();
  const { state, dispatch } = useStore();
  const nav = useNavigate();
  const parsed = useValidatedAmount(kind);
  const sel = state.draft.reason;
  const [detail, setDetail] = useState(sel?.reason === 'otro' ? sel.detail ?? '' : '');
  const { busy, confirm } = useConfirm(kind, parsed.ok ? parsed.money.minorUnits : null);

  useEffect(() => { if (!parsed.ok) nav(`${BASE[kind]}/importe`, { replace: true }); }, [parsed.ok, nav, kind]);
  if (!parsed.ok) return null;
  const valid = reasonValid(sel);

  return (
    <div className="task">
      <div className="task-scroll">
        <BackBar title={tf(kind, 'titulo')} />
        <Steps kind={kind} current={2} />
        <h1 className="title">{tf(kind, 'deDonde')}</h1>

        <div className="reasons" role="radiogroup" aria-label={t('flujo.escogeOpcion')}>
          {REASONS[kind].map((r) => (
            <button key={r.id} type="button" role="radio" aria-checked={sel?.reason === r.id}
              className={`reason ${sel?.reason === r.id ? 'on' : ''}`}
              onClick={() => dispatch({ type: 'draft', patch: { reason: r.id === 'otro' ? { reason: 'otro', detail } : { reason: r.id } } })}>
              <Icon name={sel?.reason === r.id ? 'circle-check' : r.icon} size={20} />{t(`motivos.${r.id}`)}
            </button>
          ))}
        </div>
        {sel?.reason === 'otro' && (
          <>
            <label htmlFor="otro" className="field-label">{t('flujo.otroCampo')}</label>
            <input id="otro" className="text-field" maxLength={60} value={detail}
              onChange={(e) => { setDetail(e.target.value); dispatch({ type: 'draft', patch: { reason: { reason: 'otro', detail: e.target.value } } }); }} />
          </>
        )}

        <GoalChoice kind={kind} />
        {kind === 'out' && valid && <Projection kind={kind} amountMinor={parsed.money.minorUnits} />}
      </div>
      {kind === 'in' ? (
        <ActionFooter>
          <Button block disabled={!valid} onClick={() => nav(`${BASE.in}/quien`)}>{t('comun.continuar')}</Button>
        </ActionFooter>
      ) : (
        <ActionFooter>
          <Button block disabled={!valid} loading={busy} onClick={confirm}>{tf(kind, 'confirmar')}</Button>
        </ActionFooter>
      )}
    </div>
  );
}

/** Paso 3 (agregar) · ¿Quién le envía? + resumen y confirmar. */
export function SaldoQuien() {
  const { state, dispatch } = useStore();
  const nav = useNavigate();
  const parsed = useValidatedAmount('in');
  const { busy, confirm } = useConfirm('in', parsed.ok ? parsed.money.minorUnits : null);
  const ready = parsed.ok && reasonValid(state.draft.reason);
  useEffect(() => { if (!ready) nav(`${BASE.in}/${parsed.ok ? 'motivo' : 'importe'}`, { replace: true }); }, [ready, parsed.ok, nav]);
  if (!ready || !parsed.ok) return null;
  const sel = state.draft.senderId;
  const valid = senderValid(sel, state.draft.senderName);

  return (
    <div className="task">
      <div className="task-scroll">
        <BackBar title={tf('in', 'titulo')} />
        <Steps kind="in" current={3} />
        <h1 className="title">{t('quien.titulo')}</h1>
        <div className="radio-list" role="radiogroup" aria-label={t('quien.titulo')}>
          {SENDERS.map((p) => (
            <button key={p.id} type="button" role="radio" aria-checked={sel === p.id} className={`reason wide ${sel === p.id ? 'on' : ''}`}
              onClick={() => dispatch({ type: 'draft', patch: { senderId: p.id, senderName: p.id === 'otro' ? state.draft.senderName : '' } })}>
              <Icon name={p.icon} size={22} />
              <span className="row-text"><strong>{t(`quien.${p.id}`)}</strong>{state.caregiver?.relation === p.id && <span className="muted small">{t('quien.admin')}</span>}</span>
              <span className={`radio-dot ${sel === p.id ? 'on' : ''}`} aria-hidden="true" />
            </button>
          ))}
        </div>
        {sel === 'otro' && (
          <>
            <label htmlFor="quien-otro" className="field-label">{t('quien.otroCampo')}</label>
            <input id="quien-otro" className="text-field" maxLength={30} placeholder={t('quien.otroEjemplo')} value={state.draft.senderName ?? ''}
              onChange={(e) => dispatch({ type: 'draft', patch: { senderName: e.target.value } })} />
          </>
        )}
        {valid && <Projection kind="in" amountMinor={parsed.money.minorUnits} />}
      </div>
      <ActionFooter>
        <Button block disabled={!valid} loading={busy} onClick={confirm}>{tf('in', 'confirmar')}</Button>
      </ActionFooter>
    </div>
  );
}

/** Rutas viejas del paso «Revisar»: el resumen ahora va junto a la confirmación. */
export function SaldoRevisar() {
  const kind = useKind();
  return <Navigate to={`${BASE[kind]}/${kind === 'in' ? 'quien' : 'motivo'}`} replace />;
}

/** Paso final · ¡Listo! */
export function SaldoListo() {
  const kind = useKind();
  const { state, dispatch } = useStore();
  const loc = useLocation().state as { reachedGoal?: string | null; reasonId?: string } | null;
  const [coin, setCoin] = useState(false);
  const [reminder, setReminder] = useState<'ask' | 'set' | 'no'>(kind === 'in' && loc?.reasonId === 'mesada' && state.propinaDay === null ? 'ask' : 'no');
  const today = new Date().getDay();
  const dia = dayName(today);

  return (
    <div className="task">
      <div className="task-scroll">
        <Steps kind={kind} current={STEPS[kind].length} />
        <div className="center-col">
          <span className="tile tile-verde big pop"><Icon name="circle-check" size={40} /></span>
          <h1 className="title center">{tf(kind, 'listo')}</h1>
          <p className="muted center">{tf(kind, 'ahora', { nombre: state.childName, monto: formatMoney(state.balanceMinor) })}</p>
          {loc?.reachedGoal && (
            <p className="alert-box ok reached-note" role="status"><Icon name="party-popper" size={20} />{t('flujo.metaAlcanzada', { meta: loc.reachedGoal })}</p>
          )}
          {kind === 'in' && (
            // Para que el niño participe: un gesto opcional, no bloquea nada.
            <div className="coin-game">
              <p className="small muted center">{t('flujo.nino', { nombre: state.childName })}</p>
              <button type="button" className={`coin-btn ${coin ? 'dropped' : ''}`} onClick={() => setCoin(true)} aria-label={t('flujo.ninoBoton')}>
                <span className="coin" aria-hidden="true">S/</span>
                <Mascota size={72} />
              </button>
              {coin && <p className="small center appear" role="status">{t('flujo.ninoListo')}</p>}
            </div>
          )}
          {reminder === 'ask' && (
            <div className="card card-cream reminder appear">
              <p><Icon name="bell" size={18} /> {t('flujo.recordarTitulo', { dia })}</p>
              <div className="btn-pair">
                <Button variant="secondary" onClick={() => { dispatch({ type: 'setPropinaDay', day: today }); setReminder('set'); }}>{t('flujo.recordarSi')}</Button>
                <Button variant="tertiary" onClick={() => setReminder('no')}>{t('flujo.recordarNo')}</Button>
              </div>
            </div>
          )}
          {reminder === 'set' && <p className="alert-box ok appear" role="status">{t('flujo.recordarListo', { dia })}</p>}
        </div>
      </div>
      <ActionFooter>
        <LinkButton to="/" block>{t('flujo.volverAlcancia')}</LinkButton>
      </ActionFooter>
    </div>
  );
}
