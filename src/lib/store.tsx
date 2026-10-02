import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import type { Id, Observation, Topic } from '../domain';
import { hasKey, t } from '../i18n';

export const newId = (p: string) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

/** Observación con título opcional (dato editable según el DS). */
export type Moment = Observation & { title?: string };

export interface Goal {
  id: Id; name: string; icon: 'book-open' | 'puzzle' | 'target'; savedMinor: number; targetMinor: number;
  /** Se marca al llegar al objetivo y no se pierde aunque luego se use la plata. */
  achieved?: boolean;
}
export interface Movement {
  id: Id; kind: 'in' | 'out'; label: string; author: string; at: string; amountMinor: number;
  /** Texto visible guardado (compatibilidad). Para mostrar, preferir reasonId. */
  reason?: string; reasonId?: string; reasonDetail?: string; goalId?: Id; goalName?: string;
  /** De quién viene la plata (solo entradas). senderId: ver SENDERS; senderName para «otro» o un nombre propio. */
  senderId?: string; senderName?: string;
}
export type FlowKind = 'in' | 'out';
export interface FlowReason { reason: string; detail?: string }
/** active = la persona empezó a guardar o sacar plata y no terminó (para ofrecer retomarlo). */
export interface Draft { kind: FlowKind; amountInput: string; reason: FlowReason | null; goalId: Id | null; senderId?: string | null; senderName?: string; active?: boolean }
export interface Conversation { id: Id; title: string; recordedAt: string }
export interface Celebration { id: Id; message: string; observationId?: Id; recordedAt: string }
/** Lo último que entró o salió, por tipo, para recordar motivo, meta y quién envía. */
export interface LastEntry { amountMinor: number; reason: FlowReason; goalId: Id | null; senderId?: string | null; senderName?: string }
/** Quien administra la cuenta en este celular. relation = id de SENDERS (mama, papa…). */
export interface Caregiver { name: string; relation?: string }

/** Quién le envía la plata. El orden es el de la pantalla. «otro» pide el nombre. */
export const SENDERS = [
  { id: 'mama', icon: 'user-round' }, { id: 'papa', icon: 'user-round' }, { id: 'abuela', icon: 'person-standing' },
  { id: 'abuelo', icon: 'person-standing' }, { id: 'tio', icon: 'users-round' }, { id: 'otro', icon: 'user-round-plus' },
] as const;
/** Nombre visible de quien envía: el nombre propio si lo hay, si no la relación. */
export const senderLabel = (id?: string | null, name?: string) => (name?.trim() ? name.trim() : id && hasKey(`quien.${id}`) ? t(`quien.${id}`) : '');
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
  /** Actividades recorridas hasta el final (sin puntaje). */
  finishedTopics: Topic[];
  /** Quien usa el celular: firma lo que anota y se ofrece en «¿Quién lo vio?». */
  caregiver: Caregiver | null;
  /** Día de la propina (0 = domingo … 6 = sábado) para el recordatorio; null = sin recordatorio. */
  propinaDay: number | null;
  /** El chanchito se conectó alguna vez con este celular. Si no, se invita a conectarlo en vez de decir «Sin conexión». */
  devicePaired: boolean;
  /** El chanchito está conectado ahora. En la demo de una semana se asume conectado; con hardware real, lo dice el dispositivo. */
  deviceOnline: boolean;
  last: Partial<Record<FlowKind, LastEntry>>;
}

export const emptyDraft = (kind: FlowKind = 'in'): Draft => ({ kind, amountInput: kind === 'in' ? '10.00' : '5.00', reason: null, goalId: null, senderId: null, senderName: '', active: false });

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();

export const exampleState = (): AppState => ({
  childName: 'Sofía',
  balanceMinor: 1500,
  goals: [
    { id: 'g1', name: 'Libro ilustrado', icon: 'book-open', savedMinor: 600, targetMinor: 3000 },
    { id: 'g2', name: 'Rompecabezas', icon: 'puzzle', savedMinor: 400, targetMinor: 4000 },
  ],
  movements: [
    { id: 'm1', kind: 'in', label: 'Guardó plata', author: 'Mamá', at: daysAgo(0), amountMinor: 1000, reasonId: 'mesada', senderId: 'mama' },
    { id: 'm2', kind: 'in', label: 'Guardó plata', author: 'Mamá', at: daysAgo(1), amountMinor: 500, reasonId: 'ayuda-en-casa', senderId: 'mama' },
  ],
  draft: emptyDraft(),
  observations: [{ id: 'o1', title: 'Un pequeño gran paso', childId: 'c1', narrative: 'Sofía decidió guardar sus monedas para el libro que quiere.', authorId: 'mama', authorDisplayName: 'Mamá', recordedAt: '2026-10-01T10:00:00Z', topic: 'ahorrar' }],
  conversations: [{ id: 'c1', title: 'Compara precios antes de comprar', recordedAt: '2026-10-01T18:00:00Z' }],
  celebrations: [],
  startedTopics: ['ahorrar'],
  activeTopic: 'ahorrar',
  activityStep: { ahorrar: 0 },
  finishedTopics: [],
  caregiver: { name: 'Mamá', relation: 'mama' },
  propinaDay: null,
  devicePaired: true,
  deviceOnline: false,
  last: { in: { amountMinor: 1000, reason: { reason: 'mesada' }, goalId: 'g1', senderId: 'mama' } },
});

