import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BackBar, Button, HonestyNote, Icon, LinkButton } from '../components/ui';
import { useToast } from '../components/Toast';
import { SENDERS, goalAchieved, goalUsed, movementReason, previewMovementUpdate, senderLabel, useStore, wouldBeNegative, type FlowReason, type Movement } from '../lib/store';
import { formatMoney, parseAmount } from '../lib/money';
import { friendlyDate, monthKey, monthLabel } from '../lib/dates';
import { GoalCard, MovementRow } from './Home';
import { ActionFooter, REASONS, reasonValid, senderValid } from './Saldo';
import { t } from '../i18n';

/** Sus metas: en camino arriba, logradas aparte. */
export function AllGoals() {
  const { state } = useStore();
  const going = state.goals.filter((g) => !goalAchieved(g));
  const done = state.goals.filter(goalAchieved);
  return (
    <>
      <BackBar label={t('nav.alcancia')} to="/" />
      <h1 className="title">{t('meta.listaTitulo')}</h1>
      {state.goals.length === 0 && <p className="muted">{t('meta.listaVacia')}</p>}
      {going.length > 0 && (
        <>
          {done.length > 0 && <h2 className="section-title">{t('meta.enCamino')}</h2>}
          <ul className="plain stack-8">{going.map((g) => <li key={g.id}><GoalCard g={g} /></li>)}</ul>
        </>
      )}
      <LinkButton to="/meta/nueva" variant="secondary" block>{t('meta.otraMeta')}</LinkButton>
      {done.length > 0 && (
        <>
          <h2 className="section-title">{t('meta.logradas')}</h2>
          <ul className="plain stack-8">{done.map((g) => <li key={g.id}><GoalCard g={g} /></li>)}</ul>
        </>
      )}
    </>
  );
}

/** Todo lo anotado, por mes, con lo que entró y salió en cada uno. */
export function AllMovements() {
  const { state } = useStore();
  const months: { key: string; label: string; items: Movement[] }[] = [];
  for (const m of state.movements) {
    const key = monthKey(m.at);
    const last = months[months.length - 1];
    if (last && last.key === key) last.items.push(m);
    else months.push({ key, label: monthLabel(m.at), items: [m] });
  }
  return (
    <>
      <BackBar label={t('nav.alcancia')} to="/" />
      <h1 className="title">{t('movimientos.titulo')}</h1>
      {state.movements.length === 0 && <p className="muted">{t('movimientos.vacio')}</p>}
      {months.map((mo) => {
        const entro = mo.items.filter((m) => m.kind === 'in').reduce((a, m) => a + m.amountMinor, 0);
        const salio = mo.items.filter((m) => m.kind === 'out').reduce((a, m) => a - m.amountMinor, 0);
        return (
          <section key={mo.key}>
            <div className="month-head">
              <h2>{mo.label}</h2>
              <span className="muted small">{t('movimientos.mesTotales', { entro: formatMoney(entro), salio: formatMoney(salio) })}</span>
            </div>
            <ul className="plain list">{mo.items.map((m) => <MovementRow key={m.id} m={m} />)}</ul>
          </section>
        );
      })}
      <HonestyNote />
    </>
  );
}

