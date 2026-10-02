import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BackBar, Button, Icon, LinkButton } from '../components/ui';
import { reasonLabel, useStore, type FlowKind } from '../lib/store';
import { formatMoney, parseAmount } from '../lib/money';
import { t } from '../i18n';

/** Textos y rutas por tipo de flujo; los textos viven en es.json → flujo.in / flujo.out. */
const BASE = { in: '/saldo', out: '/salida' } as const;
const tf = (kind: FlowKind, key: string, params?: Record<string, string | number>) => t(`flujo.${kind}.${key}`, params);

export const useKind = (): FlowKind => (useLocation().pathname.startsWith('/salida') ? 'out' : 'in');

/** Opciones en orden de aparición; el texto sale de es.json → motivos.<id>. */
const REASONS: Record<FlowKind, { id: string; icon: string }[]> = {
  in: [
    { id: 'mesada', icon: 'calendar-days' }, { id: 'ayuda-en-casa', icon: 'house' },
    { id: 'cumpleanos', icon: 'cake' }, { id: 'propina', icon: 'circle-check' },
    { id: 'buen-comportamiento', icon: 'star' }, { id: 'otro', icon: 'ellipsis' },
  ],
  out: [
    { id: 'compra', icon: 'shopping-cart' }, { id: 'regalo', icon: 'party-popper' },
    { id: 'compartir', icon: 'hand-heart' }, { id: 'otro', icon: 'ellipsis' },
  ],
};

function Steps({ current, label }: { current: number; label: string }) {
  return (
    <div className="steps">
      <p className="muted small" aria-live="polite">{t('flujo.paso', { actual: current, total: 4, etiqueta: label })}</p>
      <div className="seg" aria-hidden="true">{[1, 2, 3, 4].map((n) => <i key={n} className={n <= current ? 'on' : ''} />)}</div>
    </div>
  );
}

export function ActionFooter({ children, helper }: { children: React.ReactNode; helper?: string }) {
  return <footer className="action-footer">{children}{helper && <p className="muted small center">{helper}</p>}</footer>;
}

/** Valida el importe; en salidas no puede superar el saldo (ni el de la meta de origen). */
function useValidatedAmount(kind: FlowKind) {
  const { state } = useStore();
  const parsed = parseAmount(state.draft.amountInput);
  if (!parsed.ok || kind === 'in') return parsed;
  const goal = state.goals.find((g) => g.id === state.draft.goalId);
  if (parsed.money.minorUnits > state.balanceMinor) return { ok: false as const, error: t('dinero.errorNoAlcanza', { monto: formatMoney(state.balanceMinor) }) };
  if (goal && parsed.money.minorUnits > goal.savedMinor) return { ok: false as const, error: t('dinero.errorMetaNoAlcanza', { meta: goal.name, monto: formatMoney(goal.savedMinor) }) };
  return parsed;
}

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
    const dirty = state.draft.reason !== null;
    if (dirty && !window.confirm(t('flujo.salirConfirmar'))) return;
    dispatch({ type: 'clearDraft' });
    nav('/');
  };

  const projected = parsed.ok ? state.balanceMinor + (kind === 'in' ? 1 : -1) * parsed.money.minorUnits : null;

  return (
    <div className="task">
      <div className="task-scroll">
        <BackBar icon="x" title={tf(kind, 'titulo')} onBack={close} />
        <Steps current={1} label={t('flujo.pasoCuanto')} />
        <h1 className="title">{tf(kind, 'pregunta')}</h1>
        <p className="muted">{tf(kind, 'sub', { nombre: state.childName })}</p>
        <div className="info-box"><span>{t('flujo.ahoraTieneAhorrado')}</span><strong>{formatMoney(state.balanceMinor)}</strong></div>

        <label htmlFor="monto" className="field-label">{t('flujo.cuanto')}</label>
        <div className={`amount-field ${touched && !parsed.ok ? 'invalid' : ''}`} onClick={() => ref.current?.focus()}>
          <span aria-hidden="true">S/</span>
          <input id="monto" ref={ref} inputMode="decimal" autoComplete="off" value={input.replace(/^S\/\s*/, '')}
            aria-invalid={touched && !parsed.ok} aria-describedby="monto-ayuda"
            onChange={(e) => { setTouched(true); dispatch({ type: 'draft', patch: { amountInput: e.target.value } }); }}
            onBlur={() => setTouched(true)} />
        </div>
        <p id="monto-ayuda" className={`small ${touched && !parsed.ok ? 'error' : 'muted'}`} role={touched && !parsed.ok ? 'alert' : undefined}>
          {touched && !parsed.ok ? parsed.error : t('flujo.tocaMonto')}
        </p>

        <p className="muted">{t('flujo.rapido')}</p>
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
        <p className="note"><Icon name="info" size={20} />{t('comun.soloCuentaLargo')}</p>
      </div>
      <ActionFooter helper={t('flujo.pieCuanto')}>
        <Button block disabled={!parsed.ok} onClick={() => { setTouched(true); if (parsed.ok) nav(`${BASE[kind]}/motivo`); }}>{t('comun.continuar')}</Button>
      </ActionFooter>
    </div>
  );
}

