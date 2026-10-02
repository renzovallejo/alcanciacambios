import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BackBar, Button, Icon, LinkButton } from '../components/ui';
import { reasonLabel, useStore, type FlowKind } from '../lib/store';
import { formatMoney, parseAmount } from '../lib/money';

const COPY = {
  in: { base: '/saldo', title: 'Agregar plata', ask: '¿Cuánto va a guardar?', sub: (n: string) => `Lo que ${n} va a meter a su chanchito.`, field: 'Cuánto', after: 'Así quedaría',
    reasonTitle: '¿De dónde salió esta plata?', reasonCta: (m: string, n: string) => `${n} va a guardar ${m}.`, pick: 'Escoge una opción', dest: '¿Es para alguna meta?',
    destNone: 'Se suma a lo que ya tiene ahorrado.', destGoal: 'Se suma a esta meta y a lo que ya tiene ahorrado.', done: '¡Listo, ya está anotado!', confirm: 'Sí, anotar', author: 'Tú',
    now: (n: string) => `Ahora ${n} lleva ahorrado` },
  out: { base: '/salida', title: 'Sacar plata', ask: '¿Cuánto va a sacar?', sub: (n: string) => `Lo que ${n} va a sacar de su chanchito.`, field: 'Cuánto', after: 'Así quedaría',
    reasonTitle: '¿En qué la va a usar?', reasonCta: (m: string, n: string) => `${n} va a sacar ${m}.`, pick: 'Escoge una opción', dest: '¿Sale de alguna meta?',
    destNone: 'No sale de ninguna meta.', destGoal: 'Se descuenta de esta meta.', done: '¡Listo, ya está anotado!', confirm: 'Sí, anotar', author: 'Tú',
    now: (n: string) => `Ahora ${n} tiene` },
} as const;

export const useKind = (): FlowKind => (useLocation().pathname.startsWith('/salida') ? 'out' : 'in');

const REASONS: Record<FlowKind, { id: string; label: string; icon: string }[]> = {
  in: [
    { id: 'mesada', label: 'Su propina de la semana', icon: 'calendar-days' }, { id: 'ayuda-en-casa', label: 'Ayudó en casa', icon: 'house' },
    { id: 'cumpleanos', label: 'Por su cumple', icon: 'cake' }, { id: 'propina', label: 'Le dieron propina', icon: 'circle-check' },
    { id: 'buen-comportamiento', label: 'Se portó bien', icon: 'star' }, { id: 'otro', label: 'Otra cosa', icon: 'ellipsis' },
  ],
  out: [
    { id: 'compra', label: 'Se compró algo', icon: 'shopping-cart' }, { id: 'regalo', label: 'Hizo un regalo', icon: 'party-popper' },
    { id: 'compartir', label: 'Lo compartió', icon: 'hand-heart' }, { id: 'otro', label: 'Otra cosa', icon: 'ellipsis' },
  ],
};

