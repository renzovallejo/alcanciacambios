import { useNavigate, useParams } from 'react-router-dom';
import { BackBar, Button, Icon, IconTile } from '../components/ui';
import { useStore } from '../lib/store';
import { formatMoney, percent } from '../lib/money';
import { MovementRow } from './Home';
import { t } from '../i18n';

/** Detalle de meta: avance = acumulado / objetivo; la barra nunca va sola. */
export default function GoalDetail() {
  const { id } = useParams();
  const { state, dispatch } = useStore();
  const nav = useNavigate();
  const g = state.goals.find((x) => x.id === id);
  if (!g) return (<><BackBar label={t('meta.detalleVolver')} to="/metas" /><h1 className="title">{t('meta.noEncontradaTitulo')}</h1><p className="muted">{t('meta.noEncontradaTexto')}</p></>);
  const pct = percent(g.savedMinor, g.targetMinor);
  const reached = g.savedMinor >= g.targetMinor;
  const missing = Math.max(0, g.targetMinor - g.savedMinor);
  const moves = state.movements.filter((m) => m.goalId === g.id);

  const add = () => {
    dispatch({ type: 'startDraft', kind: 'in' });
    dispatch({ type: 'draft', patch: { goalId: g.id } });
    nav('/saldo/importe');
  };

  return (
    <>
      <BackBar label={t('meta.detalleVolver')} to="/metas" />
      <div className="tema-head"><IconTile icon={reached ? 'circle-check' : g.icon} tone={reached ? 'verde' : 'azul'} size={48} /><h1 className="title">{g.name}</h1></div>
      <section className={`card goal-hero ${reached ? 'card-mint' : ''}`}>
        <div className="goal-hero-top">
          <span className="amount-sm">{formatMoney(g.savedMinor)}</span>
          <span className="muted">{t('meta.detalleDe', { objetivo: formatMoney(g.targetMinor) })}</span>
        </div>
        <div className="bar big" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={t('meta.detalleAvance', { porcentaje: pct })}><div style={{ width: `${pct}%` }} /></div>
        <p className="body">
          {reached
            ? <><Icon name="party-popper" size={18} /> {t('meta.lograda')}</>
            : <>{t('meta.faltan', { porcentaje: pct, monto: formatMoney(missing) })}</>}
        </p>
      </section>
      {!reached && <Button block onClick={add}>{t('meta.agregar')}</Button>}
      <h2 className="section-title">{t('meta.movimientosTitulo')}</h2>
      {moves.length === 0
        ? <p className="muted">{t('meta.movimientosVacio')}</p>
        : <ul className="plain list">{moves.map((m) => <MovementRow key={m.id} m={m} />)}</ul>}
      <p className="note"><Icon name="info" size={18} />{t('comun.soloCuenta')}</p>
    </>
  );
}
