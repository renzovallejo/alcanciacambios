import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { BackBar, Button } from '../components/ui';
import { useToast } from '../components/Toast';
import { ActionFooter } from './Saldo';
import { newId, useStore } from '../lib/store';
import { parseAmount } from '../lib/money';
import { t } from '../i18n';

/** Poner una meta nueva o, con /meta/:id/editar, cambiar su nombre y cuánto cuesta. */
export default function NuevaMeta() {
  const { state, dispatch } = useStore();
  const nav = useNavigate();
  const toast = useToast();
  const { id } = useParams();
  const editing = id ? state.goals.find((g) => g.id === id) : undefined;
  const [name, setName] = useState(editing?.name ?? '');
  const [target, setTarget] = useState(editing ? (editing.targetMinor / 100).toFixed(2) : '');
  const [touched, setTouched] = useState(false);
  const parsed = parseAmount(target);
  const first = state.goals.length === 0;
  const [qs] = useSearchParams();
  const back = qs.get('volver');

  const save = () => {
    setTouched(true);
    if (!name.trim() || !parsed.ok) return;
    if (editing) {
      dispatch({ type: 'updateGoal', id: editing.id, name: name.trim(), targetMinor: parsed.money.minorUnits });
      toast({ message: t('comun.cambiosGuardados') });
      nav(`/meta/${editing.id}`, { replace: true });
      return;
    }
    dispatch({ type: 'addGoal', goal: { id: newId('g'), name: name.trim(), icon: 'target', savedMinor: 0, targetMinor: parsed.money.minorUnits } });
    nav(back && back.startsWith('/') ? back : first ? '/' : '/metas', { replace: true });
  };

  return (
    <div className="task">
      <div className="task-scroll">
        <BackBar icon="x" title={editing ? t('meta.editarTitulo') : t(first ? 'nuevaMeta.tituloPrimera' : 'nuevaMeta.tituloOtra')} />
        <h1 className="title">{t('nuevaMeta.pregunta', { nombre: state.childName })}</h1>
        <p className="muted">{t('nuevaMeta.ayuda')}</p>
        <label htmlFor="meta-nombre" className="field-label">{t('nuevaMeta.nombre')}</label>
        <input id="meta-nombre" className="text-field" placeholder={t('nuevaMeta.nombreEjemplo')} maxLength={40} value={name} onChange={(e) => setName(e.target.value)} />
        {touched && !name.trim() && <p className="small error" role="alert">{t('nuevaMeta.nombreError')}</p>}
        <label htmlFor="meta-monto" className="field-label">{t('nuevaMeta.costo')}</label>
        <input id="meta-monto" className="text-field" inputMode="decimal" value={target} onChange={(e) => setTarget(e.target.value)} />
        {touched && !parsed.ok && <p className="small error" role="alert">{parsed.error}</p>}
      </div>
      <ActionFooter><Button block onClick={save}>{editing ? t('comun.guardarCambios') : t('nuevaMeta.guardar')}</Button></ActionFooter>
    </div>
  );
}
