import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import type { Id, Observation, Topic } from '../domain';

/** Observación con título opcional (dato editable según el DS). */
export type Moment = Observation & { title?: string };

export interface Goal { id: Id; name: string; icon: 'book-open' | 'puzzle' | 'target'; savedMinor: number; targetMinor: number }
export interface Movement { id: Id; kind: 'in' | 'out'; label: string; author: string; at: string; amountMinor: number; reason?: string; goalId?: Id; goalName?: string }
export type FlowKind = 'in' | 'out';
export interface FlowReason { reason: string; detail?: string }
export interface Draft { kind: FlowKind; amountInput: string; reason: FlowReason | null; goalId: Id | null }
export interface Conversation { id: Id; title: string; recordedAt: string }
export interface Celebration { id: Id; message: string; observationId?: Id; recordedAt: string }
export interface AppState {
  childName: string;
  balanceMinor: number;
  goals: Goal[];
  movements: Movement[];
  draft: Draft;
  observations: Moment[];
  conversations: Conversation[];
  celebrations: Celebration[];
  startedTopics: Topic[];
  activeTopic: Topic | null;
  activityStep: Partial<Record<Topic, number>>;
}

export const emptyDraft = (kind: FlowKind = 'in'): Draft => ({ kind, amountInput: kind === 'in' ? '10.00' : '5.00', reason: null, goalId: null });

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();

export const exampleState = (): AppState => ({
  childName: 'Sofía',
  balanceMinor: 1500,
  goals: [
    { id: 'g1', name: 'Libro ilustrado', icon: 'book-open', savedMinor: 600, targetMinor: 3000 },
    { id: 'g2', name: 'Rompecabezas', icon: 'puzzle', savedMinor: 400, targetMinor: 4000 },
  ],
  movements: [
    { id: 'm1', kind: 'in', label: 'Ingreso registrado', author: 'Mamá', at: daysAgo(0), amountMinor: 1000, goalId: 'g1', goalName: 'Libro ilustrado' },
    { id: 'm2', kind: 'in', label: 'Ingreso registrado', author: 'Mamá', at: daysAgo(1), amountMinor: 500 },
  ],
  draft: emptyDraft(),
  observations: [{ id: 'o1', title: 'Un pequeño gran paso', childId: 'c1', narrative: 'Sofía decidió guardar sus monedas para el libro que quiere.', authorId: 'mama', authorDisplayName: 'Mamá', recordedAt: '2026-10-01T10:00:00Z', topic: 'ahorrar' }],
  conversations: [{ id: 'c1', title: 'Compara precios antes de comprar', recordedAt: '2026-10-01T18:00:00Z' }],
  celebrations: [],
  startedTopics: ['ahorrar'],
  activeTopic: 'ahorrar',
  activityStep: { ahorrar: 0 },
});

export const firstDayState = (): AppState => ({
  ...exampleState(), balanceMinor: 0, goals: [], movements: [], observations: [], conversations: [], celebrations: [], startedTopics: [], activeTopic: null, activityStep: {},
});

type Action =
  | { type: 'draft'; patch: Partial<Draft> }
  | { type: 'startDraft'; kind: FlowKind }
  | { type: 'clearDraft' }
  | { type: 'confirm'; amountMinor: number; reason: FlowReason; goalId: Id | null; author: string }
  | { type: 'addGoal'; goal: Goal }
  | { type: 'setName'; name: string }
  | { type: 'addObservation'; observation: Moment }
  | { type: 'addConversation'; conversation: Conversation }
  | { type: 'addCelebration'; celebration: Celebration }
  | { type: 'startActivity'; topic: Topic }
  | { type: 'advanceStep'; topic: Topic; total: number }
  | { type: 'reset'; state: AppState };

export const REASON_LABELS: Record<string, string> = {
  propina: 'Propina', 'ayuda-en-casa': 'Ayudó en casa', cumpleanos: 'Cumpleaños', mesada: 'Mesada', 'buen-comportamiento': 'Buen comportamiento', otro: 'Otro',
  compra: 'Compra', regalo: 'Regalo', compartir: 'Compartir con alguien',
};
export const reasonLabel = (r: FlowReason): string => (r.reason === 'otro' && r.detail ? r.detail : REASON_LABELS[r.reason] ?? r.reason);

function reducer(s: AppState, a: Action): AppState {
  switch (a.type) {
    case 'draft': return { ...s, draft: { ...s.draft, ...a.patch } };
    case 'startDraft': return s.draft.kind === a.kind ? s : { ...s, draft: emptyDraft(a.kind) };
    case 'clearDraft': return { ...s, draft: emptyDraft() };
    case 'confirm': {
      const sign = s.draft.kind === 'in' ? 1 : -1;
      const goal = s.goals.find((g) => g.id === a.goalId);
      const goals = s.goals.map((g) => (g.id === a.goalId ? { ...g, savedMinor: Math.max(0, g.savedMinor + sign * a.amountMinor) } : g));
      const movement: Movement = {
        id: `m${Date.now()}`, kind: s.draft.kind, label: s.draft.kind === 'in' ? 'Ingreso registrado' : 'Salida registrada', author: a.author,
        at: new Date().toISOString(), amountMinor: sign * a.amountMinor, reason: reasonLabel(a.reason), goalId: goal?.id, goalName: goal?.name,
      };
      return { ...s, balanceMinor: s.balanceMinor + sign * a.amountMinor, goals, movements: [movement, ...s.movements], draft: emptyDraft() };
    }
    case 'addGoal': return { ...s, goals: [...s.goals, a.goal] };
    case 'setName': return { ...s, childName: a.name };
    case 'addObservation': return { ...s, observations: [a.observation, ...s.observations] };
    case 'addConversation': return { ...s, conversations: [a.conversation, ...s.conversations] };
    case 'addCelebration': return { ...s, celebrations: [a.celebration, ...s.celebrations] };
    case 'startActivity':
      return { ...s, activeTopic: a.topic, startedTopics: s.startedTopics.includes(a.topic) ? s.startedTopics : [...s.startedTopics, a.topic], activityStep: { ...s.activityStep, [a.topic]: s.activityStep[a.topic] ?? 0 } };
    case 'advanceStep': {
      const next = Math.min((s.activityStep[a.topic] ?? 0) + 1, a.total - 1);
      return { ...s, activityStep: { ...s.activityStep, [a.topic]: next } };
    }
    case 'reset': return a.state;
  }
}

const KEY = 'alcancia:v2';
function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...exampleState(), ...JSON.parse(raw) };
  } catch { /* almacenamiento no disponible: se usa el estado de ejemplo */ }
  return exampleState();
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

export const newId = (p: string) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
