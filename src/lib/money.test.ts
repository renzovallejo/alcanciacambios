import { describe, expect, it } from 'vitest';
import { formatMoney, parseAmount, percent } from './money';

describe('money', () => {
  it('formatea unidades menores', () => {
    expect(formatMoney(0)).toBe('S/ 0.00');
    expect(formatMoney(1500)).toBe('S/ 15.00');
    expect(formatMoney(4305)).toBe('S/ 43.05');
  });
  it('parsea importes válidos sin coma flotante', () => {
    expect(parseAmount('10')).toEqual({ ok: true, money: { currency: 'PEN', minorUnits: 1000 } });
    expect(parseAmount('S/ 10.5')).toMatchObject({ ok: true, money: { minorUnits: 1050 } });
    expect(parseAmount('0,07')).toMatchObject({ ok: true, money: { minorUnits: 7 } });
  });
  it('rechaza vacío, cero, negativo, letras y demasiados decimales', () => {
    for (const bad of ['', '0', '-5', 'abc', '1.234', '1,000.50', '99999']) {
      expect(parseAmount(bad).ok).toBe(false);
    }
  });
  it('calcula avance como acumulado / objetivo', () => {
    expect(percent(600, 3000)).toBe(20);
    expect(percent(400, 4000)).toBe(10);
    expect(percent(5000, 3000)).toBe(100);
  });
});
