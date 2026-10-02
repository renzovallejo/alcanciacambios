import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackBar, Button, Icon, LinkButton } from '../components/ui';
import { reasonLabel, useStore } from '../lib/store';
import { formatMoney, parseAmount } from '../lib/money';
import type { BalanceReason, Reason } from '../domain';

function Steps({ current, label }: { current: number; label: string }) {
  return (
    <div className="steps">
      <p className="muted small" aria-live="polite">Paso {current} de 4 · {label}</p>
      <div className="seg" aria-hidden="true">{[1, 2, 3, 4].map((n) => <i key={n} className={n <= current ? 'on' : ''} />)}</div>
    </div>
  );
}

function ActionFooter({ children, helper }: { children: React.ReactNode; helper: string }) {
  return <footer className="action-footer">{children}<p className="muted small center">{helper}</p></footer>;
}

function useCloseWithConfirm() {
  const { state, dispatch } = useStore();
  const nav = useNavigate();
  return () => {
    const dirty = state.draft.reason !== null || state.draft.amountInput !== '10.00';
    if (dirty && !window.confirm('Si sales ahora, se descartará este registro. ¿Salir?')) return;
    dispatch({ type: 'clearDraft' });
    nav('/');
  };
}

export function SaldoImporte() {
  const { state, dispatch } = useStore();
  const nav = useNavigate();
  const close = useCloseWithConfirm();
  const [touched, setTouched] = useState(false);
  const input = state.draft.amountInput;
  const parsed = parseAmount(input);
  const quick = [500, 1000, 2000];
  const isQuick = (q: number) => parsed.ok && parsed.money.minorUnits === q;
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div className="task">
      <div className="task-scroll">
        <BackBar icon="x" title="Agregar saldo" onBack={close} />
        <Steps current={1} label="Importe" />
        <h1 className="title">¿Cuánto van a agregar?</h1>
        <p className="muted">Al saldo de práctica de {state.childName}.</p>
        <div className="info-box"><span>Saldo de práctica actual</span><strong>{formatMoney(state.balanceMinor)}</strong></div>

        <label htmlFor="monto" className="field-label">Monto a agregar</label>
        <div className={`amount-field ${touched && !parsed.ok ? 'invalid' : ''}`} onClick={() => ref.current?.focus()}>
          <span aria-hidden="true">S/</span>
          <input id="monto" ref={ref} inputMode="decimal" autoComplete="off" value={input.replace(/^S\/\s*/, '')}
            aria-invalid={touched && !parsed.ok} aria-describedby="monto-ayuda"
            onChange={(e) => { setTouched(true); dispatch({ type: 'draft', patch: { amountInput: e.target.value } }); }}
            onBlur={() => setTouched(true)} />
        </div>
        <p id="monto-ayuda" className={`small ${touched && !parsed.ok ? 'error' : 'muted'}`} role={touched && !parsed.ok ? 'alert' : undefined}>
          {touched && !parsed.ok ? parsed.error : 'Toca el importe para cambiarlo.'}
        </p>

        <p className="muted">Montos rápidos</p>
        <div className="quick">
          {quick.map((q) => (
            <button key={q} type="button" className={isQuick(q) ? 'on' : ''} aria-pressed={isQuick(q)}
              onClick={() => { setTouched(false); dispatch({ type: 'draft', patch: { amountInput: (q / 100).toFixed(2) } }); }}>
              {isQuick(q) && <Icon name="check" size={16} />}{formatMoney(q).replace('.00', '')}
            </button>
          ))}
        </div>

        {parsed.ok && (
          <div className="projection"><span className="muted">Después de confirmar</span><strong>{formatMoney(state.balanceMinor + parsed.money.minorUnits)}</strong></div>
        )}
        <p className="note"><Icon name="info" size={20} />Este registro es de práctica. No mueve dinero real ni detecta monedas.</p>
      </div>
      <ActionFooter helper="Aún no se agregará el saldo.">
        <Button block disabled={!parsed.ok} onClick={() => { setTouched(true); if (parsed.ok) nav('/saldo/motivo'); }}>Continuar</Button>
      </ActionFooter>
    </div>
  );
}

const REASONS: { id: Reason; label: string; icon: string }[] = [
  { id: 'propina', label: 'Propina', icon: 'circle-check' },
  { id: 'ayuda-en-casa', label: 'Ayudó en casa', icon: 'house' },
  { id: 'cumpleanos', label: 'Cumpleaños', icon: 'cake' },
  { id: 'mesada', label: 'Mesada', icon: 'calendar-days' },
  { id: 'buen-comportamiento', label: 'Buen comportamiento', icon: 'star' },
  { id: 'otro', label: 'Otro', icon: 'ellipsis' },
];

