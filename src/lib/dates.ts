import { t } from '../i18n';

const MONTHS = t('fechas.meses').split(',');
const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

/** «hoy», «ayer» o «1 oct». Devuelve null si la fecha no es válida (no se inventan fechas). */
export function friendlyDate(iso: string, now = new Date()): string | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  if (dayKey(d) === dayKey(now)) return t('fechas.hoy');
  const y = new Date(now); y.setDate(now.getDate() - 1);
  if (dayKey(d) === dayKey(y)) return t('fechas.ayer');
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

const DAYS = t('fechas.dias').split(',');
const MONTHS_LONG = t('fechas.mesesLargos').split(',');
/** Nombre del día: 0 = domingo … 6 = sábado. */
export const dayName = (d: number) => DAYS[d] ?? '';
/** Clave de mes para agrupar: «2026-9». */
export const monthKey = (iso: string) => { const d = new Date(iso); return `${d.getFullYear()}-${d.getMonth()}`; };
/** «octubre» (o «octubre 2025» si no es de este año). */
export function monthLabel(iso: string, now = new Date()): string {
  const d = new Date(iso);
  const m = MONTHS_LONG[d.getMonth()] ?? '';
  return d.getFullYear() === now.getFullYear() ? m : `${m} ${d.getFullYear()}`;
}
/** ¿Cayó en los últimos 7 días (incluido hoy)? */
export const inLastWeek = (iso: string, now = new Date()) => now.getTime() - new Date(iso).getTime() < 7 * 86_400_000;