export const firstDayState = (): AppState => ({
  ...exampleState(), balanceMinor: 0, goals: [], movements: [], observations: [], conversations: [], celebrations: [], startedTopics: [], activeTopic: null, activityStep: {},
  caregiver: null, devicePaired: false, deviceOnline: false, last: {},
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
    { id: 'w8', kind: 'in', label: 'Guardó plata', author: 'Mamá', at: dayAt(0, 18), amountMinor: 1000, reason: 'Propina de la semana', reasonId: 'mesada', senderId: 'mama', goalId: 'g2', goalName: 'Pelota de fútbol' },
    { id: 'w7', kind: 'in', label: 'Guardó plata', author: 'Mamá', at: dayAt(1, 19), amountMinor: 100, reason: 'Se portó bien', reasonId: 'buen-comportamiento', senderId: 'abuela' },
    { id: 'w6', kind: 'in', label: 'Guardó plata', author: 'Papá', at: dayAt(2, 17), amountMinor: 200, reason: 'Ayudó en casa', reasonId: 'ayuda-en-casa', senderId: 'papa', goalId: 'g1', goalName: 'Libro de dinosaurios' },
    { id: 'w5', kind: 'out', label: 'Sacó plata', author: 'Mamá', at: dayAt(3, 16), amountMinor: -200, reason: 'Hizo un regalo', reasonId: 'regalo' },
    { id: 'w4', kind: 'out', label: 'Sacó plata', author: 'Mamá', at: dayAt(4, 18), amountMinor: -300, reason: 'Se compró algo', reasonId: 'compra' },
    { id: 'w3', kind: 'in', label: 'Guardó plata', author: 'Mamá', at: dayAt(5, 13), amountMinor: 500, reason: 'Le dieron propina', reasonId: 'propina', senderId: 'tio', senderName: 'Tío Jorge' },
    { id: 'w2', kind: 'in', label: 'Guardó plata', author: 'Papá', at: dayAt(6, 18), amountMinor: 200, reason: 'Ayudó en casa', reasonId: 'ayuda-en-casa', senderId: 'papa' },
    { id: 'w1', kind: 'in', label: 'Guardó plata', author: 'Mamá', at: dayAt(7, 10), amountMinor: 1000, reason: 'Propina de la semana', reasonId: 'mesada', senderId: 'mama', goalId: 'g1', goalName: 'Libro de dinosaurios' },
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
  finishedTopics: ['ahorrar'],
  caregiver: { name: 'Mamá', relation: 'mama' },
  // La propina de la semana cae el mismo día (hace 7 días y hoy).
  propinaDay: new Date().getDay(),
  devicePaired: true,
  deviceOnline: true,
  last: { in: { amountMinor: 1000, reason: { reason: 'mesada' }, goalId: 'g2', senderId: 'mama' }, out: { amountMinor: 300, reason: { reason: 'compra' }, goalId: null } },
});

/** Datos iniciales según el despliegue: VITE_SEED=vacio | semana (por defecto, ejemplo de las referencias). */
const SEED = import.meta.env.VITE_SEED as string | undefined;
export const seedState = (): AppState => (SEED === 'vacio' ? firstDayState() : SEED === 'semana' ? weekState() : exampleState());
export const seedIsEmpty = SEED === 'vacio';

