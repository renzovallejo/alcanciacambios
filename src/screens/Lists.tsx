import { useParams } from 'react-router-dom';
import { BackBar, Icon, LinkButton } from '../components/ui';
import { useStore } from '../lib/store';
import { formatMoney } from '../lib/money';
import { friendlyDate } from '../lib/dates';
import { GoalCard, MovementRow } from './Home';
import { t } from '../i18n';

export function AllGoals() {
  const { state } = useStore();
  return (
    <>
      <BackBar label={t('nav.alcancia')} to="/" />
      <h1 className="title">{t('meta.listaTitulo')}</h1>
      <ul className="plain stack-8">
        {state.goals.map((g) => <li key={g.id}><GoalCard g={g} /></li>)}
      </ul>
      {state.goals.length === 0 && <p className="muted">{t('meta.listaVacia')}</p>}
      <LinkButton to="/meta/nueva" variant="secondary" block>{t('meta.otraMeta')}</LinkButton>
    </>
  );
}

export function AllMovements() {
  const { state } = useStore();
  return (
    <>
      <BackBar label={t('nav.alcancia')} to="/" />
      <h1 className="title">{t('movimientos.titulo')}</h1>
      {state.movements.length === 0
        ? <p className="muted">{t('movimientos.vacio')}</p>
        : <ul className="plain list">{state.movements.map((m) => <MovementRow key={m.id} m={m} />)}</ul>}
      <p className="note"><Icon name="info" size={18} /> {t('comun.soloCuenta')}</p>
    </>
  );
}

export function MovementDetail() {
  const { id } = useParams();
  const { state } = useStore();
  const m = state.movements.find((x) => x.id === id);
  if (!m) return (<><BackBar label={t('comun.volver')} to="/movimientos" /><p className="muted">{t('comun.noEncontrado')}</p></>);
  const out = m.kind === 'out';
  return (
    <>
      <BackBar label={t('comun.volver')} to="/movimientos" />
      <h1 className="title">{t(`movimientos.${m.kind}`)}</h1>
      <div className="info-box"><span>{t(out ? 'movimientos.salio' : 'movimientos.entro')}</span><strong>{out ? '−' : '+'}{formatMoney(Math.abs(m.amountMinor))}</strong></div>
      <dl className="summary-list">
        <div><dt>{t('movimientos.loAnoto')}</dt><dd>{m.author}</dd></div>
        <div><dt>{t('movimientos.cuando')}</dt><dd>{friendlyDate(m.at) ?? t('comun.noSabemos')}</dd></div>
        {m.reason && <div><dt>{t('movimientos.porQue')}</dt><dd>{m.reason}</dd></div>}
        <div><dt>{t('movimientos.meta')}</dt><dd>{m.goalName ?? t('comun.ninguna')}</dd></div>
      </dl>
      <p className="note"><Icon name="info" size={18} /> {t('comun.soloCuenta')}</p>
    </>
  );
}
