import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BackBar, Button } from '../components/ui';
import { ActionFooter } from './Saldo';
import { newId, useStore } from '../lib/store';
import { parseAmount } from '../lib/money';

export default function NuevaMeta() {
  const { state, dispatch } = useStore();
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [touched, setTouched] = useState(false);
  const parsed = parseAmount(target);
  const first = state.goals.length === 0;
  const [qs] = useSearchParams();
  const back = qs.get('volver');

  const save = () => {
    setTouched(true);
    if (!name.trim() || !parsed.ok) return;
    dispatch({ type: 'addGoal', goal: { id: newId('g'), name: name.trim(), icon: 'target', savedMinor: 0, targetMinor: parsed.money.minorUnits } });
    nav(back && back.startsWith('/') ? back : first ? '/' : '/metas', { replace: true });
  };

  return (
    <div className="task">
      <div className="task-scroll">
        <BackBar icon="x" title={first ? 'Primera meta' : 'Nueva meta'} />
        <h1 className="title">¿Para qué quiere ahorrar {state.childName}?</h1>
        <p className="muted">Un juguete, un libro o algo que le haga ilusión.</p>
        <label htmlFor="meta-nombre" className="field-label">Nombre de la meta</label>
        <input id="meta-nombre" className="text-field" maxLength={40} value={name} onChange={(e) => setName(e.target.value)} />
        {touched && !name.trim() && <p className="small error" role="alert">Escribe un nombre.</p>}
        <label htmlFor="meta-monto" className="field-label">¿Cuánto cuesta? (S/)</label>
        <input id="meta-monto" className="text-field" inputMode="decimal" value={target} onChange={(e) => setTarget(e.target.value)} />
        {touched && !parsed.ok && <p className="small error" role="alert">{parsed.error}</p>}
      </div>
      <ActionFooter><Button block onClick={save}>Crear meta</Button></ActionFooter>
    </div>
  );
}
