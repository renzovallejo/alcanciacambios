// Propuesta para coordinar frontend/backend, NO contrato de API existente.
// No implementa validación, persistencia, navegación, hardware ni audio.
export type Id = string;
export type IsoDateTime = string;
export type Currency = 'PEN';
export interface Money { currency: Currency; minorUnits: number } // Entero: S/ 10.00 = 1000; validar en runtime.
export interface ChildContext { id: Id; displayName: string }
export type Topic = 'ahorrar' | 'gastar-bien' | 'compartir' | 'ganar';
export type ActivityState = 'not-started' | 'started'; // No representa dominio ni habilidad.
export type Loadable<T> = { state: 'loading' } | { state: 'error'; message: string } | { state: 'ready'; data: T };
export interface Observation {
  id: Id; childId: Id; narrative: string; authorId: Id;
  authorDisplayName: string; recordedAt: IsoDateTime; topic?: Topic;
}
export interface PracticeBalance { childId: Id; amount: Money; mode: 'practice' }
// Textos visibles (v3.4, ver documentacion/lenguaje.md): mesada → «Propina de la semana», propina → «Le dieron propina»,
// cumpleanos → «Por su cumple», buen-comportamiento → «Se portó bien», otro → «Otra cosa». Los ids no cambian.
export type Reason = 'propina' | 'ayuda-en-casa' | 'cumpleanos' | 'mesada' | 'buen-comportamiento' | 'otro';
export type BalanceReason = { reason: Exclude<Reason, 'otro'> } | { reason: 'otro'; detail: string };
export interface BalanceDraft {
  childId: Id; amountInput: string; parsedAmount: Money | null;
  selectedReason: BalanceReason | null; goalId: Id | null;
  // goalId null = sin meta. parsedAmount null = input pendiente/inválido.
}
export interface ConfirmBalanceRequest {
  childId: Id; amount: Money; reason: BalanceReason; goalId: Id | null;
  idempotencyKey: string; // Acordar alcance/expiración en backend.
}
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';
export interface LastKnown<T> { value: T; receivedAt: IsoDateTime | null }
export interface DeviceState {
  id: Id; connection: ConnectionState; errorMessage?: string;
  batteryPercent: LastKnown<number> | null;
  volumePercent: LastKnown<number> | null;
  savedWifiName: string | null;
}
export type AudioState = 'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'error';
export interface Story {
  id: Id; title: string; text: string; topic: Topic;
  audioSource: string | null; durationSeconds: number | null;
}
export interface PlayerState {
  storyId: Id; state: AudioState; positionSeconds: number;
  output: 'phone' | 'piggy-bank'; errorMessage?: string;
}
export interface TopicSummary { topic: Topic; activityState: ActivityState; observations: Observation[] }
export interface Recommendation { activityId: Id; title: string; description: string }
export interface ProgressSummary {
  childId: Id; periodStart: IsoDateTime; periodEnd: IsoDateTime;
  featuredObservation: Observation | null; topics: TopicSummary[];
  recommendation: Recommendation | null;
  // Conteos provenientes de registros; no sumar como puntos ni inferir capacidades.
  observationCount: number; conversationCount: number;
}
