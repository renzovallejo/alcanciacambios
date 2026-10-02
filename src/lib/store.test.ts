import { describe, expect, it } from 'vitest';
import { exampleState, firstDayState, goalAchieved, goalUsed, previewMovementUpdate, reducer, weekState, wouldBeNegative, type AppState } from './store';

const sum = (s: AppState) => s.movements.reduce((a, m) => a + m.amountMinor, 0);

describe('estado de la app', () => {
  it('las semillas cuadran: saldo = suma de movimientos', () => {
    expect(sum(weekState())).toBe(weekState().balanceMinor);
  });

  it('confirmar guarda quién envía, el motivo por id y lo recuerda para la próxima vez', () => {
    let s = reducer(firstDayState(), { type: 'startDraft', kind: 'in' });
    s = reducer(s, { type: 'confirm', amountMinor: 500, reason: { reason: 'cumpleanos' }, goalId: null, author: 'Mamá', senderId: 'abuela' });
    expect(s.balanceMinor).toBe(500);
    expect(s.movements[0]).toMatchObject({ kind: 'in', amountMinor: 500, reasonId: 'cumpleanos', senderId: 'abuela', author: 'Mamá' });
    const next = reducer(s, { type: 'startDraft', kind: 'in' });
    expect(next.draft).toMatchObject({ reason: { reason: 'cumpleanos' }, senderId: 'abuela' });
  });

  it('repetir deja todo listo con el último monto', () => {
    const s = reducer(exampleState(), { type: 'repeat', kind: 'in' });
    expect(s.draft).toMatchObject({ amountInput: '10.00', reason: { reason: 'mesada' }, goalId: 'g1', senderId: 'mama', active: true });
  });

  it('las metas cuadran con sus movimientos en la semana', () => {
    const s = weekState();
    for (const g of s.goals) expect(s.movements.filter((m) => m.goalId === g.id).reduce((a, m) => a + m.amountMinor, 0)).toBe(g.savedMinor);
  });

  it('borrar un movimiento lo saca del saldo y de su meta', () => {
    const s = reducer(weekState(), { type: 'deleteMovement', id: 'w6' });
    expect(s.balanceMinor).toBe(2300);
    expect(s.goals.find((g) => g.id === 'g1')!.savedMinor).toBe(1000);
    expect(s.movements.some((m) => m.id === 'w6')).toBe(false);
  });

  it('corregir un movimiento recalcula saldo y metas, también al cambiar de meta', () => {
    // w6: +S/ 2 de Papá a «Libro de dinosaurios» → S/ 3 de la Abuela a «Pelota de fútbol».
    const s = reducer(weekState(), { type: 'updateMovement', id: 'w6', amountMinor: 300, reason: { reason: 'propina' }, goalId: 'g2', senderId: 'abuela' });
    expect(s.balanceMinor).toBe(2600);
    expect(s.goals.find((g) => g.id === 'g1')!.savedMinor).toBe(1000);
    expect(s.goals.find((g) => g.id === 'g2')!.savedMinor).toBe(1300);
    expect(s.movements.find((m) => m.id === 'w6')).toMatchObject({ amountMinor: 300, reasonId: 'propina', senderId: 'abuela', goalName: 'Pelota de fútbol' });
  });

  it('una corrección que dejaría plata negativa se detecta antes de guardar', () => {
    // Semana: sacar S/ 3 → corregir a S/ 999 dejaría el saldo en negativo.
    const prev = previewMovementUpdate(weekState(), { type: 'updateMovement', id: 'w4', amountMinor: 99900, reason: { reason: 'compra' }, goalId: null });
    expect(wouldBeNegative(prev)).toBe(true);
  });

  it('borrar una meta no borra plata', () => {
    const s = reducer(weekState(), { type: 'deleteGoal', id: 'g1' });
    expect(s.balanceMinor).toBe(2500);
    expect(s.movements.find((m) => m.id === 'w6')).toMatchObject({ goalId: undefined, goalName: 'Libro de dinosaurios' });
  });

  it('una meta lograda sigue lograda aunque se use su plata', () => {
    let s = reducer(exampleState(), { type: 'startDraft', kind: 'in' });
    s = reducer(s, { type: 'confirm', amountMinor: 2400, reason: { reason: 'mesada' }, goalId: 'g1', author: 'Mamá', senderId: 'mama' });
    const g = () => s.goals.find((x) => x.id === 'g1')!;
    expect(goalAchieved(g())).toBe(true);
    s = reducer(s, { type: 'startDraft', kind: 'out' });
    s = reducer(s, { type: 'confirm', amountMinor: 3000, reason: { reason: 'compra' }, goalId: 'g1', author: 'Mamá' });
    expect(g().savedMinor).toBe(0);
    expect(goalUsed(g())).toBe(true);
  });

  it('un borrador empezado se retoma en vez de reiniciarse', () => {
    let s = reducer(exampleState(), { type: 'startDraft', kind: 'in' });
    s = reducer(s, { type: 'draft', patch: { amountInput: '7.50' } });
    s = reducer(s, { type: 'startDraft', kind: 'in' });
    expect(s.draft).toMatchObject({ amountInput: '7.50', active: true });
  });

  it('terminar una actividad la saca de «en curso» sin perder que empezó', () => {
    const s = reducer(weekState(), { type: 'finishActivity', topic: 'gastar-bien' });
    expect(s.activeTopic).toBeNull();
    expect(s.startedTopics).toContain('gastar-bien');
    expect(s.finishedTopics).toContain('gastar-bien');
  });
});
