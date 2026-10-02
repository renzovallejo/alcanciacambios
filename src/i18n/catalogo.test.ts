import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { hasKey, t, tn } from './index';

const SRC = join(__dirname, '..');
const files = (dir: string): string[] =>
  readdirSync(join(SRC, dir)).filter((f) => /\.tsx?$/.test(f) && !f.endsWith('.test.ts')).map((f) => join(SRC, dir, f));
const sources = [...files('screens'), ...files('components'), ...files('lib')].map((f) => ({ f, s: readFileSync(f, 'utf8') }));

describe('catálogo de textos (es.json)', () => {
  it('toda clave literal usada en el código existe', () => {
    const missing: string[] = [];
    for (const { f, s } of sources) {
      for (const m of s.matchAll(/\bt\('([\w.-]+)'/g)) if (!hasKey(m[1])) missing.push(`${f}: ${m[1]}`);
      for (const m of s.matchAll(/\bt\(\w+ \? '([\w.-]+)' : '([\w.-]+)'/g)) for (const k of [m[1], m[2]]) if (!hasKey(k)) missing.push(`${f}: ${k}`);
      for (const m of s.matchAll(/\btn\('([\w.-]+)'/g)) for (const suf of ['_one', '_other']) if (!hasKey(m[1] + suf)) missing.push(`${f}: ${m[1]}${suf}`);
    }
    expect(missing).toEqual([]);
  });

  it('las pantallas no tienen textos escritos a mano', () => {
    const found: string[] = [];
    for (const { f, s } of sources.filter(({ f }) => f.endsWith('.tsx'))) {
      // Texto JSX entre etiquetas con letras (excluye símbolos sueltos como «S/», «+», «·»).
      for (const m of s.matchAll(/>([^<>{}\n]*[A-Za-zÁÉÍÓÚáéíóúñ¿¡]{2,}[^<>{}\n]*)</g)) {
        if (/[=;]|\bPromise\b|\bDate\./.test(m[1])) continue; // código TypeScript, no texto
        found.push(`${f}: ${m[1].trim()}`);
      }
      // Atributos de texto visibles o accesibles con valor literal.
      for (const m of s.matchAll(/\b(title|label|helper|placeholder|description|desc|aria-label)="([^"]*[a-záéíóú][^"]*)"/g)) found.push(`${f}: ${m[1]}="${m[2]}"`);
    }
    expect(found).toEqual([]);
  });

  it('interpola variables y plurales', () => {
    expect(t('flujo.in.ahora', { nombre: 'Sofía', monto: 'S/ 25.00' })).toBe('Ahora Sofía lleva ahorrado S/ 25.00.');
    expect(tn('progreso.cosas', 1)).toBe('1 cosa anotada');
    expect(tn('progreso.cosas', 3)).toBe('3 cosas anotadas');
  });
});