type Action =
  | { type: 'draft'; patch: Partial<Draft> }
  | { type: 'startDraft'; kind: FlowKind }
  | { type: 'clearDraft' }
  | { type: 'confirm'; amountMinor: number; reason: FlowReason; goalId: Id | null; author: string; senderId?: string | null; senderName?: string }
  | { type: 'addGoal'; goal: Goal }
  | { type: 'updateGoal'; id: Id; name: string; targetMinor: number }
  | { type: 'deleteGoal'; id: Id }
  | { type: 'updateMovement'; id: Id; amountMinor: number; reason: FlowReason; goalId: Id | null; senderId?: string | null; senderName?: string }
  | { type: 'deleteMovement'; id: Id }
  | { type: 'setName'; name: string }
  | { type: 'setCaregiver'; caregiver: Caregiver | null }
  | { type: 'setPropinaDay'; day: number | null }
  | { type: 'addObservation'; observation: Moment }
  | { type: 'updateObservation'; observation: Moment }
  | { type: 'deleteObservation'; id: Id }
  | { type: 'addConversation'; conversation: Conversation }
  | { type: 'addCelebration'; celebration: Celebration }
  | { type: 'startActivity'; topic: Topic }
  | { type: 'advanceStep'; topic: Topic; total: number }
  | { type: 'finishActivity'; topic: Topic }
  | { type: 'reset'; state: AppState };

/** Texto visible del motivo; los ids no cambian (ver contratos). */
export const reasonLabel = (r: FlowReason): string => (r.reason === 'otro' && r.detail ? r.detail : hasKey(`motivos.${r.reason}`) ? t(`motivos.${r.reason}`) : r.reason);
/** Motivo de un movimiento: desde el id si existe (sigue al catálogo de textos), si no el texto guardado. */
export const movementReason = (m: Movement) => (m.reasonId ? reasonLabel({ reason: m.reasonId, detail: m.reasonDetail }) : m.reason);
/** Meta lograda: llegó al objetivo alguna vez. Usada: lograda y ya sin plata. */
export const goalAchieved = (g: Goal) => !!g.achieved || g.savedMinor >= g.targetMinor;
export const goalUsed = (g: Goal) => goalAchieved(g) && g.savedMinor === 0;

/** Suma (con signo) un monto a una meta, nunca por debajo de 0, y marca si llegó al objetivo. */
function addToGoal(goals: Goal[], id: Id | null | undefined, delta: number): Goal[] {
  return goals.map((g) => {
    if (g.id !== id) return g;
    const savedMinor = Math.max(0, g.savedMinor + delta);
    return { ...g, savedMinor, achieved: g.achieved || savedMinor >= g.targetMinor };
  });
}

/** Valida que un estado no deje plata negativa (saldo o metas). Se usa antes de corregir o borrar. */
export function wouldBeNegative(s: AppState): boolean {
  return s.balanceMinor < 0 || s.goals.some((g) => g.savedMinor < 0);
}

/** Saca un movimiento del saldo y de su meta (sin clamp, para poder validar). */
function revert(s: AppState, m: Movement): AppState {
  return { ...s, balanceMinor: s.balanceMinor - m.amountMinor, goals: s.goals.map((g) => (g.id === m.goalId ? { ...g, savedMinor: g.savedMinor - m.amountMinor } : g)) };
}

/** Resultado de corregir un movimiento, sin aplicarlo: sirve para validar antes de guardar. */
export function previewMovementUpdate(s: AppState, a: Extract<Action, { type: 'updateMovement' }>): AppState {
  const m = s.movements.find((x) => x.id === a.id);
  if (!m) return s;
  const sign = m.kind === 'in' ? 1 : -1;
  const base = revert(s, m);
  const goal = base.goals.find((g) => g.id === a.goalId);
  const amount = sign * a.amountMinor;
  const updated: Movement = {
    ...m, amountMinor: amount, reasonId: a.reason.reason, reasonDetail: a.reason.detail, reason: reasonLabel(a.reason),
    goalId: goal?.id, goalName: goal?.name, ...(m.kind === 'in' ? { senderId: a.senderId ?? undefined, senderName: a.senderName || undefined } : {}),
  };
  return {
    ...base,
    balanceMinor: base.balanceMinor + amount,
    goals: base.goals.map((g) => (g.id === goal?.id ? { ...g, savedMinor: g.savedMinor + amount, achieved: g.achieved || g.savedMinor + amount >= g.targetMinor } : g)),
    movements: base.movements.map((x) => (x.id === m.id ? updated : x)),
  };
}

