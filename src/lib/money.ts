import type { Money } from '../domain';

export const pen = (minorUnits: number): Money => ({ currency: 'PEN', minorUnits });

/** Formatea unidades menores como «S/ 10.00». */
export function formatMoney(m: Money | number): string {
  const units = typeof m === 'number' ? m : m.minorUnits;
  const sign = units < 0 ? '-' : '';
  const abs = Math.abs(units);
  return `${sign}S/ ${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, '0')}`;
}

export const MAX_AMOUNT_MINOR = 100_000; // S/ 1,000.00 (límite provisional de producto)

export type ParseResult =
  | { ok: true; money: Money }
  | { ok: false; error: string };

/** Valida texto de importe: positivo, hasta 2 decimales, sin NaN ni separadores ambiguos. Sin coma flotante. */
export function parseAmount(input: string): ParseResult {
  const text = input.trim().replace(/^S\/\s*/i, '');
  if (text === '') return { ok: false, error: 'Escribe cuánto.' };
  if (/[,]/.test(text) && /\./.test(text)) return { ok: false, error: 'Usa solo un punto para los céntimos.' };
  const normalized = text.replace(',', '.');
  if (!/^\d+(\.\d{0,2})?$/.test(normalized)) {
    if (/^\d+\.\d{3,}$/.test(normalized)) return { ok: false, error: 'Pon máximo dos números para los céntimos.' };
    return { ok: false, error: 'Escribe un monto como 10 o 10.50.' };
  }
  const [whole, frac = ''] = normalized.split('.');
  const minor = Number(whole) * 100 + Number(frac.padEnd(2, '0'));
  if (minor <= 0) return { ok: false, error: 'Tiene que ser más de S/ 0.' };
  if (minor > MAX_AMOUNT_MINOR) return { ok: false, error: `Lo máximo que puedes anotar es ${formatMoney(MAX_AMOUNT_MINOR)}.` };
  return { ok: true, money: pen(minor) };
}

export const percent = (saved: number, target: number): number =>
  target <= 0 ? 0 : Math.min(100, Math.round((saved / target) * 100));