export function SaldoMotivo() {
  const kind = useKind();
  const { state, dispatch } = useStore();
  const nav = useNavigate();
  const parsed = useValidatedAmount(kind);
  const sel = state.draft.reason;
  const [detail, setDetail] = useState(sel?.reason === 'otro' ? sel.detail ?? '' : '');
  const [open, setOpen] = useState(false);

  useEffect(() => { if (!parsed.ok) nav(`${BASE[kind]}/importe`, { replace: true }); }, [parsed.ok, nav, kind]);
  if (!parsed.ok) return null;

  const goal = state.goals.find((g) => g.id === state.draft.goalId);
  const valid = !!sel && (sel.reason !== 'otro' || (sel.detail ?? '').trim().length > 0);
  const options = REASONS[kind];

  return (
    <div className="task">
      <div className="task-scroll">
        <BackBar title={tf(kind, 'titulo')} />
        <Steps current={2} label={t('flujo.pasoDeDonde')} />
        <h1 className="title">{tf(kind, 'deDonde')}</h1>
        <p className="muted">{tf(kind, 'resumen', { monto: formatMoney(parsed.money), nombre: state.childName })}</p>

        <h2 className="section-title" id="motivo">{t('flujo.escogeOpcion')}</h2>
        <div className="reasons" role="radiogroup" aria-labelledby="motivo">
          {options.map((r) => (
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

        <h2 className="section-title">{tf(kind, 'paraMeta')}</h2>
        <button type="button" className="card select-card" aria-expanded={open} onClick={() => setOpen(!open)}>
          <Icon name="wallet" size={24} />
          <span className="row-text">
            <strong>{goal ? goal.name : t('flujo.ningunaMeta')}</strong>
            <span className="muted small">{tf(kind, goal ? 'conMeta' : 'sinMeta')}</span>
          </span>
          <Icon name="chevron-down" size={20} />
        </button>
        {open && (
          <ul className="plain list options">
            <li><button type="button" className="opt" onClick={() => { dispatch({ type: 'draft', patch: { goalId: null } }); setOpen(false); }}>{t('flujo.ningunaMeta')}</button></li>
            {state.goals.map((g) => (
              <li key={g.id}><button type="button" className="opt" onClick={() => { dispatch({ type: 'draft', patch: { goalId: g.id } }); setOpen(false); }}>{g.name}</button></li>
            ))}
          </ul>
        )}
        <p className="muted small">{t('flujo.seGuardaJunto')}</p>
      </div>
      <ActionFooter helper={t('flujo.pieDeDonde')}>
        <Button block disabled={!valid} onClick={() => nav(`${BASE[kind]}/revisar`)}>{t('comun.continuar')}</Button>
      </ActionFooter>
    </div>
  );
}

/** Paso 3: no está diseñado en las referencias; se compone con los mismos maestros. */
export function SaldoRevisar() {
  const kind = useKind();
  const { state, dispatch } = useStore();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const parsed = useValidatedAmount(kind);
  const reason = state.draft.reason;
  useEffect(() => { if (!parsed.ok || !reason) nav(`${BASE[kind]}/importe`, { replace: true }); }, [parsed.ok, reason, nav, kind]);
  if (!parsed.ok || !reason) return null;
  const goal = state.goals.find((g) => g.id === state.draft.goalId);
  const after = state.balanceMinor + (kind === 'in' ? 1 : -1) * parsed.money.minorUnits;

  const confirm = () => {
    if (busy) return; // sin envíos duplicados
    setBusy(true);
    dispatch({ type: 'confirm', amountMinor: parsed.money.minorUnits, reason, goalId: state.draft.goalId, author: t('comun.tu') });
    const reached = kind === 'in' && goal && goal.savedMinor < goal.targetMinor && goal.savedMinor + parsed.money.minorUnits >= goal.targetMinor;
    nav(`${BASE[kind]}/listo`, { replace: true, state: { reachedGoal: reached ? goal.name : null } });
  };

  return (
    <div className="task">
      <div className="task-scroll">
        <BackBar title={tf(kind, 'titulo')} />
        <Steps current={3} label={t('flujo.pasoRevisar')} />
        <h1 className="title">{t('flujo.todoBien')}</h1>
        <dl className="summary-list">
          <div><dt>{t('flujo.revisarCuanto')}</dt><dd>{formatMoney(parsed.money)}</dd></div>
          <div><dt>{t('flujo.revisarPorQue')}</dt><dd>{reasonLabel(reason)}</dd></div>
          <div><dt>{t('flujo.revisarMeta')}</dt><dd>{goal ? goal.name : t('comun.ninguna')}</dd></div>
          <div><dt>{t('flujo.revisarAhoraTiene')}</dt><dd>{formatMoney(state.balanceMinor)}</dd></div>
          <div className="total"><dt>{t('flujo.asiQuedaria')}</dt><dd>{formatMoney(after)}</dd></div>
        </dl>
        <p className="note"><Icon name="info" size={20} />{t('comun.soloCuenta')}</p>
      </div>
      <ActionFooter helper={t('flujo.pieRevisar')}>
        <Button block loading={busy} onClick={confirm}>{t('flujo.confirmar')}</Button>
      </ActionFooter>
    </div>
  );
}

/** Paso 4: confirmación tras guardar. */
export function SaldoListo() {
  const kind = useKind();
  const { state } = useStore();
  const reachedGoal = (useLocation().state as { reachedGoal?: string | null } | null)?.reachedGoal;
  return (
    <div className="task">
      <div className="task-scroll">
        <Steps current={4} label={t('flujo.pasoListo')} />
        <div className="center-col">
          <span className="tile tile-verde big pop"><Icon name="circle-check" size={40} /></span>
          <h1 className="title center">{t('flujo.listo')}</h1>
          <p className="muted center">{tf(kind, 'ahora', { nombre: state.childName, monto: formatMoney(state.balanceMinor) })}</p>
          {reachedGoal && (
            <p className="alert-box ok reached-note" role="status"><Icon name="party-popper" size={20} />{t('flujo.metaAlcanzada', { meta: reachedGoal })}</p>
          )}
        </div>
      </div>
      <ActionFooter helper={t('flujo.pieListo')}>
        <LinkButton to="/" block>{t('flujo.volverAlcancia')}</LinkButton>
      </ActionFooter>
    </div>
  );
}