export function MovementDetail() {
  const { id } = useParams();
  const { state, dispatch } = useStore();
  const nav = useNavigate();
  const toast = useToast();
  const [error, setError] = useState('');
  const m = state.movements.find((x) => x.id === id);
  if (!m) return (<><BackBar label={t('comun.volver')} to="/movimientos" /><p className="muted">{t('comun.noEncontrado')}</p></>);
  const out = m.kind === 'out';
  const sender = senderLabel(m.senderId, m.senderName);
  const reason = movementReason(m);

  const remove = () => {
    // Borrar una entrada puede dejar en negativo si después se sacó plata: se avisa en vez de borrar.
    const after = previewMovementUpdate(state, { type: 'updateMovement', id: m.id, amountMinor: 0, reason: { reason: m.reasonId ?? 'otro', detail: m.reasonDetail }, goalId: m.goalId ?? null, senderId: m.senderId, senderName: m.senderName });
    if (wouldBeNegative(after)) { setError(t('movimientos.borrarNoSePuede')); return; }
    if (!window.confirm(t('movimientos.borrarConfirmar'))) return;
    const before = state;
    dispatch({ type: 'deleteMovement', id: m.id });
    toast({ message: t('movimientos.borrado'), action: { label: t('comun.deshacer'), run: () => dispatch({ type: 'reset', state: before }) } });
    nav('/movimientos', { replace: true });
  };

  return (
    <>
      <BackBar label={t('comun.volver')} to="/movimientos" />
      <h1 className="title">{t(`movimientos.${m.kind}`)}</h1>
      <div className="info-box"><span>{t(out ? 'movimientos.salio' : 'movimientos.entro')}</span><strong>{out ? '−' : '+'}{formatMoney(Math.abs(m.amountMinor))}</strong></div>
      <dl className="summary-list">
        {!out && sender && <div><dt>{t('movimientos.leEnvio')}</dt><dd>{sender}</dd></div>}
        {reason && <div><dt>{t('movimientos.porQue')}</dt><dd>{reason}</dd></div>}
        <div><dt>{t('movimientos.meta')}</dt><dd>{m.goalName ?? t('comun.ninguna')}</dd></div>
        <div><dt>{t('movimientos.cuando')}</dt><dd>{friendlyDate(m.at) ?? t('comun.noSabemos')}</dd></div>
        <div><dt>{t('movimientos.loAnoto')}</dt><dd>{m.author}</dd></div>
      </dl>
      {error && <p className="alert-box appear" role="alert">{error}</p>}
      <div className="btn-pair">
        <LinkButton to={`/movimiento/${m.id}/editar`} variant="secondary"><Icon name="pencil" size={18} />{t('movimientos.corregir')}</LinkButton>
        <Button variant="tertiary" className="danger" onClick={remove}><Icon name="trash-2" size={18} />{t('movimientos.borrar')}</Button>
      </div>
      <HonestyNote />
    </>
  );
}