function Steps({ current, label }: { current: number; label: string }) {
  return (
    <div className="steps">
      <p className="muted small" aria-live="polite">Paso {current} de 4 · {label}</p>
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
  if (parsed.money.minorUnits > state.balanceMinor) return { ok: false as const, error: `No le alcanza: ahora tiene ${formatMoney(state.balanceMinor)}.` };
  if (goal && parsed.money.minorUnits > goal.savedMinor) return { ok: false as const, error: `Para «${goal.name}» solo tiene ${formatMoney(goal.savedMinor)}.` };
  return parsed;
}

export function SaldoImporte() {
  const kind = useKind();
  const c = COPY[kind];
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
    if (dirty && !window.confirm('Si sales ahora, no se anotará nada. ¿Quieres salir?')) return;
    dispatch({ type: 'clearDraft' });
    nav('/');
  };

  const projected = parsed.ok ? state.balanceMinor + (kind === 'in' ? 1 : -1) * parsed.money.minorUnits : null;

  return (
    <div className="task">
      <div className="task-scroll">
        <BackBar icon="x" title={c.title} onBack={close} />
        <Steps current={1} label="Cuánto" />
        <h1 className="title">{c.ask}</h1>
        <p className="muted">{c.sub(state.childName)}</p>
        <div className="info-box"><span>Ahora tiene ahorrado</span><strong>{formatMoney(state.balanceMinor)}</strong></div>

        <label htmlFor="monto" className="field-label">{c.field}</label>
        <div className={`amount-field ${touched && !parsed.ok ? 'invalid' : ''}`} onClick={() => ref.current?.focus()}>
          <span aria-hidden="true">S/</span>
          <input id="monto" ref={ref} inputMode="decimal" autoComplete="off" value={input.replace(/^S\/\s*/, '')}
            aria-invalid={touched && !parsed.ok} aria-describedby="monto-ayuda"
            onChange={(e) => { setTouched(true); dispatch({ type: 'draft', patch: { amountInput: e.target.value } }); }}
            onBlur={() => setTouched(true)} />
        </div>
        <p id="monto-ayuda" className={`small ${touched && !parsed.ok ? 'error' : 'muted'}`} role={touched && !parsed.ok ? 'alert' : undefined}>
          {touched && !parsed.ok ? parsed.error : 'Toca el monto para cambiarlo.'}
        </p>

        <p className="muted">O escoge uno rápido</p>
        <div className="quick">
          {quick.map((q) => (
            <button key={q} type="button" className={isQuick(q) ? 'on' : ''} aria-pressed={isQuick(q)}
              onClick={() => { setTouched(false); dispatch({ type: 'draft', patch: { amountInput: (q / 100).toFixed(2) } }); }}>
              {isQuick(q) && <Icon name="check" size={16} />}{formatMoney(q).replace('.00', '')}
            </button>
          ))}
        </div>

        {projected !== null && (
          <div className="projection"><span className="muted">{c.after}</span><strong>{formatMoney(projected)}</strong></div>
        )}
        <p className="note"><Icon name="info" size={20} />Esto es solo para llevar la cuenta. La app no mueve plata de verdad ni cuenta las monedas del chanchito.</p>
      </div>
      <ActionFooter helper="Todavía no se anota nada.">
        <Button block disabled={!parsed.ok} onClick={() => { setTouched(true); if (parsed.ok) nav(`${c.base}/motivo`); }}>Continuar</Button>
      </ActionFooter>
    </div>
  );
}

export function SaldoMotivo() {
  const kind = useKind();
  const c = COPY[kind];
  const { state, dispatch } = useStore();
  const nav = useNavigate();
  const parsed = useValidatedAmount(kind);
  const sel = state.draft.reason;
  const [detail, setDetail] = useState(sel?.reason === 'otro' ? sel.detail ?? '' : '');
  const [open, setOpen] = useState(false);

  useEffect(() => { if (!parsed.ok) nav(`${c.base}/importe`, { replace: true }); }, [parsed.ok, nav, c.base]);
  if (!parsed.ok) return null;

  const goal = state.goals.find((g) => g.id === state.draft.goalId);
  const valid = !!sel && (sel.reason !== 'otro' || (sel.detail ?? '').trim().length > 0);
  const options = REASONS[kind];

  return (
    <div className="task">
      <div className="task-scroll">
        <BackBar title={c.title} />
        <Steps current={2} label="De dónde viene" />
        <h1 className="title">{c.reasonTitle}</h1>
        <p className="muted">{c.reasonCta(formatMoney(parsed.money), state.childName)}</p>

        <h2 className="section-title" id="motivo">{c.pick}</h2>
        <div className="reasons" role="radiogroup" aria-labelledby="motivo">
          {options.map((r) => (
            <button key={r.id} type="button" role="radio" aria-checked={sel?.reason === r.id}
              className={`reason ${sel?.reason === r.id ? 'on' : ''}`}
              onClick={() => dispatch({ type: 'draft', patch: { reason: r.id === 'otro' ? { reason: 'otro', detail } : { reason: r.id } } })}>
              <Icon name={sel?.reason === r.id ? 'circle-check' : r.icon} size={20} />{r.label}
            </button>
          ))}
        </div>
        {sel?.reason === 'otro' && (
          <>
            <label htmlFor="otro" className="field-label">Cuéntanos qué fue</label>
            <input id="otro" className="text-field" maxLength={60} value={detail}
              onChange={(e) => { setDetail(e.target.value); dispatch({ type: 'draft', patch: { reason: { reason: 'otro', detail: e.target.value } } }); }} />
          </>
        )}

        <h2 className="section-title">{c.dest}</h2>
        <button type="button" className="card select-card" aria-expanded={open} onClick={() => setOpen(!open)}>
          <Icon name="wallet" size={24} />
          <span className="row-text">
            <strong>{goal ? goal.name : 'Ninguna meta en especial'}</strong>
            <span className="muted small">{goal ? c.destGoal : c.destNone}</span>
          </span>
          <Icon name="chevron-down" size={20} />
        </button>
        {open && (
          <ul className="plain list options">
            <li><button type="button" className="opt" onClick={() => { dispatch({ type: 'draft', patch: { goalId: null } }); setOpen(false); }}>Ninguna meta en especial</button></li>
            {state.goals.map((g) => (
              <li key={g.id}><button type="button" className="opt" onClick={() => { dispatch({ type: 'draft', patch: { goalId: g.id } }); setOpen(false); }}>{g.name}</button></li>
            ))}
          </ul>
        )}
        <p className="muted small">Esto se guarda junto con lo que anoten.</p>
      </div>
      <ActionFooter helper="Antes de anotar, podrás revisar todo.">
        <Button block disabled={!valid} onClick={() => nav(`${c.base}/revisar`)}>Continuar</Button>
      </ActionFooter>
    </div>
  );
}