export function SaldoMotivo() {
  const { state, dispatch } = useStore();
  const nav = useNavigate();
  const parsed = parseAmount(state.draft.amountInput);
  const sel = state.draft.reason;
  const [detail, setDetail] = useState(sel?.reason === 'otro' ? sel.detail : '');
  const [open, setOpen] = useState(false);

  useEffect(() => { if (!parsed.ok) nav('/saldo/importe', { replace: true }); }, [parsed.ok, nav]);
  if (!parsed.ok) return null;

  const choose = (id: Reason) => {
    const reason: BalanceReason = id === 'otro' ? { reason: 'otro', detail } : { reason: id };
    dispatch({ type: 'draft', patch: { reason } });
  };
  const goal = state.goals.find((g) => g.id === state.draft.goalId);
  const valid = !!sel && (sel.reason !== 'otro' || sel.detail.trim().length > 0);

  return (
    <div className="task">
      <div className="task-scroll">
        <BackBar title="Agregar saldo" />
        <Steps current={2} label="Motivo y destino" />
        <h1 className="title">¿De dónde viene?</h1>
        <p className="muted">Agregarás {formatMoney(parsed.money)} al saldo de práctica de {state.childName}.</p>

        <h2 className="section-title" id="motivo">Elige un motivo</h2>
        <div className="reasons" role="radiogroup" aria-labelledby="motivo">
          {REASONS.map((r) => (
            <button key={r.id} type="button" role="radio" aria-checked={sel?.reason === r.id}
              className={`reason ${sel?.reason === r.id ? 'on' : ''}`} onClick={() => choose(r.id)}>
              <Icon name={sel?.reason === r.id ? 'circle-check' : r.icon} size={20} />{r.label}
            </button>
          ))}
        </div>
        {sel?.reason === 'otro' && (
          <>
            <label htmlFor="otro" className="field-label">¿Cuál fue el motivo?</label>
            <input id="otro" className="text-field" maxLength={60} value={detail}
              onChange={(e) => { setDetail(e.target.value); dispatch({ type: 'draft', patch: { reason: { reason: 'otro', detail: e.target.value } } }); }} />
          </>
        )}

        <h2 className="section-title">Destino del saldo</h2>
        <button type="button" className="card select-card" aria-expanded={open} onClick={() => setOpen(!open)}>
          <Icon name="wallet" size={24} />
          <span className="row-text">
            <strong>{goal ? goal.name : 'Sin meta'}</strong>
            <span className="muted small">{goal ? `Se suma a la meta y al saldo de práctica.` : 'Se suma al saldo de práctica.'}</span>
          </span>
          <Icon name="chevron-down" size={20} />
        </button>
        {open && (
          <ul className="plain list options">
            <li><button type="button" className="opt" onClick={() => { dispatch({ type: 'draft', patch: { goalId: null } }); setOpen(false); }}>Sin meta</button></li>
            {state.goals.map((g) => (
              <li key={g.id}><button type="button" className="opt" onClick={() => { dispatch({ type: 'draft', patch: { goalId: g.id } }); setOpen(false); }}>{g.name}</button></li>
            ))}
          </ul>
        )}
        <p className="muted small">El motivo quedará guardado junto al movimiento.</p>
      </div>
      <ActionFooter helper="Podrás revisar los datos antes de confirmar.">
        <Button block disabled={!valid} onClick={() => nav('/saldo/revisar')}>Continuar</Button>
      </ActionFooter>
    </div>
  );
}

/** Paso 3: no está diseñado en las referencias; se compone con los mismos maestros. */
export function SaldoRevisar() {
  const { state, dispatch } = useStore();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const parsed = parseAmount(state.draft.amountInput);
  const reason = state.draft.reason;
  useEffect(() => { if (!parsed.ok || !reason) nav('/saldo/importe', { replace: true }); }, [parsed.ok, reason, nav]);
  if (!parsed.ok || !reason) return null;
  const goal = state.goals.find((g) => g.id === state.draft.goalId);

  const confirm = () => {
    if (busy) return; // sin envíos duplicados
    setBusy(true);
    dispatch({ type: 'confirm', amountMinor: parsed.money.minorUnits, reason, goalId: state.draft.goalId });
    nav('/saldo/listo', { replace: true, state: { amount: parsed.money.minorUnits } });
  };

  return (
    <div className="task">
      <div className="task-scroll">
        <BackBar title="Agregar saldo" />
        <Steps current={3} label="Revisar" />
        <h1 className="title">Revisa antes de confirmar</h1>
        <dl className="summary-list">
          <div><dt>Importe</dt><dd>{formatMoney(parsed.money)}</dd></div>
          <div><dt>Motivo</dt><dd>{reasonLabel(reason)}</dd></div>
          <div><dt>Destino</dt><dd>{goal ? goal.name : 'Sin meta'}</dd></div>
          <div><dt>Saldo actual</dt><dd>{formatMoney(state.balanceMinor)}</dd></div>
          <div className="total"><dt>Después de confirmar</dt><dd>{formatMoney(state.balanceMinor + parsed.money.minorUnits)}</dd></div>
        </dl>
        <p className="note"><Icon name="info" size={20} />Este registro es de práctica. No mueve dinero real.</p>
      </div>
      <ActionFooter helper="El saldo cambia solo al confirmar.">
        <Button block loading={busy} onClick={confirm}>Confirmar y agregar</Button>
      </ActionFooter>
    </div>
  );
}

/** Paso 4: confirmación tras guardar. */
export function SaldoListo() {
  const { state } = useStore();
  return (
    <div className="task">
      <div className="task-scroll">
        <Steps current={4} label="Listo" />
        <div className="center-col">
          <span className="tile tile-verde big"><Icon name="circle-check" size={40} /></span>
          <h1 className="title center">Saldo agregado</h1>
          <p className="muted center">El saldo de práctica de {state.childName} ahora es {formatMoney(state.balanceMinor)}.</p>
        </div>
      </div>
      <ActionFooter helper="Puedes ver el movimiento en Alcancía.">
        <LinkButton to="/" block>Volver a Alcancía</LinkButton>
      </ActionFooter>
    </div>
  );
}