/** Corregir un movimiento: monto, motivo, meta y (en entradas) quién envía. Se valida que nada quede en negativo. */
export function MovementEdit() {
  const { id } = useParams();
  const { state, dispatch } = useStore();
  const nav = useNavigate();
  const toast = useToast();
  const m = state.movements.find((x) => x.id === id);
  const [amount, setAmount] = useState(m ? (Math.abs(m.amountMinor) / 100).toFixed(2) : '');
  const [reason, setReason] = useState<FlowReason | null>(m?.reasonId ? { reason: m.reasonId, detail: m.reasonDetail } : null);
  const [goalId, setGoalId] = useState<string | null>(m?.goalId ?? null);
  const [senderId, setSenderId] = useState<string | null>(m?.senderId ?? null);
  const [senderName, setSenderName] = useState(m?.senderName ?? '');
  const [error, setError] = useState('');
  if (!m) return <div className="task"><div className="task-scroll"><BackBar title={t('movimientos.editarTitulo')} to="/movimientos" /><p className="muted">{t('comun.noEncontrado')}</p></div></div>;
  const kind = m.kind;
  const parsed = parseAmount(amount);
  const ok = parsed.ok && reasonValid(reason) && (kind === 'out' || senderValid(senderId, senderName));

  const save = () => {
    if (!parsed.ok || !reason || !ok) return;
    const action = { type: 'updateMovement' as const, id: m.id, amountMinor: parsed.money.minorUnits, reason, goalId, senderId, senderName: senderId === 'otro' ? senderName : '' };
    if (wouldBeNegative(previewMovementUpdate(state, action))) { setError(t('movimientos.editarNegativo')); return; }
    const before = state;
    dispatch(action);
    toast({ message: t('comun.cambiosGuardados'), action: { label: t('comun.deshacer'), run: () => dispatch({ type: 'reset', state: before }) } });
    nav(`/movimiento/${m.id}`, { replace: true });
  };

  return (
    <div className="task">
      <div className="task-scroll">
        <BackBar icon="x" title={t('movimientos.editarTitulo')} />
        <label htmlFor="edit-monto" className="field-label">{t('flujo.cuanto')}</label>
        <div className={`amount-field ${!parsed.ok ? 'invalid' : ''}`}>
          <span aria-hidden="true">S/</span>
          <input id="edit-monto" inputMode="decimal" autoComplete="off" value={amount} onFocus={(e) => e.currentTarget.select()}
            onChange={(e) => { setError(''); setAmount(e.target.value); }} aria-invalid={!parsed.ok} />
        </div>
        {!parsed.ok && <p className="small error" role="alert">{parsed.error}</p>}

        <h2 className="section-title" id="edit-motivo">{t(`flujo.${kind}.deDonde`)}</h2>
        <div className="reasons" role="radiogroup" aria-labelledby="edit-motivo">
          {REASONS[kind].map((r) => (
            <button key={r.id} type="button" role="radio" aria-checked={reason?.reason === r.id} className={`reason ${reason?.reason === r.id ? 'on' : ''}`}
              onClick={() => setReason(r.id === 'otro' ? { reason: 'otro', detail: reason?.detail ?? '' } : { reason: r.id })}>
              <Icon name={reason?.reason === r.id ? 'circle-check' : r.icon} size={20} />{t(`motivos.${r.id}`)}
            </button>
          ))}
        </div>
        {reason?.reason === 'otro' && (
          <>
            <label htmlFor="edit-otro" className="field-label">{t('flujo.otroCampo')}</label>
            <input id="edit-otro" className="text-field" maxLength={60} value={reason.detail ?? ''} onChange={(e) => setReason({ reason: 'otro', detail: e.target.value })} />
          </>
        )}

        {kind === 'in' && (
          <>
            <h2 className="section-title" id="edit-quien">{t('quien.titulo')}</h2>
            <div className="reasons" role="radiogroup" aria-labelledby="edit-quien">
              {SENDERS.map((p) => (
                <button key={p.id} type="button" role="radio" aria-checked={senderId === p.id} className={`reason ${senderId === p.id ? 'on' : ''}`} onClick={() => setSenderId(p.id)}>
                  <Icon name={senderId === p.id ? 'circle-check' : p.icon} size={20} />{t(`quien.${p.id}`)}
                </button>
              ))}
            </div>
            {senderId === 'otro' && (
              <>
                <label htmlFor="edit-quien-otro" className="field-label">{t('quien.otroCampo')}</label>
                <input id="edit-quien-otro" className="text-field" maxLength={30} placeholder={t('quien.otroEjemplo')} value={senderName} onChange={(e) => setSenderName(e.target.value)} />
              </>
            )}
          </>
        )}

        <h2 className="section-title" id="edit-meta">{t(`flujo.${kind}.paraMeta`)}</h2>
        <div className="radio-list" role="radiogroup" aria-labelledby="edit-meta">
          <button type="button" role="radio" aria-checked={goalId === null} className={`reason wide ${goalId === null ? 'on' : ''}`} onClick={() => setGoalId(null)}>
            <Icon name={goalId === null ? 'circle-check' : 'wallet'} size={20} /><span className="row-text"><strong>{t('flujo.ningunaMeta')}</strong></span>
          </button>
          {state.goals.filter((g) => g.id === m.goalId || !goalUsed(g)).map((g) => (
            <button key={g.id} type="button" role="radio" aria-checked={goalId === g.id} className={`reason wide ${goalId === g.id ? 'on' : ''}`} onClick={() => { setError(''); setGoalId(g.id); }}>
              <Icon name={goalId === g.id ? 'circle-check' : g.icon} size={20} /><span className="row-text"><strong>{g.name}</strong></span>
            </button>
          ))}
        </div>
        {error && <p className="alert-box appear" role="alert">{error}</p>}
      </div>
      <ActionFooter helper={t('movimientos.editarPie')}>
        <Button block disabled={!ok} onClick={save}>{t('comun.guardarCambios')}</Button>
      </ActionFooter>
    </div>
  );
}
