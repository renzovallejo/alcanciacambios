import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import type { BalanceReason, Id } from '../domain';

export interface Goal { id: Id; name: string; icon: 'book-open' | 'puzzle' | 'target'; savedMinor: number; targetMinor: number }
export interface Movement { id: Id; label: string; author: string; whenLabel: string; amountMinor: number; reason?: string }
export interface Draft { amountInput: string; reason: BalanceReason | null; goalId: Id | null }
export interface AppState {
  childName: string;
  balanceMinor: number;
  goals: Goal[];
  movements: Movement[];
  draft: Draft;
}

export const emptyDraft: Draft = { amountInput: '10.00', reason: null, goalId: null };

export const exampleState: AppState = {
  childName: 'Sofía',
  balanceMinor: 1500,
  goals: [
    { id: 'g1', name: 'Libro ilustrado', icon: 'book-open', savedMinor: 600, targetMinor: 3000 },
    { id: 'g2', name: 'Rompecabezas', icon: 'puzzle', savedMinor: 400, targetMinor: 4000 },
  ],
  movements: [
    { id: 'm1', label: 'Ingreso registrado', author: 'Mamá', whenLabel: 'hoy', amountMinor: 1000 },
    { id: 'm2', label: 'Ingreso registrado', author: 'Mamá', whenLabel: 'ayer', amountMinor: 500 },
  ],
  draft: emptyDraft,
};

export const firstDayState: AppState = { ...exampleState, balanceMinor: 0, goals: [], movements: [] };

type Action =
  | { type: 'draft'; patch: Partial<Draft> }
  | { type: 'clearDraft' }
  | { type: 'confirm'; amountMinor: number; reason: BalanceReason; goalId: Id | null }
  | { type: 'addGoal'; goal: Goal }
  | { type: 'reset'; state: AppState };

const REASON_LABELS: Record<string, string> = {
  propina: 'Propina', 'ayuda-en-casa': 'Ayudó en casa', cumpleanos: 'Cumpleaños', mesada: 'Mesada',
  'buen-comportamiento': 'Buen comportamiento', otro: 'Otro',
};
export const reasonLabel = (r: BalanceReason): string =>
  r.reason === 'otro' && r.detail ? r.detail : REASON_LABELS[r.reason];

function reducer(s: AppState, a: Action): AppState {
  switch (a.type) {
    case 'draft': return { ...s, draft: { ...s.draft, ...a.patch } };
    case 'clearDraft': return { ...s, draft: emptyDraft };
    case 'confirm': {
      const goals = s.goals.map((g) => (g.id === a.goalId ? { ...g, savedMinor: g.savedMinor + a.amountMinor } : g));
      const movement: Movement = {
        id: `m${Date.now()}`, label: 'Ingreso registrado', author: 'Tú', whenLabel: 'hoy',
        amountMinor: a.amountMinor, reason: reasonLabel(a.reason),
      };
      return { ...s, balanceMinor: s.balanceMinor + a.amountMinor, goals, movements: [movement, ...s.movements], draft: emptyDraft };
    }
    case 'addGoal': return { ...s, goals: [...s.goals, a.goal] };
    case 'reset': return a.state;
  }
}

const KEY = 'alcancia:v1';
function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...exampleState, ...JSON.parse(raw) };
  } catch { /* almacenamiento no disponible: se usa el estado de ejemplo */ }
  return exampleState;
}

interface Ctx { state: AppState; dispatch: (a: Action) => void }
const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, rawDispatch] = useReducer(reducer, undefined, load);
  const dispatch = useCallback((a: Action) => rawDispatch(a), []);
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignorar */ }
  }, [state]);
  const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore(): Ctx {
  const c = useContext(StoreCtx);
  if (!c) throw new Error('useStore fuera de StoreProvider');
  return c;
}
