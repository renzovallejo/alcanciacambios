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