export function reducer(s: AppState, a: Action): AppState {
  switch (a.type) {
    case 'draft': return { ...s, draft: { ...s.draft, ...a.patch, active: true } };
    case 'startDraft': {
      if (s.draft.kind === a.kind && s.draft.active) return s; // retomar lo que quedó a medias
      // Recordar motivo, meta y quién envía de la última vez (la persona puede cambiarlos).
      const last = s.last[a.kind];
      const goalOk = last?.goalId && s.goals.some((g) => g.id === last.goalId && !goalUsed(g)) ? last.goalId : null;
      return { ...s, draft: { ...emptyDraft(a.kind), reason: last?.reason ?? null, goalId: goalOk, senderId: last?.senderId ?? (a.kind === 'in' ? s.caregiver?.relation ?? null : null), senderName: last?.senderName ?? '' } };
    }
    case 'clearDraft': return { ...s, draft: emptyDraft() };
    case 'confirm': {
      const kind = s.draft.kind;
      const sign = kind === 'in' ? 1 : -1;
      const goal = s.goals.find((g) => g.id === a.goalId);
      const movement: Movement = {
        id: newId('m'), kind, label: t(`movimientos.${kind}`), author: a.author,
        at: new Date().toISOString(), amountMinor: sign * a.amountMinor, reason: reasonLabel(a.reason), reasonId: a.reason.reason, reasonDetail: a.reason.detail,
        goalId: goal?.id, goalName: goal?.name, ...(kind === 'in' ? { senderId: a.senderId ?? undefined, senderName: a.senderName || undefined } : {}),
      };
      return {
        ...s, balanceMinor: s.balanceMinor + sign * a.amountMinor, goals: addToGoal(s.goals, a.goalId, sign * a.amountMinor),
        movements: [movement, ...s.movements], draft: emptyDraft(),
        last: { ...s.last, [kind]: { amountMinor: a.amountMinor, reason: a.reason, goalId: a.goalId, senderId: a.senderId ?? null, senderName: a.senderName ?? '' } },
      };
    }
    case 'updateMovement': return previewMovementUpdate(s, a);
    case 'deleteMovement': {
      const m = s.movements.find((x) => x.id === a.id);
      if (!m) return s;
      const r = revert(s, m);
      return { ...r, goals: r.goals.map((g) => ({ ...g, savedMinor: Math.max(0, g.savedMinor) })), movements: s.movements.filter((x) => x.id !== a.id) };
    }
    case 'addGoal': return { ...s, goals: [...s.goals, a.goal] };
    case 'updateGoal': return { ...s, goals: s.goals.map((g) => (g.id === a.id ? { ...g, name: a.name, targetMinor: a.targetMinor, achieved: g.achieved || g.savedMinor >= a.targetMinor } : g)), movements: s.movements.map((m) => (m.goalId === a.id ? { ...m, goalName: a.name } : m)) };
    // Borrar una meta no borra plata: lo guardado sigue en el saldo y los movimientos quedan sin meta.
    case 'deleteGoal': return { ...s, goals: s.goals.filter((g) => g.id !== a.id), movements: s.movements.map((m) => (m.goalId === a.id ? { ...m, goalId: undefined } : m)), draft: s.draft.goalId === a.id ? { ...s.draft, goalId: null } : s.draft };
    case 'setName': return { ...s, childName: a.name };
    case 'setCaregiver': return { ...s, caregiver: a.caregiver };
    case 'setPropinaDay': return { ...s, propinaDay: a.day };
    case 'addObservation': return { ...s, observations: [a.observation, ...s.observations] };
    case 'updateObservation': return { ...s, observations: s.observations.map((o) => (o.id === a.observation.id ? a.observation : o)) };
    case 'deleteObservation': return { ...s, observations: s.observations.filter((o) => o.id !== a.id), celebrations: s.celebrations.filter((c) => c.observationId !== a.id) };
    case 'addConversation': return { ...s, conversations: [a.conversation, ...s.conversations] };
    case 'addCelebration': return { ...s, celebrations: [a.celebration, ...s.celebrations] };
    case 'startActivity':
      return { ...s, activeTopic: a.topic, startedTopics: s.startedTopics.includes(a.topic) ? s.startedTopics : [...s.startedTopics, a.topic], activityStep: { ...s.activityStep, [a.topic]: s.activityStep[a.topic] ?? 0 } };
    case 'advanceStep': {
      const next = Math.min((s.activityStep[a.topic] ?? 0) + 1, a.total - 1);
      return { ...s, activityStep: { ...s.activityStep, [a.topic]: next } };
    }
    // Recorrida hasta el final: deja de estar «en curso» (Aprender propone la siguiente). Sin puntaje.
    case 'finishActivity':
      return { ...s, activeTopic: s.activeTopic === a.topic ? null : s.activeTopic, finishedTopics: s.finishedTopics.includes(a.topic) ? s.finishedTopics : [...s.finishedTopics, a.topic] };
    case 'reset': return a.state;
  }
}

const KEY = 'alcancia:v2';
function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { const base = seedState(); const saved = JSON.parse(raw); return { ...base, ...saved, draft: { ...base.draft, ...saved.draft } }; }
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

