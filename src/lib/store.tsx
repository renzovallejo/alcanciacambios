import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import type { Id, Observation, Topic } from '../domain';
import { hasKey, t } from '../i18n';

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
    { id: 'm1', kind: 'in', label: 'Guardó plata', author: 'Mamá', at: daysAgo(0), amountMinor: 1000, goalId: 'g1', goalName: 'Libro ilustrado' },
    { id: 'm2', kind: 'in', label: 'Guardó plata', author: 'Mamá', at: daysAgo(1), amountMinor: 500 },
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

/** Fecha de hace n días a una hora local fija, para que la semana se vea natural. */
const dayAt = (n: number, hour: number) => { const d = new Date(Date.now() - n * 86_400_000); d.setHours(hour, 0, 0, 0); return d.toISOString(); };

/** Una semana de uso real: metas, entradas y salidas, momentos, conversaciones y felicitaciones coherentes entre sí. */
export const weekState = (): AppState => ({
  childName: 'Sofía',
  balanceMinor: 2500, // 10 + 2 + 5 − 3 − 2 + 2 + 1 + 10
  goals: [
    { id: 'g1', name: 'Libro de dinosaurios', icon: 'book-open', savedMinor: 1200, targetMinor: 3000 },
    { id: 'g2', name: 'Pelota de fútbol', icon: 'target', savedMinor: 1000, targetMinor: 2000 },
  ],
  movements: [
    { id: 'w8', kind: 'in', label: 'Guardó plata', author: 'Mamá', at: dayAt(0, 18), amountMinor: 1000, reason: 'Su propina de la semana', goalId: 'g2', goalName: 'Pelota de fútbol' },
    { id: 'w7', kind: 'in', label: 'Guardó plata', author: 'Abuela', at: dayAt(1, 19), amountMinor: 100, reason: 'Se portó bien' },
    { id: 'w6', kind: 'in', label: 'Guardó plata', author: 'Papá', at: dayAt(2, 17), amountMinor: 200, reason: 'Ayudó en casa', goalId: 'g1', goalName: 'Libro de dinosaurios' },
    { id: 'w5', kind: 'out', label: 'Sacó plata', author: 'Mamá', at: dayAt(3, 16), amountMinor: -200, reason: 'Hizo un regalo' },
    { id: 'w4', kind: 'out', label: 'Sacó plata', author: 'Mamá', at: dayAt(4, 18), amountMinor: -300, reason: 'Se compró algo' },
    { id: 'w3', kind: 'in', label: 'Guardó plata', author: 'Tío Jorge', at: dayAt(5, 13), amountMinor: 500, reason: 'Le dieron propina' },
    { id: 'w2', kind: 'in', label: 'Guardó plata', author: 'Papá', at: dayAt(6, 18), amountMinor: 200, reason: 'Ayudó en casa' },
    { id: 'w1', kind: 'in', label: 'Guardó plata', author: 'Mamá', at: dayAt(7, 10), amountMinor: 1000, reason: 'Su propina de la semana', goalId: 'g1', goalName: 'Libro de dinosaurios' },
  ],
  draft: emptyDraft(),
  observations: [
    { id: 'o3', title: 'Pensó en su hermanito', childId: 'c1', narrative: 'Dijo que quiere guardar un sol para comprarle algo a su hermanito por su cumple.', authorId: 'abuela', authorDisplayName: 'Abuela', recordedAt: dayAt(1, 20), topic: 'compartir' },
    { id: 'o2', title: 'Comparó antes de comprar', childId: 'c1', narrative: 'Antes de comprar sus figuritas, preguntó si en la otra bodega estaban más baratas.', authorId: 'mama', authorDisplayName: 'Mamá', recordedAt: dayAt(4, 19), topic: 'gastar-bien' },
    { id: 'o1', title: 'Contó sola sus monedas', childId: 'c1', narrative: 'Contó sola sus monedas antes de meterlas al chanchito, ¡y no se equivocó!', authorId: 'papa', authorDisplayName: 'Papá', recordedAt: dayAt(6, 19), topic: 'ahorrar' },
  ],
  conversations: [
    { id: 'c3', title: '¿Lo necesito o lo quiero?', recordedAt: dayAt(3, 20) },
    { id: 'c2', title: 'Compara precios antes de comprar', recordedAt: dayAt(4, 20) },
    { id: 'c1', title: 'Planifica y ahorra para una meta', recordedAt: dayAt(6, 20) },
  ],
  celebrations: [
    { id: 'k2', message: '¡Qué chévere cómo lo pensaste!', observationId: 'o2', recordedAt: dayAt(4, 20) },
    { id: 'k1', message: '¡Qué orgullo, lo hiciste muy bien!', observationId: 'o1', recordedAt: dayAt(6, 20) },
  ],
  startedTopics: ['ahorrar', 'gastar-bien'],
  activeTopic: 'gastar-bien',
  activityStep: { ahorrar: 2, 'gastar-bien': 1 },
});

/** Datos iniciales según el despliegue: VITE_SEED=vacio | semana (por defecto, ejemplo de las referencias). */
const SEED = import.meta.env.VITE_SEED as string | undefined;
export const seedState = (): AppState => (SEED === 'vacio' ? firstDayState() : SEED === 'semana' ? weekState() : exampleState());
export const seedIsEmpty = SEED === 'vacio';

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

/** Texto visible del motivo; los ids no cambian (ver contratos). */
export const reasonLabel = (r: FlowReason): string => (r.reason === 'otro' && r.detail ? r.detail : hasKey(`motivos.${r.reason}`) ? t(`motivos.${r.reason}`) : r.reason);

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
        id: `m${Date.now()}`, kind: s.draft.kind, label: t(`movimientos.${s.draft.kind}`), author: a.author,
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
    if (raw) return { ...seedState(), ...JSON.parse(raw) };
  } catch { /* almacenamiento no disponible: se usa el estado de ejemplo */ }
  return seedState();
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