/** Paso 3: no está diseñado en las referencias; se compone con los mismos maestros. */
export function SaldoRevisar() {
  const kind = useKind();
  const c = COPY[kind];
  const { state, dispatch } = useStore();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const parsed = useValidatedAmount(kind);
  const reason = state.draft.reason;
  useEffect(() => { if (!parsed.ok || !reason) nav(`${c.base}/importe`, { replace: true }); }, [parsed.ok, reason, nav, c.base]);
  if (!parsed.ok || !reason) return null;
  const goal = state.goals.find((g) => g.id === state.draft.goalId);
  const after = state.balanceMinor + (kind === 'in' ? 1 : -1) * parsed.money.minorUnits;

  const confirm = () => {
    if (busy) return; // sin envíos duplicados
    setBusy(true);
    dispatch({ type: 'confirm', amountMinor: parsed.money.minorUnits, reason, goalId: state.draft.goalId, author: c.author });
    const reached = kind === 'in' && goal && goal.savedMinor < goal.targetMinor && goal.savedMinor + parsed.money.minorUnits >= goal.targetMinor;
    nav(`${c.base}/listo`, { replace: true, state: { reachedGoal: reached ? goal.name : null } });
  };

  return (
    <div className="task">
      <div className="task-scroll">
        <BackBar title={c.title} />
        <Steps current={3} label="Revisar" />
        <h1 className="title">¿Todo bien?</h1>
        <dl className="summary-list">
          <div><dt>Cuánto</dt><dd>{formatMoney(parsed.money)}</dd></div>
          <div><dt>Por qué</dt><dd>{reasonLabel(reason)}</dd></div>
          <div><dt>Meta</dt><dd>{goal ? goal.name : 'Ninguna'}</dd></div>
          <div><dt>Ahora tiene</dt><dd>{formatMoney(state.balanceMinor)}</dd></div>
          <div className="total"><dt>{c.after}</dt><dd>{formatMoney(after)}</dd></div>
        </dl>
        <p className="note"><Icon name="info" size={20} />Es solo para llevar la cuenta: la app no mueve plata de verdad.</p>
      </div>
      <ActionFooter helper="Recién se anota cuando toques el botón.">
        <Button block loading={busy} onClick={confirm}>{c.confirm}</Button>
      </ActionFooter>
    </div>
  );
}

/** Paso 4: confirmación tras guardar. */
export function SaldoListo() {
  const kind = useKind();
  const c = COPY[kind];
  const { state } = useStore();
  const reachedGoal = (useLocation().state as { reachedGoal?: string | null } | null)?.reachedGoal;
  return (
    <div className="task">
      <div className="task-scroll">
        <Steps current={4} label="Listo" />
        <div className="center-col">
          <span className="tile tile-verde big pop"><Icon name="circle-check" size={40} /></span>
          <h1 className="title center">{c.done}</h1>
          <p className="muted center">{c.now(state.childName)} {formatMoney(state.balanceMinor)}.</p>
          {reachedGoal && (
            <p className="alert-box ok reached-note" role="status"><Icon name="party-popper" size={20} />¡Ya juntaron todo para «{reachedGoal}»!</p>
          )}
        </div>
      </div>
      <ActionFooter helper="Lo verás en Alcancía.">
        <LinkButton to="/" block>Volver a Alcancía</LinkButton>
      </ActionFooter>
    </div>
  );
}

